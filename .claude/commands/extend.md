---
description: Extend an existing feature without breaking its current call sites
argument-hint: <feature> <change> — e.g. applications add source field
---

Change: **$ARGUMENTS**

Find every touchpoint **before** editing. A feature here is spread across an action module, a page, one or more components, and often a Zod schema — partial edits typecheck fine and break at runtime.

```bash
grep -rn "<featureName>" src/ --include=*.ts --include=*.tsx
```

Then work outward from the data:

1. If the shape changes, start at `prisma/schema.prisma` → `/migrate` → let type errors point you at the call sites.
2. Update the Zod schema in `src/lib/validations.ts` to match. A field added to the DB but not the schema is silently dropped on submit — `FormData` is parsed through Zod, not spread.
3. Update the action, keeping **that module's** existing return shape (`response.ts` helpers in `auth.ts`, ad-hoc `{ error }` / `{ success }` everywhere else).
4. Update every consumer the grep found, including the detail page `src/app/dashboard/applications/[id]/page.tsx` if the model is `Application`.
5. Widen `revalidatePath()` if the change is now visible on a path the action didn't previously invalidate.

Do not refactor surrounding code, rename things, or migrate a module to a different return convention while you're in there. Make the requested change and stop.

Finish with `/check`.
