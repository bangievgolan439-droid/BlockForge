import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/main/index.ts')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/preload/index.ts'),
        // Electron's sandboxed preload loader can't execute ESM (no `import`/`export`) —
        // force CJS output despite the project's "type": "module" so `sandbox: true` still works.
        output: {
          format: 'cjs',
          entryFileNames: '[name].js'
        }
      }
    }
  },
  renderer: {
    root: '.',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer')
      }
    },
    worker: {
      format: 'es'
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    },
    plugins: [react(), glsl()]
  }
});
