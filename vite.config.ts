import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  server: {
    open: './src/demo/index.html',
  },
  build: {
    lib: {
      formats: ['es'],
      entry: './src/index.ts',
      name: 'CollisionController',
      fileName: 'index',
    },
  },
  plugins: [dts({ insertTypesEntry: true })],
});
