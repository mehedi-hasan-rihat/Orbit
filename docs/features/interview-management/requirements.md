# Interview Management — Business Requirements

## Overview

Each job application can have multiple interview rounds. Users track type, schedule, notes, and outcome for each round.

---

## User Stories

- As a user, I can add multiple interview rounds to an application.
- As a user, I can set the interview type (HR, Technical, System Design, etc.).
- As a user, I can schedule an interview with date and time.
- As a user, I can add notes for each round.
- As a user, I can mark the outcome as Passed, Failed, Pending, or Cancelled.
- As a user, I can edit or delete any interview round.
- As a user, I see my interviews on the calendar.

---

## Interview Types

| Type | Label |
|------|-------|
| HR | HR Screen |
| TECHNICAL | Technical |
| SYSTEM_DESIGN | System Design |
| BEHAVIORAL | Behavioral |
| CULTURE_FIT | Culture Fit |
| TAKE_HOME | Take-Home |
| FINAL | Final Round |
| OTHER | Other |

---

## Outcomes

| Value | Meaning |
|-------|---------|
| PENDING | Awaiting result |
| PASSED | Moved to next stage |
| FAILED | Did not pass |
| CANCELLED | Interview cancelled |

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Add interview round | Created, INTERVIEW_SCHEDULED activity logged |
| Set outcome to PASSED | Updated, INTERVIEW_OUTCOME activity logged |
| Change outcome from PENDING to FAILED | Activity logged |
| Change outcome from PASSED to PASSED | No new activity (same value) |
| Delete interview | Removed permanently |
| Interview with scheduledAt | Appears on calendar |
| Interview without scheduledAt | Does NOT appear on calendar |
