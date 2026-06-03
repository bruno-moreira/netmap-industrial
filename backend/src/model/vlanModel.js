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

async function update(id, data) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.vlan_number !== undefined) {
    fields.push(`vlan_number = $${paramIndex++}`);
    values.push(data.vlan_number);
  }
  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE vlans SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM vlans WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
