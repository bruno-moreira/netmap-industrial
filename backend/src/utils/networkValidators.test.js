const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidIpv4,
  isValidMac,
  normalizeMac,
  getPortDisplayColor,
} = require('./networkValidators');

describe('networkValidators', () => {
  it('valida IPv4', () => {
    assert.equal(isValidIpv4('192.168.1.1'), true);
    assert.equal(isValidIpv4('999.1.1.1'), false);
    assert.equal(isValidIpv4(''), true);
  });

  it('valida e normaliza MAC', () => {
    assert.equal(isValidMac('AA:BB:CC:DD:EE:FF'), true);
    assert.equal(isValidMac('invalid'), false);
    assert.equal(normalizeMac('aa-bb-cc-dd-ee-ff'), 'AA:BB:CC:DD:EE:FF');
  });

  it('cor de exibição da porta', () => {
    assert.equal(getPortDisplayColor({ is_trunk: true }), '#171717');
    assert.equal(getPortDisplayColor({ status: 'error' }), '#ef4444');
    assert.equal(getPortDisplayColor({ status: 'connected', vlan_color: '#3b82f6' }), '#3b82f6');
    assert.equal(getPortDisplayColor({ status: 'free' }), '#9ca3af');
  });
});
