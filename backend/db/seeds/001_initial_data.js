/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function seed(knex) {
  await knex('port_history').del();
  await knex('device_links').del();
  await knex('switch_ports').del();
  await knex('devices').del();
  await knex('switches').del();
  await knex('vlans').del();
  await knex('device_types').del();

  const deviceTypes = [
    { slug: 'pc', name: 'PC', icon: 'monitor', color: '#64748b' },
    { slug: 'printer', name: 'Impressora', icon: 'printer', color: '#22c55e' },
    { slug: 'time_clock', name: 'Relógio de ponto', icon: 'clock', color: '#eab308' },
    { slug: 'camera', name: 'Câmera IP', icon: 'camera', color: '#8b5cf6' },
    { slug: 'dvr', name: 'DVR/NVR', icon: 'hard-drive', color: '#6366f1' },
    { slug: 'turnstile', name: 'Catraca', icon: 'door-open', color: '#f97316' },
    { slug: 'ap', name: 'Access Point', icon: 'wifi', color: '#06b6d4' },
    { slug: 'ip_phone', name: 'Telefone IP', icon: 'phone', color: '#14b8a6' },
    { slug: 'extension_antenna', name: 'Antena de ramal', icon: 'radio', color: '#a855f7' },
    { slug: 'server', name: 'Servidor', icon: 'server', color: '#0ea5e9' },
    { slug: 'switch', name: 'Switch', icon: 'network', color: '#334155' },
    { slug: 'router', name: 'Roteador', icon: 'router', color: '#1e293b' },
  ];
  await knex('device_types').insert(deviceTypes);

  const vlans = [
    { vlan_number: 10, name: 'Administração', color: '#3b82f6' },
    { vlan_number: 20, name: 'CFTV', color: '#8b5cf6' },
    { vlan_number: 30, name: 'Impressoras', color: '#86efac' },
    { vlan_number: 40, name: 'Catracas', color: '#f97316' },
    { vlan_number: 99, name: 'Trunk', color: '#171717' },
  ];
  await knex('vlans').insert(vlans);

  const [sw] = await knex('switches')
    .insert({
      name: 'SW-ADM-01',
      ip_address: '192.168.1.10',
      brand: 'HP',
      model: '2530-24',
      rack_id: 'RACK-A1',
      location: 'Administrativo',
      port_count: 24,
    })
    .returning('*');

  const typeMap = Object.fromEntries(
    (await knex('device_types').select('id', 'slug')).map((r) => [r.slug, r.id])
  );
  const vlanMap = Object.fromEntries(
    (await knex('vlans').select('id', 'vlan_number')).map((r) => [r.vlan_number, r.id])
  );

  const [printer] = await knex('devices')
    .insert({
      device_type_id: typeMap.printer,
      name: 'Impressora RH',
      ip_address: '192.168.30.10',
      mac_address: 'AA:BB:CC:DD:EE:01',
      location: 'Administrativo',
      status: 'online',
    })
    .returning('*');

  const [camera] = await knex('devices')
    .insert({
      device_type_id: typeMap.camera,
      name: 'Câmera Portaria',
      ip_address: '192.168.20.50',
      mac_address: 'AA:BB:CC:DD:EE:02',
      location: 'Portaria',
      status: 'online',
    })
    .returning('*');

  const ports = [];
  for (let i = 1; i <= 24; i++) {
    ports.push({
      switch_id: sw.id,
      port_number: i,
      status: 'free',
    });
  }
  ports[11] = {
    ...ports[11],
    status: 'connected',
    vlan_id: vlanMap[30],
    mac_address: printer.mac_address,
    connected_device_id: printer.id,
    label: 'Impressora RH',
  };
  ports[7] = {
    ...ports[7],
    status: 'connected',
    vlan_id: vlanMap[20],
    mac_address: camera.mac_address,
    connected_device_id: camera.id,
    label: 'Câmera Portaria',
  };
  ports[23] = { ...ports[23], status: 'free', is_trunk: true, vlan_id: vlanMap[99], label: 'Uplink' };

  await knex('switch_ports').insert(ports);
};
