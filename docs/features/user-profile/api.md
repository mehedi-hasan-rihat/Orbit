# User Profile — API Documentation

## Server Actions (`src/lib/actions/profile.ts`)

---

### `updateProfile(formData: FormData)`

Updates user's name and email.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | string | Yes | 1–100 chars |
| email | string | Yes | Valid email format |

**Returns:**
```typescript
{ success: true }
{ error: { name?: string[], email?: string[], _form?: string[] } }
```

**Side Effects:**
- Updates user record
- Refreshes session cookie (new name/email in JWT)
- Revalidates `/dashboard`

---

### `changePassword(formData: FormData)`

Changes user's password.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| currentPassword | string | Yes | Min 1 char |
| newPassword | string | Yes | Min 8 chars |
| confirmPassword | string | Yes | Must match newPassword |

**Returns:**
```typescript
{ success: true }
{ error: { currentPassword?: string[], newPassword?: string[], confirmPassword?: string[], _form?: string[] } }
```

**Specific Errors:**
- `{ currentPassword: ["Current password is incorrect"] }` — bcrypt comparison failed
- `{ confirmPassword: ["Passwords do not match"] }` — Zod refine failed

---

### `deleteAccount()`

Permanently deletes the user and all associated data.

**Input:** None.

**Returns:**
```typescript
{ success: true }
{ error: "Unauthorized" }
```

**Side Effects:** All user data (applications, activities, interviews, tags) cascade-deleted.

---

### `getProfileStats()`

Returns user info and aggregate metrics.

**Input:** None.

**Returns:**
```typescript
{
  user: { id: string, name: string, email: string, createdAt: Date };
  total: number;       // total application count
  offers: number;      // apps with status OFFER
  interviews: number;  // apps with status INTERVIEW
} | null  // null if not authenticated
```
