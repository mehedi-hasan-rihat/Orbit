# Authentication — Backend System Design

## Architecture

Authentication is fully server-side. There are no API routes — everything goes through Next.js Server Actions.

```
┌─────────────┐     ┌──────────────────┐     ┌────────────┐
│   Browser   │────►│  Server Actions   │────►│ PostgreSQL │
│  (form)     │     │  (auth.ts)        │     │  (users)   │
└─────────────┘     └──────────────────┘     └────────────┘
                           │
                    ┌──────▼──────┐
                    │  JWT Cookie  │
                    │  (httpOnly)  │
                    └─────────────┘
```

---

## Session Management (`src/lib/auth.ts`)

### Token Creation

```typescript
function createToken(payload: SessionPayload): string
```

- Signs a JWT with `{ userId, email, name }` using `BETTER_AUTH_SECRET`.
- Expiry: 7 days.

### Token Verification

```typescript
function verifyToken(token: string): SessionPayload | null
```

- Returns decoded payload or `null` if expired/invalid.

### Get Session

```typescript
async function getSession(): Promise<SessionPayload | null>
```

- Reads `orbit-session` cookie from the request.
- Verifies JWT. Returns user payload or `null`.

### Set Session

```typescript
async function setSession(payload: SessionPayload): Promise<void>
```

- Creates JWT, writes HTTP-only cookie with these properties:

| Property | Value |
|----------|-------|
| httpOnly | `true` |
| secure | `true` in production |
| sameSite | `lax` |
| path | `/` |
| maxAge | 604800s (7 days) |

### Clear Session

```typescript
async function clearSession(): Promise<void>
```

- Deletes the `orbit-session` cookie.

---

## Registration Flow

```
1. Client submits FormData { name, email, password }
2. Zod validates: name (1-100), email (valid format), password (min 8)
3. Check prisma.user.findUnique({ email }) → if exists, return error
4. Hash password with bcrypt (12 rounds)
5. prisma.user.create({ name, email, hashedPassword })
6. setSession({ userId, email, name }) → JWT in cookie
7. redirect("/dashboard")
```

## Login Flow

```
1. Client submits FormData { email, password }
2. Zod validates: email (valid format), password (min 1)
3. prisma.user.findUnique({ email }) → if not found, return generic error
4. bcrypt.compare(password, user.password) → if false, return generic error
5. setSession({ userId, email, name }) → JWT in cookie
6. redirect("/dashboard")
```

## Logout Flow

```
1. logoutAction() called from sidebar form
2. clearSession() → deletes cookie
3. redirect("/login")
```

## Route Protection

The dashboard layout (`src/app/dashboard/layout.tsx`) acts as the auth gate:

```typescript
export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  // ... render layout
}
```

Every nested page under `/dashboard/*` is automatically protected.

---

## Security Decisions

| Decision | Rationale |
|----------|-----------|
| HTTP-only cookie | Token not accessible via JS → prevents XSS token theft |
| bcrypt 12 rounds | Strong hashing, resistant to brute force |
| Generic login error | Prevents user enumeration attacks |
| SameSite=lax | Prevents CSRF on state-changing requests |
| Secure in production | Cookie only sent over HTTPS |
| 7-day expiry | Balance between UX and security |

---

## Data Model

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `BETTER_AUTH_SECRET` | JWT signing key. Must be a strong random string in production. |
| `NODE_ENV` | Controls `secure` flag on cookie |
