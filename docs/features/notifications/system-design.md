# Notifications & Email Reminders — System Design

## Architecture

Two delivery channels share a single `Notification` database table as the source of truth:

```
Vercel Cron (daily 8am UTC)
  └── GET /api/cron/reminders
        ├── query DB for interviews/followups due in 1 or 2 days
        ├── CREATE Notification rows (deduplicated)
        └── sendReminderEmail() via Nodemailer → mark emailSent: true

                    PostgreSQL
                  (Notification table)
                         │
                         ▼
GET /api/notifications/stream  (SSE, persistent)
  └── every 30s: SELECT unread notifications for user
        └── push to NotificationBell via EventSource
```

## Data Model

```prisma
enum NotificationType {
  INTERVIEW_REMINDER
  FOLLOW_UP_REMINDER
}

model Notification {
  id            String           @id @default(cuid())
  userId        String
  user          User             @relation(...)
  type          NotificationType
  title         String           // e.g. "Interview at Acme Corp"
  body          String           // dedupeKey e.g. "interview-<id>-1d"
  applicationId String?
  read          Boolean          @default(false)
  emailSent     Boolean          @default(false)
  createdAt     DateTime         @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}
```

## Deduplication

The `body` field doubles as a dedupe key:

| Event | Key format |
|-------|-----------|
| Interview, 1-day reminder | `interview-<interviewId>-1d` |
| Interview, 2-day reminder | `interview-<interviewId>-2d` |
| Follow-up, 1-day reminder | `followup-<applicationId>-1d` |
| Follow-up, 2-day reminder | `followup-<applicationId>-2d` |

Before creating, the cron does `findFirst({ where: { userId, body: dedupeKey } })`. If it exists, the record is skipped.

## Cron Job Flow

```
1. Verify Authorization: Bearer CRON_SECRET → 401 if invalid
2. Compute targetDay = tomorrow (startOfDay)
3. Compute targetDay = day after tomorrow (startOfDay)
4. For each day offset [1, 2]:
   a. Find interviews WHERE scheduledAt in [targetDay, nextDay), outcome = PENDING
   b. Find applications WHERE followUpDate in [targetDay, nextDay)
   c. For each result:
      - Check dedupe key → skip if exists
      - prisma.notification.create(...)
      - sendReminderEmail(...) → update emailSent = true
5. Return { ok, created, emailed, skipped, logs }
```

## SSE Stream Flow

```
1. getSession() → 401 if not authenticated
2. Open ReadableStream
3. Immediately: query unread notifications → encode as SSE event → enqueue
4. setInterval(30s): re-query → push updated data
5. On req.signal abort: clearInterval → close stream
```

## Email Template

- Subject: `Reminder: <label> at <company> — tomorrow` / `in 2 days`
- Body: HTML email with name, action line, date, CTA button → application URL
- Sent via Nodemailer using SMTP credentials from environment variables
