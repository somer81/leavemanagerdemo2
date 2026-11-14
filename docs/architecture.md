# Architecture

> Describes the architecture decided at bootstrap (2026-11-14), not an aspiration. Agents read this
> file before planning. Vague answers here become vague code.

## System overview

Leave Manager is a small web application in which employees request leave, managers approve or
reject it, and the Annual balance is tracked. It is a **modular monolith in one TypeScript
monorepo** (npm workspaces): a pure domain package holds every business rule, a Fastify HTTP API
persists to a single-file SQLite database, and a React single-page app talks to the API over
HTTP/JSON. This style was chosen because it's a demo: one language, one process to run, no
container or database server, and the rules are tested once in `packages/domain`. The SQLite
driver choice is confirmed (or recorded as an ADR) in the walking-skeleton spec.

## Modules / components and ownership

| Module | Single responsibility | Owns |
|---|---|---|
| `packages/domain` | The business rules BR-1…BR-7, Working-day counting and Balance math, as pure functions that return result values | The meaning of Leave request, Status transitions, Balance (no storage) |
| `apps/api` | HTTP API: session/identity, authorization, input validation, persistence; routes → services → repository | Employees, reporting lines, Allowances, Leave requests (the SQLite database) |
| `apps/web` | Browser UI: login (pick a seeded user), request leave, my requests and Balance, Manager's approval list | UI state only, with no business data of its own |

## Communication rules

- `apps/web` → `apps/api`: HTTP/JSON only, same origin, session cookie. No other channel.
- `apps/api` → `packages/domain`: direct function calls. The services call domain functions for every rule decision and do not reimplement rules.
- Inside `apps/api`: routes validate input (zod) and call services. Services do authorization and orchestration. The repository is the only code that runs SQL.
- No events, queues or background jobs in this version.

## Forbidden dependencies (make them testable)

Enforced by an ESLint import-boundary rule (wired into `scripts/check` by the walking skeleton):

- `packages/domain` imports nothing from `apps/*` and no I/O or framework modules: no `fastify`, no SQLite driver, no `react`, no `node:fs`/`node:net`/`node:http`, and no system clock (`Date.now()`, `new Date()` without arguments). "Today" is a parameter.
- `apps/web` never imports from `apps/api`. From `packages/domain` it may import **types only** (`import type`).
- `apps/api` route modules never import the repository or the SQLite driver. Only `apps/api/src/repository/**` may import the SQLite driver.
- No module imports another module's internals: only a package's public entry point (`index.ts`) is imported across packages.

## Deliberately out of scope

- Public holidays, half days, hourly leave, carry-over, accrual schedules.
- Multiple approvers, skip-level or delegated approval, HR/admin roles, and editing Allowances through the UI (seed data only).
- Real authentication (passwords, SSO), email or notifications, a reporting/calendar view.
- Multi-tenant or multi-company support, deployment to production, and real personal data.
