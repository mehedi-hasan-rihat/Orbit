# System Design

## 1. Architecture Overview

Orbit follows a **monolithic full-stack architecture** built on Next.js App Router with Server Actions. There are no REST or GraphQL endpoints — all data mutations happen through server-side functions invoked directly from React components. API routes are used only for streaming (SSE) and cron job endpoints.

```
┌────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Server Pages │  │ Client Comps │  │  DnD / Forms │ │
│  │ (SSR + RSC)  │  │ (use client) │  │   (Events)   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│         │           EventSource              │         │
│         │        (SSE persistent)            │         │
└─────────┼──────────────────┼──────────────────┼────────┘
          │                  │                  │
          │  Server Actions  │  Server Actions  │
          ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────┐
│                   Next.js Server                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Server Actions Layer                  │  │
│  │   auth.ts | applications.ts | interviews.ts      │  │
│  │   tags.ts | profile.ts | calendar.ts             │  │
│  │   notifications.ts                               │  │
│  └──────────────────────┬───────────────────────────┘  │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │              API Routes                           │  │
│  │   /api/notifications/stream  (SSE)               │  │
│  │   /api/cron/reminders        (Vercel cron)       │  │
│  └──────────────────────┬───────────────────────────┘  │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │              Prisma ORM                           │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     PostgreSQL        │
              │  (7 tables, indexes)  │
              └───────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               Vercel Cron (daily 8am)                    │
│   GET /api/cron/reminders                               │
│   Authorization: Bearer CRON_SECRET                     │
│       │                                                  │
│       ├── creates Notification rows in DB               │
│       └── sends emails via Nodemailer (SMTP)            │
└─────────────────────────────────────────────────────────┘
```

### Design Decisions

- **Server Actions for mutations** — all data mutations go through server actions, eliminating REST boilerplate
- **API routes for streaming & cron** — `/api/notifications/stream` (SSE) and `/api/cron/reminders` (cron) are the only API routes
- **SSE for real-time notifications** — one persistent connection per browser tab, server pushes updates every 30s; simpler than WebSockets, no extra infrastructure
- **Cron job for reminders** — Vercel cron triggers daily at 8am, creates `Notification` rows and sends emails; deduplicated by `body` key so reminders are never sent twice
- **Server Components by default** — pages fetch data at the server level and pass it as props to client components where interactivity is needed
- **Optimistic UI** — the Kanban board updates locally before the server confirms, then reconciles via `router.refresh()`
- **Session via Context** — a `SessionProvider` wraps the dashboard layout, making user data available to all nested client components via `useSession()`

---

## 2. Data Model

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│  Application │──1:N──│ Activity │
└──────────┘       └──────────────┘       └──────────┘
     │                    │
     │                    ├──1:N──┌───────────┐
     │                    │       │ Interview │
     │                    │       └───────────┘
     │                    │
     │                    └──N:M──┌─────────────────┐
     │                            │ ApplicationTag  │
     │                            └────────┬────────┘
     │                                     │
     └──────1:N──┌─────┐──────────N:1──────┘
                 │ Tag │
                 └─────┘
```

### Table Details

| Model | Primary Purpose | Key Indexes |
|-------|----------------|-------------|
| User | Account & auth | email (unique) |
| Application | Core tracked entity | (userId), (userId, status), (userId, archived), (company) |
| Activity | Immutable audit log | (applicationId) |
| Interview | Per-round interview tracking | (applicationId) |
| Tag | User-defined labels | (userId), (userId, name) unique |
| ApplicationTag | Junction table (N:M) | (applicationId, tagId) unique |
| Notification | In-app & email reminders | (userId, read), (userId, createdAt) |

### Cascade Rules

All foreign keys use `onDelete: Cascade`:
- Deleting a User removes all their Applications, Tags, Notifications
- Deleting an Application removes all its Activities, Interviews, ApplicationTags
- Deleting a Tag removes all ApplicationTag associations

---

## 3. Authentication Flow

### Technology

- **JWT** (jsonwebtoken) — stateless session tokens
- **HTTP-only cookie** — `orbit-session`, not accessible via JavaScript
- **bcryptjs** — password hashing (12 salt rounds)

### Registration Flow

```
Client                Server Action              Database
  │                        │                        │
  │── POST formData ──────►│                        │
  │                        │── validate (Zod) ──────│
  │                        │── check email unique ──►│
  │                        │◄── result ─────────────│
  │                        │── hash password ───────│
  │                        │── create user ─────────►│
  │                        │◄── user record ────────│
  │                        │── sign JWT ────────────│
  │                        │── set cookie ──────────│
  │◄── redirect /dashboard─│                        │
```

### Login Flow

```
Client                Server Action              Database
  │                        │                        │
  │── POST formData ──────►│                        │
  │                        │── validate (Zod) ──────│
  │                        │── find user by email ──►│
  │                        │◄── user record ────────│
  │                        │── bcrypt.compare ──────│
  │                        │── sign JWT ────────────│
  │                        │── set cookie ──────────│
  │◄── redirect /dashboard─│                        │
```

### Session Verification (every protected page)

```
Server Component          Auth Library             Cookie Store
       │                       │                        │
       │── getSession() ──────►│                        │
       │                       │── read cookie ─────────►│
       │                       │◄── token string ───────│
       │                       │── jwt.verify() ────────│
       │◄── SessionPayload ───│                        │
       │    or null            │                        │
```

### Cookie Configuration

| Property | Value |
|----------|-------|
| Name | `orbit-session` |
| httpOnly | `true` |
| secure | `true` in production |
| sameSite | `lax` |
| path | `/` |
| maxAge | 7 days (604800 seconds) |

---

## 4. Data Flow Patterns

### Server Component → Client Component (props)

Most pages use this pattern:
1. Server component calls a server action to fetch data
2. Data is serialized via `JSON.parse(JSON.stringify(...))` for Date objects
3. Passed as props to client components for interactivity

```tsx
// Server page
const data = await getApplications();
return <ApplicationsList applications={JSON.parse(JSON.stringify(data))} />;
```

### Client Component → Server Action (mutations)

Client components call server actions directly:
1. User interacts with a form/button
2. Client component calls a server action with FormData or arguments
3. Server action validates, mutates DB, calls `revalidatePath()`
4. Client calls `router.refresh()` to get fresh data

### Session Context (client-side access)

```
DashboardLayout (Server)
  │── getSession() → reads cookie
  │── passes user data to SessionProvider
  │
  └── SessionProvider (Client)
        │── React Context with {userId, name, email}
        │
        └── Any nested client component
              └── useSession() → {userId, name, email}
```

---

## 5. Page Architecture

### Route Groups

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Server | Public | Landing page |
| `/login` | Client | Public | Login form |
| `/register` | Client | Public | Registration form |
| `/dashboard` | Server | Protected | Main dashboard with analytics, kanban, follow-ups |
| `/dashboard/applications` | Server | Protected | Application list with filters |
| `/dashboard/applications/[id]` | Server | Protected | Application detail |
| `/dashboard/calendar` | Server | Protected | Calendar view |
| `/dashboard/companies` | Server | Protected | Company statistics |
| `/dashboard/tags` | Server | Protected | Tag management |
| `/dashboard/profile` | Server | Protected | User profile settings |
| `/api/notifications/stream` | API Route | Protected | SSE stream for real-time notifications |
| `/api/cron/reminders` | API Route | CRON_SECRET | Daily cron — creates notifications & sends emails |

### Layout Hierarchy

```
RootLayout (font, metadata, globals.css)
├── (auth)/layout.tsx (minimal wrapper)
│   ├── /login
│   └── /register
└── dashboard/layout.tsx (session check, Sidebar, SessionProvider)
    ├── /dashboard
    ├── /dashboard/applications
    ├── /dashboard/applications/[id]
    ├── /dashboard/calendar
    ├── /dashboard/companies
    ├── /dashboard/tags
    └── /dashboard/profile
```

---

## 6. Security Design

### Authentication Security
- Passwords never stored in plaintext (bcrypt, 12 rounds)
- JWT stored in HTTP-only cookie (immune to XSS token theft)
- Generic error messages prevent user enumeration
- Session validated on every protected page load

### Authorization
- Every server action verifies `session.userId` matches the resource owner
- No cross-user data access is possible through the action layer
- Ownership check pattern: `findFirst({ where: { id, userId: session.userId } })`

### Input Validation
- All inputs validated with Zod schemas on the server
- Client-side validation for UX (HTML5 attributes + form state)
- Max lengths enforced (notes: 5000 chars, name: 100 chars, etc.)

### Database Security
- Prisma parameterized queries (no SQL injection)
- Cascade deletes enforce referential integrity
- Unique constraints prevent data duplication

---

## 7. Performance Considerations

### Caching & Revalidation
- Server Components fetch data on each request (dynamic rendering)
- `revalidatePath()` called after mutations to invalidate cached pages
- No stale data issues since pages are dynamically rendered

### Database Indexes
- Composite indexes on frequently filtered columns: `(userId, status)`, `(userId, archived)`
- Single-column indexes on `userId`, `applicationId`, `company`
- Unique index on `(applicationId, tagId)` prevents duplicate tag assignments

### Rendering Strategy
- Server Components for data-heavy pages (no JS shipped for read-only content)
- Client Components only where interactivity is required (forms, drag-drop, charts)
- `JSON.parse(JSON.stringify(...))` used to strip Prisma metadata and serialize Dates

### Optimistic Updates
- Kanban drag-and-drop updates local state immediately
- Server action runs in background
- `router.refresh()` reconciles with server state after mutation

---

## 8. Component Architecture

### Component Categories

| Category | Rendering | Examples |
|----------|-----------|---------|
| Layout | Server | `Sidebar`, `MobileNav` (client for active state) |
| Pages | Server | All page.tsx files |
| Data Display | Client | `AnalyticsCharts`, `FollowUps`, `ActivityTimeline` |
| Forms | Client | `ApplicationForm`, `ProfileForm`, `InterviewTracker` |
| Interactive | Client | `KanbanBoard`, `KanbanColumn`, `KanbanCard` |
| Notification | Client | `NotificationBell` (SSE-powered, mark-as-read) |
| Utility | Client | `DatePicker`, `StatusBadge`, `ExportButton` |

### State Management

- **No global state library** — React Context for session only
- **Server-driven data** — pages fetch fresh data on each navigation
- **Local component state** — forms, modals, optimistic updates
- **URL state** — search, filter, sort params stored in URL query strings

---

## 9. Notification & Email System

### Overview

Reminders are delivered in two ways:
1. **In-app bell** — real-time via SSE, reads `Notification` table
2. **Email** — sent by cron job via Nodemailer SMTP

### Cron Flow

```
Vercel Cron (daily 8am UTC)
  └── GET /api/cron/reminders
        │  Authorization: Bearer CRON_SECRET
        │
        ├── query interviews WHERE scheduledAt = tomorrow OR day+2, outcome = PENDING
        ├── query applications WHERE followUpDate = tomorrow OR day+2
        │
        ├── for each match:
        │     ├── deduplicate via body key (e.g. "interview-<id>-1d")
        │     ├── CREATE Notification row
        │     ├── sendReminderEmail() via Nodemailer
        │     └── UPDATE notification.emailSent = true
        │
        └── return { ok, created, emailed, skipped, logs }
```

### SSE Notification Flow

```
NotificationBell (client)
  └── new EventSource("/api/notifications/stream")
        │  persistent connection, auto-reconnects
        │
        ├── on connect: query unread Notification rows → push to client
        ├── every 30s: re-query → push updated data
        └── on client disconnect: clear interval, close stream
```

### Deduplication

Each notification has a `body` field used as a dedupe key:
- `interview-<interviewId>-1d` — 1-day reminder for that interview
- `interview-<interviewId>-2d` — 2-day reminder for that interview
- `followup-<applicationId>-1d` — 1-day reminder for that follow-up
- `followup-<applicationId>-2d` — 2-day reminder for that follow-up

Before creating, the cron checks if a notification with that `body` already exists — if so, it skips. This ensures running the cron multiple times in a day is safe.

### Mark as Read

- Opening the bell dropdown calls `markNotificationsRead()` server action
- Sets `read = true` on all unread notifications for the user
- SSE stream next poll returns `count: 0`

---

## 10. Deployment Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   CDN / Edge    │     │   Application   │     │  Vercel Cron     │
│  (Static Assets)│     │   (Next.js)     │◄────│  (daily 8am)     │
└────────┬────────┘     └────────┬────────┘     └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐     ┌──────────────┐
              │  PostgreSQL  │     │  SMTP Server │
              │   Database   │     │  (email out) │
              └─────────────┘     └──────────────┘
```

### Requirements
- Node.js runtime (for server-side rendering and server actions)
- PostgreSQL database (managed service recommended)
- SMTP credentials for email delivery (Gmail App Password recommended)
- Environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `SMTP_*`
- Secure cookie requires HTTPS in production (`secure: true`)
- `vercel.json` configures the daily cron schedule
