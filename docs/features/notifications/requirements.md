# Notifications & Email Reminders — Requirements

## Overview

Notify users before upcoming interviews and follow-up dates via in-app bell notifications and email.

## Functional Requirements

### In-App Notifications
- Bell icon visible in the dashboard on both desktop and mobile
- Badge shows count of unread notifications
- Notifications are pushed in real-time via SSE (no page reload required)
- Dropdown lists each notification with title, type icon, urgency badge, and relative time
- Clicking a notification navigates to the related application
- "Mark all read" clears the badge and collapses the list
- Empty state shown when there are no unread notifications
- Loading state shown while SSE connection is being established

### Email Reminders
- Send email 2 days before a scheduled interview
- Send email 1 day before a scheduled interview
- Send email 2 days before a follow-up date
- Send email 1 day before a follow-up date
- Each reminder is sent only once (deduplicated)
- Email contains: user name, company, role, date, reminder type, and a link to the application

### Cron Job
- Runs daily at 08:00 UTC
- Processes all users' interviews and follow-ups
- Creates `Notification` records in the database
- Sends emails via SMTP
- Returns a JSON summary: `{ ok, created, emailed, skipped, logs }`
- Protected by `Authorization: Bearer CRON_SECRET` header

## Non-Functional Requirements

- SSE connection auto-reconnects on drop
- Cron endpoint is idempotent — safe to run multiple times per day
- Email failures do not block notification creation
- Notifications are scoped per user (no cross-user data)

## Acceptance Criteria

- [ ] Bell badge updates within 30s of cron creating a notification
- [ ] Clicking bell item navigates to correct application
- [ ] Mark all read sets badge to 0
- [ ] Email arrives in inbox for interviews/follow-ups due in 1 or 2 days
- [ ] Running cron twice does not create duplicate notifications or send duplicate emails
- [ ] Cron returns 401 without correct `CRON_SECRET`
