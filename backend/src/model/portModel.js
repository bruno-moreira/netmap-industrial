import { pool } from '../../config/db.js';

const PORT_SELECT = `
  SELECT sp.*,
    v.vlan_number AS untagged_vlan_number, v.name AS untagged_vlan_name, v.color AS untagged_vlan_color,
    d.name AS device_name, d.ip_address AS device_ip, d.mac_address AS device_mac,
    d.location AS device_location, d.status AS device_status,
    dt.slug AS device_type_slug, dt.name AS device_type_name, dt.color AS device_type_color,
    s.name AS switch_name,
    cs.name AS connected_switch_name, cs.ip_address AS connected_switch_ip,
    cs.location AS connected_switch_location
  FROM switch_ports sp
  JOIN switches s ON s.id = sp.switch_id
  LEFT JOIN vlans v ON v.id = sp.untagged_vlan_id
  LEFT JOIN devices d ON d.id = sp.connected_device_id
  LEFT JOIN device_types dt ON dt.id = d.device_type_id
  LEFT JOIN switches cs ON cs.id = sp.connected_switch_id
`;

async function findById(id, tenantId) {
  const { rows } = await pool.query(`${PORT_SELECT} WHERE sp.id = $1 AND sp.tenant_id = $2`, [id, tenantId]);
  return rows[0] || null;
}

async function findBySwitchId(switchId, tenantId) {
  const { rows } = await pool.query(
    `${PORT_SELECT} WHERE sp.switch_id = $1 AND sp.tenant_id = $2 ORDER BY sp.port_number ASC`,
    [switchId, tenantId]
  );
  return rows;
}

async function create(data, tenantId, userId) {
  const { rows } = await pool.query(
    `INSERT INTO switch_ports (switch_id, port_number, status, port_type, untagged_vlan_id, tagged_vlan_ids, mac_address, connected_device_id, connected_switch_id, label, tenant_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id`,
    [
      data.switch_id,
      data.port_number,
      data.status || 'free',
      data.port_type || 'access',
      data.untagged_vlan_id || null,
      JSON.stringify(data.tagged_vlan_ids || []),
      data.mac_address || null,
      data.connected_device_id || null,
      data.connected_switch_id || null,
      data.label || null,
      tenantId,
      userId,
      userId,
    ]
  );
  return findById(rows[0].id, tenantId);
}

async function update(id, data, tenantId, userId) {
  const current = await findById(id, tenantId);
  if (!current) return null;

  const fields = [];
  const params = [];
  let idx = 1;
  const allowed = ['status', 'port_type', 'untagged_vlan_id', 'tagged_vlan_ids', 'mac_address', 'connected_device_id', 'connected_switch_id', 'label'];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(key === 'tagged_vlan_ids' ? JSON.stringify(data[key]) : data[key]);
    }
  }
  
  fields.push(`updated_by = $${idx++}`);
  params.push(userId);
  fields.push('updated_at = NOW()');
  
  if (!fields.length) return current;

  params.push(id);
  params.push(tenantId);
  // We use idx and idx+1 since they correspond to the array length + 1
  await pool.query(`UPDATE switch_ports SET ${fields.join(', ')} WHERE id = $${idx++} AND tenant_id = $${idx}`, params);
  return findById(id, tenantId);
}

async function addHistory(portId, action, oldValue, newValue) {
  await pool.query(
    `INSERT INTO port_history (port_id, action, old_value, new_value) VALUES ($1, $2, $3, $4)`,
    [portId, action, JSON.stringify(oldValue), JSON.stringify(newValue)]
  );
}

async function getHistory(portId, limit = 50) {
  const { rows } = await pool.query(
    `SELECT * FROM port_history WHERE port_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [portId, limit]
  );
  return rows;
}

export { findById, findBySwitchId, create, update, addHistory, getHistory };
export default { findById, findBySwitchId, create, update, addHistory, getHistory };
