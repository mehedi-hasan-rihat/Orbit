---
description: Change the Prisma schema and regenerate the client correctly
argument-hint: <migration-name> — e.g. add_application_source
---

Schema change: **$ARGUMENTS**

## 1. Objective

Change `prisma/schema.prisma`, migrate, regenerate — then let the resulting type errors lead you to the call sites.

## 2. Input / Scope

The migration name above. Scope is the schema and the migration. Fixing the call sites it breaks is a separate step — say so if needed.

## 3. Context

`AGENTS.md` covers the generated-client layout and the two commands. The part it doesn't explain: importing `@prisma/client` **typechecks but yields the wrong, unconfigured client at runtime** — which is why that rule exists and why the failure is confusing.

## 4. Investigation

Read the current model and the recent files in `prisma/migrations/` before editing. Check whether the columns or constraints you're adding already exist.

## 5. Pattern / Constraints

Run **both** — the second is easy to forget and its failure mode is opaque:

```bash
npx prisma migrate dev --name $ARGUMENTS
npx prisma generate
```

### Known failure mode

Removing a value from a Postgres enum (`ApplicationStatus`, `InterviewType`, `ActivityType`, `NotificationType`) is **not** a simple edit — it needs type recreation with casting.

## 6. Analysis

Name what the migration does to existing data: additive column, backfill, constraint change, or destructive edit.

## 7. Decision

If it is destructive or touches an enum, **read the generated SQL in `prisma/migrations/` and say what it will do before applying anything**.

## 8. Execution

Edit the schema, run both commands.

## 9. Verification

Run `/check` — schema changes usually surface as type errors at the call sites. Report those even if fixing them is out of scope.

## 10. Limitations

Verified locally is not verified against production data. Flag any unique or non-null constraint that could fail on a populated database.

## 11. Report

**Schema change** — what changed in the model
**Migration** — name, and what the SQL does
**Data impact** — additive / backfilled / destructive
**Verification** — `/check`, and any call sites now broken
**Not verified** — behaviour against production data
**Remaining concerns** — or "None"
