# User Profile — Frontend Documentation

## Components

### `ProfileForm` (`src/components/profile-form.tsx`)

**Type:** Client component

**Props:**
```typescript
{ user: { name: string, email: string } }
```

**Sections:**

**1. Profile Information**
- Name input (pre-filled)
- Email input (pre-filled)
- "Save Changes" button
- Success/error messages

**2. Change Password**
- Current password input
- New password input (min 8)
- Confirm password input
- "Update Password" button
- Success/error messages
- Form resets on success

**3. Danger Zone (red border)**
- "Delete Account" button reveals confirmation
- Text input: must type "DELETE"
- Confirm button (disabled until "DELETE" typed)
- Cancel button to dismiss

**Behavior:**
- Each section submits independently.
- Profile update calls `updateProfile(formData)` → on success, `router.refresh()` to update sidebar.
- Password change calls `changePassword(formData)` → on success, resets form.
- Delete calls `deleteAccount()` → on success, `router.push("/")`.

---

## Page

### Profile Page (`src/app/dashboard/profile/page.tsx`)

**Type:** Server component

```tsx
const stats = await getProfileStats();
// Renders:
// - Profile summary card (avatar, name, email, member since, total/offers/interviews)
// - ProfileForm component
```

---

## Files

| File | Role |
|------|------|
| `src/components/profile-form.tsx` | Profile edit, password, delete account |
| `src/app/dashboard/profile/page.tsx` | Profile page (summary + form) |
