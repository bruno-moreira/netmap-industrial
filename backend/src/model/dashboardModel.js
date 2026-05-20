const { pool } = require('../../config/db');

async function getStats() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM switches) AS total_switches,
      (SELECT COUNT(*)::int FROM switch_ports) AS total_ports,
      (SELECT COUNT(*)::int FROM switch_ports WHERE status = 'connected') AS ports_connected,
      (SELECT COUNT(*)::int FROM switch_ports WHERE status = 'free') AS ports_free,
      (SELECT COUNT(*)::int FROM switch_ports WHERE status = 'error') AS ports_error,
      (SELECT COUNT(*)::int FROM devices WHERE status = 'online') AS devices_online,
      (SELECT COUNT(*)::int FROM devices WHERE status = 'offline') AS devices_offline,
      (SELECT COUNT(*)::int FROM vlans) AS total_vlans,
      (SELECT COUNT(*)::int FROM devices) AS total_devices
  `);
  return rows[0];
}

module.exports = { getStats };
