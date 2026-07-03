# Authentication — System Design

## Architecture

Authentication is entirely server-side. All auth operations are handled by Next.js Server Actions. No API routes are involved in the authentication flow.

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

## Session Management

### Token Creation

Signs a JWT containing `{ userId, email, name }` using the `JWT_SECRET` environment variable. Token expiry is set to 7 days.

### Token Verification

Verifies the JWT signature and expiry. Returns the decoded `SessionPayload` on success, or `null` if the token is expired or invalid.

### Session Payload Type

```typescript
interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}
```

### Cookie Configuration

| Property | Value |
|----------|-------|
| httpOnly | `true` |
| secure | `true` in production |
| sameSite | `lax` |
| path | `/` |
| maxAge | 604,800 seconds (7 days) |

---

## Registration Flow

```
1. Client submits FormData { name, email, password }
2. Zod validates: name (1–100 chars), email (valid format), password (min 8 chars)
3. Check if a verified account exists for this email → return conflict error if so
4. If an unverified account exists, update it with a new token; otherwise create a new user
5. Hash password with bcrypt (12 rounds)
6. Generate UUID verification token with 24-hour expiry
7. Store token and expiry on the user record
8. Send verification email asynchronously (non-blocking)
9. Return { ok: true, data: { email } }
```

---

## Email Verification Flow

```
1. User clicks link: GET /api/auth/verify-email?token=<uuid>
2. Look up user by verificationToken
3. If not found → return "Invalid or expired verification link"
4. If verificationExpiry < now → return "This verification link has expired"
5. Set emailVerified = true, clear token and expiry
6. setSession({ userId, email, name }) → JWT in cookie
7. redirect("/dashboard")
```

---

## Login Flow

```
1. Client submits FormData { email, password }
2. Zod validates: email (valid format), password (min 1 char)
3. Find user by email → if not found, return generic error
4. bcrypt.compare(password, user.password) → if false, return generic error
5. If emailVerified = false → re-issue verification token, send email, return field error
6. setSession({ userId, email, name }) → JWT in cookie
7. redirect("/dashboard")
```

---

## Password Reset Flow

```
1. User submits email address
2. Find user by email; if not found or not verified → return ok (prevents enumeration)
3. Generate UUID reset token with 1-hour expiry
4. Store token and expiry on user record
5. Send password reset email asynchronously
6. Return { ok: true }

On reset form submission:
1. Validate token, password (min 8), and confirm match
2. Find user by passwordResetToken
3. If not found or expiry < now → return error
4. Hash new password with bcrypt (12 rounds)
5. Clear reset token and expiry
6. setSession → auto-login
7. redirect("/dashboard")
```

---

## Logout Flow

```
1. logoutAction() called from sidebar form
2. clearSession() → deletes orbit-session cookie
3. redirect("/login")
```

---

## Route Protection

The dashboard layout calls `getSession()` on every request. If the session is absent or invalid, the user is redirected to `/login` before any page content is rendered. Every nested route under `/dashboard/*` is automatically protected by this single check.

---

## Security Decisions

| Decision | Rationale |
|----------|-----------|
| HTTP-only cookie | Token is inaccessible to JavaScript; prevents XSS-based token theft |
| bcrypt with 12 rounds | Computationally expensive; resistant to brute-force attacks |
| Generic login error | Returns the same message for unknown email and wrong password; prevents user enumeration |
| SameSite=Lax | Prevents CSRF on state-changing requests |
| Secure flag in production | Cookie only transmitted over HTTPS |
| Email verification required | Prevents account creation with unowned email addresses |
| Non-blocking email sending | Email failures do not degrade the registration or login experience |
| Always-ok forgot-password response | Prevents enumeration of registered email addresses |
