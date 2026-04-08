import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    exclude: [
      'tests/e2e/**',
      'node_modules/**'
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],      clean: true,      thresholds: {
        lines: 90,
        statements: 90,
        branches: 90,
        functions: 90,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        'tests/e2e/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/index.ts',
      ],
    },
  },
})