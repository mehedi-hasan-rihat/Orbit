# Authentication — Business Requirements

## Overview

Orbit uses a custom authentication system. Users register with email/password and receive a session stored in an HTTP-only cookie. No third-party auth providers are used.

---

## User Stories

### Registration
- As a new user, I can create an account with my name, email, and password.
- Email must be unique across all accounts.
- Password must be at least 8 characters.
- On successful registration, I am automatically logged in and taken to the dashboard.

### Login
- As a returning user, I can sign in with my email and password.
- If my credentials are wrong, I see "Invalid email or password" (no hint about which field is wrong).
- On success, I am redirected to the dashboard.

### Logout
- As a logged-in user, I can sign out from the sidebar.
- After logout, I am redirected to the login page.
- My session is fully cleared (cookie deleted).

### Session Persistence
- My session stays valid for 7 days without re-login.
- If I try to access any `/dashboard/*` page without a valid session, I am redirected to `/login`.

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Register with valid data | Account created, redirected to /dashboard |
| Register with existing email | Error: "Email already in use" |
| Register with short password | Error: "Password must be at least 8 characters" |
| Login with valid credentials | Session set, redirected to /dashboard |
| Login with wrong password | Error: "Invalid email or password" |
| Login with non-existent email | Error: "Invalid email or password" |
| Access /dashboard without session | Redirect to /login |
| Click Sign Out | Cookie cleared, redirect to /login |
| Session after 7 days | Expired, next request redirects to /login |
