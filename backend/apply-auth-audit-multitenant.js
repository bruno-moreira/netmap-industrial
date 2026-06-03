const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🔄 Aplicando migração de Auth, Audit e Multitenant...');
  
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'add-auth-audit-multitenant.sql'), 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migração aplicada com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao aplicar migração:', err);
  } finally {
    await pool.end();
  }
}

applyMigration();
