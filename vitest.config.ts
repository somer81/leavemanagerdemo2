import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Determinism (docs/testing.md): TZ and locale are fixed for every project; "today" is injected.
const env = { TZ: 'UTC', LANG: 'en_US.UTF-8' };

export default defineConfig({
  test: {
    // resource hygiene: run once and exit; never watch mode (docs/conventions.md, Known traps)
    watch: false,
    projects: [
      {
        test: {
          name: 'domain',
          root: './packages/domain',
          environment: 'node',
          env,
        },
      },
      {
        test: {
          name: 'api',
          root: './apps/api',
          environment: 'node',
          env,
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'web',
          root: './apps/web',
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          env,
        },
      },
      {
        test: {
          name: 'tools',
          root: './tools',
          environment: 'node',
          env,
        },
      },
    ],
  },
});
