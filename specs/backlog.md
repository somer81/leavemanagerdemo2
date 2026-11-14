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
