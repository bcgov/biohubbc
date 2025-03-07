import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT) || 5173
  },
  plugins: [
    react(),
    tsconfigPaths(),
    svgr(),
    // nodePolyfills(),
    inject({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  resolve: {
    alias: {
      assert: 'assert',
      'fs-constants': 'fs-constants',
      fs: 'fs-extra',
      path: 'path-browserify',
      stream: 'stream-browserify'
    }
  },
  build: {
    rollupOptions: {
      plugins: []
    }
  },
  logLevel: 'warn',
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  }
});
