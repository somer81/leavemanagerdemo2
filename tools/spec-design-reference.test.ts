// Spec 0002: an open UI spec's Design reference is a pinned Claude Design artifact or a named waiver
// (docs/testing.md, "Design references (Claude Design artifacts)").
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkOpenSpecs, checkSpec } from './spec-design-reference.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LINK = 'https://claude.ai/artifact/AbC123xyz';
const CODE_LINK = 'https://claude.ai/code/artifact/0b9e3c2a-4f1d-4e5a-9c7b-2d8e6f1a3b4c';

function fullSpec(status: string, userExperience: string): string {
  return [
    '# Spec 9999 — fixture',
    '',
    `- Status: ${status}`,
    '- Mode: lite',
    '',
    '## Intent',
    'Fixture.',
    '',
    '## User experience',
    '<!-- template comment: - Design reference: a link to the design -->',
    userExperience,
    '',
    '## Constraints & out of scope',
    '- none',
    '',
  ].join('\n');
}

const uiSpec = (status: string, designLine: string): string =>
  fullSpec(status, `- Flow: open the page.\n- States: empty, success.\n${designLine}`);

function miniSpec(status: string, designValue: string): string {
  return [
    '# Mini-spec 9998 — fixture',
    '',
    `- Status: ${status}`,
    '- Source: TICKET-1',
    `- Design: ${designValue}`,
    '',
    '## Changed behavior',
    '- [ ] CB-1 — something',
    '',
  ].join('\n');
}

describe('checkSpec — full specs', () => {
  it('fails a UI spec without an artifact link', () => {
    expect(checkSpec(uiSpec('Approved', ''), 'specs/active/9999-x.md')).toEqual([
      expect.stringContaining('specs/active/9999-x.md'),
    ]);
    expect(checkSpec(uiSpec('Approved', '- Design reference:'), 'f.md')).toHaveLength(1);
  });

  it('fails a link without a version', () => {
    expect(checkSpec(uiSpec('Approved', `- Design reference: ${LINK}`), 'f.md')).toHaveLength(1);
    expect(
      checkSpec(uiSpec('Approved', `- Design reference: ${LINK} · approved 2026-11-14`), 'f.md'),
    ).toHaveLength(1);
    expect(
      checkSpec(
        uiSpec('Approved', `- Design reference: ${LINK} · version:  · approved 2026-11-14`),
        'f.md',
      ),
    ).toHaveLength(1);
  });

  it('passes a spec with no user interface', () => {
    const spec = fullSpec('Approved', 'none — no user interface (process change only)');
    expect(checkSpec(spec, 'f.md')).toEqual([]);
  });

  it.each([LINK, CODE_LINK])('passes an artifact link with a version: %s', (link) => {
    const line = `- Design reference: ${link} · version: spec 9999 approved · approved 2026-11-14`;
    expect(checkSpec(uiSpec('In progress', line), 'f.md')).toEqual([]);
  });

  it('passes a complete waiver', () => {
    const line = '- Design reference: none — waived by somer81, 2026-11-14, a one-field form';
    expect(checkSpec(uiSpec('Approved', line), 'f.md')).toEqual([]);
  });

  it.each([
    'https://www.figma.com/file/abc · version: v3 · approved 2026-11-14',
    'https://claude.ai/chat/0b9e3c2a-4f1d · version: v3 · approved 2026-11-14',
    'http://claude.ai/artifact/AbC123 · version: v3 · approved 2026-11-14',
    'https://claude.ai.evil.example/artifact/AbC123 · version: v3 · approved 2026-11-14',
  ])('rejects links that are not Claude Design artifacts: %s', (value) => {
    expect(checkSpec(uiSpec('Approved', `- Design reference: ${value}`), 'f.md')).toHaveLength(1);
  });

  it('exempts a Draft UI spec', () => {
    expect(checkSpec(uiSpec('Draft', ''), 'f.md')).toEqual([]);
  });

  it.each(['Approved', 'In progress'])('judges Approved and In progress: %s', (status) => {
    expect(checkSpec(uiSpec(status, ''), 'f.md')).toHaveLength(1);
  });

  it('rejects the template wording', () => {
    const line = '- Design reference: none — the flow above is the design.';
    expect(checkSpec(uiSpec('Approved', line), 'f.md')).toHaveLength(1);
  });

  it.each([
    'none — waived by somer81, 2026-11-14',
    'none — waived by , 2026-11-14, reason',
    'none — waived by somer81, 14.11.2026, reason',
    'none — waived',
  ])('rejects an incomplete waiver: %s', (value) => {
    expect(checkSpec(uiSpec('Approved', `- Design reference: ${value}`), 'f.md')).toHaveLength(1);
  });

  it('ignores a design reference that only appears inside an HTML comment', () => {
    const ux = `<!-- - Design reference: ${LINK} · version: v1 · approved 2026-11-14 -->\n- Flow: x`;
    expect(checkSpec(fullSpec('Approved', ux), 'f.md')).toHaveLength(1);
  });
});

describe('checkSpec — mini-specs (spec 0002, G6)', () => {
  it('passes an empty or comment-only Design field', () => {
    expect(checkSpec(miniSpec('Approved', ''), 'm.md')).toEqual([]);
    expect(checkSpec(miniSpec('Approved', '<!-- UI change only -->'), 'm.md')).toEqual([]);
  });

  it('validates a filled-in Design field', () => {
    expect(checkSpec(miniSpec('Approved', 'see figma'), 'm.md')).toHaveLength(1);
    expect(
      checkSpec(
        miniSpec('Approved', `${LINK} · version: spec 9998 approved · approved 2026-11-14`),
        'm.md',
      ),
    ).toEqual([]);
  });
});

describe('checkOpenSpecs — this repository', () => {
  it('open specs in this repository comply', () => {
    expect(checkOpenSpecs(root)).toEqual([]);
  });

  it('ignores specs/done', () => {
    // specs/done/0001-walking-skeleton.md is a UI spec with "Design reference: none. The flow above is the
    // design." — it would fail if judged, yet it is shipped and immutable (spec 0002, AC-6).
    const shipped = checkSpec(
      fullSpec('Approved', '- Flow: x\n- Design reference: none. The flow above is the design.'),
      'specs/done/0001-walking-skeleton.md',
    );
    expect(shipped).toHaveLength(1); // the content alone would fail…
    expect(checkOpenSpecs(root).some((v) => v.includes('specs/done/'))).toBe(false); // …but done/ is never read
  });
});
