const { pool } = require('../../config/db');

async function getStats(tenantId) {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM switches WHERE tenant_id = $1) AS total_switches,
      (SELECT COUNT(*)::int FROM switch_ports WHERE tenant_id = $1) AS total_ports,
      (SELECT COUNT(*)::int FROM switch_ports WHERE tenant_id = $1 AND status = 'connected') AS ports_connected,
      (SELECT COUNT(*)::int FROM switch_ports WHERE tenant_id = $1 AND status = 'free') AS ports_free,
      (SELECT COUNT(*)::int FROM devices WHERE tenant_id = $1 AND status = 'online') AS devices_online,
      (SELECT COUNT(*)::int FROM devices WHERE tenant_id = $1 AND status = 'offline') AS devices_offline,
      (SELECT COUNT(*)::int FROM vlans WHERE tenant_id = $1) AS total_vlans,
      (SELECT COUNT(*)::int FROM devices WHERE tenant_id = $1) AS total_devices
  `, [tenantId]);
  return rows[0];
}

module.exports = { getStats };
