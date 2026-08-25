---
description: Review changes against Orbit's project-specific invariants
argument-hint: [path or leave blank for the working diff]
---

Review: **$ARGUMENTS** (default: `git diff` on the working tree).

## 1. Objective

Check the change against the invariants specific to *this* codebase. For general correctness bugs use the built-in `/code-review` — this doesn't duplicate it.

## 2. Input / Scope

The path above, or the working diff. Review **only what changed**. Pre-existing problems outside the diff are not findings.

## 3. Context

Read enough surrounding code to judge the diff. A line that looks correct in isolation is often wrong against its module's conventions — check the neighbours before calling it a violation.

## 4. Investigation

Read the diff, then the code it touches. Confirm against what actually runs, not the first plausible reading.

## 5. Constraints — the checklist

Walk each. Report only **actual violations**, with `file:line`.

**Security / correctness**
- Every server action calls `requireUser()` **and** scopes the query by `userId`. A `findUnique({ where: { id } })` on a user-owned model with no ownership check is a vulnerability, not a style issue.
- No secret reaches a log. (`src/app/api/cron/reminders/route.ts:21` logs `CRON_SECRET` — known, pre-existing, not a finding.)
- Input goes through a Zod schema from `src/lib/validations.ts`.

**Serverless**
- No floated promise in an action or route handler — `await`ed or wrapped in `after()`.
- Nothing assumes in-memory state survives between requests.

**Project conventions**
- Imports from `@/generated/prisma/client`, never `@prisma/client`.
- Nothing under `src/generated/` edited.
- `prisma` is the singleton from `@/lib/prisma`.
- Return shape matches the rest of that action module.
- Mutations call `revalidatePath()` for every affected path.
- A `Date` crossing server→client is serialized.
- A new dashboard route is in **both** `src/components/sidebar.tsx:18` and `src/components/mobile-nav.tsx:14`.

## 6. Analysis

For each candidate finding, name the concrete failure it causes. If you can't, it isn't a finding — drop it.

## 7. Decision

Rank by severity, exploitable first. Separate "violates an invariant" from "would be nicer", and label the second or leave it out.

## 8. Execution

**This command does not edit code.** Report findings; don't fix them unless asked.

## 9. Verification

Run `/check` and report against the baseline.

## 10. Limitations

State what static review couldn't cover: runtime behaviour, anything behind email, SMTP, cron, SSE, or the browser, and any invariant checked only partially.

## 11. Report

**Findings** — ranked, each with `file:line` and the failure it causes
**Verification** — `/check` against the baseline
**Not covered** — what couldn't be reviewed statically

Say plainly if nothing is wrong. Don't invent findings to fill the list.
