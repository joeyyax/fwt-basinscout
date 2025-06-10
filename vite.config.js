/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.{test,spec}.{js,ts}',
        '**/test-*.js',
      ],
    },
    // Mock GSAP for testing
    server: {
      deps: {
        inline: ['gsap'],
      },
    },
  },
  // Allow importing from src in tests
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
