---
description: Add a server action following this project's exact conventions
argument-hint: <module> <actionName> — e.g. tags archiveTag
---

Add the server action described by: **$ARGUMENTS**

## 1. Objective

Add one server action matching the conventions of the module it lands in — not a general idea of good practice.

## 2. Input / Scope

Module and action name above. Actions live in `src/lib/actions/<module>.ts`. Scope is that action plus its Zod schema; nothing else in the module changes.

## 3. Context

`AGENTS.md` has the five-step action pattern. What it can't tell you: this codebase is **not internally consistent**, and **the file you are editing wins over any general rule**.

## 4. Investigation

Read the target module top to bottom first. Note its `requireUser` helper, Zod imports, return shape, and `revalidatePath()` calls. Copy those; don't invent alternatives.

## 5. Pattern / Constraints

Beyond the `AGENTS.md` steps, the three that actually go wrong here:

- **Ownership check before every mutation** — `findFirst({ where: { id, userId: session.userId } })`, bail if missing. Never trust a client id. Single most important rule in this repo; nothing in the toolchain catches its absence.
- **`requireUser` is a per-module local helper** (`src/lib/actions/tags.ts:8`), not a shared import. If the module lacks one, copy it in rather than inventing a shared abstraction.
- **Zod schema goes in `src/lib/validations.ts`**, never inline.

Return shape by module, no mixing: `auth.ts` uses `src/lib/response.ts` helpers; every other module returns ad-hoc `{ error }` / `{ success: true }`. Match the neighbours — no drive-by migration.

## 6. Analysis

State which module the action belongs in, that module's return convention, and which paths need revalidating. If it doesn't obviously belong to an existing module, say so before creating a new one.

## 7. Decision

Note any judgement call: new Zod schema vs. reusing one, which paths to revalidate, whether a new module is warranted.

## 8. Execution

Write the action and its schema. Nothing else.

## 9. Verification

Run `/check`, then re-read the action against the rules above — especially the ownership check.

## 10. Limitations

`/check` proves types and lint only. It does not prove the ownership check is correct, that `revalidatePath()` covers the right paths, or that any email sends.

## 11. Report

**Added** — action and schema, with `file:line`
**Conventions followed** — return shape, `requireUser` source, revalidated paths
**Verification** — `/check` against the baseline
**Not verified** — ownership behaviour, revalidation, email delivery
**Remaining concerns** — or "None"
