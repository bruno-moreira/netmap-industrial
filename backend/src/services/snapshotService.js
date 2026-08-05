import crypto from 'node:crypto';
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

/**
 * Busca uma imagem/snapshot de uma câmera IP via HTTP/HTTPS.
 * Otimizado para Intelbras (ex: VIP 1230 B G2), Dahua, Hikvision e ONVIF.
 * Suporta autenticação HTTP Basic e HTTP Digest (padrão Intelbras).
 */
async function fetchCameraSnapshot({ ip_address, snapshot_url, camera_username, camera_password }) {
  if (!ip_address && !snapshot_url) {
    throw new HttpError(400, 'É necessário informar o IP ou a URL de snapshot da câmera.');
  }

  let username = camera_username || '';
  let password = camera_password || '';

  const cleanIp = (ip_address || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const candidateUrls = [];

  if (snapshot_url && snapshot_url.trim()) {
    let formattedUrl = snapshot_url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `http://${formattedUrl}`;
    }

    try {
      const parsedUrl = new URL(formattedUrl);
      if (parsedUrl.username && !username) username = parsedUrl.username;
      if (parsedUrl.password && !password) password = parsedUrl.password;
    } catch (_) {
      // url parse fallback
    }

    candidateUrls.push(formattedUrl);
  }

  if (cleanIp) {
    candidateUrls.push(
      `http://${cleanIp}/cgi-bin/snapshot.cgi`,
      `http://${cleanIp}/cgi-bin/snapshot.cgi?channel=1`,
      `http://${cleanIp}/onvif/snapshot`,
      `http://${cleanIp}/snapshot.jpg`,
      `http://${cleanIp}/snap.jpg`
    );
  }

  let lastErrorMessage = '';
  let had401 = false;

  for (const url of candidateUrls) {
    try {
      const parsedUrl = new URL(url);
      const uriPath = parsedUrl.pathname + parsedUrl.search;

      const headers = {};
      if (username && password) {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      let response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Se a câmera retornar 401 exigindo Digest Authentication (Padrão Intelbras VIP)
      if (response.status === 401 && username && password) {
        had401 = true;
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
          const retryTimeoutId = setTimeout(() => retryController.abort(), 6000);

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

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
      } else {
        if (response.status === 401 || response.status === 403) {
          had401 = true;
        }
        lastErrorMessage = `HTTP ${response.status} (${response.statusText || 'Não autorizado'}) em ${url}`;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        lastErrorMessage = `Tempo limite esgotado (timeout 6s) ao conectar em ${url}`;
      } else {
        lastErrorMessage = `Erro de conexão (${err.message}) em ${url}`;
      }
    }
  }

  let userFriendlyMsg = '';
  if (had401) {
    userFriendlyMsg = `A câmera Intelbras em ${cleanIp || snapshot_url} recusou as credenciais informadas (Usuário: "${username}"). Verifique se o usuário e senha estão corretos no formulário.`;
  } else {
    userFriendlyMsg = `Não foi possível capturar snapshot da câmera Intelbras (${lastErrorMessage}). Verifique a conectividade de rede com o IP ${cleanIp || ''} ou faça o upload manual da imagem.`;
  }

  throw new HttpError(502, userFriendlyMsg);
}

export default { fetchCameraSnapshot };
