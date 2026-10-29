import { defineConfig } from 'vite';

const apiTarget = process.env.QUIZCRAFT_API_URL || 'http://localhost:5006';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true,
    proxy: {
      '/api': apiTarget,
    },
  },
});
