# Orbit — Security

## Authentication

- Passwords hashed with `bcryptjs` (cost factor 10).
- Session stored as a signed JWT in an HTTP-only, `SameSite=Lax` cookie (`orbit_session`).
- JWT secret from `process.env.JWT_SECRET`. Must be set in production.
- Session lifetime: 7 days.
- Email must be verified before login is permitted. Attempting to log in with an unverified email resends the verification link.

---

## Authorisation

All data is user-scoped. Every server action that touches user data must:

1. Call `requireUser()` — throws if no valid session.
2. Include `userId: session.userId` in every `where` clause.
3. Never accept a `userId` from the client request body.

**Pattern:**
```ts
export async function doSomething(id: string) {
  const session = await requireUser();                    // 1. auth
  const row = await prisma.thing.findFirst({
    where: { id, userId: session.userId },                // 2. ownership
  });
  if (!row) return { error: "Not found" };               // 3. 404 not 403
  // ...mutate
}
```

Returning "Not found" (not "Forbidden") for rows that exist but belong to another user prevents enumeration.

---

## Input Validation

All mutations validate inputs with Zod before touching the DB. Schemas live in `src/lib/validations.ts`. Raw `FormData` values are never passed directly to Prisma.

---

## Password Reset & Email Verification

- Tokens are cryptographically random (`crypto.randomBytes`), stored hashed in the DB.
- Email verification tokens expire after 24 hours.
- Password reset tokens expire after 1 hour.
- Tokens are single-use — cleared immediately after consumption.

---

## CSRF

Server Actions are protected by Next.js's built-in CSRF mechanism (origin check on `POST`). No additional CSRF token is needed.

---

## API Routes

| Route | Protection |
|-------|-----------|
| `/api/notifications/stream` | Requires valid session cookie |
| `/api/cron/reminders` | `Authorization: Bearer <CRON_SECRET>` header |
| `/api/auth/verify-email` | Public — token is the credential |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs session JWTs |
| `CRON_SECRET` | Authenticates cron job requests |
| `NEXT_PUBLIC_APP_URL` | Base URL for email links |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for outgoing emails |

Never commit `.env` to source control. `.env.example` documents required keys without values.

---

## Data Isolation

- `archived` and `closed` are soft-state flags on `Application`. Archived/closed rows are not hard-deleted unless the user explicitly deletes the application.
- Deleting a `PipelineStageType` that still has applications assigned is blocked by `onDelete: Restrict`.
- Deleting a `User` cascades to all owned data (`onDelete: Cascade` on all user-owned models).
- System pipeline stages (Wishlist, Applied, Screening, etc.) cannot be renamed or deleted — only their colour can be changed.
