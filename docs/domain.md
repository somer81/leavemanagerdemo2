# Domain

> The shared language between business, humans, and agents. Set at bootstrap 2026-11-14.
> If a term isn't here, expect the AI to invent its own meaning for it.

## Ubiquitous language

| Term | Meaning | Notes / not to be confused with |
|---|---|---|
| Employee | A person who can request leave. Every Employee has exactly one Manager, except the top-level Employee, who has none. | A Manager is also an Employee and requests leave the same way. |
| Manager | The Employee who approves or rejects a given Employee's Leave requests: their direct reports only. | Not a role flag: an Employee is a Manager *of someone* via the reporting line. No skip-level approval. |
| Leave type | One of `Annual`, `Sick`, `Unpaid`. | Only `Annual` affects the Balance (BR-6). |
| Leave request | One Employee, one Leave type, a start date and an end date (whole days, both inclusive), and a Status. | Not "absence" or "booking". |
| Status | `Pending` → `Approved` or `Rejected` (by the Manager); `Pending` → `Cancelled` (by the requester). | Approved, Rejected and Cancelled are final (BR-5). Domain status, not the spec `Status:` protocol field. |
| Working day | Monday to Friday. A Leave request's length is the number of Working days it covers. | Public holidays are out of scope: every Mon–Fri counts. |
| Allowance | Annual-leave Working days granted per calendar year. Default 20, per Employee. | |
| Balance | Allowance − Working days of the Employee's Approved Annual requests in that calendar year. | When a new request is checked, Pending Annual requests are also subtracted (BR-2). |

## Business rules

- **BR-1:** A Leave request's end date is on or after its start date, and the request covers at least 1 Working day.
- **BR-2:** An Annual request is accepted only if its Working days ≤ Balance − Working days of the Employee's other Pending Annual requests in that year. A request that uses exactly the remaining days is accepted.
- **BR-3:** A Leave request must not overlap, by even one day, any of the same Employee's Pending or Approved requests. Rejected and Cancelled requests are ignored.
- **BR-4:** Only the requester's own Manager may approve or reject a Leave request. Nobody approves or rejects their own request. Only the requester may cancel, and only while the request is `Pending`.
- **BR-5:** A request in `Approved`, `Rejected` or `Cancelled` never changes Status again.
- **BR-6:** `Sick` and `Unpaid` requests never change the Balance.
- **BR-7:** A Leave request's start date and end date fall in the same calendar year. Each year's Balance starts fresh from the Allowance, and unused days do not carry over.

## Key domain invariants

- The Balance is never negative.
- An Employee never has two overlapping Pending or Approved requests.
- A final Status (`Approved`, `Rejected`, `Cancelled`) is never changed. The history of a request is never rewritten.
- A Status change is always made by the person BR-4 allows, and the server checks it.

## Sensitive areas

- **Authorization:** who may approve, reject or cancel a Leave request (BR-4), and who may see whose requests and Balance (`docs/security.md`, AuthN / AuthZ). A spec touching this says `Sensitive area: Authorization` in Constraints.
- Personal data is **not** a sensitive area in this demo: all people are fictitious seed data. Revisit this before any real-user use. Sick-leave data would be health data.
