# Application Tracking — Requirements

## Overview

Application tracking is the core feature of Orbit. Users create and manage job application records through a multi-stage pipeline, from initial interest through to a final outcome. Every meaningful change is logged automatically in an activity trail.

---

## User Stories

### Creating Applications
- As a user, I can add a new job application by providing the company name, role, job URL, pipeline status, applied date, follow-up date, notes, and tags.
- Company name and role are required; all other fields are optional.
- Status defaults to "Wishlist" if not specified.

### Editing Applications
- As a user, I can edit any field of any application I own at any time.
- Changes to status, notes, and follow-up date are automatically recorded in the activity log.

### Deleting Applications
- As a user, I can permanently delete an application.
- Deletion removes all related data: activities, interview rounds, and tag associations.

### Archiving
- As a user, I can archive applications I no longer want in my active view.
- Archived applications are hidden from the dashboard, analytics, and the main application list.
- I can view archived applications in a dedicated "Archived" tab.
- I can restore an archived application at any time.

### Duplicate Detection
- When creating a new application, the system checks whether I already have an active application for the same company and role.
- If a duplicate is detected, a warning is shown. I can dismiss the warning and proceed.

### Notes
- As a user, I can add free-text notes (up to 5,000 characters) to any application.
- I can use the "Quick Note" feature to append a timestamped entry to existing notes without replacing them.

### Application Detail
- As a user, I can view a full detail page for any application showing: company, role, status, job URL, applied date, follow-up date with overdue indicator, interview rounds, notes editor, activity timeline, and tags.

---

## Pipeline Stages

| Status | Description |
|--------|-------------|
| Wishlist | Interested but not yet applied |
| Applied | Application submitted |
| Screening | Initial screening stage |
| Interview | Active interview process |
| Offer | Offer received |
| Rejected | Application rejected |
| Withdrawn | Application withdrawn by the user |
| Archived | Soft-removed from active view |

---

## Acceptance Criteria

| Scenario | Expected Outcome |
|----------|-----------------|
| Create with company and role | Application created with status Wishlist; CREATED activity logged |
| Create without company | Validation error |
| Edit status from Applied to Interview | Status updated; STATUS_CHANGED activity logged |
| Archive application | Hidden from main list and analytics |
| Unarchive application | Restored to main list |
| Delete application | Permanently removed with all related data |
| Duplicate company and role detected | Warning shown; user can dismiss and proceed |
| Add quick note | Note appended with timestamp; NOTE_ADDED activity logged |
| Set follow-up date | FOLLOW_UP_SET activity logged |
