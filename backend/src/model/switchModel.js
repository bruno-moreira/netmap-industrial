const { pool } = require('../../config/db');

async function findAll() {
  const { rows } = await pool.query(
    `SELECT s.*,
      (SELECT COUNT(*)::int FROM switch_ports sp WHERE sp.switch_id = s.id) AS ports_total,
      (SELECT COUNT(*)::int FROM switch_ports sp WHERE sp.switch_id = s.id AND sp.status = 'connected') AS ports_connected,
      (SELECT COUNT(*)::int FROM switch_ports sp WHERE sp.switch_id = s.id AND sp.status = 'free') AS ports_free
     FROM switches s
     ORDER BY s.name ASC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM switches WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO switches (name, ip_address, brand, model, rack_id, location, snmp_community, port_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
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

async function update(id, data) {
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
  if (!fields.length) return findById(id);

  fields.push('updated_at = NOW()');
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE switches SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM switches WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
