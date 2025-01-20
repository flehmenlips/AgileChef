import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'dnd-vendor': ['@hello-pangea/dnd']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: true,
      requireReturnsDefault: true
    }
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  }
}); 