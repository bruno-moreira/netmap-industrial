const path = require('path');
const fs = require('fs');
const { config } = require('dotenv');

// Sempre carrega .env da pasta backend/, independente do diretório de execução
const backendRoot = path.resolve(__dirname, '../..');
const envPath = path.join(backendRoot, '.env');
const loaded = config({ path: envPath });

if (!loaded.parsed && !process.env.DB_HOST) {
  const examplePath = path.join(backendRoot, '.env_example');
  const hint = fs.existsSync(examplePath)
    ? 'Copie o arquivo de exemplo: cp backend/.env_example backend/.env'
    : 'Crie backend/.env com DB_HOST, DB_USER, DB_PASSWORD e DB_NAME.';
  throw new Error(`Arquivo .env não encontrado ou vazio.\n${hint}`);
}

const { z } = require('zod');

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
}

const env = parsed.data;

module.exports = { env };
