# Spec 0001 — Walking skeleton

- Status: In progress
- Mode: lite
- Plan: `specs/plans/0001-plan.md`
- Self-critique: done

## Intent
Before any leave feature is built, the team needs the thinnest possible end-to-end slice of
Leave Manager. That slice is a pure rules package, an API and a browser page, each holding one
real piece of behavior and wired together, with the verification contract fully switched on. It
succeeds when one command (`scripts/check`) proves the whole slice locally and in CI, a developer
can start the app and see it talk to its API, and the architecture boundaries are enforced by
tooling rather than prose. The one real business rule included is BR-1's working-day count,
because every later leave feature depends on it. Deliberately not done: leave requests, balances,
users, login, persistence of business data, and any other business rule.

## Requirements
- R-1: The system counts the Working days (Monday–Friday, both ends inclusive, no public
  holidays) in a date range given as two `YYYY-MM-DD` calendar dates.
- R-2: The system rejects a date range that BR-1 forbids (end date before start date, or no
  Working day covered) and a date that is malformed or doesn't exist in the calendar. Each
  rejection carries a distinct error code.
- R-3: The service answers a health inquiry from any caller, without a session, with only an
  "ok" indication and no other data.
- R-4: A browser start page shows the product name and whether the service is reachable.
- R-5: A developer can start the app (page and service together) locally with one documented
  command.
- R-6: Every planned verification step (format, lint, typecheck, unit/component tests,
  integration tests, build) is active in `scripts/check`, with the fast/full split of
  `docs/testing.md`. CI runs the full contract on every push and pull request on Node 26.
- R-7: The forbidden dependencies of `docs/architecture.md` are enforced by the lint step. A
  violating import makes `scripts/check` red.

## User experience
- Flow: the developer starts the app with the documented command → opens the start page in a
  browser → sees "Leave Manager" and the service status.
- States of the start page:
  - **Checking:** while the status is being fetched, it shows "Checking service…".
  - **Ok:** the service answered ok, and it shows "Service: OK".
  - **Unavailable:** the service is unreachable or answered with an error, and it shows "Service unavailable".
  - Empty and no-permission states don't apply, because the page has no data and no access control.
- Design reference: none. The flow above is the design. No styling beyond readable defaults.
- Accessibility: the status text sits in a polite live region (`role="status"`) so screen readers
  announce changes. The state is told by text, never by colour alone. The page title is "Leave Manager".

## Constraints & out of scope
- Out of scope: leave requests, Balance, Employees/Managers, login and sessions, the SQLite
  database and migrations (no business data exists yet), BR-2…BR-7 (BR-7's same-year limit is
  **not** enforced here; the count works on any valid range), production deployment, styling.
- The health inquiry is the only behavior reachable without a session. It is an explicit exception
  to default-deny (`docs/security.md`) and returns nothing beyond "ok" (no version, uptime or
  environment data). `docs/security.md` names it as the only exception. This is not a change to
  Authorization rules for leave data, so this spec is **not** in the sensitive area (G1).
- The start page is public in this spec, and login arrives with the first user-facing feature (G2).
- Validation order: a malformed or non-existent date is reported as `INVALID_DATE` before any
  BR-1 check (G3).
- The health status has no timeout or retry rules: any network failure or non-success answer
  counts as unavailable, with no automatic retry (G5).
- AC-9 is proven by tests that lint fixture files breaking each forbidden rule and assert the
  errors, so a rule regression turns `scripts/check` red (G6).
- Split: proposed (domain / api+web / check+CI); kept as one — human at the self-critique gate, 2026-11-14,
  a walking skeleton only proves its point end to end (G7).
- Stack, versions, layout and test conventions follow `docs/conventions.md`, `docs/architecture.md`
  and `docs/testing.md`. New dependencies are listed and approved at the plan gate (`docs/security.md`).
- Check leaves nothing running: the residue test is clean in both profiles (BUILD's Done, not a criterion).

## Acceptance criteria
- [ ] AC-1 — Working days are counted Mon–Fri with both ends inclusive: Mon 2026-11-16 → Fri 2026-11-20 = 5;
  Fri 2026-11-20 → Mon 2026-11-23 = 2; a single weekday (start = end, Wed 2026-11-18) = 1;
  Mon 2026-11-16 → Fri 2026-11-27 = 10.
- [ ] AC-2 — A range whose end date is before its start date is rejected with error code `BR1_END_BEFORE_START`.
- [ ] AC-3 — A range covering no Working day (Sat 2026-11-21 → Sun 2026-11-22; a single Saturday, start = end = 2026-11-21) is rejected with `BR1_NO_WORKING_DAY`.
- [ ] AC-4 — A malformed date (`2026-1-5`, `20261105`, empty) or a non-existent date (`2026-02-30`, `2026-13-01`) is rejected with `INVALID_DATE`.
  A leap day in a leap year (`2028-02-29`) is accepted.
- [ ] AC-5 — A health inquiry without a session is answered with success and a body containing only the ok indication (`{ "status": "ok" }`).
- [ ] AC-6 — The start page shows "Checking service…" in a `role="status"` region while the status is being fetched.
- [ ] AC-7 — When the service answers ok, the start page shows "Service: OK".
- [ ] AC-8 — When the service is unreachable or answers with an error status, the start page shows "Service unavailable".
- [ ] AC-9 — An import that breaks a forbidden dependency of `docs/architecture.md` (domain importing an
  I/O or framework module or using the system clock; web importing api; an api route importing the
  repository) makes the lint step, and so `scripts/check`, fail.
- [ ] AC-10 — `scripts/check` (full) and `scripts/check --fast` are green with every planned step active,
  and CI runs the full contract on Node 26 for every push and pull request, green on this spec's PR.

## Definition of Done
- [ ] Every acceptance criterion mapped to proof (test or reproducible observation)
- [ ] `scripts/check` green
- [ ] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [ ] Docs / ADRs updated if behavior or architecture changed
- [ ] Spec moved to `specs/done/` (it becomes immutable there)

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | |
| Fix rounds | |
| Review findings: real / noise / deferred | |
| Regressions introduced | |
| Bugs escaped to production | |
