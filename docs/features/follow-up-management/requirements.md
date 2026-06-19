# Follow-up Management — Business Requirements

## Overview

Users set follow-up dates on applications to remind themselves to check back. The system detects overdue follow-ups and surfaces them prominently.

---

## User Stories

- As a user, I can set a follow-up date when creating or editing an application.
- As a user, I see upcoming follow-ups on my dashboard.
- As a user, overdue follow-ups are highlighted in red so I don't miss them.
- As a user, I see a "Follow-up overdue" badge on the application detail page.
- As a user, follow-ups appear on the calendar.

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Follow-up date in future | Shown in "Upcoming" section |
| Follow-up date in past | Shown in "Overdue" section with red styling |
| Application with status REJECTED | Not shown in follow-ups |
| Archived application | Not shown in follow-ups |
| No follow-up date set | Not shown |
| Follow-up date on detail page (overdue) | Red "Follow-up overdue" badge in hero |
