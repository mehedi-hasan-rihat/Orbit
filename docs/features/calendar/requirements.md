# Calendar — Business Requirements

## Overview

An interactive monthly calendar showing all scheduled interviews and follow-up reminders in one place.

---

## User Stories

- As a user, I see all my interview dates and follow-up dates on a calendar.
- As a user, I can click a day to see what events are scheduled.
- As a user, I see upcoming events for the next 7 days in a sidebar.
- As a user, events are color-coded by type (interview vs follow-up).
- As a user, I can click an event to go to the related application.

---

## Event Types

| Type | Color | Source |
|------|-------|--------|
| Interview | Indigo | `interview.scheduledAt` |
| Follow-up | Amber | `application.followUpDate` |

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| No events | Calendar renders, no dots on days |
| Interview scheduled for June 20 | Indigo dot on June 20 |
| Follow-up set for June 22 | Amber dot on June 22 |
| Click on June 20 | Shows interview details for that day |
| Upcoming sidebar | Shows events within next 7 days |
| Archived application's events | NOT shown |
