/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/html',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/unit/setup.js'],
    include: ['test/unit/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'test/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
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
