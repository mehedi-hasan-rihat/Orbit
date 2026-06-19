# Authentication — Frontend Documentation

## Pages

### Login Page (`src/app/(auth)/login/page.tsx`)

**Type:** Client component (`"use client"`)

**UI Elements:**
- Heading: "Sign in to Orbit"
- Email input (type=email, required)
- Password input (type=password, required)
- Submit button ("Sign In" / "Signing in..." when loading)
- Link to register page

**Behavior:**
1. On form submit, calls `loginAction(formData)` directly.
2. Shows loading state on button during submission.
3. Displays error messages above the form (from `result.error`).
4. On success, the server action redirects — no client navigation needed.

---

### Register Page (`src/app/(auth)/register/page.tsx`)

**Type:** Client component (`"use client"`)

**UI Elements:**
- Heading: "Create your account"
- Name input (type=text, required)
- Email input (type=email, required)
- Password input (type=password, required, minLength=8)
- Submit button ("Create Account" / "Creating account...")
- Link to login page

**Behavior:**
- Same pattern as login: calls `registerAction(formData)`, shows errors, loading state.

---

### Auth Layout (`src/app/(auth)/layout.tsx`)

Minimal wrapper — just renders `{children}`. No sidebar, no session check (these are public pages).

---

## Session Context (`src/components/session-provider.tsx`)

**Purpose:** Makes user data available to any client component inside the dashboard without prop-drilling.

**Type:** Client component with React Context.

### Provider

```tsx
<SessionProvider user={{ userId, name, email }}>
  {children}
</SessionProvider>
```

Wraps the entire dashboard layout. The `user` prop comes from `getSession()` called in the server layout.

### Hook

```tsx
const { userId, name, email } = useSession();
```

Available in any client component nested inside the dashboard. Throws if used outside the provider.

---

## Logout UI (`src/components/sidebar.tsx`)

The logout button is a `<form>` with `action={logoutAction}`:

```tsx
<form action={logoutAction}>
  <button type="submit">Sign Out</button>
</form>
```

This uses Next.js progressive enhancement — the form works even without JS loaded.

---

## Route Protection (Server-Side)

The `src/app/dashboard/layout.tsx` checks the session before rendering:

```tsx
const session = await getSession();
if (!session) redirect("/login");
```

This is invisible to the frontend — unauthenticated users never see the dashboard HTML.

---

## Files

| File | Role |
|------|------|
| `src/app/(auth)/login/page.tsx` | Login form |
| `src/app/(auth)/register/page.tsx` | Registration form |
| `src/app/(auth)/layout.tsx` | Auth pages wrapper |
| `src/app/dashboard/layout.tsx` | Session gate + SessionProvider mount |
| `src/components/session-provider.tsx` | React Context for session |
| `src/components/sidebar.tsx` | Logout button |
