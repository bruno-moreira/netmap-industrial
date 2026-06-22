import { pool } from './config/db.js';

async function testDB() {
  console.log('Testando conexão com banco...');
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão OK!', res.rows[0]);
    
    console.log('\nVerificando tabelas...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tabelas encontradas:', tables.rows.map(r => r.table_name));
    
    console.log('\nVerificando device_types...');
    const types = await pool.query('SELECT * FROM device_types');
    console.log('Device types:', types.rows);
    
    console.log('\nVerificando devices...');
    const devices = await pool.query('SELECT * FROM devices');
    console.log('Devices:', devices.rows);
    
    console.log('\n✅ Teste completo!');
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

testDB();
