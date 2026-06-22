import '../../test/setupEnv.js';
import { describe, it, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import dashboardModel from '../model/dashboardModel.js';
import switchModel from '../model/switchModel.js';
import deviceModel from '../model/deviceModel.js';
import vlanModel from '../model/vlanModel.js';
import deviceTypeModel from '../model/deviceTypeModel.js';
import scanService from '../services/scanService.js';
import jwt from 'jsonwebtoken';
import userModel from '../model/userModel.js';

let server;
let baseUrl;

async function fetchAuth(url, options = {}) {
  const headers = { ...options.headers, 'Authorization': 'Bearer test-token' };
  return fetch(url, { ...options, headers });
}

const mockStats = {
  total_switches: 1,
  total_ports: 24,
  ports_connected: 2,
  ports_free: 22,
  ports_error: 0,
  devices_online: 2,
  devices_offline: 0,
  total_vlans: 5,
  total_devices: 2,
};

function setupMocks() {
  mock.method(jwt, 'verify', () => ({ userId: 1 }));
  mock.method(userModel, 'findById', async () => ({ id: 1, is_active: true, tenant_id: 1 }));
  mock.method(dashboardModel, 'getStats', async () => mockStats);
  mock.method(switchModel, 'findAll', async () => [
    {
      id: 1,
      name: 'SW-ADM-01',
      ports_total: 24,
      ports_connected: 2,
      ports_free: 22,
    },
  ]);
  mock.method(switchModel, 'findById', async (id) =>
    id === 1 ? { id: 1, name: 'SW-ADM-01', ip_address: '192.168.1.10' } : null
  );
  mock.method(deviceModel, 'findAll', async () => [
    {
      id: 1,
      name: 'Impressora RH',
      ip_address: '192.168.30.10',
      status: 'online',
      type_name: 'Impressora',
    },
  ]);
  mock.method(vlanModel, 'findAll', async () => [
    { id: 1, vlan_number: 30, name: 'Impressoras', color: '#86efac' },
  ]);
  mock.method(deviceTypeModel, 'findAll', async () => [
    { id: 1, slug: 'printer', name: 'Impressora' },
  ]);
  mock.method(scanService, 'scanNetwork', async () => ({
    status: 'stub',
    message: 'ok',
    discovered: [],
  }));
}

before(async () => {
  setupMocks();
  const { createApp } = await import('../app.js');
  const app = createApp();
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  return new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  mock.restoreAll();
  setupMocks();
});

describe('integração HTTP', () => {
  it('GET /health retorna ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
  });

  it('GET /api/dashboard retorna estatísticas', async () => {
    const res = await fetchAuth(`${baseUrl}/api/dashboard`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.total_switches, 1);
    assert.equal(body.total_ports, 24);
  });

  it('GET /api/switches lista switches', async () => {
    const res = await fetchAuth(`${baseUrl}/api/switches`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].name, 'SW-ADM-01');
  });

  it('GET /api/switches/:id retorna switch', async () => {
    const res = await fetchAuth(`${baseUrl}/api/switches/1`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.name, 'SW-ADM-01');
  });

  it('GET /api/switches/999 retorna 404', async () => {
    mock.method(switchModel, 'findById', async () => null);
    const res = await fetchAuth(`${baseUrl}/api/switches/999`);
    assert.equal(res.status, 404);
  });

  it('POST /api/devices com body inválido retorna 400', async () => {
    const res = await fetchAuth(`${baseUrl}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error);
  });

  it('GET /api/devices busca equipamentos', async () => {
    const res = await fetchAuth(`${baseUrl}/api/devices?q=impressora`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.length, 1);
  });

  it('GET /api/vlans lista VLANs', async () => {
    const res = await fetchAuth(`${baseUrl}/api/vlans`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body[0].vlan_number, 30);
  });

  it('POST /api/scan/network retorna stub', async () => {
    const res = await fetchAuth(`${baseUrl}/api/scan/network`, { method: 'POST' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'stub');
  });
});
