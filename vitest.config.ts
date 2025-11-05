import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        '**/*.config.ts',
        'coverage/',
        'src/index.ts', // Entry point - requires process spawn testing
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 68, // Realistic threshold given Zod validation error handling
        statements: 90,
      },
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
    testTimeout: 10000,
  },
});
