# Orbit — Agent Instructions

This file is the primary entry point for all AI agents working in this repository.
Read it fully before making any changes.

## Documentation

All project documentation lives in `docs/`. It is the source of truth for architecture,
design decisions, domain rules, and feature behaviour.

```
docs/
├── prd.md                    ← Product requirements and goals
├── architecture.md           ← Full-stack architecture overview
├── design-system.md          ← UI conventions, tokens, component patterns
├── security.md               ← Auth, authorisation, and data safety rules
└── domains/
    ├── applications/
    │   ├── overview.md
    │   ├── business-rules.md
    │   ├── api.md
    │   ├── database.md
    │   ├── permissions.md
    │   └── features/
    │       ├── kanban-board/
    │       │   ├── flow.md
    │       │   ├── decision.md
    │       │   └──  memory.md and phases are temporary if needed
    │       └── application-list/
    │           ├── flow.md
    │           ├── decision.md
    │           └── 
    ├── pipeline/
    │   ├── overview.md
    │   ├── business-rules.md
    │   ├── api.md
    │   ├── database.md
    │   ├── permissions.md
    │   └── features/
    │       └── pipeline-manager/
    │           ├── flow.md
    │           ├── decision.md
    │           └── 
    ├── interviews/
    │   ├── overview.md
    │   ├── business-rules.md
    │   ├── api.md
    │   ├── database.md
    │   └── permissions.md
    ├── notifications/
    │   ├── overview.md
    │   ├── api.md
    │   └── database.md
    └── auth/
        ├── overview.md
        ├── business-rules.md
        ├── api.md
        └── security.md
```

## Documentation Update Rule

**Every implementation iteration must update the relevant docs.**

When you implement or change a feature:

1. Update `docs/domains/<domain>/api.md` if any server action signature changed.
2. Update `docs/domains/<domain>/database.md` if the schema changed.
3. Update `docs/domains/<domain>/features/<feature>/flow.md` if the user flow changed.
4. Update `docs/domains/<domain>/features/<feature>/decision.md` with any non-obvious
   architectural decisions made during implementation.
5. Update `docs/domains/<domain>/features/<feature>/` with the current
   implementation state — what exists, what file it lives in, what is still pending.
6. Do not leave docs stale. Stale docs are worse than no docs.

## Codebase Conventions

- **Framework**: Next.js 16 App Router. Pages are Server Components by default.
- **Data fetching**: Server Actions in `src/lib/actions/`. Never fetch from client components directly.
- **Mutations**: Always go through Server Actions. Always call `revalidatePath` after writes.
- **Auth**: Call `requireUser()` (throws on unauthenticated) or `getSession()` (returns null).
  Every server action that touches user data must call `requireUser()` first.
- **Ownership**: Every DB query that reads user data must include `userId: session.userId`
  in the `where` clause. Never trust a client-supplied userId.
- **Validation**: Use Zod schemas from `src/lib/validations.ts` before touching the DB.
- **ORM**: Prisma. Client is at `src/lib/prisma.ts`. Generated types at `src/generated/prisma`.
- **Styling**: Tailwind CSS 4. Use design tokens (`bg-muted`, `text-muted-foreground`, etc.)
  not raw colours. Match the existing visual language before introducing new patterns.
- **Components**: `"use client"` only when the component needs interactivity or browser APIs.
  Prefer Server Components.
- **Types**: No `any`. Prefer inference over manual annotation where Prisma types are available.

## Critical Safety Rules

### API Changes
Before modifying or removing any server action:
1. Search the entire codebase for all call sites.
2. Identify every consumer (page, component, other action).
3. Migrate consumers before removing the old action.
4. Confirm zero active consumers before deletion.

### Database Changes
- Never write a migration by hand unless absolutely necessary — use `prisma migrate dev`.
- Never drop a column that may still be read by deployed code.
- Nullable additions are safe. Removals and renames are not.

### Destructive Operations
Ask the user before:
- Dropping a database column or table.
- Removing a server action that has consumers outside the current feature.
- Changing an authentication or authorisation mechanism.

## Testing & Verification

After every implementation:
1. Run `npx tsc --noEmit` — must pass clean.
2. Run `npm run lint` — no new errors beyond pre-existing ones.
3. Verify the changed pages render without runtime errors.
4. Update the relevant `` with the new implementation state.

## Definition of Done

A feature is not done until:
- [ ] Code compiles (`tsc --noEmit` clean).
- [ ] Lint passes (no new errors).
- [ ] Relevant docs updated (api.md, flow.md, decision.md, ).
- [ ] Implementation reviewed against the spec.
- [ ] No stale references to removed code.
