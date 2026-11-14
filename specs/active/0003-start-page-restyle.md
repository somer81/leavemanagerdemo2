# Spec 0003 — Start page restyled with the design system (mini)

- Status: In progress
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
- [ ] CB-1 — The page uses the design system's ground and type: `surface` background, the product name "Leave Manager"
  in the `display` style in `brand`, a one-line tagline "Request, approve and count leave in working days." in the
  `caption` style in `ink-muted`, and other text in Public Sans.
- [ ] CB-2 — The service status sits in a `surface-raised` card under the label "SERVICE" (`label` style, `ink-muted`).
  "Checking service…" is shown in `ink-muted`, "Service: OK" in `ink`, and "Service unavailable" in `status-rejected`.
  Each state is told by its words, never by color alone.
- [ ] CB-3 — The layout uses the design system's spacing steps. At every width it is one centered column at most 560px
  wide, with at least a `space-4` side gutter. At 400px wide the page never scrolls horizontally. There is no breakpoint (G4).
- [ ] CB-4 — The design-system tokens are available to every screen in `apps/web` as CSS custom properties, under the
  same names as in the design system (`--surface`, `--brand`, `--space-4`, `--radius-md`, …). A token used by a
  screen but missing from that stylesheet is a test failure, not a silent fallback.
- [ ] CB-5 — If the web fonts can't be loaded, the page still renders completely in the system font stacks from the
  design system. No text is hidden while fonts load.

## Preserved behavior
- [ ] PB-1 — The three status texts and when they appear are unchanged (spec 0001 AC-6…AC-8): "Checking service…" while
  the check runs; "Service: OK" only for a 2xx answer whose body is `{"status":"ok"}`; "Service unavailable" for a
  network failure, a non-2xx status (even with an ok body), or any other body.
- [ ] PB-2 — The status text stays in a `role="status"` region with `aria-live="polite"`, the page title stays
  "Leave Manager", and the main heading stays "Leave Manager".
- [ ] PB-3 — The page still asks `/api/health` exactly once when it opens, with no retry, and the API is untouched
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
- [ ] `scripts/check` green
- [ ] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [ ] Criterion ↔ evidence table complete for CB-* **and** PB-* (UI: before/after screenshots, agent-captured, judged at SHIP)
- [ ] Spec moved to `specs/done/` (immutable there)
