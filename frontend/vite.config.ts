import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Keep Windows builds working in environments where native realpath is restricted.
  // This standalone app does not use linked workspace packages.
  resolve: { preserveSymlinks: true },
  server: {
    port: 5173,
    proxy: {
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/model-info': 'http://127.0.0.1:8000',
      '/metadata': 'http://127.0.0.1:8000',
      '/model/metrics': 'http://127.0.0.1:8000',
      '/metrics': 'http://127.0.0.1:8000',
      '/features': 'http://127.0.0.1:8000',
      '/sample-patient': 'http://127.0.0.1:8000',
      '/predict': 'http://127.0.0.1:8000',
      '/scenario': 'http://127.0.0.1:8000',
      '/explain': 'http://127.0.0.1:8000',
      '/batch-predict': 'http://127.0.0.1:8000',
    },
  },
});
