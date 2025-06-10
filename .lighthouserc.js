module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'serve -s dist -l 3000',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 10000,
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],

        // Custom assertions for our app
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'off', // We might not use WebP yet
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
