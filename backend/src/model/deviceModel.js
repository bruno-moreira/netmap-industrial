const { pool } = require('../../config/db');

const DEVICE_SELECT = `
  SELECT d.*, dt.slug AS type_slug, dt.name AS type_name, dt.icon AS type_icon, dt.color AS type_color
  FROM devices d
  JOIN device_types dt ON dt.id = d.device_type_id
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (filters.type) {
    conditions.push(`dt.slug = $${idx++}`);
    params.push(filters.type);
  }
  if (filters.status) {
    conditions.push(`d.status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters.q) {
    conditions.push(
      `(d.name ILIKE $${idx} OR d.ip_address ILIKE $${idx} OR d.mac_address ILIKE $${idx} OR d.location ILIKE $${idx})`
    );
    params.push(`%${filters.q}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${DEVICE_SELECT} ${where} ORDER BY d.name ASC LIMIT 500`,
    params
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`${DEVICE_SELECT} WHERE d.id = $1`, [id]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO devices (device_type_id, name, ip_address, mac_address, location, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.device_type_id,
      data.name,
      data.ip_address || null,
      data.mac_address || null,
      data.location || null,
      data.status || 'unknown',
      JSON.stringify(data.metadata || {}),
    ]
  );
  return findById(rows[0].id);
}

async function update(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;

  const map = {
    device_type_id: 'device_type_id',
    name: 'name',
    ip_address: 'ip_address',
    mac_address: 'mac_address',
    location: 'location',
    status: 'status',
    metadata: 'metadata',
  };

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      params.push(key === 'metadata' ? JSON.stringify(data[key]) : data[key]);
    }
  }

  if (!fields.length) return findById(id);

  fields.push(`updated_at = NOW()`);
  params.push(id);

  await pool.query(`UPDATE devices SET ${fields.join(', ')} WHERE id = $${idx}`, params);
  return findById(id);
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM devices WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
