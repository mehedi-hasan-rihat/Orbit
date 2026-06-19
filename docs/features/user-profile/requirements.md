# User Profile — Business Requirements

## Overview

Users manage their account settings: profile information, password, and account deletion.

---

## User Stories

- As a user, I can view my profile summary (name, email, member since, stats).
- As a user, I can update my name and email.
- As a user, I can change my password (with current password verification).
- As a user, I can permanently delete my account and all data.

---

## Constraints

- Name: 1–100 characters.
- Email: must be valid format and unique across all users.
- New password: minimum 8 characters.
- Password change requires current password.
- Account deletion requires typing "DELETE" to confirm.

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Update name | Name changes in sidebar/header immediately |
| Update email to taken address | Error: "Email already in use" |
| Change password with wrong current | Error: "Current password is incorrect" |
| Change password (mismatch confirm) | Error: "Passwords do not match" |
| Delete account confirmed | All data removed, redirect to home |
| Delete account (didn't type DELETE) | Button disabled |
