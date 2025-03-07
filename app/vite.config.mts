import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT) || 5173
  },
  plugins: [
    tsconfigPaths(),
    react(),
    nodePolyfills({
      include: ['buffer', 'path', 'stream', 'events', 'fs'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  logLevel: 'info'
});
