# Application Tracking — Business Requirements

## Overview

The core feature of Orbit. Users track job applications through a multi-stage pipeline from initial interest to final outcome.

---

## User Stories

### Creating Applications
- As a user, I can add a new job application with company name, role, job URL, status, applied date, follow-up date, notes, and tags.
- Company and role are required fields.
- Status defaults to "Wishlist" if not specified.

### Editing Applications
- As a user, I can edit any field of my applications at any time.
- Changes to status, notes, and follow-up date are tracked in the activity log.

### Deleting Applications
- As a user, I can permanently delete an application.
- Deletion removes all related data (activities, interviews, tag associations).

### Archiving
- As a user, I can archive applications I no longer want in my active view.
- Archived apps are hidden from the dashboard, analytics, and main list.
- I can view archived apps in a separate "Archived" tab.
- I can restore (unarchive) an application at any time.

### Duplicate Detection
- When I create a new application, the system warns me if I already have one for the same company + role.
- I can dismiss the warning and create it anyway.

### Notes
- As a user, I can add free-text notes (up to 5000 chars) to any application.
- I can use "Quick Note" to append a timestamped entry without replacing existing notes.

### Detail Page
- As a user, I can view a full detail page for any application showing:
  - Company, role, status, job URL link
  - Applied date, follow-up date (with overdue indicator), last updated
  - Interview rounds with outcomes
  - Notes editor
  - Activity timeline
  - Tags

---

## Pipeline Stages

| Status | Description |
|--------|-------------|
| Wishlist | Interested but haven't applied yet |
| Applied | Application submitted |
| Interview | In the interview process |
| Offer | Received an offer |
| Rejected | Application rejected |
| Archived | No longer relevant (soft-delete) |

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Create with company + role | Application created, status = Wishlist, activity logged |
| Create without company | Validation error |
| Edit status from Applied to Interview | Updated, STATUS_CHANGED activity created |
| Archive application | Hidden from main list and analytics |
| Unarchive application | Restored to main list |
| Delete application | Permanently removed with all related data |
| Duplicate company+role exists | Warning shown, user can dismiss |
| Add quick note | Appended with timestamp, activity logged |
