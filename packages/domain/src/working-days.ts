import { dayOfWeek, parseCalendarDate } from './calendar-date.ts';
import { fail, ok, type Result } from './result.ts';

export type WorkingDaysError = 'INVALID_DATE' | 'BR1_END_BEFORE_START' | 'BR1_NO_WORKING_DAY';

/**
 * BR-1 (docs/domain.md): counts the Working days (Mon–Fri, both ends inclusive, no public
 * holidays) between two YYYY-MM-DD dates. Order of checks (spec 0001, G3): INVALID_DATE, then
 * BR1_END_BEFORE_START, then BR1_NO_WORKING_DAY.
 */
export function countWorkingDays(start: string, end: string): Result<number, WorkingDaysError> {
  const from = parseCalendarDate(start);
  if (!from.ok) return from;
  const to = parseCalendarDate(end);
  if (!to.ok) return to;

  if (to.value.epochDay < from.value.epochDay) {
    return fail('BR1_END_BEFORE_START', `End date ${end} is before start date ${start}`);
  }

  let workingDays = 0;
  for (let day = from.value.epochDay; day <= to.value.epochDay; day++) {
    const weekday = dayOfWeek(day);
    if (weekday !== 0 && weekday !== 6) workingDays++;
  }

  if (workingDays === 0) {
    return fail('BR1_NO_WORKING_DAY', `${start} to ${end} covers no working day`);
  }
  return ok(workingDays);
}
