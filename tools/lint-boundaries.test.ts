// AC-9 (spec 0001): the forbidden dependencies of docs/architecture.md are enforced by the lint
// step. Each case lints a snippet as if it lived at `file` with the real eslint.config.js, so a
// rule that regresses turns scripts/check red (spec 0001, G6).
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const eslint = new ESLint({ cwd: root });

async function boundaryErrors(file: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) });
  return (result?.messages ?? [])
    .filter(
      (m) =>
        m.ruleId === '@typescript-eslint/no-restricted-imports' ||
        m.ruleId === 'no-restricted-syntax',
    )
    .map((m) => m.message);
}

const DOMAIN = 'packages/domain/src/__boundary_fixture__.ts';
const WEB = 'apps/web/src/__boundary_fixture__.tsx';
const API_ROUTE = 'apps/api/src/routes/__boundary_fixture__.ts';
const API_SERVICE = 'apps/api/src/services/__boundary_fixture__.ts';

describe('forbidden dependencies (docs/architecture.md)', () => {
  it.each([
    ['domain imports fastify', DOMAIN, "import Fastify from 'fastify';\nvoid Fastify;"],
    ['domain imports react', DOMAIN, "import { useState } from 'react';\nvoid useState;"],
    [
      'domain imports node:fs',
      DOMAIN,
      "import { readFileSync } from 'node:fs';\nvoid readFileSync;",
    ],
    ['domain imports bare fs', DOMAIN, "import { readFileSync } from 'fs';\nvoid readFileSync;"],
    [
      'domain imports node:sqlite',
      DOMAIN,
      "import { DatabaseSync } from 'node:sqlite';\nvoid DatabaseSync;",
    ],
    [
      'domain imports the api package',
      DOMAIN,
      "import { buildApp } from '@leave/api';\nvoid buildApp;",
    ],
    [
      'domain imports apps by relative path',
      DOMAIN,
      "import { buildApp } from '../../../apps/api/src/app.ts';\nvoid buildApp;",
    ],
    ['domain reads the clock with Date.now()', DOMAIN, 'export const now = Date.now();'],
    ['domain reads the clock with new Date()', DOMAIN, 'export const now = new Date();'],
    ['domain reads the clock with Date()', DOMAIN, 'export const now = Date();'],
    ['web imports the api package', WEB, "import { buildApp } from '@leave/api';\nvoid buildApp;"],
    [
      'web imports api by relative path',
      WEB,
      "import { buildApp } from '../../api/src/app.ts';\nvoid buildApp;",
    ],
    [
      'web imports a domain value',
      WEB,
      "import { countWorkingDays } from '@leave/domain';\nvoid countWorkingDays;",
    ],
    [
      'api route imports the repository',
      API_ROUTE,
      "import { findAll } from '../repository/leave-requests.ts';\nvoid findAll;",
    ],
    [
      'api route imports node:sqlite',
      API_ROUTE,
      "import { DatabaseSync } from 'node:sqlite';\nvoid DatabaseSync;",
    ],
    [
      'deep import of package internals',
      API_SERVICE,
      "import { ok } from '@leave/domain/src/result.ts';\nvoid ok;",
    ],
  ])('forbids: %s', async (_name, file, code) => {
    expect(await boundaryErrors(file, code)).not.toEqual([]);
  });

  it.each([
    ['domain uses an explicit date', DOMAIN, 'export const d = new Date(Date.UTC(2026, 0, 1));'],
    ['domain imports itself', DOMAIN, "import { ok } from './result.ts';\nvoid ok;"],
    [
      'web imports domain types only',
      WEB,
      "import type { Result } from '@leave/domain';\nexport type R = Result<number>;",
    ],
    ['web imports react', WEB, "import { useState } from 'react';\nvoid useState;"],
    [
      'api service imports the domain entry point',
      API_SERVICE,
      "import { countWorkingDays } from '@leave/domain';\nvoid countWorkingDays;",
    ],
    [
      'api service imports the repository',
      API_SERVICE,
      "import { findAll } from '../repository/leave-requests.ts';\nvoid findAll;",
    ],
    [
      'api route imports fastify',
      API_ROUTE,
      "import type { FastifyInstance } from 'fastify';\nexport type F = FastifyInstance;",
    ],
  ])('allows: %s', async (_name, file, code) => {
    expect(await boundaryErrors(file, code)).toEqual([]);
  });
});
