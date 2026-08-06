import crypto from 'node:crypto';

/** Calcula o hash MD5 de uma string */
export function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/** Parse dos parâmetros retornados no cabeçalho WWW-Authenticate: Digest */
export function parseDigestHeader(header) {
  const params = {};
  const re = /(\w+)=(?:"([^"]+)"|([^\s,]+))/g;
  let match;
  while ((match = re.exec(header)) !== null) {
    params[match[1]] = match[2] || match[3];
  }
  return params;
}

/** Constrói o cabeçalho Authorization: Digest conforme a RFC 2617 */
export function buildDigestHeader({ username, password, method, uri, authParams }) {
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

export default { md5, parseDigestHeader, buildDigestHeader };
