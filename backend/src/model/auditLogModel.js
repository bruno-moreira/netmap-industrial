import { pool } from '../../config/db.js';

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO audit_logs 
     (tenant_id, user_id, entity_type, entity_id, action, old_values, new_values, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.tenant_id,
      data.user_id || null,
      data.entity_type,
      data.entity_id,
      data.action,
      data.old_values || null,
      data.new_values || null,
      data.ip_address || null,
      data.user_agent || null
    ]
  );
  return rows[0];
}

async function findByEntity(tenantId, entityType, entityId) {
  const { rows } = await pool.query(
    `SELECT 
      al.*,
      u.name AS user_name
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     WHERE al.tenant_id = $1 
       AND al.entity_type = $2 
       AND al.entity_id = $3
     ORDER BY al.created_at DESC
     LIMIT 100`,
    [tenantId, entityType, entityId]
  );
  return rows;
}

async function findByTenant(tenantId, options = {}) {
  const { limit = 100, offset = 0 } = options;
  const { rows } = await pool.query(
    `SELECT 
      al.*,
      u.name AS user_name
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     WHERE al.tenant_id = $1
     ORDER BY al.created_at DESC
     LIMIT $2 OFFSET $3`,
    [tenantId, limit, offset]
  );
  return rows;
}

export { create, findByEntity, findByTenant };
export default { create, findByEntity, findByTenant };
