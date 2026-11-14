// Spec 0003: the start page uses the Leave Manager design system through one shared token
// stylesheet. jsdom computes no CSS, so these are static checks on the stylesheets and index.html
// (spec 0003, G3); the before/after screenshots at VERIFY are the visual evidence.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const stylesDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(stylesDir, '..', '..');
const read = (file: string): string => readFileSync(path.join(stylesDir, file), 'utf8');

const tokensCss = read('tokens.css');
const baseCss = read('base.css');
const indexHtml = readFileSync(path.join(webDir, 'index.html'), 'utf8');

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Custom properties defined in tokens.css, name → value. */
function definedTokens(): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const m of stripComments(tokensCss).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1] as string, (m[2] as string).trim());
  }
  return tokens;
}

/** Selector text with quote style and whitespace normalized (Prettier writes `[a='b']`). */
const normalizeSelector = (selector: string): string =>
  selector.replace(/'/g, '"').replace(/\s+/g, ' ').trim();

/** The declarations of the first rule whose selector list contains `selector` exactly. */
function rule(css: string, selector: string): string {
  for (const m of stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = (m[1] as string).split(',').map(normalizeSelector);
    if (selectors.includes(normalizeSelector(selector))) return m[2] as string;
  }
  throw new Error(`no rule for ${selector}`);
}

const declaration = (block: string, property: string): string | undefined =>
  new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+);`).exec(block)?.[1]?.trim();

/** Every CSS file under apps/web/src (the app's own stylesheets). */
function appCssFiles(dir = path.join(webDir, 'src')): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return appCssFiles(full);
    return entry.name.endsWith('.css') ? [full] : [];
  });
}

describe('design tokens (spec 0003, CB-4)', () => {
  it('defines the design system tokens under their own names', () => {
    const tokens = definedTokens();
    expect(tokens.get('--surface')).toBe('#f4f6f5');
    expect(tokens.get('--surface-raised')).toBe('#ffffff');
    expect(tokens.get('--ink')).toBe('#17231f');
    expect(tokens.get('--ink-muted')).toBe('#55625d');
    expect(tokens.get('--brand')).toBe('#1e5b4b');
    expect(tokens.get('--on-brand')).toBe('#ffffff');
    expect(tokens.get('--brand-tint')).toBe('#dfe9e5');
    expect(tokens.get('--status-pending')).toBe('#8c5300');
    expect(tokens.get('--status-approved')).toBe('#1d5fa8');
    expect(tokens.get('--status-rejected')).toBe('#b42318');
    expect(tokens.get('--space-1')).toBe('4px');
    expect(tokens.get('--space-2')).toBe('8px');
    expect(tokens.get('--space-4')).toBe('16px');
    expect(tokens.get('--space-6')).toBe('24px');
    expect(tokens.get('--radius-sm')).toBe('4px');
    expect(tokens.get('--radius-md')).toBe('8px');
    expect(tokens.get('--radius-pill')).toBe('999px');
  });

  it('names the design system version it was copied from', () => {
    expect(tokensCss).toContain('https://claude.ai/artifact/WAGKyU2cSBtmzaNUdhB8bi');
    expect(tokensCss).toContain('1794657787-35e0');
  });

  it('every var() used in apps/web is defined in tokens.css', () => {
    const tokens = definedTokens();
    const files = appCssFiles();
    expect(files.length).toBeGreaterThanOrEqual(2);
    const missing = files.flatMap((file) =>
      [...stripComments(readFileSync(file, 'utf8')).matchAll(/var\(\s*(--[a-z0-9-]+)/g)]
        .map((m) => m[1] as string)
        .filter((name) => !tokens.has(name))
        .map((name) => `${path.relative(webDir, file)}: ${name}`),
    );
    expect(missing).toEqual([]);
  });

  it('base.css uses no literal colors', () => {
    const literal = stripComments(baseCss).match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi) ?? [];
    expect(literal).toEqual([]);
  });

  it('every color in base.css comes from a token', () => {
    // Review round 1, L-1: an allow-list closes the whole class — named colors, `transparent`,
    // oklch()/lab()/hwb()/color-mix() — not only hex/rgb/hsl.
    expect(colorsNotFromTokens(baseCss)).toEqual([]);
    expect(colorsNotFromTokens('.a { color: red; }')).toEqual(['color: red']);
    expect(colorsNotFromTokens('.a { background: transparent; }')).toEqual([
      'background: transparent',
    ]);
    expect(colorsNotFromTokens('.a { border: 1px solid oklch(50% 0.1 30); }')).toHaveLength(1);
    expect(
      colorsNotFromTokens('.a { outline-color: color-mix(in srgb, red, blue); }'),
    ).toHaveLength(1);
    expect(colorsNotFromTokens('.a { color: var(--ink); outline: none; }')).toEqual([]);
  });
});

/** Properties that paint a color (review round 1, L-1). Sizes like border-radius are not here. */
const COLOR_PROPERTY =
  /^(color|background|background-color|border|border-(top|right|bottom|left)|border(-(top|right|bottom|left))?-color|outline|outline-color|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color)$/;
const COLOR_KEYWORDS = new Set(['none', 'inherit', 'currentColor']);

/** Color declarations whose value neither uses a token nor is a non-color keyword. */
function colorsNotFromTokens(css: string): string[] {
  return [...stripComments(css).matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)]
    .map((m) => [m[1] as string, (m[2] as string).trim()] as const)
    .filter(([property]) => COLOR_PROPERTY.test(property))
    .filter(([, value]) => !value.includes('var(--') && !COLOR_KEYWORDS.has(value))
    .map(([property, value]) => `${property}: ${value}`);
}

describe('start page styles (spec 0003)', () => {
  it('page ground, heading and tagline use design tokens (CB-1)', () => {
    expect(declaration(rule(baseCss, 'body'), 'background')).toBe('var(--surface)');
    expect(declaration(rule(baseCss, 'body'), 'color')).toBe('var(--ink)');
    expect(declaration(rule(baseCss, 'body'), 'font-family')).toBe('var(--font-sans)');
    const display = rule(baseCss, '.display');
    expect(declaration(display, 'font-family')).toBe('var(--font-display)');
    expect(declaration(display, 'color')).toBe('var(--brand)');
    expect(declaration(display, 'font-size')).toBe('48px');
    expect(declaration(rule(baseCss, '.tagline'), 'color')).toBe('var(--ink-muted)');
    expect(declaration(rule(baseCss, '.card'), 'background')).toBe('var(--surface-raised)');
    expect(declaration(rule(baseCss, '.label'), 'color')).toBe('var(--ink-muted)');
  });

  it('maps each service state to its token (CB-2)', () => {
    expect(declaration(rule(baseCss, '.status[data-state="checking"]'), 'color')).toBe(
      'var(--ink-muted)',
    );
    expect(declaration(rule(baseCss, '.status[data-state="ok"]'), 'color')).toBe('var(--ink)');
    expect(declaration(rule(baseCss, '.status[data-state="unavailable"]'), 'color')).toBe(
      'var(--status-rejected)',
    );
  });

  it('one centered column at most 560px with a space-4 gutter (CB-3)', () => {
    const page = rule(baseCss, '.page');
    expect(declaration(page, 'max-width')).toBe('560px');
    expect(declaration(page, 'margin-inline')).toBe('auto');
    expect(declaration(page, 'padding-inline')).toBe('var(--space-4)');
    expect(baseCss).not.toMatch(/@media[^{]*width/); // one layout at every width (G4)
  });

  it('every font stack ends in system fonts (CB-5)', () => {
    const tokens = definedTokens();
    for (const name of ['--font-display', '--font-sans']) {
      expect(tokens.get(name)).toMatch(/, (system-ui|-apple-system).*sans-serif$/);
    }
    expect(tokens.get('--font-mono')).toMatch(/monospace$/);
  });

  it('web fonts load with display=swap (CB-5)', () => {
    expect(indexHtml).toMatch(
      /<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*display=swap"/,
    );
  });

  it('page title stays Leave Manager (PB-2)', () => {
    expect(indexHtml).toContain('<title>Leave Manager</title>');
  });
});
