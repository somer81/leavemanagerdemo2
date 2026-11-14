# Spec 0003 — Start page restyled with the design system (mini)

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0003-plan.md`
- Self-critique: done
- Source: user request 2026-11-14 (restyle start page)
- Design: https://claude.ai/artifact/CV3GbqXpn7y24yNfmm9BH3 · version: spec 0003 approved · approved 2026-11-14
- Supersedes: none. Spec 0001's criteria all stay (PB-1…PB-3). Only its constraint "styling out of scope" is lifted, and that was never a criterion.

## Intent
The start page still shows browser defaults, so the product looks unfinished, and the Leave Manager design
system (https://claude.ai/artifact/WAGKyU2cSBtmzaNUdhB8bi) isn't used anywhere in the app. This change restyles
the start page with it and brings its tokens into `apps/web` as one shared stylesheet, so every later screen
starts from the same colors, type and spacing. What the page says and does stays exactly as it is.

## Changed behavior
- [x] CB-1 — The page uses the design system's ground and type: `surface` background, the product name "Leave Manager"
  in the `display` style in `brand`, a one-line tagline "Request, approve and count leave in working days." in the
  `caption` style in `ink-muted`, and other text in Public Sans.
- [x] CB-2 — The service status sits in a `surface-raised` card under the label "SERVICE" (`label` style, `ink-muted`).
  "Checking service…" is shown in `ink-muted`, "Service: OK" in `ink`, and "Service unavailable" in `status-rejected`.
  Each state is told by its words, never by color alone.
- [x] CB-3 — The layout uses the design system's spacing steps. At every width it is one centered column at most 560px
  wide, with at least a `space-4` side gutter. At 400px wide the page never scrolls horizontally. There is no breakpoint (G4).
- [x] CB-4 — The design-system tokens are available to every screen in `apps/web` as CSS custom properties, under the
  same names as in the design system (`--surface`, `--brand`, `--space-4`, `--radius-md`, …). A token used by a
  screen but missing from that stylesheet is a test failure, not a silent fallback.
- [x] CB-5 — If the web fonts can't be loaded, the page still renders completely in the system font stacks from the
  design system. No text is hidden while fonts load.

## Preserved behavior
- [x] PB-1 — The three status texts and when they appear are unchanged (spec 0001 AC-6…AC-8): "Checking service…" while
  the check runs; "Service: OK" only for a 2xx answer whose body is `{"status":"ok"}`; "Service unavailable" for a
  network failure, a non-2xx status (even with an ok body), or any other body.
- [x] PB-2 — The status text stays in a `role="status"` region with `aria-live="polite"`, the page title stays
  "Leave Manager", and the main heading stays "Leave Manager".
- [x] PB-3 — The page still asks `/api/health` exactly once when it opens, with no retry, and the API is untouched
  (`GET /api/health` → `200 {"status":"ok"}`).

## Decisions (self-critique, approved 2026-11-14)
- **G1 Token source:** `apps/web/src/styles/tokens.css` holds the values copied exactly from the design system's `tokens.json`, and its
  header names the design-system version copied from (`1794657787-35e0`). A later design-system change reaches the app only through a `/change`.
- **G2 Fonts:** a Google Fonts `<link>` with `display=swap` in `apps/web/index.html`, as the design system's README says. No npm
  dependency is added. `swap` keeps text visible while fonts load (CB-5).
- **G3 Proving colors:** each state sets `data-state="checking" | "ok" | "unavailable"` on the status element (asserted in component
  tests). A stylesheet test checks that each state maps to its token and that every `var(--…)` used in `apps/web` is defined in
  `tokens.css` (CB-4). The before/after screenshots at VERIFY are the visual evidence (`docs/testing.md`).
- **G4** CB-3 reworded: one layout at every width, no breakpoint.
- **G5 Tagline:** "Request, approve and count leave in working days.", the design system's cover line.
- **G6 Design line:** the canvas is published with the label `spec 0003 approved` just before the spec gate, and the `- Design:` line records it.

## Out of scope
- New screens, login, navigation, a dark theme, icons or a logo. The design system has none yet.
- Changes to the design system itself. Everything this page needs already exists there.
- Changes to the API or `packages/domain`.

## Definition of Done
- [x] `scripts/check` green
- [x] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [x] Criterion ↔ evidence table complete for CB-* **and** PB-* (UI: before/after screenshots, agent-captured, judged at SHIP)
- [x] Spec moved to `specs/done/` (immutable there)

## Evidence (VERIFY)
Independent QA agent, VERIFY @9922037. Full green for the shipped code: CI
https://github.com/somer81/leavemanagerdemo2/actions/runs/43595895018 (`CHECK GREEN (full, 6 steps, 10 s)` @a60305d; later commits
touch `specs/` only). Reproduce with `./scripts/check` (on macOS: `dash ./scripts/check`, B-1).

| Criterion | Evidence | Status |
|---|---|---|
| CB-1 | `apps/web/src/start-page.test.tsx` › "shows the product name and tagline"; `apps/web/src/styles/styles.test.ts` › "page ground, heading and tagline use design tokens (CB-1)"; computed styles in a real browser (surface, brand 48px Bricolage, Public Sans) + S-1…S-4 | PASS |
| CB-2 | "marks each state with data-state" (3 states); "maps each service state to its token (CB-2)" — broken: unavailable → ink went red; computed state colors match the design + S-1…S-3 | PASS |
| CB-3 | "one centered column at most 560px with a space-4 gutter (CB-3)" — broken: a width @media went red; measured scrollWidth = 400 at 400px (OK and Unavailable) + S-4, S-3b | PASS |
| CB-4 | "defines the design system tokens under their own names", "every var() used in apps/web is defined in tokens.css", "base.css uses no literal colors", "every color in base.css comes from a token" — broken: an undefined var went red | PASS |
| CB-5 | "every font stack ends in system fonts (CB-5)", "web fonts load with display=swap (CB-5)" + S-5/S-5b (fonts blocked) and S-6 (fonts loading): all text visible | PASS |
| PB-1 | the 6 shipped tests in `apps/web/src/start-page.test.tsx`, byte-identical to main; same three texts in the same conditions observed before and after | PASS |
| PB-2 | "shows checking while fetching", "keeps the status polite", "page title stays Leave Manager (PB-2)"; observed in every state before and after | PASS |
| PB-3 | "asks the service exactly once" — broken: a second fetch went red; `apps/api/src/routes/health.int.test.ts` unchanged; production build, API up and down: exactly 1 request on main and HEAD. Failure-path test gap → B-6 | PASS |

Screenshots (agent-captured, headless, outside the repo), judged by somer81 at SHIP, 2026-11-14, before (main) → after:
S-1 Checking, S-2 OK, S-3 Unavailable (real 502), S-4 OK at 400px, S-3b Unavailable at 400px, S-5/S-5b fonts blocked, S-6 fonts loading.
Styling differences from the pinned design accepted at SHIP: D-1 (desktop text column 528px, gutter inside the 560px column) and
D-2 (48px top padding at 400px, from G4's single layout). No content, structure or state differences.

## Scorecard
| Metric | Value |
|---|---|
| Spec revisions | 0 |
| Fix rounds | 1 |
| Review findings: real / noise / deferred | 1 / 2 / 3 (review: 1/2/2 · VERIFY: 0/0/1) |
| Regressions introduced | 0 |
| Bugs escaped to production | 0 |
