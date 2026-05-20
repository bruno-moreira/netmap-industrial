/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('device_types', (t) => {
    t.increments('id').primary();
    t.string('slug', 50).notNullable().unique();
    t.string('name', 100).notNullable();
    t.string('icon', 50);
    t.string('color', 20);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('vlans', (t) => {
    t.increments('id').primary();
    t.integer('vlan_number').notNullable().unique();
    t.string('name', 100).notNullable();
    t.string('color', 20).defaultTo('#3b82f6');
    t.text('description');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('switches', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.string('ip_address', 45);
    t.string('brand', 80);
    t.string('model', 80);
    t.string('rack_id', 50);
    t.string('location', 200);
    t.string('snmp_community', 100);
    t.integer('port_count').defaultTo(24);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('devices', (t) => {
    t.increments('id').primary();
    t.integer('device_type_id').unsigned().references('id').inTable('device_types').onDelete('RESTRICT');
    t.string('name', 150).notNullable();
    t.string('ip_address', 45);
    t.string('mac_address', 17);
    t.string('location', 200);
    t.enum('status', ['online', 'offline', 'unknown', 'maintenance']).defaultTo('unknown');
    t.jsonb('metadata').defaultTo('{}');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['ip_address']);
    t.index(['mac_address']);
    t.index(['device_type_id']);
    t.index(['status']);
  });

  await knex.schema.createTable('switch_ports', (t) => {
    t.increments('id').primary();
    t.integer('switch_id').unsigned().notNullable().references('id').inTable('switches').onDelete('CASCADE');
    t.integer('port_number').notNullable();
    t.enum('status', ['free', 'connected', 'error', 'disabled']).defaultTo('free');
    t.integer('vlan_id').unsigned().references('id').inTable('vlans').onDelete('SET NULL');
    t.string('mac_address', 17);
    t.integer('connected_device_id').unsigned().references('id').inTable('devices').onDelete('SET NULL');
    t.boolean('is_trunk').defaultTo(false);
    t.string('label', 100);
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['switch_id', 'port_number']);
    t.index(['switch_id']);
    t.index(['vlan_id']);
    t.index(['connected_device_id']);
    t.index(['status']);
  });

  await knex.schema.createTable('device_links', (t) => {
    t.increments('id').primary();
    t.integer('source_device_id').unsigned().references('id').inTable('devices').onDelete('CASCADE');
    t.integer('target_device_id').unsigned().references('id').inTable('devices').onDelete('CASCADE');
    t.integer('source_port_id').unsigned().references('id').inTable('switch_ports').onDelete('SET NULL');
    t.string('link_type', 50).defaultTo('ethernet');
    t.text('notes');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['source_device_id']);
    t.index(['target_device_id']);
  });

  await knex.schema.createTable('port_history', (t) => {
    t.increments('id').primary();
    t.integer('port_id').unsigned().notNullable().references('id').inTable('switch_ports').onDelete('CASCADE');
    t.string('action', 50).notNullable();
    t.jsonb('old_value');
    t.jsonb('new_value');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['port_id']);
    t.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('port_history');
  await knex.schema.dropTableIfExists('device_links');
  await knex.schema.dropTableIfExists('switch_ports');
  await knex.schema.dropTableIfExists('devices');
  await knex.schema.dropTableIfExists('switches');
  await knex.schema.dropTableIfExists('vlans');
  await knex.schema.dropTableIfExists('device_types');
};
