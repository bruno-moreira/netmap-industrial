/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('switch_ports', (t) => {
    t.integer('connected_switch_id').references('id').inTable('switches').onDelete('SET NULL');
  });

  // Optional: knex already creates an index when you do references() sometimes, but let's be explicit
  await knex.schema.alterTable('switch_ports', (t) => {
    t.index('connected_switch_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('switch_ports', (t) => {
    t.dropIndex('connected_switch_id');
    t.dropColumn('connected_switch_id');
  });
};
