# Authentication — Frontend

## Pages

### Login Page

**Type:** Client component

Renders a sign-in form with email and password fields. On submission, calls `loginAction(formData)` and displays any returned field errors. Shows a loading state on the submit button during the server round-trip. On success, the server action performs the redirect — no client-side navigation is required.

---

### Register Page

**Type:** Client component

Renders a registration form with name, email, and password fields. Follows the same submission pattern as the login page. On success, displays a prompt instructing the user to check their email for a verification link.

---

### Forgot Password Page

**Type:** Client component

Renders a single email input. On submission, calls `forgotPasswordAction(formData)`. Always shows a success message regardless of whether the email exists, to prevent enumeration.

---

### Reset Password Page

**Type:** Client component

Reads the reset token from the URL query string. Renders new password and confirm password fields. On submission, calls `resetPasswordAction(formData)`. On success, the server action redirects to the dashboard.

---

### Verify Email Page

**Type:** Server component

Reads the token from the URL query string and calls `verifyEmailAction(token)` on the server. Renders a success state (redirects to dashboard) or an error state with an option to resend the verification email.

---

## Session Context

**Purpose:** Makes user data available to any client component inside the dashboard without prop-drilling.

The `SessionProvider` wraps the entire dashboard layout. It receives the `user` object from `getSession()` called in the server layout and exposes it via React Context. Any nested client component can access `{ userId, name, email }` via the `useSession()` hook.

---

## Logout

The logout button in the sidebar is a `<form>` element with `action={logoutAction}`. This uses Next.js progressive enhancement — the form works correctly even before client-side JavaScript has loaded.

---

## Route Protection

The dashboard layout calls `getSession()` on every request. If the session is absent or invalid, the user is redirected to `/login` before any dashboard HTML is rendered. This protection is invisible to the user and cannot be bypassed by client-side navigation.
