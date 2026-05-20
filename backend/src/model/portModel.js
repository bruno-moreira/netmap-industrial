const { pool } = require('../../config/db');

const PORT_SELECT = `
  SELECT sp.*,
    v.vlan_number, v.name AS vlan_name, v.color AS vlan_color,
    d.name AS device_name, d.ip_address AS device_ip, d.mac_address AS device_mac,
    d.location AS device_location, d.status AS device_status,
    dt.slug AS device_type_slug, dt.name AS device_type_name, dt.color AS device_type_color,
    s.name AS switch_name
  FROM switch_ports sp
  JOIN switches s ON s.id = sp.switch_id
  LEFT JOIN vlans v ON v.id = sp.vlan_id
  LEFT JOIN devices d ON d.id = sp.connected_device_id
  LEFT JOIN device_types dt ON dt.id = d.device_type_id
`;

async function findById(id) {
  const { rows } = await pool.query(`${PORT_SELECT} WHERE sp.id = $1`, [id]);
  return rows[0] || null;
}

async function findBySwitchId(switchId) {
  const { rows } = await pool.query(
    `${PORT_SELECT} WHERE sp.switch_id = $1 ORDER BY sp.port_number ASC`,
    [switchId]
  );
  return rows;
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO switch_ports (switch_id, port_number, status, vlan_id, mac_address, connected_device_id, is_trunk, label)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      data.switch_id,
      data.port_number,
      data.status || 'free',
      data.vlan_id || null,
      data.mac_address || null,
      data.connected_device_id || null,
      data.is_trunk || false,
      data.label || null,
    ]
  );
  return findById(rows[0].id);
}

async function update(id, data) {
  const current = await findById(id);
  if (!current) return null;

  const fields = [];
  const params = [];
  let idx = 1;
  const allowed = ['status', 'vlan_id', 'mac_address', 'connected_device_id', 'is_trunk', 'label'];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(data[key]);
    }
  }
  if (!fields.length) return current;

  fields.push('updated_at = NOW()');
  params.push(id);
  await pool.query(`UPDATE switch_ports SET ${fields.join(', ')} WHERE id = $${idx}`, params);
  return findById(id);
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

module.exports = { findById, findBySwitchId, create, update, addHistory, getHistory };
