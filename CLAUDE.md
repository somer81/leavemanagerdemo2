# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

All project rules live in **AGENTS.md**, the single source of truth. Read it before doing anything
and honor the operating mode it declares. Do not copy rules into this file. If this file and
AGENTS.md ever disagree, AGENTS.md wins.

## Current state

This repo is an unconfigured copy of **ANEW** (AI Native Engineering Workspace, base version in
`.anew-version`): a process workspace written in Markdown and POSIX shell. It has no application
code and no stack yet. AGENTS.md is `STATUS: NOT CONFIGURED`, so the only valid first action is
the bootstrap workflow (`workflows/bootstrap.md`, or `/bootstrap`). Bootstrap interviews the human
and then rewrites `AGENTS.md`, fills `docs/`, and generates `scripts/check.conf`. Write no
application code before bootstrap finishes.

The Claude Code adapter is installed in `.claude/`. Its source is `adapters/claude-code/`, and
`./scripts/init claude-code` refreshes it. That keeps this CLAUDE.md unless you pass `--force`.
The adapter adds the slash commands (`/bootstrap`, `/new-feature`, `/analyze`, `/plan`, `/build`, `/review`,
`/verify`, `/change`, `/fix-bug`, `/refactor`, `/adr`, `/recover`), a read-only `reviewer`
subagent, permission denies, and a hook that blocks edits under `specs/done/`.

## Commands

| Command | Purpose |
|---|---|
| `./scripts/check` | The single verification contract. Runs every step in `scripts/check.conf`, in order, stopping at the first failure. Only a full green run counts as evidence. |
| `./scripts/check --fast` | Inner loop. Runs only the steps tagged `[fast]`. It is never evidence. |
| `./scripts/doctor` / `--strict` | Workspace health: required files, config, spec/plan gate consistency, `specs/done/` immutability. CI runs `--strict`, which turns gate warnings into failures. |
| `./scripts/selftest` | Self-test of check/doctor/residue in throwaway temp copies. Runs in CI. |
| `./scripts/residue [--fast]` | Runs check twice and fails if processes are left running. |
| `./scripts/init <adapter>` | Installs a tool adapter (`claude-code`, `github-copilot`, `cursor`, `codex`, `generic`). |

`scripts/check` fails until bootstrap creates `scripts/check.conf`. The format is in
`scripts/check.conf.example`: one `<name>: <command>` per line, plus optional `[fast]` tags and
`requires <step>: <cmd>` prerequisites. To run a single test, run the test command from the
relevant `check.conf` step directly. CI (`.github/workflows/check.yml`) runs doctor `--strict`,
selftest, and the full check.

## How the pieces fit

- **Spine of every piece of work:** INTENT → CLARIFY → SPEC → PLAN → [human approval] → BUILD →
  independent REVIEW → [triage] → VERIFY → SHIP. Each stage is a *segment*, and segment commands
  always stop at a handoff (`workflows/segments.md`). Handoffs travel through files: spec
  `Status:`, plan `Approved by / on`, evidence. Chat is not a handoff.
- **Modes:** `lite` uses `/new-feature`, which chains the segments and asks at each gate. `strict`
  uses one segment command per role, one role per session. `docs/commands.md` describes every
  command, where it stops, and how lite and strict differ.
- **Layers:** core (`docs/`, `specs/`, `workflows/`, `prompts/`, `scripts/`, `AGENTS.md`) is
  tool-agnostic. `adapters/` is thin per-tool wiring that only points into the core and never
  restates rules (ADR `docs/decisions/anew/ANEW-0001`). Workflows reference prompts in `prompts/`
  and never copy them.
- **Specs lifecycle:** `specs/active/` (from `specs/TEMPLATE.md` or `TEMPLATE-mini.md`) →
  `specs/plans/NNNN-plan.md` → shipped to `specs/done/`, which is immutable. Deferred findings go
  to `specs/backlog.md`. When something goes wrong, use a ramp in `prompts/recovery/` instead of
  improvising.
- **`.anew-dev/`** holds the template's own development records (its specs and plans). It is not
  project work, and doctor does not scan it.
