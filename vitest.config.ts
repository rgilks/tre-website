import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      exclude: [
        // UI Components (not tested per workspace rules)
        'src/components/**',
        'src/app/**',

        // Configuration files
        '*.config.*',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',

        // Test files themselves
        '**/*.test.*',
        '**/*.spec.*',
        'src/test/**',

        // Type definitions (no logic to test)
        'src/types/**',

        // Public assets
        'public/**',

        // Service worker
        'public/sw.js',

        // Root config files
        'next.config.js',
        'open-next.config.ts',
        'postcss.config.mjs',
        'tailwind.config.ts',
        'wrangler.toml',
      ],
      include: [
        // Only include business logic files
        'src/lib/**',
        'src/store/**',
      ],
      reporter: ['text', 'html'],
      thresholds: {
        functions: 80,
        lines: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
