import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const legacyAppDirectory = fileURLToPath(new URL('../englishfluency-app/', import.meta.url));

export default defineConfig(({ mode }) => {
  const appEnvironment = loadEnv(mode, process.cwd(), '');
  const legacyEnvironment = loadEnv(mode, legacyAppDirectory, '');
  const workerUrl = process.env.WORKER_URL
    ?? appEnvironment.WORKER_URL
    ?? legacyEnvironment.EXPO_PUBLIC_WORKER_URL;
  const workerSecret = process.env.WORKER_SECRET
    ?? appEnvironment.WORKER_SECRET
    ?? legacyEnvironment.EXPO_PUBLIC_WORKER_SECRET;
  const workerProxy = workerUrl ? {
    '/api': {
      target: workerUrl,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
      headers: workerSecret ? { Authorization: `Bearer ${workerSecret}` } : undefined,
    },
  } : undefined;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 4173,
      proxy: workerProxy,
    },
    preview: {
      port: 4173,
      proxy: workerProxy,
    },
  };
});
