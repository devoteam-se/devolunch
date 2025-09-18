import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  // Base TypeScript config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Node.js environments (server, functions)
  {
    files: [
      'apps/server/**/*.{ts,tsx}',
      'apps/functions/**/*.{ts,tsx}',
      'packages/**/*.{ts,tsx}',
    ],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        fetch: 'readonly', // Node.js 18+ has fetch
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        // Browser globals for Puppeteer automation
        document: 'readonly',
        window: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLElement: 'readonly',
        Document: 'readonly',
        Element: 'readonly',
      },
    },
  },
  // Browser environment (client)
  {
    files: ['apps/client/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Image: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
    },
  },
  // CommonJS files
  {
    files: ['**/*.config.{js,ts}', '.prettierrc.js', 'eslint.config.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        module: 'writable',
        exports: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      '.turbo/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.js.map',
      '**/*.mjs',
      '**/dist.*',
    ],
  },
];
