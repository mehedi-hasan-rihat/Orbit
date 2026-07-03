# Authentication — Requirements

## Overview

Orbit implements a custom authentication system. Users register with their name, email address, and password. Email verification is required before login is permitted. Sessions are maintained via a signed JWT stored in an HTTP-only cookie. No third-party authentication providers are used.

---

## User Stories

### Registration
- As a new user, I can create an account by providing my name, email address, and a password of at least 8 characters.
- If I attempt to register with an email address already associated with a verified account, I receive an error.
- After registering, I receive a verification email and am shown a prompt to check my inbox.

### Email Verification
- As a newly registered user, I receive an email containing a verification link valid for 24 hours.
- Clicking the link verifies my account and logs me in automatically.
- If the link has expired, I am shown an option to request a new verification email.

### Login
- As a verified user, I can sign in with my email address and password.
- If my credentials are incorrect, I receive the message "Invalid email or password" with no indication of which field is wrong.
- If my email is not yet verified, I am blocked from logging in and a new verification email is sent automatically.

### Password Reset
- As a user who has forgotten their password, I can request a reset link by entering my email address.
- The reset link is valid for 1 hour.
- After successfully resetting my password, I am automatically logged in.

### Logout
- As a logged-in user, I can sign out from the sidebar.
- After logout, I am redirected to the login page and my session cookie is cleared.

### Session Persistence
- My session remains valid for 7 days without requiring re-authentication.
- Accessing any protected route without a valid session redirects me to the login page.

---

## Acceptance Criteria

| Scenario | Expected Outcome |
|----------|-----------------|
| Register with valid data | Account created; verification email sent |
| Register with existing verified email | Error: "Email already in use" |
| Register with password shorter than 8 characters | Validation error |
| Click valid verification link | Account verified; redirected to dashboard |
| Click expired verification link | Error shown; option to resend |
| Login with valid credentials and verified email | Session set; redirected to dashboard |
| Login with wrong password | Error: "Invalid email or password" |
| Login with unverified email | Blocked; new verification email sent |
| Request password reset | Email sent (no confirmation of whether email exists) |
| Reset with valid token | Password updated; auto-login |
| Reset with expired token | Error: "Reset link has expired" |
| Access `/dashboard` without session | Redirect to `/login` |
| Sign out | Cookie cleared; redirect to `/login` |
| Session after 7 days | Expired; next request redirects to `/login` |
