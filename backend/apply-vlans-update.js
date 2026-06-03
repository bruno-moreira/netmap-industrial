const { pool } = require('./config/db');

async function applyUpdate() {
  try {
    console.log('Adicionando coluna updated_at na tabela vlans...');
    await pool.query(`
      ALTER TABLE vlans 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    `);
    
    console.log('Criando função set_updated_at...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('Criando trigger trg_vlans_updated...');
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_vlans_updated ON vlans;
      CREATE TRIGGER trg_vlans_updated
      BEFORE UPDATE ON vlans
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    
    console.log('✅ Alterações aplicadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

applyUpdate();
