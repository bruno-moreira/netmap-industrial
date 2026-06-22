export async function up(knex) {
  await knex.schema.alterTable('switch_ports', (t) => {
    t.enum('port_type', ['access', 'hybrid', 'trunk'], { useNative: false, enumName: 'port_type_enum' }).defaultTo('access');
    t.jsonb('tagged_vlan_ids').defaultTo('[]');
  });

  await knex.schema.alterTable('switch_ports', (t) => {
    t.renameColumn('vlan_id', 'untagged_vlan_id');
  });

  // Migrate existing data
  await knex('switch_ports').where('is_trunk', true).update({ port_type: 'trunk' });

  await knex.schema.alterTable('switch_ports', (t) => {
    t.dropColumn('is_trunk');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('switch_ports', (t) => {
    t.boolean('is_trunk').defaultTo(false);
  });

  await knex('switch_ports').where('port_type', 'trunk').update({ is_trunk: true });

  await knex.schema.alterTable('switch_ports', (t) => {
    t.dropColumn('port_type');
    t.dropColumn('tagged_vlan_ids');
    t.renameColumn('untagged_vlan_id', 'vlan_id');
  });
}
