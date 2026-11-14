import { describe, expect, it } from 'vitest';
import { countWorkingDays } from './working-days.ts';

describe('countWorkingDays (BR-1)', () => {
  it.each([
    ['2026-11-16', '2026-11-20', 5], // Mon → Fri
    ['2026-11-20', '2026-11-23', 2], // Fri → Mon, across a weekend
    ['2026-11-18', '2026-11-18', 1], // a single Wednesday
    ['2026-11-16', '2026-11-27', 10], // two full weeks
  ])('counts Mon–Fri inclusive: %s → %s = %i', (start, end, expected) => {
    expect(countWorkingDays(start, end)).toEqual({ ok: true, value: expected });
  });

  it('rejects end before start', () => {
    expect(countWorkingDays('2026-11-20', '2026-11-16')).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'BR1_END_BEFORE_START' }),
    });
  });

  it.each([
    ['2026-11-21', '2026-11-22'], // Sat → Sun
    ['2026-11-21', '2026-11-21'], // a single Saturday
  ])('rejects a range with no working day: %s → %s', (start, end) => {
    expect(countWorkingDays(start, end)).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'BR1_NO_WORKING_DAY' }),
    });
  });

  it('reports INVALID_DATE before BR-1', () => {
    // end is before start AND start is invalid: the invalid date wins (spec G3)
    expect(countWorkingDays('2026-02-30', '2026-01-05')).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'INVALID_DATE' }),
    });
    expect(countWorkingDays('2026-11-16', '2026-13-01')).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'INVALID_DATE' }),
    });
  });
});
