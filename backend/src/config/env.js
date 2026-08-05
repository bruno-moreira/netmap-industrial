import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

// Procura .env na raiz do repositório primeiro, ou dentro de backend/
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');
const projectRoot = path.resolve(backendRoot, '..');

const rootEnvPath = path.join(projectRoot, '.env');
const backendEnvPath = path.join(backendRoot, '.env');

let loaded = { parsed: null };
if (fs.existsSync(rootEnvPath)) {
  loaded = config({ path: rootEnvPath });
}
if (fs.existsSync(backendEnvPath)) {
  config({ path: backendEnvPath, override: true });
}

if (!loaded.parsed && !process.env.DB_HOST) {
  const hint = 'Crie o arquivo .env na raiz do projeto com DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT e DB_PORT.';
  throw new Error(`Arquivo .env não encontrado ou vazio.\n${hint}`);
}

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
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

export { env };
