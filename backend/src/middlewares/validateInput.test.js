const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');
const { validateBody } = require('./validateInput');

describe('validateBody', () => {
  it('rejeita payload inválido', () => {
    const middleware = validateBody(z.object({ name: z.string().min(1) }));
    const req = { body: {} };
    let error;
    middleware(req, {}, (err) => {
      error = err;
    });
    assert.equal(error.statusCode, 400);
    assert.ok(error.details);
  });

  it('aceita payload válido', () => {
    const middleware = validateBody(z.object({ name: z.string() }));
    const req = { body: { name: 'SW-01' } };
    let nextCalled = false;
    middleware(req, {}, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(req.validated.name, 'SW-01');
  });
});
