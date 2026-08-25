---
description: Build a new feature end-to-end through this project's vertical slice
argument-hint: <what to build> — e.g. archive applications
---

Feature: **$ARGUMENTS**

## 1. Objective

Ship the feature as a complete vertical slice, following the conventions already here rather than introducing new ones.

## 2. Input / Scope

Before writing code, state **which layers it touches and which it doesn't** — skipping a layer deliberately is fine, skipping it silently is not.

Build what was asked. Don't widen the feature.

## 3. Context

`AGENTS.md` covers the stack and per-layer rules. No component library — everything is custom Tailwind 4 against the CSS variables in `src/app/globals.css`.

## 4. Investigation

Read the nearest existing slice end-to-end first. Applications, tags, and interviews are each complete — one of them is the template for what you're building.

```bash
grep -rn "<similarFeature>" src/ --include=*.ts --include=*.tsx
```

## 5. Pattern / Constraints

The slice, in order:

1. **Schema** — `prisma/schema.prisma`, then `/migrate <name>`.
2. **Validation** — Zod schema in `src/lib/validations.ts`. Never inline. A field in the DB but not the schema is **silently dropped** on submit.
3. **Server action** — `src/lib/actions/<module>.ts`, following `/action`. Ownership check mandatory.
4. **Page** — `src/app/dashboard/<route>/page.tsx` as a Server Component that fetches via `prisma` and passes data down.
5. **Client component** — `src/components/<name>.tsx`, `"use client"`, interactivity only.
6. **Navigation** — a new dashboard route goes in **both** nav arrays. They are duplicated and drift silently:
   - `src/components/sidebar.tsx:18`
   - `src/components/mobile-nav.tsx:14`

Match neighbouring components rather than introducing a new visual idiom.

## 6. Analysis

Consider each, and **say if you decided against**:

- **Activity log** — mutations to an `Application` write an `Activity` row (`ActivityType.CREATED`, `STATUS_CHANGED`, `NOTE_ADDED`, `FOLLOW_UP_SET`). See `src/lib/actions/applications.ts:49`. New enum values need a migration.
- **Notification** — if the user should be told, write a `Notification`; the bell reads it over SSE from `/api/notifications/stream`.
- **Email** — through `after()`, never floated.

## 7. Decision

Present the slice plan — layers touched, layers skipped, reasoning — before writing code.

## 8. Execution

Build in the order above. Match neighbouring files: naming, return shape, component structure, Tailwind idiom. No drive-by refactors.

## 9. Verification

Run `/check`, then confirm the schema, Zod schema, action signature, and component props all agree — a mismatch there typechecks in isolation and fails at runtime.

## 10. Limitations

State what needs the app running: email, cron, SSE, browser-only behaviour, and any UI written but never rendered.

## 11. Report

**Built** — layers touched, file by file
**Skipped** — layers deliberately not touched, and why
**Verification** — `/check` against the baseline
**Not verified** — runtime behaviour
**Remaining concerns** — or "None"
