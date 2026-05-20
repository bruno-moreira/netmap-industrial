const { pool } = require('../../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM vlans ORDER BY vlan_number ASC');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM vlans WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO vlans (vlan_number, name, color, description) VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.vlan_number, data.name, data.color || '#3b82f6', data.description || null]
  );
  return rows[0];
}

module.exports = { findAll, findById, create };
