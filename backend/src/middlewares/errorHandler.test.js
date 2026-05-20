require('../../test/setupEnv');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { errorHandler } = require('./errorHandler');
const { HttpError } = require('../utils/HttpError');

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

describe('errorHandler', () => {
  it('retorna mensagem do cliente em 404', () => {
    const res = mockRes();
    errorHandler(new HttpError(404, 'Não encontrado'), { path: '/x', method: 'GET' }, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Não encontrado');
  });

  it('retorna mensagem genérica em 500', () => {
    const res = mockRes();
    errorHandler(new Error('segredo'), { path: '/x', method: 'GET' }, res, () => {});
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, 'Erro interno do servidor');
  });

  it('inclui details quando presente', () => {
    const res = mockRes();
    const err = new HttpError(400, 'Inválido');
    err.details = [{ field: 'name', message: 'obrigatório' }];
    errorHandler(err, { path: '/', method: 'POST' }, res, () => {});
    assert.deepEqual(res.body.details, err.details);
  });
});
