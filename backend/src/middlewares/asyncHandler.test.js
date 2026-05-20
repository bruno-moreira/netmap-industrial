const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { asyncHandler } = require('./asyncHandler');

describe('asyncHandler', () => {
  it('propaga erro assíncrono para next', async () => {
    const handler = asyncHandler(async () => {
      throw new Error('falhou');
    });
    let passed;
    await new Promise((resolve) => {
      handler({}, {}, (err) => {
        passed = err;
        resolve();
      });
    });
    assert.equal(passed.message, 'falhou');
  });

  it('executa handler sem erro', async () => {
    const handler = asyncHandler(async (_req, res) => {
      res.sent = true;
    });
    const res = {};
    handler({}, res, () => {});
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(res.sent, true);
  });
});
