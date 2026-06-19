# Notifications & Email Reminders — Client

## Components

### NotificationBell

`src/components/notification-bell.tsx`

Client component mounted in both desktop and mobile layouts.

**Location:**
- Desktop: top-right bar above main content (`dashboard/layout.tsx`)
- Mobile: next to hamburger menu in top header (`mobile-nav.tsx`)

**States:**

| State | UI |
|-------|----|
| Loading | Spinning `Loader2` icon (SSE not yet connected) |
| No unread | `BellOff` icon, "No new notifications" message |
| Has unread | Bell with red badge showing count (capped at `9+`) |
| Dropdown open | List of notifications with mark-all-read button |

**Notification item display:**

| Field | Source | Display |
|-------|--------|---------|
| Icon | `type` | 🎤 blue circle (interview) / 📅 amber circle (follow-up) |
| Title | `title` | Truncated text |
| Urgency | `body` (extracts `-1d` / `-2d`) | "Today" / "Tomorrow" / "In 2 days" — red if ≤1 day, yellow if 2 days |
| Time | `createdAt` | Relative: "just now", "2h ago", "1d ago" |
| Link | `applicationId` | Navigates to `/dashboard/applications/<id>` |

**Behavior:**
- `EventSource` opens on mount, closes on unmount
- On error: connection closes cleanly (no infinite retry)
- Opening dropdown when unread > 0: calls `markNotificationsRead()` → sets count to 0
- Clicking an item closes dropdown and navigates
- Clicking outside closes dropdown

**Key implementation details:**
```
useEffect → new EventSource("/api/notifications/stream")
  es.onmessage → setData(JSON.parse(e.data))
  es.onerror   → es.close()
  cleanup      → es.close()
```

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_SECURE` | `false` for STARTTLS, `true` for SSL |
| `SMTP_USER` | Sender email address |
| `SMTP_PASS` | App password (Gmail: myaccount.google.com/apppasswords) |
| `SMTP_FROM` | From display name + address |
| `CRON_SECRET` | Shared secret for cron authentication |
| `NEXT_PUBLIC_APP_URL` | Base URL used in email CTA links |

## Vercel Cron Configuration

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Vercel automatically injects `Authorization: Bearer <CRON_SECRET>` when calling cron routes.

## Local Testing

Use ngrok to expose localhost and a third-party scheduler (e.g. cron-job.org):

```bash
ngrok http 3000
```

Scheduler config:
- URL: `https://<ngrok-url>/api/cron/reminders`
- Header: `Authorization: Bearer <CRON_SECRET>`
- Header: `ngrok-skip-browser-warning: true`
- Method: `GET`
