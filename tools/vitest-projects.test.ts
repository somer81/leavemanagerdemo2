// Review round 1, F-4 (amendment A-3): every npm workspace must have a Vitest project in
// vitest.config.ts, otherwise its tests would run in neither check profile while check stays
// green (docs/testing.md, Two speeds, rule 4).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import config from '../vitest.config.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Expands the workspace globs of package.json (only the `<dir>/*` form is used here). */
function workspaceDirs(): string[] {
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
    workspaces: string[];
  };
  return pkg.workspaces.flatMap((glob) => {
    if (!glob.endsWith('/*')) throw new Error(`Unsupported workspace glob: ${glob}`);
    const parent = glob.slice(0, -2);
    return readdirSync(path.join(root, parent), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${parent}/${entry.name}`)
      .filter((dir) => existsSync(path.join(root, dir, 'package.json')));
  });
}

function projectRoots(): string[] {
  const projects = (config.test?.projects ?? []) as Array<{ test?: { root?: string } }>;
  return projects.map((project) => path.posix.normalize(project.test?.root ?? ''));
}

describe('vitest projects', () => {
  it('cover every npm workspace', () => {
    const roots = projectRoots();
    const missing = workspaceDirs().filter((dir) => !roots.includes(dir));
    expect(missing).toEqual([]);
  });

  it('include the tools project', () => {
    expect(projectRoots()).toContain('tools');
  });
});
