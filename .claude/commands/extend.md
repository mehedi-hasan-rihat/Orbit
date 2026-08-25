---
description: Extend an existing feature without breaking its current call sites
argument-hint: <feature> <change> — e.g. applications add source field
---

Change: **$ARGUMENTS**

## 1. Objective

Make the requested change, updating **every** touchpoint, without altering behaviour anywhere else.

## 2. Input / Scope

That change and only that change. Scope is the feature's existing touchpoints — not the code around them.

## 3. Context

A feature here spans an action module, a page, one or more components, and usually a Zod schema. **Partial edits typecheck fine and break at runtime.** That is the whole risk of this command.

## 4. Investigation

Find every touchpoint **before** editing:

```bash
grep -rn "<featureName>" src/ --include=*.ts --include=*.tsx
```

List what you found. If a hit doesn't need updating, say why.

## 5. Pattern / Constraints

Work outward from the data:

1. If the shape changes, start at `prisma/schema.prisma` → `/migrate` → let type errors point at the call sites.
2. Update the Zod schema in `src/lib/validations.ts`. **A field added to the DB but not the schema is silently dropped on submit** — `FormData` is parsed through Zod, not spread. The compiler cannot catch this one.
3. Update the action, keeping **that module's** return shape.
4. Update every consumer the grep found — including `src/app/dashboard/applications/[id]/page.tsx` if the model is `Application`.
5. Widen `revalidatePath()` if the change is now visible on a path the action didn't invalidate.

Don't refactor, rename, or migrate a module's return convention while you're in there. Make the change and stop.

## 6. Analysis

State the touchpoint map before editing: which files change, which stay, and where the type system will and won't catch a miss.

## 7. Decision

If the change could be made at more than one layer, say which you chose and why.

## 8. Execution

Apply in the order above, smallest edit per file.

## 9. Verification

Run `/check`, then walk the touchpoint list and confirm each was actually updated — a missed consumer usually still compiles.

## 10. Limitations

State what needs the app running, especially the form round-trip (schema → action → DB → render) and anything behind email, cron, or SSE.

## 11. Report

**Touchpoints found** — from the grep
**Changed** — file by file
**Unchanged, and why** — touchpoints deliberately left alone
**Verification** — `/check` against the baseline
**Not verified** — runtime behaviour
**Remaining concerns** — or "None"
