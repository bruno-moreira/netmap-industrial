require('../../test/setupEnv');
const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

const switchModel = require('../model/switchModel');
const portModel = require('../model/portModel');
const switchService = require('./switchService');

describe('switchService', () => {
  beforeEach(() => mock.restoreAll());

  it('getById com portas adiciona display_color', async () => {
    mock.method(switchModel, 'findById', async () => ({ id: 1, name: 'SW-01' }));
    mock.method(portModel, 'findBySwitchId', async () => [
      { id: 1, port_number: 1, status: 'free', is_trunk: false },
      { id: 2, port_number: 2, status: 'connected', vlan_color: '#22c55e', is_trunk: false },
    ]);

    const sw = await switchService.getById(1, true);
    assert.equal(sw.ports.length, 2);
    assert.equal(sw.ports[1].display_color, '#22c55e');
  });

  it('create gera portas automaticamente', async () => {
    const createdPorts = [];
    mock.method(switchModel, 'create', async () => ({ id: 1, name: 'SW-NEW' }));
    mock.method(portModel, 'create', async (data) => {
      createdPorts.push(data);
      return { id: createdPorts.length };
    });
    mock.method(switchModel, 'findById', async () => ({ id: 1, name: 'SW-NEW' }));
    mock.method(portModel, 'findBySwitchId', async () => []);

    await switchService.create({ name: 'SW-NEW', port_count: 4 });
    assert.equal(createdPorts.length, 4);
    assert.equal(createdPorts[0].port_number, 1);
    assert.equal(createdPorts[3].port_number, 4);
  });
});
