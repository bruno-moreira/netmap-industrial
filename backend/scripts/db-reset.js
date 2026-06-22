import { execSync } from 'child_process';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function resetDb() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'changeme',
    database: process.env.DB_NAME || 'netmap',
  });

  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();

    console.log('🗑️ Removendo todas as tabelas (DROP SCHEMA public CASCADE)...');
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');

    console.log('✅ Banco de dados zerado com sucesso.');

  } catch (err) {
    console.error('❌ Erro ao resetar o banco:', err);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('🚀 Rodando migrações unificadas...');
  try {
    execSync('npx knex migrate:latest', { stdio: 'inherit' });
    console.log('✅ Migrações aplicadas com sucesso.');

    console.log('🌱 Executando seeds...');
    execSync('npx knex seed:run', { stdio: 'inherit' });
    console.log('✅ Seeds concluídos.');
    
    console.log('🎉 Reset do banco de dados completo!');
  } catch (err) {
    console.error('❌ Erro durante o knex:', err.message);
    process.exit(1);
  }
}

resetDb();
