const { createApp } = require('./src/app');
const { env } = require('./src/config/env');
const { logger } = require('./src/config/logger');
const { pool } = require('./config/db');

const app = createApp();
const server = app.listen(env.PORT, async () => {
  logger.info(`NetMap Industrial API em http://localhost:${env.PORT}`);
  logger.info(`Documentação: http://localhost:${env.PORT}/docs`);

  try {
    const { rows } = await pool.query('SELECT NOW()');
    logger.info({ time: rows[0].now }, 'Conexão com banco de dados estabelecida');
  } catch (err) {
    logger.error({ err }, 'Falha ao conectar com banco de dados');
  }
});

function shutdown(signal) {
  logger.info({ signal }, 'Encerrando servidor...');
  server.close(async () => {
    try {
      await pool.end();
      logger.info('Pool PostgreSQL encerrado');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Erro ao encerrar pool');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
