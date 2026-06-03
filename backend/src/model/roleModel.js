const { pool } = require('../../config/db');

const ROLE_SELECT = `
  SELECT 
    id,
    name,
    slug,
    description,
    created_at,
    updated_at
  FROM roles
`;

async function findAll() {
  const { rows } = await pool.query(`${ROLE_SELECT} ORDER BY name ASC`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`${ROLE_SELECT} WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const { rows } = await pool.query(`${ROLE_SELECT} WHERE slug = $1`, [slug]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO roles (name, slug, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.name, data.slug, data.description || null]
  );
  return rows[0];
}

module.exports = { findAll, findById, findBySlug, create };
