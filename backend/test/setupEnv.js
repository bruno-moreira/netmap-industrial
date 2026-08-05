/** Variáveis mínimas para carregar a aplicação nos testes */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3002';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'changeme';
process.env.DB_NAME = process.env.DB_NAME || 'netmap_test';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
