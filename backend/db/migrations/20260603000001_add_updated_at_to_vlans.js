/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('vlans', (t) => {
    t.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER trg_vlans_updated
      BEFORE UPDATE ON vlans
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  `);
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  await knex.raw('DROP TRIGGER IF EXISTS trg_vlans_updated ON vlans');
  await knex.schema.alterTable('vlans', (t) => {
    t.dropColumn('updated_at');
  });
};
