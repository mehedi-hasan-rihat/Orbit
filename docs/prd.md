# Orbit — Product Requirements Document

## Problem Statement

Job seekers managing multiple simultaneous applications face a fragmented experience: applications are scattered across email threads, spreadsheets, and memory. There is no proactive reminder system, no visual pipeline, and no way to measure progress objectively. Orbit solves this with a purpose-built tracker.

---

## Goals

- Give users a single place to track every job application through its full lifecycle.
- Let users define their own pipeline stages instead of forcing a fixed status set.
- Surface actionable follow-up reminders via in-app notifications and email.
- Measure the job search with real metrics: interview rate, offer rate, weekly velocity.
- Be fast and low-friction — adding an application should take under 30 seconds.

---

## Non-Goals

- Job discovery or job board integration.
- Collaborative / team features.
- Native mobile app (responsive web only).

---

## Users

Single user per account. No roles, no organisations. All data is private and scoped to the authenticated user.

---

## Core Features

### Application Tracking
Add, edit, archive, and close applications. Each application has: company, role, job URL, stage, applied date, stage outcome (for scheduling stages), scheduled date, notes, and tags.

Applications have two independent state flags:
- **archived** — hidden from the active list; the application is out of the running but preserved for analytics.
- **closed** — the hiring process ended; stage, notes, and history are preserved intact.

### Custom Pipeline
User-defined stage catalogue. Stages are the columns on the Kanban board. System stages (Wishlist, Applied, Screening, Assessment, Interview, Get Offer, Hired, Rejected) are seeded on first login. Users can add custom stages and reorder/colour all stages.

### Kanban Board
Drag-and-drop board on the dashboard. Each column shows the stage name, colour, application count, and up to 5 preview cards. Cards link to the application detail page.

### Stage Outcomes
For scheduling stages (Screening, Assessment, Interview), users record a sub-status:
- `SCHEDULED` / `ASSIGNED` — open; cron sends reminder emails 2 and 1 day before the scheduled date.
- `COMPLETED` / `PASSED` / `FAILED` / `CANCELLED` — terminal; application removed from calendar but date preserved in history.

`null` means the outcome has not been set yet.

### Reminders
Date-based follow-up reminders per application. Up to 2 open reminders per application. Each reminder has a title, optional details, and a due date. A reminder email is sent on the due date. Reminders can be marked done (archived but kept on record).

### Notes
Free-text notes per application. Unlimited. Each note records created/updated timestamps and is displayed in the application detail page below reminders.

### Activity Timeline
Immutable audit log per application. Records: created, stage changes, outcome changes, notes added, reminders set. Filterable by type.

### Analytics
Dashboard metrics:
- Total applications, this-week count.
- Interview rate (% reached INTERVIEWING or SUCCESS category).
- Offer rate (% reached SUCCESS category).
- Stage distribution bar chart.

### Calendar
Month view of all open scheduled stages and upcoming reminders. Terminal outcomes are excluded. Clicking an event navigates to the application.

### Tags
Colour-coded labels. Applied to applications at create/edit time. Applications list is filterable by tag.

### Notifications
Real-time in-app notifications via SSE. Notification bell in the header shows unread count. Clicking marks all read. Cron-generated notifications also trigger emails.

### Export
CSV export of all applications including closed status, stage, applied date, tags.

### Profile
Update name and email. Change password. Delete account (hard deletes all owned data).

---

## Success Metrics

- User can add their first application without confusion.
- Kanban board renders quickly regardless of application count.
- Reminder emails are delivered reliably and not duplicated.
- No data loss — closed/archived applications preserve their full history.
- TypeScript compiles clean; lint passes with no errors.
