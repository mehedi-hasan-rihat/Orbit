---
description: Replace an existing feature's logic, deliberately changing its behaviour
argument-hint: <feature> <new logic> — e.g. interviews auto-advance only on final round
---

Rework: **$ARGUMENTS**

## 1. Objective

Replace how an existing feature works. Unlike `/extend`, changing behaviour **is** the goal — so the risk isn't breaking call sites, it's dropping behaviour nobody wrote down.

Not `/refactor`: refactoring preserves behaviour. This doesn't.

## 2. Input / Scope

Before touching anything, state two lists:

- **Changing** — the behaviour being replaced.
- **Preserved** — what must still hold afterwards.

The second list is the point of this command. Anything not on it is at risk of vanishing silently.

## 3. Context

`AGENTS.md` is in context. Two failure modes are specific to a rework and nothing in the toolchain catches either:

- **Undocumented side effects.** The old code guarantees things no type signature mentions — an `Activity` row, a `revalidatePath`, a notification, a string format another component parses.
- **Data already written under the old rules.** Existing rows keep their old shape and still have to render.

## 4. Investigation

Two passes. Don't skip the second — it's the one `/extend` doesn't have.

**Touchpoints:**

```bash
grep -rn "<featureName>" src/ --include=*.ts --include=*.tsx
```

**Behaviour inventory** — read the current implementation and list everything it *does*, not just what it returns: rows written to other tables, activity logged, notifications created, paths revalidated, string formats produced, status auto-transitions.

Concrete examples of what hides here: `applications.ts` writes `Activity` rows on four different mutations; `addQuickNote:415` produces a `\n\n`-joined note format; the cron route stores a dedupe key in `notification.body` that `notification-bell.tsx:23` parses back out; `interviews.ts` auto-advances application status from `earlyStages`.

## 5. Pattern / Constraints

- Rows written by the old logic **still exist**. New code reads what old code produced — check the parse side before changing the write side.
- Keep that module's return shape. A rework is not a licence to migrate conventions.
- Widen or narrow `revalidatePath()` to match the new behaviour; the old paths may no longer be right.
- If a shape change is involved, `/migrate` first and let type errors find the call sites.

**Enum caution:** if the rework stops writing an `ActivityType` / `NotificationType` value, leave the enum value in place. Removing one needs type recreation with casting — see `/migrate`. Don't turn a logic change into a destructive migration.

## 6. Analysis

Present the inventory from §4 as three buckets: **kept**, **changed**, **dropped**.

## 7. Decision

Name every behaviour in the **dropped** bucket explicitly, and why it's safe to drop. Silent loss is the failure this command exists to prevent — if you can't justify a drop, it belongs in **kept**.

## 8. Execution

Replace the logic, then **delete what is now unreachable**: unused Zod schemas in `src/lib/validations.ts`, exports with no remaining callers, branches that can no longer be hit. A rework that leaves the old path behind is half-done.

## 9. Verification

Run `/check`. Then:

- Re-grep the touchpoint list — confirm no caller still expects the old behaviour.
- Confirm nothing imports what you deleted.
- Walk the **preserved** list from §2 and point at the code that still guarantees each item.

## 10. Limitations

`/check` cannot see data. Say explicitly what old-format rows the new logic now has to read, and that this was not exercised. Same for email, cron, SSE, and browser-only paths.

## 11. Report

**Changed** — old behaviour → new behaviour
**Preserved** — with the code that still guarantees each
**Dropped** — deliberately, with justification
**Deleted** — code removed as now-unreachable
**Verification** — `/check` against the baseline
**Not verified** — old-format data and runtime behaviour
