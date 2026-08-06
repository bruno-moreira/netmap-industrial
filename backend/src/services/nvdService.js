import deviceModel from '../model/deviceModel.js';
import deviceTypeModel from '../model/deviceTypeModel.js';
import { HttpError } from '../utils/HttpError.js';
import { parseDigestHeader, buildDigestHeader } from '../utils/digestAuth.js';

/** Fazer requisição HTTP com Digest Auth para a API do NVD Intelbras */
async function fetchNvdText(url, username, password) {
  const parsedUrl = new URL(url);
  const uriPath = parsedUrl.pathname + parsedUrl.search;
  const headers = {};

  if (username && password) {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  let response = await fetch(url, {
    method: 'GET',
    headers,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (response.status === 401 && username && password) {
    const wwwAuth = response.headers.get('www-authenticate');

    if (wwwAuth && wwwAuth.toLowerCase().includes('digest')) {
      const authParams = parseDigestHeader(wwwAuth);
      const digestHeader = buildDigestHeader({
        username,
        password,
        method: 'GET',
        uri: uriPath,
        authParams,
      });

      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), 7000);

      response = await fetch(url, {
        method: 'GET',
        headers: {
          ...headers,
          Authorization: digestHeader,
        },
        signal: retryController.signal,
      });

      clearTimeout(retryTimeoutId);
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(
        502,
        `Credenciais do NVD recusadas pela Intelbras (HTTP ${response.status}). Edite o NVD e preencha o Usuário e Senha corretos.`
      );
    }
    throw new HttpError(
      502,
      `Falha na comunicação com o NVD em ${parsedUrl.hostname} (HTTP ${response.status}). Verifique o IP e as portas.`
    );
  }

  return await response.text();
}

/** Parse das tabelas de configuração do NVD Intelbras (Suporte a mapeamento UUID e Canal) */
function parseRemoteDeviceConfig(rawTexts) {
  const combinedText = Array.isArray(rawTexts) ? rawTexts.join('\n') : String(rawTexts);
  const lines = combinedText.split('\n');

  const remoteDevicesByUuid = new Map(); // uuid -> { ip_address, mac_address, name, enable }
  const remoteChannelsMap = new Map();  // channelIndex -> { deviceUuid, enable }
  const channelTitlesMap = new Map();   // channelIndex -> name
  const fallbackDevicesMap = new Map(); // numericIndex -> { ip_address, mac_address, name, enable }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes('=')) continue;

    const [key, ...valParts] = trimmed.split('=');
    const val = valParts.join('=').replace(/['"]/g, '').trim();
    if (!key) continue;

    // 1. Matcheia RemoteDevice com UUID: table.RemoteDevice.uuid:System_CONFIG_NETCAMERA_INFO_0.Address=10.107.71.21
    const uuidMatch = key.match(/RemoteDevice\.(uuid:[^\.]+)\.(.+)/i);
    if (uuidMatch) {
      const uuid = uuidMatch[1];
      const prop = uuidMatch[2].toLowerCase();

      if (!remoteDevicesByUuid.has(uuid)) {
        remoteDevicesByUuid.set(uuid, {});
      }
      const dev = remoteDevicesByUuid.get(uuid);

      const ipMatch = val.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      if (ipMatch && ipMatch[0] !== '0.0.0.0' && ipMatch[0] !== '127.0.0.1') {
        dev.ip_address = ipMatch[0];
      }

      const macMatch = val.match(/\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/);
      if (macMatch) {
        dev.mac_address = macMatch[0].toUpperCase();
      }

      if (prop.includes('name') && val) {
        dev.name = val;
      }
      if (prop.includes('enable')) {
        dev.enable = val.toLowerCase() === 'true' || val === '1';
      }
      continue;
    }

    // 2. Matcheia RemoteChannel[index]: table.RemoteChannel[0].Device=uuid:System_CONFIG_NETCAMERA_INFO_0
    const remoteChanMatch = key.match(/RemoteChannel\[(\d+)\]\.(.+)/i);
    if (remoteChanMatch) {
      const idx = parseInt(remoteChanMatch[1], 10);
      const prop = remoteChanMatch[2].toLowerCase();

      if (!remoteChannelsMap.has(idx)) {
        remoteChannelsMap.set(idx, {});
      }
      const ch = remoteChannelsMap.get(idx);
      if (prop.includes('device')) {
        ch.deviceUuid = val;
      }
      if (prop.includes('enable')) {
        ch.enable = val.toLowerCase() === 'true' || val === '1';
      }
      continue;
    }

    // 3. Matcheia ChannelTitle[index]: table.ChannelTitle[0].Name=VIPC Intelbras
    const titleMatch = key.match(/ChannelTitle\[(\d+)\]\.(.+)/i);
    if (titleMatch) {
      const idx = parseInt(titleMatch[1], 10);
      const prop = titleMatch[2].toLowerCase();
      if (prop.includes('name') || prop.includes('title')) {
        channelTitlesMap.set(idx, val);
      }
      continue;
    }

    // 4. Matcheia sintaxe numérica tradicional: RemoteDevice[0].IP=10.107.71.21
    const numMatch = key.match(/(?:RemoteDevice|DigitalChannel|DevVideoInput|Camera)\[(\d+)\][\.\[](.+)/i);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10);
      const prop = numMatch[2].toLowerCase();

      if (!fallbackDevicesMap.has(idx)) {
        fallbackDevicesMap.set(idx, {});
      }
      const dev = fallbackDevicesMap.get(idx);
      const ipMatch = val.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      if (ipMatch && ipMatch[0] !== '0.0.0.0' && ipMatch[0] !== '127.0.0.1') {
        dev.ip_address = ipMatch[0];
      }
      const macMatch = val.match(/\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/);
      if (macMatch) {
        dev.mac_address = macMatch[0].toUpperCase();
      }
      if (prop.includes('name') && val) dev.name = val;
    }

    // 5. Captura universal de MAC em qualquer chave com UUID ou [índice]
    const macMatch = val.match(/\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/);
    if (macMatch) {
      const foundMac = macMatch[0].toUpperCase();
      const lineUuidMatch = key.match(/(uuid:[^\.]+)/i);
      if (lineUuidMatch) {
        const uuid = lineUuidMatch[1];
        if (!remoteDevicesByUuid.has(uuid)) remoteDevicesByUuid.set(uuid, {});
        remoteDevicesByUuid.get(uuid).mac_address = foundMac;
      }
      const lineIdxMatch = key.match(/\[(\d+)\]/);
      if (lineIdxMatch) {
        const idx = parseInt(lineIdxMatch[1], 10);
        if (!fallbackDevicesMap.has(idx)) fallbackDevicesMap.set(idx, {});
        fallbackDevicesMap.get(idx).mac_address = foundMac;
      }
    }
  }

  // Construir resultado por canal (0..N -> CH1..N+1)
  const allIndexes = new Set([
    ...remoteChannelsMap.keys(),
    ...channelTitlesMap.keys(),
    ...fallbackDevicesMap.keys(),
  ]);

  const sortedIndexes = Array.from(allIndexes).sort((a, b) => a - b);
  const result = [];

  for (const idx of sortedIndexes) {
    const channelNum = idx + 1;
    const remoteChan = remoteChannelsMap.get(idx);
    const titleName = channelTitlesMap.get(idx);
    const fallbackDev = fallbackDevicesMap.get(idx);

    let devByUuid = null;
    if (remoteChan && remoteChan.deviceUuid) {
      devByUuid = remoteDevicesByUuid.get(remoteChan.deviceUuid);
    }

    const name = titleName || devByUuid?.name || fallbackDev?.name || `Câmera CH${channelNum}`;
    const ip = devByUuid?.ip_address || fallbackDev?.ip_address || '';
    const mac = devByUuid?.mac_address || fallbackDev?.mac_address || '';
    const enable = remoteChan?.enable !== false && devByUuid?.enable !== false;

    result.push({
      channel: channelNum,
      name,
      ip_address: ip,
      mac_address: mac,
      enable,
      protocol: 'Intelbras',
      port: 37777,
    });
  }

  return result;
}

/** Descobre câmeras cadastradas em um NVD/DVR Intelbras */
async function discoverNvdCameras(nvdId, tenantId) {
  const nvd = await deviceModel.findById(nvdId, tenantId);
  if (!nvd) throw new HttpError(404, 'NVD/DVR não encontrado');

  const metadata = nvd.metadata || {};
  const ip = nvd.ip_address || metadata.ip_address;
  const username = metadata.camera_username || metadata.username || 'admin';
  const password = metadata.camera_password || metadata.password || '';

  if (!ip) {
    throw new HttpError(400, 'O NVD/DVR precisa ter um IP cadastrado para busca automática.');
  }

  const cleanIp = ip.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

  const configTargets = [
    'RemoteDevice',
    'RemoteChannel',
    'ChannelTitle',
    'Network',
  ];
  const rawResults = [];
  const debugInfo = [];

  for (const target of configTargets) {
    try {
      const configUrl = `http://${cleanIp}/cgi-bin/configManager.cgi?action=getConfig&name=${target}`;
      const text = await fetchNvdText(configUrl, username, password);
      if (text && text.includes('=')) {
        debugInfo.push({ target, success: true, snippet: text.slice(0, 300) });
        rawResults.push(text);
      } else {
        debugInfo.push({ target, success: false, reason: 'Sem dados com "="' });
      }
    } catch (err) {
      debugInfo.push({ target, success: false, error: err.message });
    }
  }

  if (rawResults.length === 0) {
    throw new HttpError(502, `Não foi possível obter configurações do NVD. Diagnóstico: ${JSON.stringify(debugInfo)}`);
  }

  const cameras = parseRemoteDeviceConfig(rawResults);

  // Extrai modelo do gravador Intelbras (ex: NVD 7132, NVD 3332, NVD 1432, iNVD 5232)
  let detectedModel = null;
  const networkResult = rawResults.find((r) => r.includes('Network.Hostname'));
  if (networkResult) {
    const match = networkResult.match(/Network\.Hostname=(.+)/i);
    if (match && match[1]) {
      detectedModel = match[1].replace(/['"]/g, '').trim();
    }
  }

  return {
    nvd_id: nvd.id,
    nvd_name: nvd.name,
    nvd_ip: cleanIp,
    detected_model: detectedModel,
    debug_info: debugInfo,
    cameras,
  };
}

/** Importa em lote as câmeras selecionadas e vincula ao NVD */
async function importNvdCameras(nvdId, camerasPayload, tenantId, userId) {
  const nvd = await deviceModel.findById(nvdId, tenantId);
  if (!nvd) throw new HttpError(404, 'NVD/DVR não encontrado');

  const cameraType = await deviceTypeModel.findBySlug('camera');
  if (!cameraType) throw new HttpError(500, 'Tipo de equipamento "camera" não configurado');

  const createdDevices = [];

  for (const cam of camerasPayload) {
    const metadata = {
      nvd_device_id: nvd.id,
      nvd_device_name: nvd.name,
      nvd_channel: cam.channel,
      snapshot_url: `http://${nvd.ip_address}/cgi-bin/snapshot.cgi?channel=${cam.channel}`,
      camera_username: nvd.metadata?.camera_username || 'admin',
      camera_password: nvd.metadata?.camera_password || '',
    };

    const deviceData = {
      device_type_id: cameraType.id,
      name: cam.name || `Câmera CH${cam.channel}`,
      ip_address: cam.ip_address || null,
      mac_address: cam.mac_address || null,
      location: `Canal ${cam.channel} - ${nvd.name}`,
      status: 'online',
      metadata,
    };

    try {
      const newDevice = await deviceModel.create(deviceData, tenantId, userId);
      createdDevices.push(newDevice);
    } catch (err) {
      console.warn(`Aviso ao importar câmera CH${cam.channel}: ${err.message}`);
    }
  }

  return {
    imported_count: createdDevices.length,
    devices: createdDevices,
  };
}

export default { discoverNvdCameras, importNvdCameras };
