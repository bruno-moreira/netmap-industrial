import { pool } from '../../config/db.js';

async function findAll(tenantId) {
  const { rows } = await pool.query('SELECT * FROM vlans WHERE tenant_id = $1 ORDER BY vlan_number ASC', [tenantId]);
  return rows;
}

async function findById(id, tenantId) {
  const { rows } = await pool.query('SELECT * FROM vlans WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
  return rows[0] || null;
}

async function create(data, tenantId, userId) {
  const { rows } = await pool.query(
    `INSERT INTO vlans (vlan_number, name, color, description, tenant_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.vlan_number, data.name, data.color || '#3b82f6', data.description || null, tenantId, userId, userId]
  );
  return rows[0];
}

async function update(id, data, tenantId, userId) {
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

  fields.push(`updated_by = $${paramIndex++}`);
  values.push(userId);
  fields.push('updated_at = NOW()');

  if (fields.length === 0) return null;

  values.push(id);
  values.push(tenantId);
  const { rows } = await pool.query(
    `UPDATE vlans SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} RETURNING *`,
    values
  );

  return rows[0] || null;
}

async function remove(id, tenantId) {
  const { rowCount } = await pool.query('DELETE FROM vlans WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
  return rowCount > 0;
}

export { findAll, findById, create, update, remove };
export default { findAll, findById, create, update, remove };
