# Backlog — deferred findings

Findings a human triaged as **defer**: real, but fixed later by decision (`workflows/feature-development.md`,
step 7). Nothing lands here without that decision; noise is rejected in the triage record, not parked here.

- A criterion moved out at the ship gate (R-08, `→ moved to B-<n>`) lands here too, by the
  human's ship decision; the entry names the spec and criterion.
- One entry per finding, newest last. Delete the entry in the commit of the work that closes it.
- An entry that grows into new behavior becomes a spec (`specs/active/`), not a fix.

<!-- Format (labels stay English):
- **B-<n>** — <finding, one line> — Source: spec <NNNN>, review round <n> (<file:line>) — Severity: <…>
  — Recommendation: <the reviewer's action> — Deferred by: <name>, <YYYY-MM-DD>, <why>
  A decision deferred at bootstrap (its REPORT) uses Source: bootstrap <YYYY-MM-DD>.
-->

- **B-1** — `scripts/check` and `scripts/doctor` abort under macOS `/bin/sh` (bash 3.2) with `syntax error near unexpected token ';;'` (a `case … )` inside `$( … )`, check line 69 / doctor line 98) — Source: bootstrap 2026-11-14 — Severity: Medium (local only; CI on Ubuntu/dash unaffected)
  — Recommendation: fix through its own spec (make the parsing bash-3.2-safe, add a selftest scenario under bash 3.2) or adopt an upstream ANEW fix; until then run `dash ./scripts/check` / `dash ./scripts/doctor` (CLAUDE.md) — Deferred by: somer81, 2026-11-14, walking skeleton comes first; workaround is reliable

- **B-2** — `scripts/residue` reports false RESIDUE FOUND on macOS: on-demand system services (parent `launchd`, PID 1) and Claude Code's own `caffeinate` (parent `claude`, an ancestor of the run) are counted as check's survivors; the flagged set differs per run, no toolchain process survives — Source: spec 0001, BUILD step 6 (residue gate) — Severity: Low (local only; misleads the gate, hides nothing)
  — Recommendation: fix through its own spec or upstream ANEW (on macOS, ignore launchd-parented system paths `/usr/libexec/*`, `/System/*`, and processes whose parent chain predates the baseline), or run residue on Linux — Deferred by: somer81, 2026-11-14, evidence in plan 0001 Build evidence; fast profile clean

- **B-3** — `apps/api/src/app.ts` uses Fastify's default error and not-found handlers (`{statusCode, error, message}`), not the `{ code, message }` / `500 INTERNAL` convention of `docs/conventions.md` — Source: spec 0001, review round 1 (F-5, `apps/api/src/app.ts:9-13`) — Severity: Info
  — Recommendation: the first API spec that adds a route with inputs plans `setErrorHandler` / `setNotFoundHandler` with tests — Deferred by: somer81, 2026-11-14, nothing in spec 0001 can produce an error

- **B-4** — The CB-4 token guard (`apps/web/src/styles/styles.test.ts`) scans only `*.css`, so an undefined `var(--…)` in a `.tsx` inline style would pass — Source: spec 0003, review round 1 (I-1, `styles.test.ts:44-51`) — Severity: Info
  — Recommendation: extend the scan to `apps/web/src/**/*.tsx` in the first spec that adds an inline style — Deferred by: somer81, 2026-11-14, no `.tsx` uses `var(--` today
- **B-5** — The web fonts load from Google Fonts at runtime (`apps/web/index.html`), sending each visitor's IP to a third party; `docs/security.md` has no rule on third-party runtime requests — Source: spec 0003, review round 1 (I-2) — Severity: Info
  — Recommendation: self-host the fonts, or record a third-party-request rule in `docs/security.md`, before any real-user use (with the `docs/domain.md` personal-data note) — Deferred by: somer81, 2026-11-14, demo with fictitious users; approved as spec 0003 G2

- **B-6** — No test proves the start page's "no retry" (spec 0003 PB-3, spec 0001) on the failure paths: "asks the service exactly once" covers only the success path, and a probe adding one retry after a network failure stays green — Source: spec 0003, VERIFY round 1 (F-1, `apps/web/src/start-page.test.tsx`) — Severity: Low (gap already on main; behavior observed correct)
  — Recommendation: a NEW test (never an edit to a shipped one) asserting `fetch` is called exactly once on the network-failure and 5xx paths — Deferred by: somer81, 2026-11-14, PB-3 holds by observation (production build, API down: exactly 1 request on main and HEAD)
