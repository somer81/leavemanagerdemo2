# Spec 0001 — Walking skeleton

- Status: Shipped
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
- [x] AC-1 — Working days are counted Mon–Fri with both ends inclusive: Mon 2026-11-16 → Fri 2026-11-20 = 5;
  Fri 2026-11-20 → Mon 2026-11-23 = 2; a single weekday (start = end, Wed 2026-11-18) = 1;
  Mon 2026-11-16 → Fri 2026-11-27 = 10.
- [x] AC-2 — A range whose end date is before its start date is rejected with error code `BR1_END_BEFORE_START`.
- [x] AC-3 — A range covering no Working day (Sat 2026-11-21 → Sun 2026-11-22; a single Saturday, start = end = 2026-11-21) is rejected with `BR1_NO_WORKING_DAY`.
- [x] AC-4 — A malformed date (`2026-1-5`, `20261105`, empty) or a non-existent date (`2026-02-30`, `2026-13-01`) is rejected with `INVALID_DATE`.
  A leap day in a leap year (`2028-02-29`) is accepted.
- [x] AC-5 — A health inquiry without a session is answered with success and a body containing only the ok indication (`{ "status": "ok" }`).
- [x] AC-6 — The start page shows "Checking service…" in a `role="status"` region while the status is being fetched.
- [x] AC-7 — When the service answers ok, the start page shows "Service: OK".
- [x] AC-8 — When the service is unreachable or answers with an error status, the start page shows "Service unavailable".
- [x] AC-9 — An import that breaks a forbidden dependency of `docs/architecture.md` (domain importing an
  I/O or framework module or using the system clock; web importing api; an api route importing the
  repository) makes the lint step, and so `scripts/check`, fail.
- [x] AC-10 — `scripts/check` (full) and `scripts/check --fast` are green with every planned step active,
  and CI runs the full contract on Node 26 for every push and pull request, green on this spec's PR.

## Definition of Done
- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check` green
- [x] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [x] Docs / ADRs updated if behavior or architecture changed
- [x] Spec moved to `specs/done/` (it becomes immutable there)

## Evidence (VERIFY)
Independent QA agent, VERIFY round 1 @eff9e1e and AC-8 re-check @cee6f68. Full green for the shipped code: CI
https://github.com/somer81/leavemanagerdemo2/actions/runs/43587265583 (`CHECK GREEN (full, 6 steps, 8 s)` @cee6f68).
Reproduce any row with `./scripts/check` (on macOS: `dash ./scripts/check`, B-1).

| Acceptance criterion | Evidence | Status |
|---|---|---|
| AC-1 | `packages/domain/src/working-days.test.ts` › "counts Mon–Fri inclusive" (4 cases) — broken: B1 inclusive end, B2 weekend | PASS |
| AC-2 | `packages/domain/src/working-days.test.ts` › "rejects end before start" | PASS |
| AC-3 | `packages/domain/src/working-days.test.ts` › "rejects a range with no working day" (2 cases) — broken: B2 | PASS |
| AC-4 | `packages/domain/src/calendar-date.test.ts` › "rejects malformed and non-existent dates", "accepts a leap day"; `working-days.test.ts` › "reports INVALID_DATE before BR-1" — broken: B3 round-trip, B4 order | PASS |
| AC-5 | `apps/api/src/routes/health.int.test.ts` › "answers ok without a session" (full profile) + `curl` against the real server — broken: B5 extra field, B5b value | PASS |
| AC-6 | `apps/web/src/start-page.test.tsx` › "shows checking while fetching" + S-1 — probe: role removed → red | PASS |
| AC-7 | `apps/web/src/start-page.test.tsx` › "shows OK when the service is up" + S-2, S-4 (real API) | PASS |
| AC-8 | `apps/web/src/start-page.test.tsx` › "shows unavailable on error status", "… even when the body says ok", "… on network failure", "… when a 2xx answer is not the ok indication" + S-3, S-3b — broken: B6 `response.ok` check removed (after fix-2) | PASS |
| AC-9 | `tools/lint-boundaries.test.ts` › 16 "forbids" + 7 "allows" cases with the real `eslint.config.js` (red before the rules existed) | PASS |
| AC-10 | `scripts/check.conf` all 6 steps active; `CHECK GREEN (full …)` and `(fast …)`; CI on push and PR #2 with Node 26 from `.nvmrc`, green @cee6f68 | PASS |

Screenshots S-1 Checking, S-2 Ok, S-3 Unavailable (500), S-3b Unavailable (network), S-4 real API end to end: agent-captured
(headless Chromium, outside the repo), judged by somer81 at SHIP, 2026-11-14.

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | 0 |
| Fix rounds | 2 |
| Review findings: real / noise / deferred | 5 / 0 / 1 (review: 4/0/1 · VERIFY: 1/0/0) |
| Regressions introduced | 0 |
| Bugs escaped to production | 0 (not deployed) |
