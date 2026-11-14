// ESLint flat config. Boundary rules (docs/architecture.md "Forbidden dependencies") are added
// per folder below the base config.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/** Only a package's public entry point is imported across packages. */
const DEEP_IMPORT = {
  group: ['@leave/*/src', '@leave/*/src/**'],
  message: "Import the package's public entry point, never its internals.",
};

/** Bare Node built-ins with I/O or process access (the `node:` forms are matched separately). */
const NODE_IO_MODULES = [
  'fs',
  'fs/*',
  'http',
  'https',
  'http2',
  'net',
  'dgram',
  'dns',
  'tls',
  'child_process',
  'worker_threads',
  'cluster',
  'os',
  'process',
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '.anew-dev/**',
      '.agents/**',
      '.claude/**',
      'adapters/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Plain-JS Node scripts and configs (TS files get globals from their types).
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // --- Forbidden dependencies (docs/architecture.md), proven by tools/lint-boundaries.test.ts ---
  // For one file the LAST matching block wins per rule, so every area block repeats DEEP_IMPORT.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: [DEEP_IMPORT] }],
    },
  },
  {
    files: ['packages/domain/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'fastify',
                'fastify/*',
                'react',
                'react/*',
                'react-dom',
                'react-dom/*',
                'node:*',
                ...NODE_IO_MODULES,
              ],
              message: 'packages/domain is pure: no I/O or framework modules.',
            },
            {
              group: ['@leave/api', '@leave/api/*', '@leave/web', '@leave/web/*', '**/apps/**'],
              message: 'packages/domain never depends on apps/*.',
            },
            DEEP_IMPORT,
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'packages/domain never reads the system clock: pass "today" in.',
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'packages/domain never reads the system clock: pass "today" in.',
        },
        {
          selector: "CallExpression[callee.name='Date']",
          message: 'packages/domain never reads the system clock: pass "today" in.',
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@leave/api', '@leave/api/*', '**/api/src/**', '**/apps/api/**'],
              message: 'apps/web talks to apps/api over HTTP only.',
            },
            {
              group: ['@leave/domain'],
              allowTypeImports: true,
              message: 'apps/web may import only types from @leave/domain (use `import type`).',
            },
            DEEP_IMPORT,
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/src/routes/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/repository', '**/repository/**', 'node:sqlite'],
              message: 'Routes never touch storage: call a service.',
            },
            DEEP_IMPORT,
          ],
        },
      ],
    },
  },
);
