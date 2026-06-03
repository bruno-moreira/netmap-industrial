const { pool } = require('./config/db');

async function applyUpdate() {
  try {
    console.log('Adicionando coluna connected_switch_id...');
    await pool.query(`
      ALTER TABLE switch_ports ADD COLUMN IF NOT EXISTS connected_switch_id INTEGER REFERENCES switches (id) ON DELETE SET NULL;
    `);

    console.log('Criando índice...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_switch_ports_connected_switch ON switch_ports (connected_switch_id);
    `);

    console.log('✅ Alterações aplicadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

applyUpdate();
