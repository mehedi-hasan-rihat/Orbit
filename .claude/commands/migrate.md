---
description: Change the Prisma schema and regenerate the client correctly
argument-hint: <migration-name> — e.g. add_application_source
---

Schema change: **$ARGUMENTS**

Edit `prisma/schema.prisma`, then run both steps — the second is easy to forget and the failure is confusing:

```bash
npx prisma migrate dev --name $ARGUMENTS
npx prisma generate
```

Project-specific details that differ from a stock Prisma setup:

- The client is generated to **`src/generated/prisma/`**, not `node_modules`. Import from `@/generated/prisma/client`. Importing `@prisma/client` will typecheck but give you the wrong (unconfigured) client at runtime.
- Never hand-edit anything under `src/generated/` — it is overwritten on every generate, and `postinstall` runs `prisma generate` too.
- The connection goes through `@prisma/adapter-pg`; `src/lib/prisma.ts` is the singleton. Don't construct a `PrismaClient` anywhere else.

Removing a value from a Postgres enum (`ApplicationStatus`, `InterviewType`, `ActivityType`, `NotificationType`) is not a simple edit — it needs type recreation with casting. Read the generated SQL in `prisma/migrations/` before applying, and say so before running anything destructive.

After migrating, run `/check` — schema changes usually surface as type errors at the call sites.
