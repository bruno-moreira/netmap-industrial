import { pool } from '../../config/db.js';

const USER_SELECT = `
  SELECT 
    u.id,
    u.tenant_id,
    u.role_id,
    u.name,
    u.email,
    u.password_hash,
    u.is_active,
    u.created_at,
    u.updated_at,
    r.slug AS role_slug,
    r.name AS role_name,
    t.name AS tenant_name,
    t.slug AS tenant_slug
  FROM users u
  JOIN roles r ON r.id = u.role_id
  JOIN tenants t ON t.id = u.tenant_id
`;

async function findAll(tenantId) {
  const { rows } = await pool.query(
    `${USER_SELECT} WHERE u.tenant_id = $1 ORDER BY u.name ASC`,
    [tenantId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`${USER_SELECT} WHERE u.id = $1`, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await pool.query(`${USER_SELECT} WHERE u.email = $1`, [email]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO users (tenant_id, role_id, name, email, password_hash, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.tenant_id,
      data.role_id,
      data.name,
      data.email,
      data.password_hash,
      data.is_active !== false
    ]
  );
  return findById(rows[0].id);
}

async function update(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;
  const allowed = ['tenant_id', 'role_id', 'name', 'email', 'password_hash', 'is_active'];
  
  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key) && value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(value);
    }
  }
  
  if (!fields.length) return findById(id);
  
  fields.push('updated_at = NOW()');
  params.push(id);
  
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] ? findById(rows[0].id) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
}

export { findAll, findById, findByEmail, create, update, remove };
export default { findAll, findById, findByEmail, create, update, remove };
