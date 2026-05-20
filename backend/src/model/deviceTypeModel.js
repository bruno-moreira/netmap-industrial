const { pool } = require('../../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM device_types ORDER BY name ASC');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM device_types WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const { rows } = await pool.query('SELECT * FROM device_types WHERE slug = $1', [slug]);
  return rows[0] || null;
}

module.exports = { findAll, findById, findBySlug };
