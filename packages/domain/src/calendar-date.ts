import { fail, ok, type Result } from './result.ts';

/**
 * A calendar date with no time and no zone (docs/conventions.md, Data rules).
 * `epochDay` is the number of days since 1970-01-01, computed with UTC methods only, so no
 * local-time conversion can shift it.
 */
export interface CalendarDate {
  readonly iso: string;
  readonly epochDay: number;
}

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarDate(input: string): Result<CalendarDate, 'INVALID_DATE'> {
  const match = ISO_DATE.exec(input);
  if (!match) {
    return fail('INVALID_DATE', `"${input}" is not a date in YYYY-MM-DD form`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // setUTCFullYear, not Date.UTC: Date.UTC maps years 0–99 to 1900–1999 (review round 1, F-1).
  const roundTrip = new Date(0);
  roundTrip.setUTCFullYear(year, month - 1, day);
  const utcMs = roundTrip.getTime();
  // Out-of-range parts roll over (2026-02-30 → 2026-03-02); a round-trip mismatch means the date doesn't exist.
  if (
    roundTrip.getUTCFullYear() !== year ||
    roundTrip.getUTCMonth() !== month - 1 ||
    roundTrip.getUTCDate() !== day
  ) {
    return fail('INVALID_DATE', `"${input}" does not exist in the calendar`);
  }
  return ok({ iso: input, epochDay: utcMs / MS_PER_DAY });
}

/** Day of week for an epoch day: 0 = Sunday … 6 = Saturday (1970-01-01 was a Thursday). */
export function dayOfWeek(epochDay: number): number {
  return (((epochDay + 4) % 7) + 7) % 7;
}
