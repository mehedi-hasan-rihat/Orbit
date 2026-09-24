# Orbit — Architecture

## Overview

Orbit is a monolithic full-stack Next.js 16 application using the App Router. There is no separate backend service. All data mutations go through **Server Actions**. API Routes exist only for SSE and the cron endpoint.

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

## Request Lifecycle

### Page Load
1. Next.js renders the Server Component (`page.tsx`).
2. The page calls server actions directly to fetch data (no `fetch()` calls — Prisma queries run server-side).
3. HTML is streamed to the browser with hydration payloads.
4. Client components hydrate and attach DnD / form handlers.

### Mutation
1. User triggers an action (form submit, drag-drop).
2. A Server Action is called.
3. Action calls `requireUser()` — throws 401 if no session.
4. Input is validated with Zod.
5. Ownership is verified (`userId: session.userId` on every DB query).
6. Prisma executes the mutation.
7. `revalidatePath("/dashboard")` clears the Next.js cache.
8. The page re-renders with fresh data.

## Directory Structure

```
src/
├── app/
│   ├── (auth)/          ← Login, register, verify, reset
│   ├── dashboard/       ← All authenticated pages
│   │   ├── page.tsx     ← Dashboard home (kanban + analytics)
│   │   ├── applications/
│   │   ├── pipeline/
│   │   ├── calendar/
│   │   ├── companies/
│   │   ├── profile/
│   │   └── tags/
│   ├── api/
│   │   ├── auth/verify-email/
│   │   ├── cron/reminders/
│   │   └── notifications/stream/
│   └── (landing)/       ← Public marketing pages
├── components/          ← All React components
├── lib/
│   ├── actions/         ← All server actions
│   ├── auth.ts          ← Session management
│   ├── prisma.ts        ← Prisma client singleton
│   ├── stage-display.ts ← Resolves stage label for legacy rows
│   └── validations.ts   ← Zod schemas
└── generated/
    └── prisma/          ← Prisma generated client
```

## Authentication

- HTTP-only JWT cookie (`orbit_session`), 7-day expiry.
- Refresh token in DB (`RefreshToken` model), rotated on each request.
- `getSession()` — reads and verifies the JWT, returns `{ userId }` or `null`.
- `requireUser()` — calls `getSession()`, throws if null.
- Email verification required before login.

## Database

PostgreSQL via Prisma ORM. Connection pooling managed by `@prisma/adapter-pg`.

Key indexes:
- `Application`: `(userId)`, `(userId, stageId)`, `(userId, archived)`, `(userId, closed)`
- `PipelineStageType`: `(userId)`

## Real-time

Server-Sent Events (SSE) at `/api/notifications/stream`. The client subscribes on mount and receives notification payloads. No WebSocket — SSE is sufficient for one-way server push.

## Cron

`/api/cron/reminders` — called by an external scheduler (Vercel Cron). Scans for due follow-ups and queues notification/email delivery.

## Performance Notes

- Kanban board uses `getKanbanData()` — per-stage count + 5-item preview. Never loads all applications for the board.
- Analytics uses `getApplicationStats()` — aggregates counts in a single query set, never returns full application objects.
- Heavy client components (charts, DnD) are split into `"use client"` leaf components so the page shell is still SSR.
