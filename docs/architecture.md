# Orbit — Architecture

## Overview

Orbit is a monolithic full-stack Next.js 16 application using the App Router. There is no separate backend service. All data mutations go through **Server Actions**. API Routes exist only for the SSE notification stream and the cron endpoint.

```
Browser
  │
  ├── Server Components (RSC) — fetch data, render HTML
  │     └── src/app/**/page.tsx
  │
  ├── Client Components — interactivity, forms, DnD, charts
  │     └── src/components/*.tsx  ("use client")
  │
  ├── Server Actions — validate → authorise → mutate → revalidate
  │     └── src/lib/actions/*.ts  ("use server")
  │
  └── API Routes — SSE stream, cron job
        └── src/app/api/**/route.ts
```

---

## Request Lifecycle

### Page Load
1. Next.js renders the Server Component (`page.tsx`).
2. The page calls server actions directly to fetch data — Prisma queries run server-side, no `fetch()` calls.
3. HTML is streamed to the browser with hydration payloads.
4. Client components hydrate and attach DnD / form handlers.

### Mutation
1. User triggers an action (form submit, drag-drop, button click).
2. A Server Action is called.
3. Action calls `requireUser()` — throws if no session.
4. Input is validated with Zod.
5. Ownership is verified (`userId: session.userId` on every DB query).
6. Prisma executes the mutation.
7. `revalidatePath("/dashboard")` clears the Next.js cache.
8. The page re-renders with fresh data.

---

## Directory Structure

```
src/
├── app/
│   ├── (auth)/                  ← Login, register, verify-email, reset-password
│   ├── dashboard/               ← All authenticated pages
│   │   ├── page.tsx             ← Dashboard home (kanban + analytics + due items)
│   │   ├── layout.tsx           ← Sidebar shell
│   │   ├── applications/
│   │   │   ├── page.tsx         ← Applications list with filters
│   │   │   └── [id]/page.tsx    ← Application detail
│   │   ├── pipeline/page.tsx    ← Pipeline stage management
│   │   ├── calendar/page.tsx    ← Calendar view
│   │   ├── companies/page.tsx   ← Company stats
│   │   ├── tags/page.tsx        ← Tag management
│   │   └── profile/page.tsx     ← User profile + password
│   ├── api/
│   │   ├── auth/verify-email/   ← Email verification link handler
│   │   ├── cron/reminders/      ← Scheduled reminder + notification delivery
│   │   └── notifications/stream/← SSE notification stream
│   ├── pricing/, privacy/, terms/← Public pages
│   └── page.tsx                 ← Landing page
├── components/                  ← All React components
├── lib/
│   ├── actions/                 ← All server actions
│   │   ├── applications.ts
│   │   ├── auth.ts
│   │   ├── calendar.ts
│   │   ├── notes.ts
│   │   ├── notifications.ts
│   │   ├── pipeline.ts
│   │   ├── profile.ts
│   │   ├── reminders.ts
│   │   └── tags.ts
│   ├── auth.ts                  ← Session management (JWT cookie)
│   ├── email.ts                 ← Nodemailer email templates
│   ├── outcome-display.ts       ← Outcome → label/colour lookup
│   ├── prisma.ts                ← Prisma client singleton
│   ├── relative-time.ts         ← Human-readable date helpers
│   ├── response.ts              ← Typed action response constructors
│   ├── stage-display.ts         ← Resolves stage name for any application
│   └── validations.ts           ← Zod schemas + domain constants
└── generated/
    └── prisma/                  ← Prisma-generated client types
```

---

## Authentication

- HTTP-only JWT cookie (`orbit_session`), 7-day expiry, `SameSite=Lax`.
- `getSession()` — reads and verifies the JWT, returns `{ userId, email, name }` or `null`.
- `requireUser()` — calls `getSession()`, throws if null. Used in every server action that touches user data.
- Email must be verified before login is permitted.
- Password reset and email verification tokens are cryptographically random, stored hashed in the DB, single-use, and expire (24h verification, 1h reset).

---

## Data Model

### Enums

```
StageOutcome   SCHEDULED | ASSIGNED | COMPLETED | PASSED | FAILED | CANCELLED
StageCategory  OPEN | INTERVIEWING | SUCCESS | CLOSED
ActivityType   CREATED | OUTCOME_CHANGE | NOTE_ADDED | REMINDER_SET | OTHER
NotificationType  SCHEDULED | REMINDER
```

`StageOutcome` is nullable on `Application.stageOutcome`. `null` means the outcome has not been set yet. There is no `PENDING` value — null is the "not set" state.

### Key Relations

```
User ──< Application ──< Activity
     ──< PipelineStageType        Application >── PipelineStageType
     ──< Tag                      Application ──< ApplicationTag >── Tag
     ──< Notification             Application ──< Reminder
                                  Application ──< Note
```

### Stage Outcome Sub-Status

`stageOutcome` applies only to scheduling stages (Screening, Assessment, Interview). It records what happened at that stage step:

| Value | Meaning |
|-------|---------|
| `null` | Not set — stage just entered |
| `SCHEDULED` | Appointment booked; date required |
| `ASSIGNED` | Assigned/pending confirmation; date required |
| `COMPLETED` | Stage completed normally |
| `PASSED` | Stage passed |
| `FAILED` | Stage failed |
| `CANCELLED` | Stage cancelled |

`SCHEDULED` and `ASSIGNED` are "open" outcomes — the cron and calendar track these. Terminal outcomes (COMPLETED, PASSED, FAILED, CANCELLED) remove the application from the calendar but preserve the date for history.

---

## Pipeline Stages

The pipeline is user-defined. Each `PipelineStageType` belongs to a user and has:
- **name** — unique per user
- **color** — hex string used for board column header and stage badges
- **category** — one of `OPEN / INTERVIEWING / SUCCESS / CLOSED`
- **order** — display order on the board
- **enabled** — hidden stages still exist in the DB (apps can still be on them) but don't appear on the board

System stages (Wishlist, Applied, Screening, Assessment, Interview, Get Offer, Hired, Rejected) are seeded on first login and cannot be renamed or deleted — only their colour can be changed. Custom stages can be fully edited.

---

## Real-time

Server-Sent Events (SSE) at `/api/notifications/stream`. The client subscribes on mount via `EventSource` and receives notification payloads as JSON. No WebSocket — SSE is sufficient for one-way server push.

---

## Cron

`/api/cron/reminders` — called by an external scheduler (e.g. Vercel Cron). On each run:
1. Finds applications with `stageDueAt` falling 1 or 2 days from now whose outcome is still open (`null`, `SCHEDULED`, or `ASSIGNED`).
2. Finds `Reminder` rows with `dueAt` today that are not yet done.
3. For each, creates a `Notification` row (deduped by a stable key) and sends an email.

Protected by `Authorization: Bearer <CRON_SECRET>` header.

---

## Performance

- **Kanban**: `getKanbanData()` runs one count + one 5-row SELECT per stage inside a transaction. Never loads all applications for the board render.
- **Analytics**: `getApplicationStats()` aggregates in a single query set without returning full application objects.
- **Client splitting**: Heavy client components (charts, DnD board) are `"use client"` leaf components so the page shell stays SSR.
