---
description: Diagnose and fix a bug from root cause, not symptoms
argument-hint: <symptom> — e.g. tag colors reset after edit
---

Bug: **$ARGUMENTS**

## 1. Objective

Establish the failure mechanism from the code, remove it at the source, report what was actually proved.

A fix you cannot explain is not a fix. If the mechanism can't be established, say so instead of guessing.

## 2. Input / Scope

The symptom is the only input and is usually under-specified — "X doesn't work" often covers several distinct failures with distinct fixes. Narrow it from the code before investigating.

Scope is the path that produces the symptom. Not everything else you notice on the way.

## 3. Context

`AGENTS.md` is already in context; don't restate it. The one thing that shapes this command: **there is no test suite**, so no red test can prove the diagnosis. Code inspection is the evidence. `/check` is the gate, not the proof.

## 4. Investigation

Inspect before changing anything.

1. Trace the symptom through the code that actually runs — entry point to data layer.
2. Find the exact `file:line` where behaviour diverges from intent.
3. State the mechanism: what happens, where, and why it produces *this* symptom.
4. Check callers, data flow, serialization boundaries, and types before editing.

Don't infer behaviour from `docs/` — parts of it are stale.

## 5. Pattern / Constraints

### Check these first

Each has bitten this project, and all four present as something else. Priority checks, **not assumptions** — only fix what the code confirms.

- **Works locally, flaky on Vercel** → floated promise. The instance freezes when the response returns, killing in-flight async work silently and intermittently. Fix with `after()` from `next/server`, not a retry. `docs/issue-faced.md` #6.
- **Hydration mismatch / "differs on server"** → `Date` formatting, `Date.now()`, or DnD/chart internals in SSR. Gate on `useSyncExternalStore` (`src/components/kanban-board.tsx:48`) — **not** `useEffect` + `setState`, which the ESLint config errors on.
- **Data missing after submit** → field absent from the Zod schema in `src/lib/validations.ts`. `FormData` is parsed through Zod, not spread, so unknown fields vanish with no error.
- **Stale UI after a mutation** → missing or too-narrow `revalidatePath()`.

Also rule out: a `Date` crossing server→client unserialized, and an import from `@prisma/client` instead of `@/generated/prisma/client`.

### Must not change

Behaviour outside the affected path, or the module's existing return convention.

## 6. Diagnosis

Before editing, state:

**Root cause:** <mechanism>
**Evidence:** <file:line and the data flow proving it>
**Fix:** <minimal change that removes the cause>

Don't accept the first plausible explanation. If two mechanisms could produce the symptom, say which the code supports and how you ruled the other out.

## 7. Decision

Name the approach, and why any smaller or more obvious alternative — a data migration, a wider refactor, a defensive guard — was rejected.

## 8. Execution

Smallest change that removes the cause. No unrelated refactors, renames, or convention migrations. No `try/catch`, fallback, retry, or null check unless the investigation showed it necessary.

## 9. Verification

Run `/check`, then re-read the affected path: types, imports, serialization boundaries, data flow. Report what was verified, not what was assumed.

## 10. Limitations

State what could not be verified without running the app. Email, SMTP, cron, external services, and browser-only behaviour are **not** covered by `/check` — say so rather than implying the fix is confirmed.

If the diagnosis rests on data you couldn't inspect — a DB row, a production log — say that too, and give the concrete check that would confirm it.

## 11. Report

**Root cause** — mechanism, with `file:line`
**Fix** — what changed and why
**Verification** — what `/check` confirmed, against the baseline
**Not verified** — runtime behaviour still unconfirmed, or "None"
**Remaining concerns** — related defects found but deliberately not fixed, or "None"
