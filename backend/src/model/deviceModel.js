const { pool } = require('../../config/db');

const DEVICE_SELECT = `
  SELECT d.*, dt.slug AS type_slug, dt.name AS type_name, dt.icon AS type_icon, dt.color AS type_color
  FROM devices d
  JOIN device_types dt ON dt.id = d.device_type_id
`;

async function findAll(filters = {}, tenantId) {
  const conditions = [`d.tenant_id = $1`];
  const params = [tenantId];
  let idx = 2;

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

async function findById(id, tenantId) {
  const { rows } = await pool.query(`${DEVICE_SELECT} WHERE d.id = $1 AND d.tenant_id = $2`, [id, tenantId]);
  return rows[0] || null;
}

async function create(data, tenantId, userId) {
  const { rows } = await pool.query(
    `INSERT INTO devices (device_type_id, name, ip_address, mac_address, location, status, metadata, tenant_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.device_type_id,
      data.name,
      data.ip_address || null,
      data.mac_address || null,
      data.location || null,
      data.status || 'unknown',
      JSON.stringify(data.metadata || {}),
      tenantId,
      userId,
    ]
  );
  return findById(rows[0].id, tenantId);
}

async function update(id, data, tenantId, userId) {
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
  
  fields.push(`updated_by = $${idx++}`);
  params.push(userId);
  fields.push(`updated_at = NOW()`);
  params.push(id);
  params.push(tenantId);

  if (!fields.length) return findById(id, tenantId);

  await pool.query(`UPDATE devices SET ${fields.join(', ')} WHERE id = $${idx - 1} AND tenant_id = $${idx}`, params);
  return findById(id, tenantId);
}

async function remove(id, tenantId) {
  const { rowCount } = await pool.query('DELETE FROM devices WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
