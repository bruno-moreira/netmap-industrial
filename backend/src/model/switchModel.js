const { pool } = require('../../config/db');

async function findAll(tenantId) {
  const { rows } = await pool.query(
    `SELECT s.*,
      (SELECT COUNT(*)::int FROM switch_ports sp WHERE sp.switch_id = s.id) AS ports_total,
      (SELECT COUNT(*)::int FROM switch_ports sp WHERE sp.switch_id = s.id AND sp.status = 'connected') AS ports_connected,
      (SELECT COUNT(*)::int FROM switch_ports sp WHERE sp.switch_id = s.id AND sp.status = 'free') AS ports_free
     FROM switches s
     WHERE s.tenant_id = $1
     ORDER BY s.name ASC`,
    [tenantId]
  );
  return rows;
}

async function findById(id, tenantId) {
  const { rows } = await pool.query(
    'SELECT * FROM switches WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  return rows[0] || null;
}

async function create(data, tenantId, userId) {
  const { rows } = await pool.query(
    `INSERT INTO switches (tenant_id, created_by, updated_by, name, ip_address, brand, model, rack_id, location, snmp_community, port_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      tenantId,
      userId,
      userId,
      data.name,
      data.ip_address || null,
      data.brand || null,
      data.model || null,
      data.rack_id || null,
      data.location || null,
      data.snmp_community || null,
      data.port_count || 24,
    ]
  );
  return rows[0];
}

async function update(id, data, tenantId, userId) {
  const fields = [];
  const params = [];
  let idx = 1;
  const allowed = ['name', 'ip_address', 'brand', 'model', 'rack_id', 'location', 'snmp_community', 'port_count'];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(data[key]);
    }
  }
  fields.push(`updated_by = $${idx++}`);
  params.push(userId);
  fields.push('updated_at = NOW()');
  
  if (!fields.length) return findById(id, tenantId);

  params.push(id);
  params.push(tenantId);
  const { rows } = await pool.query(
    `UPDATE switches SET ${fields.join(', ')} WHERE id = $${idx++} AND tenant_id = $${idx} RETURNING *`,
    params
  );
  return rows[0];
}

async function remove(id, tenantId) {
  const { rowCount } = await pool.query(
    'DELETE FROM switches WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
