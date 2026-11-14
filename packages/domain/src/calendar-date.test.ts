import { describe, expect, it } from 'vitest';
import { parseCalendarDate } from './calendar-date.ts';

describe('parseCalendarDate', () => {
  it.each(['2026-1-5', '20261105', '', '2026-11-05T00:00:00Z', ' 2026-11-05', 'abcd-ef-gh'])(
    'rejects malformed and non-existent dates: malformed %j',
    (input) => {
      const result = parseCalendarDate(input);
      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({ code: 'INVALID_DATE' }),
      });
    },
  );

  it.each(['2026-02-30', '2026-13-01', '2026-00-10', '2026-04-31', '2027-02-29', '2026-11-00'])(
    'rejects malformed and non-existent dates: non-existent %s',
    (input) => {
      const result = parseCalendarDate(input);
      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({ code: 'INVALID_DATE' }),
      });
    },
  );

  it('accepts a leap day', () => {
    const result = parseCalendarDate('2028-02-29');
    expect(result.ok).toBe(true);
  });

  it.each(['0050-03-01', '0000-01-01', '0099-12-31'])(
    'accepts a valid date in years 0000–0099: %s',
    (input) => {
      expect(parseCalendarDate(input)).toEqual({
        ok: true,
        value: expect.objectContaining({ iso: input }),
      });
    },
  );

  it('accepts an ordinary date', () => {
    expect(parseCalendarDate('2026-11-16').ok).toBe(true);
  });
});
