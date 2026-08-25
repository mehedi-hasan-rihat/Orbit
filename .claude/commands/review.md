---
description: Review changes against Orbit's project-specific invariants
argument-hint: [path or leave blank for the working diff]
---

Review: **$ARGUMENTS** (default: `git diff` on the working tree).

For general correctness bugs use the built-in `/code-review`. This pass covers the invariants specific to this codebase — things a general reviewer won't know to look for.

Check each and report only actual violations, with `file:line`:

**Security / correctness**
- Every server action calls `requireUser()` **and** scopes the query by `userId`. A `findUnique({ where: { id } })` on a user-owned model with no ownership check is a vulnerability, not a style issue.
- No secret reaches a log. (`src/app/api/cron/reminders/route.ts:21` currently logs the `CRON_SECRET` — known, pre-existing.)
- Input goes through a Zod schema from `src/lib/validations.ts`.

**Serverless**
- No floated promise in a server action or route handler. Async side effects are `await`ed or wrapped in `after()`.
- Nothing assumes in-memory state survives between requests.

**Project conventions**
- Imports come from `@/generated/prisma/client`, never `@prisma/client`.
- Nothing under `src/generated/` was edited.
- `prisma` is the singleton from `@/lib/prisma`.
- Return shape matches the rest of that action module.
- Mutations call `revalidatePath()` for every affected path.
- A `Date` crossing server→client is serialized.
- A new dashboard route is in **both** `src/components/sidebar.tsx:18` and `src/components/mobile-nav.tsx:14`.

Then run `/check` and report the result against the baseline.

Rank by severity, lead with anything exploitable, and say plainly if nothing is wrong — don't invent findings to fill the list.
