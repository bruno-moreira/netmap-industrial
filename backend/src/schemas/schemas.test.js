const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  createDeviceSchema,
  createSwitchSchema,
  createVlanSchema,
  updatePortSchema,
  searchQuerySchema,
} = require('./index');

describe('schemas Zod', () => {
  it('aceita device válido', () => {
    const r = createDeviceSchema.safeParse({
      device_type_id: 1,
      name: 'Impressora RH',
      ip_address: '192.168.30.10',
      mac_address: 'AA:BB:CC:DD:EE:FF',
      status: 'online',
    });
    assert.equal(r.success, true);
  });

  it('rejeita device sem nome', () => {
    const r = createDeviceSchema.safeParse({ device_type_id: 1 });
    assert.equal(r.success, false);
  });

  it('rejeita IP inválido no device', () => {
    const r = createDeviceSchema.safeParse({
      device_type_id: 1,
      name: 'X',
      ip_address: 'not-an-ip',
    });
    assert.equal(r.success, false);
  });

  it('aceita switch com port_count', () => {
    const r = createSwitchSchema.safeParse({
      name: 'SW-ADM-01',
      port_count: 24,
      ip_address: '192.168.1.10',
    });
    assert.equal(r.success, true);
    assert.equal(r.data.port_count, 24);
  });

  it('rejeita port_count fora do limite', () => {
    const r = createSwitchSchema.safeParse({ name: 'SW', port_count: 2 });
    assert.equal(r.success, false);
  });

  it('aceita VLAN válida', () => {
    const r = createVlanSchema.safeParse({
      vlan_number: 30,
      name: 'Impressoras',
      color: '#86efac',
    });
    assert.equal(r.success, true);
  });

  it('aceita atualização parcial de porta', () => {
    const r = updatePortSchema.safeParse({ status: 'connected', vlan_id: 3 });
    assert.equal(r.success, true);
  });

  it('aceita busca com query q', () => {
    const r = searchQuerySchema.safeParse({ q: '192.168' });
    assert.equal(r.success, true);
  });
});
