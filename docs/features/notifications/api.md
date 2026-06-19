# Notifications & Email Reminders — API

## API Routes

### GET /api/notifications/stream

SSE endpoint. Streams unread notifications for the authenticated user.

**Auth:** Session cookie (HTTP-only JWT)

**Response:** `text/event-stream`

Each event payload:
```json
{
  "count": 2,
  "items": [
    {
      "id": "clxyz123",
      "type": "interview",
      "title": "Interview at Acme Corp",
      "body": "interview-abc123-1d",
      "applicationId": "clabc456",
      "createdAt": "2026-06-19T08:00:00.000Z"
    },
    {
      "id": "clxyz124",
      "type": "followup",
      "title": "Follow-up: Beta Inc",
      "body": "followup-def789-2d",
      "applicationId": "cldef012",
      "createdAt": "2026-06-19T08:00:00.000Z"
    }
  ]
}
```

**Behavior:**
- Sends immediately on connect
- Refreshes every 30 seconds
- Closes cleanly on client disconnect

---

### GET /api/cron/reminders

Cron job endpoint. Creates notifications and sends reminder emails.

**Auth:** `Authorization: Bearer <CRON_SECRET>` header

**Response:**
```json
{
  "ok": true,
  "created": 3,
  "emailed": 2,
  "skipped": 1,
  "logs": [
    "notification:created:interview-abc-1d",
    "email:sent:user@example.com:interview-abc-1d",
    "notification:created:followup-def-2d",
    "email:sent:user@example.com:followup-def-2d",
    "notification:created:interview-xyz-1d",
    "email:failed:other@example.com:interview-xyz-1d"
  ]
}
```

**Error responses:**
- `401` — missing or invalid `CRON_SECRET`

---

## Server Actions

### markNotificationsRead()

`src/lib/actions/notifications.ts`

Marks all unread notifications as read for the current session user.

**Auth:** Session cookie

**Returns:** `void`

```ts
export async function markNotificationsRead(): Promise<void>
```
