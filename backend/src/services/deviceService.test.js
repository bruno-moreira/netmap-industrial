require('../../test/setupEnv');
const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

const deviceModel = require('../model/deviceModel');
const deviceTypeModel = require('../model/deviceTypeModel');
const deviceService = require('./deviceService');
const { HttpError } = require('../utils/HttpError');

describe('deviceService', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('getById lança 404 quando não existe', async () => {
    mock.method(deviceModel, 'findById', async () => null);
    await assert.rejects(() => deviceService.getById(99), (err) => {
      assert.equal(err.statusCode, 404);
      return true;
    });
  });

  it('create valida tipo de equipamento', async () => {
    mock.method(deviceTypeModel, 'findById', async () => null);
    await assert.rejects(
      () => deviceService.create({ device_type_id: 1, name: 'Test' }),
      (err) => err.statusCode === 400
    );
  });

  it('create rejeita MAC inválido', async () => {
    mock.method(deviceTypeModel, 'findById', async () => ({ id: 1 }));
    await assert.rejects(
      () =>
        deviceService.create({
          device_type_id: 1,
          name: 'Test',
          mac_address: 'invalid',
        }),
      (err) => err.message.includes('MAC')
    );
  });

  it('create normaliza MAC e persiste', async () => {
    mock.method(deviceTypeModel, 'findById', async () => ({ id: 1 }));
    mock.method(deviceModel, 'create', async (data) => ({
      id: 1,
      ...data,
      mac_address: data.mac_address,
    }));
    mock.method(deviceModel, 'findById', async () => ({
      id: 1,
      name: 'Impressora',
      mac_address: 'AA:BB:CC:DD:EE:FF',
    }));

    const result = await deviceService.create({
      device_type_id: 1,
      name: 'Impressora',
      mac_address: 'aa-bb-cc-dd-ee-ff',
    });
    assert.equal(result.mac_address, 'AA:BB:CC:DD:EE:FF');
  });

  it('create mapeia conflito de unique para 409', async () => {
    mock.method(deviceTypeModel, 'findById', async () => ({ id: 1 }));
    mock.method(deviceModel, 'create', async () => {
      const err = new Error('duplicate');
      err.code = '23505';
      throw err;
    });
    await assert.rejects(
      () => deviceService.create({ device_type_id: 1, name: 'X' }),
      (err) => err instanceof HttpError && err.statusCode === 409
    );
  });
});
