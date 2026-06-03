const { pool } = require('./config/db');

async function checkVlans() {
  try {
    console.log('Verificando estrutura da tabela vlans...');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vlans' 
      ORDER BY ordinal_position
    `);
    console.log('Colunas na tabela vlans:', columns.rows);
    
    console.log('\nVerificando se o trigger existe...');
    const triggers = await pool.query(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_table = 'vlans'
    `);
    console.log('Triggers:', triggers.rows);
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    await pool.end();
  }
}

checkVlans();
