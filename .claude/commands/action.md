---
description: Add a server action following this project's exact conventions
argument-hint: <module> <actionName> — e.g. tags archiveTag
---

Add the server action described by: **$ARGUMENTS**

Server actions live in `src/lib/actions/<module>.ts`. Read the target file first and match the conventions already in it — this codebase is not internally consistent, and the file you are editing wins over any general rule below.

Required in every action:

1. `"use server"` at the top of the module (once, not per function).
2. Auth: `const session = await requireUser();` — `requireUser` is a small local helper defined per-module (see `src/lib/actions/tags.ts:8`), not a shared import. If the module you are editing doesn't have one, copy it in rather than inventing a shared abstraction.
3. Validate input with a Zod schema from `src/lib/validations.ts`. Add the schema there, not inline.
4. **Ownership check before every mutation** — `findFirst({ where: { id, userId: session.userId } })` and bail if missing. Never trust an id from the client. This is the single most important rule here.
5. Mutate via `prisma` from `@/lib/prisma`.
6. `revalidatePath()` for every path whose UI reflects the change.

Return shape — pick by module, do not mix:

- `src/lib/actions/auth.ts` uses the typed helpers in `src/lib/response.ts` (`ok`, `fieldError`, `serverError`, …).
- **Every other module** returns ad-hoc `{ error }` / `{ success: true }` objects. Match the neighbours; don't migrate a file to `response.ts` as a drive-by.

If the action sends email, it must not float the promise — wrap it in `after()` from `next/server`. See `src/lib/actions/auth.ts:76` and the reasoning in `docs/issue-faced.md` (#6).

Import Prisma types from `@/generated/prisma/client`, never `@prisma/client`.

When done, run `/check`.
