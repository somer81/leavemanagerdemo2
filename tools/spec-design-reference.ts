// Spec 0002: checks that an open spec with a user interface links a pinned Claude Design artifact
// (or carries a named waiver) as its Design reference. Rules: docs/testing.md,
// "Design references (Claude Design artifacts)". Pure text checks — the link is never opened.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const JUDGED_STATUSES = new Set(['Approved', 'In progress']);
const NO_UI = 'none — no user interface';

const ARTIFACT_REFERENCE =
  /^https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9-]+ · version: \S.*? · approved \d{4}-\d{2}-\d{2}$/;
const WAIVER = /^none — waived by \S.*?, \d{4}-\d{2}-\d{2}, \S.*$/;

const EXPECTED_FORMAT =
  'expected "- Design reference: https://claude.ai/artifact/<id> · version: <label> · approved <YYYY-MM-DD>" ' +
  'or "- Design reference: none — waived by <name>, <YYYY-MM-DD>, <reason>"';

const stripComments = (text: string): string => text.replace(/<!--[\s\S]*?-->/g, '');

/** The Status value with HTML comments removed, as scripts/doctor reads it (review round 1, F-2). */
function statusOf(markdown: string): string | undefined {
  const raw = /^- Status:[ \t]*(.*)$/m.exec(markdown)?.[1];
  return raw === undefined ? undefined : stripComments(raw).trim();
}

/** The body of a `## <heading>` section, up to the next `## ` heading. */
function section(markdown: string, heading: string): string | undefined {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return undefined;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

const isValidReference = (value: string): boolean =>
  ARTIFACT_REFERENCE.test(value) || WAIVER.test(value);

/** Violation messages for one spec file; empty when it complies or is not judged. */
export function checkSpec(markdown: string, fileName: string): string[] {
  const status = statusOf(markdown);
  if (!status || !JUDGED_STATUSES.has(status)) return [];

  const userExperience = section(markdown, 'User experience');
  if (userExperience !== undefined) {
    const body = stripComments(userExperience).trim();
    if (body.startsWith(NO_UI)) return [];
    const value = /^\s*- Design reference:[ \t]*(.*?)\s*$/m.exec(body)?.[1] ?? '';
    if (isValidReference(value)) return [];
    const found = value === '' ? 'no Design reference' : `"${value}"`;
    return [`${fileName}: UI spec with ${found} — ${EXPECTED_FORMAT}`];
  }

  // Mini-spec (specs/TEMPLATE-mini.md): a filled-in `- Design:` field must use the same format (G6).
  const design = /^- Design:[ \t]*(.*?)\s*$/m.exec(markdown)?.[1];
  if (design === undefined) return [];
  const value = stripComments(design).trim();
  if (value === '' || isValidReference(value)) return [];
  return [
    `${fileName}: Design field "${value}" — ${EXPECTED_FORMAT.replaceAll('Design reference', 'Design')}`,
  ];
}

/** Checks every open spec (`specs/active/NNNN-*.md`). Shipped specs in `specs/done/` are never read. */
export function checkOpenSpecs(rootDir: string): string[] {
  const activeDir = path.join(rootDir, 'specs', 'active');
  return readdirSync(activeDir)
    .filter((name) => /^\d{4}-.+\.md$/.test(name))
    .sort()
    .flatMap((name) =>
      checkSpec(readFileSync(path.join(activeDir, name), 'utf8'), `specs/active/${name}`),
    );
}
