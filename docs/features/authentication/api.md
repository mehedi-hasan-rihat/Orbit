# Authentication — API Documentation

## Server Actions

All actions are in `src/lib/actions/auth.ts` and marked `"use server"`.

---

### `registerAction(formData: FormData)`

Creates a new user account and establishes a session.

**Input (FormData fields):**

| Field | Type | Validation |
|-------|------|-----------|
| name | string | Required, 1–100 chars |
| email | string | Required, valid email format |
| password | string | Required, min 8 chars |

**Success:** Redirects to `/dashboard` (no return value — uses Next.js `redirect()`).

**Error Response:**

```typescript
{
  error: {
    name?: string[];      // e.g. ["Name is required"]
    email?: string[];     // e.g. ["Email already in use"]
    password?: string[];  // e.g. ["Password must be at least 8 characters"]
  }
}
```

**Side Effects:**
- Creates user record in database
- Sets HTTP-only session cookie

---

### `loginAction(formData: FormData)`

Authenticates a user and establishes a session.

**Input (FormData fields):**

| Field | Type | Validation |
|-------|------|-----------|
| email | string | Required, valid email format |
| password | string | Required, min 1 char |

**Success:** Redirects to `/dashboard`.

**Error Response:**

```typescript
{
  error: {
    email?: string[];  // ["Invalid email or password"]
  }
}
```

**Side Effects:**
- Sets HTTP-only session cookie

**Note:** The same error message is returned for both "user not found" and "wrong password" to prevent user enumeration.

---

### `logoutAction()`

Destroys the user session.

**Input:** None.

**Success:** Redirects to `/login`.

**Side Effects:**
- Deletes the `orbit-session` cookie

---

## Session Utilities (`src/lib/auth.ts`)

These are not server actions but utility functions used by actions and layouts:

| Function | Returns | Purpose |
|----------|---------|---------|
| `getSession()` | `SessionPayload \| null` | Read & verify current session |
| `setSession(payload)` | `void` | Create JWT and set cookie |
| `clearSession()` | `void` | Delete session cookie |
| `createToken(payload)` | `string` | Sign JWT (internal) |
| `verifyToken(token)` | `SessionPayload \| null` | Verify JWT (internal) |

### SessionPayload Type

```typescript
interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}
```
