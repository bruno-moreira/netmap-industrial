export async function up(knex) {
  // 1. Tenants table
  await knex.schema.createTable('tenants', (t) => {
    t.increments('id').primary();
    t.string('name', 255).notNullable().unique();
    t.string('slug', 100).notNullable().unique();
    t.text('description');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // 2. Roles table
  await knex.schema.createTable('roles', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable().unique();
    t.string('slug', 50).notNullable().unique();
    t.text('description');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // 3. Users table
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.integer('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.integer('role_id').notNullable().references('id').inTable('roles').onDelete('RESTRICT');
    t.string('name', 255).notNullable();
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  const addTenantAndUser = (t) => {
    t.integer('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    t.integer('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.integer('updated_by').references('id').inTable('users').onDelete('SET NULL');
  };

  // 4. Device Types
  await knex.schema.createTable('device_types', (t) => {
    t.increments('id').primary();
    t.string('slug', 50).notNullable().unique();
    t.string('name', 100).notNullable();
    t.string('icon', 50);
    t.string('color', 20);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 5. VLANs
  await knex.schema.createTable('vlans', (t) => {
    t.increments('id').primary();
    t.integer('vlan_number').notNullable().unique();
    t.string('name', 100).notNullable();
    t.string('color', 20).defaultTo('#3b82f6');
    t.text('description');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    addTenantAndUser(t);
  });

  // 6. Switches
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
    addTenantAndUser(t);
  });

  // 7. Devices
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
    addTenantAndUser(t);
  });

  // 8. Switch Ports
  await knex.schema.createTable('switch_ports', (t) => {
    t.increments('id').primary();
    t.integer('switch_id').unsigned().notNullable().references('id').inTable('switches').onDelete('CASCADE');
    t.integer('port_number').notNullable();
    t.enum('status', ['free', 'connected', 'error', 'disabled']).defaultTo('free');
    t.enum('port_type', ['access', 'hybrid', 'trunk'], { useNative: false, enumName: 'port_type_enum' }).defaultTo('access');
    t.integer('untagged_vlan_id').unsigned().references('id').inTable('vlans').onDelete('SET NULL');
    t.jsonb('tagged_vlan_ids').defaultTo('[]');
    t.string('mac_address', 17);
    t.integer('connected_device_id').unsigned().references('id').inTable('devices').onDelete('SET NULL');
    t.integer('connected_switch_id').unsigned().references('id').inTable('switches').onDelete('SET NULL');
    t.string('label', 100);
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['switch_id', 'port_number']);
    t.index(['switch_id']);
    t.index(['untagged_vlan_id']);
    t.index(['connected_device_id']);
    t.index('connected_switch_id');
    t.index(['status']);
    addTenantAndUser(t);
  });

  // 9. Device Links
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

  // 10. Port History
  await knex.schema.createTable('port_history', (t) => {
    t.increments('id').primary();
    t.integer('port_id').unsigned().notNullable().references('id').inTable('switch_ports').onDelete('CASCADE');
    t.integer('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action', 50).notNullable();
    t.jsonb('old_value');
    t.jsonb('new_value');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['port_id']);
    t.index(['created_at']);
  });

  // 11. Audit Logs
  await knex.schema.createTable('audit_logs', (t) => {
    t.increments('id').primary();
    t.integer('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('entity_type', 100).notNullable();
    t.integer('entity_id').notNullable();
    t.string('action', 50).notNullable();
    t.jsonb('old_values');
    t.jsonb('new_values');
    t.string('ip_address', 45);
    t.text('user_agent');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // 12. updated_at Triggers Function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 13. Apply updated_at triggers
  const tables = ['tenants', 'roles', 'users', 'vlans'];
  for (const table of tables) {
    await knex.raw(`
      DROP TRIGGER IF EXISTS trg_${table}_updated ON ${table};
      CREATE TRIGGER trg_${table}_updated
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
  }
}

export async function down(knex) {
  const tablesWithTriggers = ['tenants', 'roles', 'users', 'vlans'];
  for (const table of tablesWithTriggers) {
    await knex.raw(`DROP TRIGGER IF EXISTS trg_${table}_updated ON ${table}`);
  }

  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('port_history');
  await knex.schema.dropTableIfExists('device_links');
  await knex.schema.dropTableIfExists('switch_ports');
  await knex.schema.dropTableIfExists('devices');
  await knex.schema.dropTableIfExists('switches');
  await knex.schema.dropTableIfExists('vlans');
  await knex.schema.dropTableIfExists('device_types');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('tenants');
}
