/// <reference types="vitest" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import fs from 'fs';
import path from 'path';

// Plugin to exclude system files from build
const excludeSystemFiles = () => ({
  name: 'exclude-system-files',
  generateBundle(options, bundle) {
    // Remove any system files from the bundle
    Object.keys(bundle).forEach((fileName) => {
      if (fileName.includes('.DS_Store') || fileName.includes('Thumbs.db')) {
        delete bundle[fileName];
      }
    });
  },
  writeBundle(options) {
    // Clean up any system files that might have been copied
    const outDir = options.dir || 'dist';

    try {
      const dsStoreFile = path.join(outDir, '.DS_Store');
      if (fs.existsSync(dsStoreFile)) {
        fs.unlinkSync(dsStoreFile);
      }
    } catch {
      // Ignore errors
    }
  },
});

export default defineConfig({
  plugins: [preact(), excludeSystemFiles()],
  root: 'src',
  envDir: '../', // Look for .env files in the project root
  publicDir: '../public',
  build: {
    outDir: '../dist/html',
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      output: {
        // Clean asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: [
      'basinscout.test',
      'basinscout.thefreshwatertrust.test',
      'fwt-basinscount.up.railway.app',
      '.railway.app', // Allow any railway.app subdomain
      'craftcms.ddev.site', // DDEV CraftCMS instance
    ],
  },
  server: {
    host: true,
    port: 5173,
    cors: true,
    proxy: {
      // Proxy GraphQL requests to CraftCMS DDEV instance during development
      '/api/graphql': {
        target: 'https://craftcms.ddev.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/graphql/, '/graphql'),
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['../test/unit/setup.js'],
    include: ['../test/unit/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '../test/e2e'],
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
