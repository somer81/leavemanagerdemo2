import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Determinism (docs/testing.md): motion off in every component test.
const noMotion = document.createElement('style');
noMotion.textContent =
  '*, *::before, *::after { transition: none !important; animation: none !important; }';
document.head.appendChild(noMotion);

// …and the reduced-motion preference, the second place docs/testing.md requires (review round 1,
// F-3). jsdom has no matchMedia at all; this stub answers "reduce" and nothing else.
const REDUCED_MOTION = /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/;
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: (query: string): MediaQueryList => ({
    matches: REDUCED_MOTION.test(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
