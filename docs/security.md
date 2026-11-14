# Security

> Set at bootstrap 2026-11-14. Baseline rules agents must honor in every plan and review.

## Secrets
- Secrets never enter the repo, specs, prompts, or chat. `.env` is gitignored; provide `.env.example`.
- Agents never print secret values, even when debugging.
- The only secret is `SESSION_SECRET`, which signs the session cookie. It is read from the environment by `apps/api` only. Tests generate a random one per run, and no secret is ever a `VITE_*` variable.

## Input & output
- Every API input (body, params, query) is validated with a zod schema at the route before any
  service runs. Unknown fields are rejected, and dates must match `YYYY-MM-DD` and be real calendar dates.
- SQL uses bound parameters only. Building SQL from strings with input values is forbidden.
- React renders text escaped. `dangerouslySetInnerHTML` is forbidden.
- Responses never contain stack traces, SQL, internal IDs of other users' data, or secrets
  (`docs/conventions.md`, Error handling). Logs never contain request bodies or cookies.

## AuthN / AuthZ
- **Authentication (demo-grade, by decision):** no passwords. The login screen lists the seeded
  Employees, and choosing one calls `POST /session`, which sets an **httpOnly, SameSite=Lax, signed**
  session cookie (Secure when served over HTTPS). `DELETE /session` logs out. Identity comes **only**
  from that cookie, never from a body, query parameter or client-set header. A request with no valid
  session gets `401`.
- **Authorization is default-deny and enforced in the `apps/api` service layer** on every request.
  An action is allowed only if a rule below grants it:
  - an Employee may create Leave requests for themselves, see their own requests and Balance, and cancel their own `Pending` requests;
  - a Manager may additionally see their **direct reports'** requests and Balances, and approve or reject their direct reports' `Pending` requests (BR-4). Nobody approves or rejects their own request.
- A resource the caller may not see answers `404` (not `403`), so the API doesn't reveal whether it
  exists. `403` is only for a visible resource with a forbidden action (e.g. the requester trying to
  approve their own request).
- The UI hiding a button is convenience, never protection.
- This is the sensitive area **Authorization** (`docs/domain.md`).

## Dependencies
- Every new **runtime** dependency is listed with its reason in the plan and approved at the plan gate.
  New dev dependencies are listed too.
- Allowed licences: MIT, Apache-2.0, BSD-2/3-Clause, ISC. Anything else needs an ADR.
- The package must be actively maintained (a release in the last 12 months, or a stable de-facto
  standard), and `npm audit --omit=dev` shows no high or critical advisory when it's added.
  The lockfile is committed, and installs in check/CI use `npm ci`.
- Prefer the platform (Node built-ins such as `node:sqlite` and `crypto`) over a new package.

## Review lens
Security is a mandatory dimension of every independent review (see `prompts/review.md`), not a
separate afterthought phase.
