require('../../test/setupEnv');
const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

const portModel = require('../model/portModel');
const vlanModel = require('../model/vlanModel');
const deviceModel = require('../model/deviceModel');
const portService = require('./portService');

describe('portService', () => {
  beforeEach(() => mock.restoreAll());

  const basePort = {
    id: 1,
    switch_id: 1,
    port_number: 12,
    status: 'free',
    is_trunk: false,
  };

  it('getById inclui display_color e histórico', async () => {
    mock.method(portModel, 'findById', async () => ({
      ...basePort,
      status: 'connected',
      vlan_color: '#3b82f6',
    }));
    mock.method(portModel, 'getHistory', async () => [{ id: 1, action: 'update' }]);

    const port = await portService.getById(1);
    assert.equal(port.display_color, '#3b82f6');
    assert.equal(port.history.length, 1);
  });

  it('update associa device e define status connected', async () => {
    const current = { ...basePort };
    const updated = {
      ...current,
      status: 'connected',
      connected_device_id: 5,
      mac_address: 'AA:BB:CC:DD:EE:01',
    };

    mock.method(portModel, 'findById', async (id) => (id === 1 ? current : updated));
    mock.method(vlanModel, 'findById', async () => null);
    mock.method(deviceModel, 'findById', async () => ({
      id: 5,
      mac_address: 'AA:BB:CC:DD:EE:01',
    }));
    mock.method(portModel, 'update', async () => updated);
    mock.method(portModel, 'addHistory', async () => {});
    mock.method(portModel, 'getHistory', async () => []);

    const result = await portService.update(1, { connected_device_id: 5 });
    assert.equal(result.status, 'connected');
    assert.equal(result.mac_address, 'AA:BB:CC:DD:EE:01');
  });

  it('update rejeita VLAN inexistente', async () => {
    mock.method(portModel, 'findById', async () => basePort);
    mock.method(vlanModel, 'findById', async () => null);

    await assert.rejects(
      () => portService.update(1, { vlan_id: 999 }),
      (err) => err.statusCode === 400
    );
  });
});
