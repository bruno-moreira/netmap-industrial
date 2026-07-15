export async function up(knex) {
  await knex.schema.alterTable('switches', (t) => {
    t.enum('snmp_version', ['v1', 'v2c', 'v3']).defaultTo('v2c');
    t.string('snmp_user', 100);
    t.enum('snmp_auth_protocol', ['md5', 'sha', 'sha224', 'sha256', 'sha384', 'sha512']).nullable();
    t.string('snmp_auth_password', 100);
    t.enum('snmp_priv_protocol', ['des', 'aes', 'aes256b', 'aes256r']).nullable();
    t.string('snmp_priv_password', 100);
  });
}

export async function down(knex) {
  await knex.schema.alterTable('switches', (t) => {
    t.dropColumn('snmp_version');
    t.dropColumn('snmp_user');
    t.dropColumn('snmp_auth_protocol');
    t.dropColumn('snmp_auth_password');
    t.dropColumn('snmp_priv_protocol');
    t.dropColumn('snmp_priv_password');
  });
}
