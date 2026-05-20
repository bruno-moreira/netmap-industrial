const { Pool } = require('pg');
const { env } = require('../src/config/env');

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL', err);
});

module.exports = { pool };
