# Spec 0002 — Design artifact as the spec's design reference

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0002-plan.md`
- Self-critique: done

## Intent
The team wants every feature with a user interface to be analysed against a concrete picture of its
screens, not only against prose. Today a spec's "Design reference" may simply say "none — the flow
above is the design", so the builder invents the visuals and VERIFY has nothing to compare
screenshots with. From now on, the analysis of a UI feature is linked to a **Claude Design
artifact** that shows every screen state the spec lists, pinned to the version the human approved.
Success means a UI spec cannot reach approval without such a link (or an explicit, named waiver),
the rule is enforced by `scripts/check` rather than remembered, and VERIFY compares its screenshots
with the pinned design. Deliberately not done: changing the ANEW core templates or prompts,
building a design system, and redesigning the already-shipped start page.

## Requirements
- R-1: For a spec whose User experience describes a user interface, the Analyst creates (or reuses)
  a Claude Design artifact that shows each screen state listed in the spec, and records it in the
  spec's "Design reference" as a link plus the version identifier that was approved.
- R-2: The recorded version is the one shown at the spec approval gate. A later change to the
  design that should count is a spec change (R-08): new version identifier, re-approval.
- R-3: A UI spec may go without a design only by an explicit, named waiver recorded at the spec
  approval gate. A spec without a user interface keeps "none — no user interface".
- R-4: VERIFY compares each UI screenshot with the pinned design version. A visible difference in
  content, structure or state is a finding. Pixel-level styling is not, unless the spec says so.
- R-5: The rule is written in the project docs (`docs/testing.md`, plus a pointer in
  `docs/conventions.md`) and does not modify ANEW core files (`specs/TEMPLATE*.md`, `prompts/`, `workflows/`).
- R-6: `scripts/check` fails when an open spec (`specs/active/`) violates R-1/R-3: a UI spec whose
  Design reference has neither a Claude Design artifact link with a version identifier nor the
  waiver form. Shipped specs (`specs/done/`) are never judged, because they are immutable and older than this rule.

## User experience
none — no user interface (this is a change to the project's process documents and verification
tooling. It's used through spec files and the `scripts/check` output.)

## Constraints & out of scope
- Out of scope: edits to ANEW core (`specs/TEMPLATE.md`, `specs/TEMPLATE-mini.md`, `prompts/*`,
  `workflows/*`, `scripts/check|doctor|residue`). A core change would be proposed upstream to ANEW.
- Out of scope: creating a Design System artifact, a design for spec 0001's start page (already
  shipped), and checking that the linked artifact exists or is reachable (check runs offline).
- The design artifact is never copied into the repo. The spec holds only the link and version
  (`docs/testing.md`, Evidence policy). Artifacts are private by default: sharing them with
  reviewers is the human's decision.
- **What counts as a UI (G1):** a spec has no user interface exactly when its `## User experience` section
  begins with `none — no user interface`. Anything else is a UI spec.
- **Line format (G2):** `- Design reference: <link> · version: <identifier> · approved <YYYY-MM-DD>`, where
  `<link>` is `https://claude.ai/artifact/<id>` or `https://claude.ai/code/artifact/<uuid>`. Waiver:
  `- Design reference: none — waived by <name>, <YYYY-MM-DD>, <reason>`.
- **Version identifier (G3):** the label of the artifact publish shown at the spec approval gate (e.g.
  `spec 0003 approved`), unless the plan finds a platform version ID that is better to use.
- **Which specs are judged (G4):** open specs with `Status: Approved` or `In progress`. `Draft` is exempt,
  because the design is made during ANALYZE, before approval.
- **Template wording (G5):** ANEW's template comment "No design → none — the flow above is the design" is not
  accepted for UI specs in this project, and `docs/testing.md` says so explicitly. This resolves the conflict in project docs, not in the core template.
- **Mini-specs (G6):** the same rule applies to CHANGE-lane mini-specs (`specs/TEMPLATE-mini.md`) that touch a UI.
- Not a sensitive area.

## Acceptance criteria
- [ ] AC-1 — `docs/testing.md` states the rule: a UI spec's Design reference is a Claude Design artifact link
  with a pinned version showing every listed state, or a named waiver. VERIFY compares screenshots with that
  version. `docs/conventions.md` points to it.
- [ ] AC-2 — `scripts/check` fails on an open spec whose User experience is a UI and whose Design reference has
  no Claude Design artifact link, naming the spec file.
- [ ] AC-3 — `scripts/check` fails on an open UI spec whose Design reference has an artifact link but no version identifier.
- [ ] AC-4 — `scripts/check` passes for an open spec whose User experience is "none — no user interface".
- [ ] AC-5 — `scripts/check` passes for an open UI spec with a Claude Design artifact link and a version identifier,
  and for one with the waiver form.
- [ ] AC-6 — `scripts/check` ignores specs in `specs/done/` (spec 0001 has no artifact link and check stays green).
- [ ] AC-7 — A link that is not a Claude Design artifact link (e.g. another website, or a plain claude.ai chat link) does not satisfy AC-5.
- [ ] AC-8 — `scripts/check` passes for an open UI spec in `Status: Draft` with no design reference yet, and fails for
  the same spec once it is `Approved` or `In progress`.
- [ ] AC-9 — `scripts/check` fails on an open UI spec whose Design reference is "none — the flow above is the design" (the
  ANEW template wording, G5) or a waiver missing its name, date or reason.

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
