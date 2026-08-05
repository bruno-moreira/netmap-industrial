import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const projectRoot = path.resolve(__dirname, '..');
  const env = {
    ...loadEnv(mode, projectRoot, ''),
    ...loadEnv(mode, __dirname, ''),
  };

  const apiPort = env.PORT || '3002';
  const apiTarget = env.VITE_API_TARGET || env.VITE_API_URL || `http://localhost:${apiPort}`;
  const vitePort = Number(env.VITE_PORT) || 5173;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: vitePort,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
