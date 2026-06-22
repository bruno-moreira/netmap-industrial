import { pool } from '../../config/db.js';

const TENANT_SELECT = `
  SELECT 
    id,
    name,
    slug,
    description,
    is_active,
    created_at,
    updated_at
  FROM tenants
`;

async function findAll() {
  const { rows } = await pool.query(`${TENANT_SELECT} ORDER BY name ASC`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`${TENANT_SELECT} WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const { rows } = await pool.query(`${TENANT_SELECT} WHERE slug = $1`, [slug]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO tenants (name, slug, description, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.slug, data.description || null, data.is_active !== false]
  );
  return rows[0];
}

async function update(id, data) {
  const fields = [];
  const params = [];
  let idx = 1;
  const allowed = ['name', 'slug', 'description', 'is_active'];
  
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
    `UPDATE tenants SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tenants WHERE id = $1', [id]);
  return rowCount > 0;
}

export { findAll, findById, findBySlug, create, update, remove };
export default { findAll, findById, findBySlug, create, update, remove };
