import crypto from 'node:crypto';
import deviceModel from '../model/deviceModel.js';
import deviceTypeModel from '../model/deviceTypeModel.js';
import { HttpError } from '../utils/HttpError.js';

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function parseDigestHeader(header) {
  const params = {};
  const re = /(\w+)=(?:"([^"]+)"|([^\s,]+))/g;
  let match;
  while ((match = re.exec(header)) !== null) {
    params[match[1]] = match[2] || match[3];
  }
  return params;
}

function buildDigestHeader({ username, password, method, uri, authParams }) {
  const { realm, nonce, qop, opaque } = authParams;
  const cnonce = crypto.randomBytes(8).toString('hex');
  const nc = '00000001';

  const ha1 = md5(`${username}:${realm}:${password}`);
  const ha2 = md5(`${method}:${uri}`);

  let response;
  if (qop === 'auth' || qop === 'auth-int') {
    response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
  } else {
    response = md5(`${ha1}:${nonce}:${ha2}`);
  }

  let header = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;
  if (opaque) header += `, opaque="${opaque}"`;
  if (qop) header += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;

  return header;
}

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
    throw new HttpError(
      response.status === 401 ? 401 : 502,
      `Falha na comunicação com o NVD (HTTP ${response.status}). Verifique o IP e as credenciais.`
    );
  }

  return await response.text();
}

/** Parse da resposta da API RemoteDevice da Intelbras */
function parseRemoteDeviceConfig(text) {
  const devicesMap = new Map();
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes('=')) continue;

    const [key, ...valParts] = trimmed.split('=');
    const val = valParts.join('=').trim();

    // Ex: table.RemoteDevice[0].Name ou RemoteDevice[0].IP
    const match = key.match(/RemoteDevice\[(\d+)\]\.(\w+)/i);
    if (match) {
      const index = parseInt(match[1], 10);
      const prop = match[2];

      if (!devicesMap.has(index)) {
        devicesMap.set(index, { channel: index + 1 });
      }

      const item = devicesMap.get(index);
      item[prop] = val;
    }
  }

  const result = [];
  for (const [index, raw] of devicesMap.entries()) {
    // Filtra apenas se houver ao menos IP ou Nome configurado
    if (raw.IP || raw.Name) {
      result.push({
        channel: raw.channel || index + 1,
        name: raw.Name || `Câmera Canal ${index + 1}`,
        ip_address: raw.IP || '',
        mac_address: raw.Mac || raw.MAC || '',
        enable: raw.Enable === 'true' || raw.Enable === '1',
        protocol: raw.Protocol || 'Intelbras',
        port: raw.Port ? parseInt(raw.Port, 10) : 37777,
      });
    }
  }

  return result.sort((a, b) => a.channel - b.channel);
}

/** Descobre câmeras cadastradas em um NVD/DVR */
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
  const configUrl = `http://${cleanIp}/cgi-bin/configManager.cgi?action=getConfig&name=RemoteDevice`;

  try {
    const rawText = await fetchNvdText(configUrl, username, password);
    const cameras = parseRemoteDeviceConfig(rawText);
    return {
      nvd_id: nvd.id,
      nvd_name: nvd.name,
      nvd_ip: cleanIp,
      cameras,
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(502, `Erro ao buscar câmeras do NVD em ${cleanIp}: ${err.message}`);
  }
}

/** Importa em lote as câmeras selecionadas e vincula ao NVD */
async function importNvdCameras(nvdId, camerasPayload, tenantId, userId) {
  const nvd = await deviceModel.findById(nvdId, tenantId);
  if (!nvd) throw new HttpError(404, 'NVD/DVR não encontrado');

  // Buscar tipo 'camera'
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
      // Se der conflito de IP (já existente), apenas ignore ou atualize o metadata existente
      console.warn(`Aviso ao importar câmera CH${cam.channel}: ${err.message}`);
    }
  }

  return {
    imported_count: createdDevices.length,
    devices: createdDevices,
  };
}

export default { discoverNvdCameras, importNvdCameras };
