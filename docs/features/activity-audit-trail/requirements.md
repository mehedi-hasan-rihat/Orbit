# Activity Audit Trail — Business Requirements

## Overview

Every meaningful change to an application is logged automatically as an immutable activity record, creating a complete history of the application lifecycle.

---

## User Stories

- As a user, I see a timeline of all changes made to an application.
- As a user, I can filter activities by type (status changes, notes, interviews, etc.).
- As a user, I can see when each change happened.

---

## Activity Types

| Type | Trigger |
|------|---------|
| CREATED | Application first created |
| STATUS_CHANGED | Status moved to a different value |
| NOTE_ADDED | Notes field updated or quick note added |
| FOLLOW_UP_SET | Follow-up date set or changed |
| INTERVIEW_SCHEDULED | New interview round created |
| INTERVIEW_OUTCOME | Interview outcome changed (non-PENDING) |

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Create application | CREATED activity logged |
| Change status via Kanban | STATUS_CHANGED with from/to metadata |
| Change status via edit form | STATUS_CHANGED with from/to metadata |
| Update notes | NOTE_ADDED activity |
| Set follow-up date | FOLLOW_UP_SET activity |
| Add interview | INTERVIEW_SCHEDULED activity |
| Pass interview | INTERVIEW_OUTCOME activity |
| Delete application | All activities cascade-deleted |
| Activities immutable | Users cannot edit or delete individual activities |
