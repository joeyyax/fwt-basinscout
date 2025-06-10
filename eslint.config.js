import js from '@eslint/js';

export default [
  // Ignore patterns (replacing .eslintignore)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'public/**',
      '*.log',
      '.DS_Store',
      '*.tmp',
      '*.temp',
    ],
  },

  // Apply to all JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        Image: 'readonly', // For image loading in animations

        // GSAP globals
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // Code Quality Rules
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'warn', // Allow console but warn about it
      'no-debugger': 'error',
      'no-alert': 'error',

      // Modern JavaScript Best Practices
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',

      // Import/Export Rules
      'no-duplicate-imports': 'error',

      // Code Style Rules (that don't conflict with Prettier)
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'eol-last': 'error',

      // Potential Error Prevention
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-implicit-globals': 'error',

      // Animation/DOM specific rules
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],

      // Allow certain patterns common in animation code
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.js', '**/test/**/*.js', 'src/test/**/*.js'],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        Image: 'readonly',
        Event: 'readonly', // For test event simulation

        // Vitest globals
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',

        // GSAP globals (mocked in tests)
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in tests
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.js', '**/test/**/*.js', 'src/test/**/*.js'],
    languageOptions: {
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        Image: 'readonly',
        Event: 'readonly', // For test event simulation

        // Vitest globals
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',

        // GSAP globals (mocked in tests)
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in tests
    },
  },

  // Allow console statements in utility files that are designed for logging
  {
    files: ['src/scripts/utils/**/*.js'],
    rules: {
      'no-console': 'off', // Utility files can use console
    },
  },

  // Special rules for config files
  {
    files: [
      '*.config.js',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js',
    ],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off', // Config files often have special globals
    },
  },
];
