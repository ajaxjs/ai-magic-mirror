import { defineConfig } from 'vite';
import dotenv from 'dotenv'

dotenv.config()

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    exclude: ['bufferutil', 'utf-8-validate']
  },
  build: {
    rollupOptions: {
      external: ['bufferutil', 'utf-8-validate']
    }
  }
});
