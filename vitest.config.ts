import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.*',
      ],
    },
    server: {
      deps: {
        // Inline these dependencies to fix ES module compatibility issues in Node 18.x
        // html-encoding-sniffer (used by jsdom) tries to require() @exodus/bytes which is ESM-only
        // Need to inline the entire dependency chain: jsdom -> html-encoding-sniffer -> @exodus/bytes
        inline: [
          'jsdom',
          'html-encoding-sniffer',
          '@exodus/bytes',
          'whatwg-url',
        ],
        // Enable fallback to CommonJS for better ESM/CJS compatibility in Node 18.x
        fallbackCJS: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

