const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

function isValidIpv4(ip) {
  if (!ip) return true;
  return IPV4_REGEX.test(ip);
}

function normalizeMac(mac) {
  if (!mac) return null;
  return mac.toUpperCase().replace(/-/g, ':');
}

function isValidMac(mac) {
  if (!mac) return true;
  return MAC_REGEX.test(mac);
}

const PORT_STATUS = ['free', 'connected', 'error', 'disabled'];
const DEVICE_STATUS = ['online', 'offline', 'unknown', 'maintenance'];

const PORT_COLORS = {
  free: '#9ca3af',
  connected: '#22c55e',
  error: '#ef4444',
  disabled: '#6b7280',
  trunk: '#171717',
  hybrid: '#4338ca',
};

function getPortDisplayColor(port) {
  if (port.port_type === 'trunk') return PORT_COLORS.trunk;
  if (port.port_type === 'hybrid') return PORT_COLORS.hybrid;
  if (port.status === 'error') return PORT_COLORS.error;
  if (port.untagged_vlan_color) return port.untagged_vlan_color;
  if (port.status === 'free') return PORT_COLORS.free;
  if (port.status === 'connected') return PORT_COLORS.connected;
  return PORT_COLORS.free;
}

export {
  isValidIpv4,
  isValidMac,
  normalizeMac,
  PORT_STATUS,
  DEVICE_STATUS,
  PORT_COLORS,
  getPortDisplayColor,
};
