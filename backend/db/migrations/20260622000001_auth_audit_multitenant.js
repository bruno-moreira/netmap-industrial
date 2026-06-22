/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
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

  // 4. Alter existing tables
  const addTenantAndUser = (t) => {
    t.integer('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    t.integer('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.integer('updated_by').references('id').inTable('users').onDelete('SET NULL');
  };

  await knex.schema.alterTable('switches', addTenantAndUser);
  await knex.schema.alterTable('devices', addTenantAndUser);
  await knex.schema.alterTable('vlans', addTenantAndUser);
  await knex.schema.alterTable('switch_ports', addTenantAndUser);

  await knex.schema.alterTable('port_history', (t) => {
    t.integer('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
  });

  // 5. Audit Logs
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

  // Create function for updated_at
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create triggers
  const tables = ['tenants', 'roles', 'users'];
  for (const table of tables) {
    await knex.raw(`
      DROP TRIGGER IF EXISTS trg_${table}_updated ON ${table};
      CREATE TRIGGER trg_${table}_updated
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
  }
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  const tablesWithTriggers = ['tenants', 'roles', 'users'];
  for (const table of tablesWithTriggers) {
    await knex.raw(`DROP TRIGGER IF EXISTS trg_${table}_updated ON ${table}`);
  }

  await knex.schema.dropTableIfExists('audit_logs');

  await knex.schema.alterTable('port_history', (t) => {
    t.dropColumn('tenant_id');
    t.dropColumn('user_id');
  });

  const removeTenantAndUser = (t) => {
    t.dropColumn('tenant_id');
    t.dropColumn('created_by');
    t.dropColumn('updated_by');
  };

  await knex.schema.alterTable('switch_ports', removeTenantAndUser);
  await knex.schema.alterTable('vlans', removeTenantAndUser);
  await knex.schema.alterTable('devices', removeTenantAndUser);
  await knex.schema.alterTable('switches', removeTenantAndUser);

  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('tenants');
};
