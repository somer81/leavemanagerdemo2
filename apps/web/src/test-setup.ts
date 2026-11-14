import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Determinism (docs/testing.md): motion off in every component test.
const noMotion = document.createElement('style');
noMotion.textContent =
  '*, *::before, *::after { transition: none !important; animation: none !important; }';
document.head.appendChild(noMotion);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
