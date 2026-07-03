# Authentication — API Reference

## Server Actions

All authentication actions are marked `"use server"` and located in the auth actions module.

---

### `registerAction(formData: FormData)`

Creates a new user account and initiates email verification.

**Input:**

| Field | Type | Validation |
|-------|------|-----------|
| name | string | Required, 1–100 characters |
| email | string | Required, valid email format |
| password | string | Required, minimum 8 characters |

**Returns:**

```typescript
{ ok: true; data: { email: string } }
{ ok: false; code: "VALIDATION"; fields: { name?, email?, password?: string[] } }
{ ok: false; code: "CONFLICT"; message: "Email already in use." }
{ ok: false; code: "SERVER_ERROR"; message: string }
```

**Side Effects:** Creates user record; sends verification email asynchronously.

---

### `verifyEmailAction(token: string)`

Verifies a user's email address using the token from the verification link.

**Input:** UUID token from the verification email link.

**Returns:**

```typescript
// On success: redirects to /dashboard (no return value)
{ ok: false; code: "NOT_FOUND"; message: "Invalid or expired verification link." }
{ ok: false; code: "EXPIRED"; message: "This verification link has expired."; email: string }
{ ok: false; code: "SERVER_ERROR"; message: string }
```

**Side Effects:** Sets `emailVerified = true`; clears token fields; sets session cookie.

---

### `resendVerificationAction(email: string)`

Resends the email verification link.

**Returns:**

```typescript
{ ok: true }
{ ok: false; code: "NOT_FOUND"; message: "No account found for this email." }
{ ok: false; code: "CONFLICT"; message: "Email already verified. Please sign in." }
```

**Side Effects:** Updates verification token and expiry; sends verification email asynchronously.

---

### `loginAction(formData: FormData)`

Authenticates a user and establishes a session.

**Input:**

| Field | Type | Validation |
|-------|------|-----------|
| email | string | Required, valid email format |
| password | string | Required, minimum 1 character |

**Returns:**

```typescript
// On success: redirects to /dashboard (no return value)
{ ok: false; code: "VALIDATION"; fields: Record<string, string[]> }
{ ok: false; code: "UNAUTHORIZED"; message: "Invalid email or password." }
{ ok: false; code: "VALIDATION"; fields: { email: ["Please verify your email before signing in."] } }
{ ok: false; code: "SERVER_ERROR"; message: string }
```

**Side Effects:** Sets HTTP-only session cookie. If email is unverified, re-issues and sends a new verification email.

**Note:** The same error message is returned for both "user not found" and "wrong password" to prevent user enumeration.

---

### `logoutAction()`

Destroys the current session.

**Input:** None.

**Side Effects:** Deletes the `orbit-session` cookie; redirects to `/login`.

---

### `forgotPasswordAction(formData: FormData)`

Initiates the password reset flow.

**Input:**

| Field | Type | Validation |
|-------|------|-----------|
| email | string | Required |

**Returns:**

```typescript
{ ok: true }  // always, regardless of whether the email exists
{ ok: false; code: "VALIDATION"; fields: { email: string[] } }
```

**Side Effects:** If a verified account exists for the email, stores a reset token (1-hour expiry) and sends a password reset email asynchronously.

---

### `resetPasswordAction(formData: FormData)`

Completes the password reset and logs the user in.

**Input:**

| Field | Type | Validation |
|-------|------|-----------|
| token | string | Required |
| password | string | Required, minimum 8 characters |
| confirm | string | Required, must match password |

**Returns:**

```typescript
// On success: redirects to /dashboard (no return value)
{ ok: false; code: "NOT_FOUND"; message: "Invalid reset link." }
{ ok: false; code: "EXPIRED"; message: "Reset link has expired." }
{ ok: false; code: "VALIDATION"; fields: { password?, confirm?: string[] } }
```

**Side Effects:** Updates password hash; clears reset token fields; sets session cookie.

---

## Session Utilities

These are internal utility functions used by actions and layouts, not callable from the client.

| Function | Returns | Purpose |
|----------|---------|---------|
| `getSession()` | `SessionPayload \| null` | Read and verify the current session from the cookie |
| `setSession(payload)` | `void` | Sign a JWT and write it to the HTTP-only cookie |
| `clearSession()` | `void` | Delete the session cookie |
| `createToken(payload)` | `string` | Sign a JWT (internal) |
| `verifyToken(token)` | `SessionPayload \| null` | Verify a JWT signature and expiry (internal) |
