import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        /^node:.*/,
        '@modelcontextprotocol/sdk',
        '@faker-js/faker',
        'zod',
        'zod-to-json-schema',
      ],
    },
    target: 'node18',
    outDir: 'dist',
    minify: false,
    sourcemap: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
});
