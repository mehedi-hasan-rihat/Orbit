# Orbit — Security

## Authentication

- Passwords hashed with `bcryptjs` (cost factor 10).
- Session stored as a signed JWT in an HTTP-only, SameSite=Strict cookie (`orbit_session`).
- JWT secret from `process.env.JWT_SECRET`. Must be set in production.
- Session lifetime: 7 days. Refresh tokens rotate on every request.
- Email must be verified before login is permitted.

## Authorisation

All data is user-scoped. Every server action and DB query must:

1. Call `requireUser()` — throws if no valid session.
2. Include `userId: session.userId` in every `where` clause that touches user data.
3. Never accept a `userId` from the client request body or query string.

**Pattern:**
```ts
export async function doSomething(id: string) {
  const session = await requireUser();                      // 1. auth
  const row = await prisma.thing.findFirst({
    where: { id, userId: session.userId },                  // 2. ownership
  });
  if (!row) return { error: "Not found" };                  // 3. ownership check
  // ...mutate
}
```

Returning "Not found" (instead of "Forbidden") for rows that exist but belong to another user prevents enumeration.

## Input Validation

All mutations validate inputs with Zod before touching the DB. Schemas live in `src/lib/validations.ts`. Never trust raw `FormData` or JSON body values.

## Password Reset & Email Verification

- Tokens are cryptographically random, stored hashed in the DB.
- Tokens expire (1 hour for password reset, 24 hours for email verification).
- Tokens are single-use — invalidated immediately after consumption.

## CSRF

Server Actions are protected by Next.js's built-in CSRF mechanism (origin check on POST). No additional CSRF token needed.

## API Routes

- `/api/notifications/stream` — requires valid session cookie.
- `/api/cron/reminders` — protected by `CRON_SECRET` header check. Must match `process.env.CRON_SECRET`.
- `/api/auth/verify-email` — public (token is the credential).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs session JWTs |
| `CRON_SECRET` | Authenticates cron job requests |
| `SMTP_*` | Email delivery credentials |

Never commit `.env` to source control. `.env.example` documents required keys without values.

## Data Isolation

- `archived` and `closed` are soft-delete flags. Archived/closed rows are never hard-deleted by default.
- Deleting a `PipelineStageType` that still has applications assigned to it is blocked at the DB level (`onDelete: Restrict`).
- Deleting a `User` cascades to all owned data (`onDelete: Cascade` on all user-owned models).
