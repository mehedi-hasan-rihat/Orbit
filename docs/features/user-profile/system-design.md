# User Profile — Backend System Design

## Profile Update

### `updateProfile(formData)`

```
1. getSession() → verify user
2. Zod validate: name (1-100), email (valid format)
3. If email changed:
   - prisma.user.findFirst({ email, NOT: { id: userId } })
   - If found → return error "Email already in use"
4. prisma.user.update({ name, email })
5. setSession({ userId, name, email }) → refresh cookie
6. revalidatePath("/dashboard")
```

The session refresh is critical — without it, the sidebar would show stale name/email until the cookie expires.

---

## Password Change

### `changePassword(formData)`

```
1. getSession() → verify user
2. Zod validate:
   - currentPassword (min 1)
   - newPassword (min 8)
   - confirmPassword (min 1)
   - Refine: newPassword === confirmPassword
3. prisma.user.findUnique({ id })
4. bcrypt.compare(currentPassword, user.password)
   - If false → return error "Current password is incorrect"
5. bcrypt.hash(newPassword, 12)
6. prisma.user.update({ password: hashed })
```

No session refresh needed for password change — the JWT payload doesn't include the password.

---

## Account Deletion

### `deleteAccount()`

```
1. getSession() → verify user
2. prisma.user.delete({ where: { id } })
   → Cascade: Applications → Activities, Interviews, ApplicationTags
   → Cascade: Tags → ApplicationTags
3. Return { success: true }
```

The client handles cookie cleanup (redirect navigates away, cookie becomes invalid since user no longer exists).

---

## Profile Stats

### `getProfileStats()`

```typescript
const [total, offers, interviews] = await Promise.all([
  prisma.application.count({ where: { userId } }),
  prisma.application.count({ where: { userId, status: "OFFER" } }),
  prisma.application.count({ where: { userId, status: "INTERVIEW" } }),
]);
```

Returns user metadata + aggregate counts. Three parallel count queries (efficient with userId index).
