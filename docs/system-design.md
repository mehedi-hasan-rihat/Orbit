# System Design

## 1. Architecture Overview

Orbit follows a **monolithic full-stack architecture** built on Next.js App Router with Server Actions. There are no REST or GraphQL endpoints — all data mutations happen through server-side functions invoked directly from React components. API routes are used only for the SSE notification stream and the cron job endpoint.

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
│  │   /api/cron/reminders        (scheduled)         │  │
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
│               Scheduled Cron (daily 8am UTC)             │
│   GET /api/cron/reminders                               │
│   Authorization: Bearer CRON_SECRET                     │
│       │                                                  │
│       ├── creates Notification rows in DB               │
│       └── sends emails via Nodemailer (SMTP)            │
└─────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Server Actions for mutations | Eliminates REST boilerplate; mutations are type-safe RPC calls from client components |
| API routes only for SSE and cron | These require persistent connections or external triggers that cannot be expressed as Server Actions |
| SSE for real-time notifications | Unidirectional push is sufficient; simpler than WebSockets with no additional infrastructure |
| External cron scheduler | Decouples scheduling from the application runtime; any HTTP scheduler can trigger the endpoint |
| Server Components by default | Pages fetch data server-side, reducing client-side JavaScript and eliminating loading waterfalls |
| Optimistic UI on Kanban | Provides immediate visual feedback; server state reconciled via `router.refresh()` |
| Session via React Context | Avoids prop-drilling user data through the entire dashboard component tree |

---

## 2. Data Model

### Entity Relationship Overview

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

     └──────1:N──┌──────────────┐
                 │ Notification │
                 └──────────────┘
```

### Table Details

| Model | Primary Purpose | Key Indexes |
|-------|----------------|-------------|
| User | Account and authentication | `email` (unique) |
| Application | Core tracked entity | `(userId)`, `(userId, status)`, `(userId, archived)`, `(company)` |
| Activity | Immutable audit log | `(applicationId)` |
| Interview | Per-round interview tracking | `(applicationId)` |
| Tag | User-defined labels | `(userId)`, `(userId, name)` unique |
| ApplicationTag | Junction table (N:M) | `(applicationId, tagId)` unique |
| Notification | In-app and email reminders | `(userId, read)`, `(userId, createdAt)` |

### Cascade Rules

All foreign keys use `onDelete: Cascade`:
- Deleting a User removes all their Applications, Tags, and Notifications.
- Deleting an Application removes all its Activities, Interviews, and ApplicationTags.
- Deleting a Tag removes all ApplicationTag associations.

---

## 3. Authentication Flow

### Technology

- **Signed JWT session tokens** — stateless, stored in an HTTP-only cookie named `orbit-session`
- **bcryptjs** — password hashing with a cost factor of 12 salt rounds
- **Zod** — input validation on all auth actions

### Registration Flow

```
Client                Server Action              Database
  │                        │                        │
  │── POST formData ──────►│                        │
  │                        │── Zod validate ────────│
  │                        │── check email unique ──►│
  │                        │── hash password ───────│
  │                        │── create user ─────────►│
  │                        │── send verification email
  │◄── ok: { email } ──────│                        │
```

Email verification is required before login is permitted. On registration, a UUID token with a 24-hour expiry is stored on the user record and emailed to the user.

### Login Flow

```
Client                Server Action              Database
  │                        │                        │
  │── POST formData ──────►│                        │
  │                        │── Zod validate ────────│
  │                        │── find user by email ──►│
  │                        │── bcrypt.compare ──────│
  │                        │── check emailVerified ─│
  │                        │── sign JWT token ──────│
  │                        │── set HTTP-only cookie ─│
  │◄── redirect /dashboard─│                        │
```

### Session Verification

Every protected page and server action calls `getSession()`, which reads the `orbit-session` cookie and verifies the JWT signature. If the token is absent, expired, or invalid, the function returns `null` and the caller redirects to `/login` or throws an Unauthorised error.

### Cookie Configuration

| Property | Value |
|----------|-------|
| Name | `orbit-session` |
| httpOnly | `true` |
| secure | `true` in production |
| sameSite | `lax` |
| path | `/` |
| maxAge | 7 days (604,800 seconds) |

### Password Reset Flow

1. User submits their email address.
2. A UUID reset token with a 1-hour expiry is stored on the user record.
3. A password reset email is sent with a link containing the token.
4. User submits a new password; the token is validated and cleared.
5. The user is automatically logged in after a successful reset.

---

## 4. Data Flow Patterns

### Server Component → Client Component

Most pages follow this pattern:
1. The server component calls a server action to fetch data.
2. Data is serialised via `JSON.parse(JSON.stringify(...))` to strip Prisma metadata and convert Date objects to strings.
3. The serialised data is passed as props to client components for interactivity.

### Client Component → Server Action (Mutations)

1. The user interacts with a form or button.
2. The client component calls a server action with `FormData` or typed arguments.
3. The server action validates input, checks ownership, mutates the database, and calls `revalidatePath()`.
4. The client calls `router.refresh()` to receive fresh server-rendered data.

### Session Context

The dashboard layout reads the session on the server and passes user data to a `SessionProvider` client component. Any nested client component can access `{ userId, name, email }` via the `useSession()` hook without additional data fetching.

---

## 5. Route Architecture

| Route | Rendering | Auth | Description |
|-------|-----------|------|-------------|
| `/` | Server | Public | Landing page |
| `/login` | Client | Public | Login form |
| `/register` | Client | Public | Registration form |
| `/forgot-password` | Client | Public | Password reset request |
| `/reset-password` | Client | Public | Password reset form |
| `/verify-email` | Server | Public | Email verification handler |
| `/dashboard` | Server | Protected | Main dashboard: analytics, Kanban, follow-ups |
| `/dashboard/applications` | Server | Protected | Application list with search and filters |
| `/dashboard/applications/[id]` | Server | Protected | Application detail page |
| `/dashboard/calendar` | Server | Protected | Calendar view |
| `/dashboard/companies` | Server | Protected | Company statistics |
| `/dashboard/tags` | Server | Protected | Tag management |
| `/dashboard/profile` | Server | Protected | User profile and account settings |
| `/api/notifications/stream` | API Route | Session | SSE stream for real-time notifications |
| `/api/cron/reminders` | API Route | CRON_SECRET | Scheduled cron — creates notifications and sends emails |

Route protection is enforced in the dashboard layout: `getSession()` is called on every request, and unauthenticated users are redirected to `/login` before any page content is rendered.

---

## 6. Security Design

### Authentication Security

| Measure | Rationale |
|---------|-----------|
| bcrypt with 12 rounds | Computationally expensive; resistant to brute-force and rainbow table attacks |
| HTTP-only cookie | Session token is inaccessible to JavaScript; prevents XSS-based token theft |
| Generic login error message | Returns "Invalid email or password" for both wrong password and unknown email; prevents user enumeration |
| SameSite=Lax | Prevents CSRF attacks on state-changing requests from cross-site navigations |
| Secure flag in production | Cookie is only transmitted over HTTPS |
| 7-day expiry | Balances session convenience with security; expired tokens are automatically rejected |

### Authorisation

Every server action that accesses or mutates a resource verifies ownership before proceeding:

```typescript
const existing = await prisma.application.findFirst({
  where: { id, userId: session.userId },
});
if (!existing) return { error: "Application not found" };
```

This pattern ensures no user can read or modify another user's data, even if they know the resource ID.

### Input Validation

All inputs are validated with Zod schemas on the server before any database operation. Client-side validation provides UX feedback but is not relied upon for security. Field-level constraints include maximum lengths (notes: 5,000 characters; name: 100 characters; tag name: 50 characters) and format checks (valid URL, valid hex colour, valid email).

### Database Security

Prisma uses parameterised queries exclusively, eliminating SQL injection risk. Cascade deletes enforce referential integrity. Unique constraints at the database level prevent duplicate records even under concurrent requests.

---

## 7. Performance Considerations

### Database Indexes

Composite indexes on `(userId, status)` and `(userId, archived)` support the most common filtered queries. The `(userId)` index supports all per-user data fetches. The `(applicationId)` indexes on Activity and Interview support detail page loads. The unique index on `(applicationId, tagId)` prevents duplicate tag assignments at the database level.

### Rendering Strategy

Server Components are used for all data-heavy pages, meaning no JavaScript is shipped to the client for read-only content. Client Components are used only where interactivity is required: forms, drag-and-drop, charts, and the notification bell. This minimises the client-side JavaScript bundle.

### Optimistic Updates

The Kanban board updates local state immediately on drag-and-drop, before the server action completes. This eliminates perceived latency for the most frequent user interaction. The server action runs in the background and `router.refresh()` reconciles the UI with the confirmed server state.

### Analytics Computation

Application statistics (total, status counts, interview rate, offer rate) are computed in-memory from a single database query returning only `status` and `createdAt` fields. For typical user data volumes (fewer than 1,000 applications), this is faster than complex SQL aggregation and avoids additional query round-trips.

---

## 8. Component Architecture

### Component Categories

| Category | Rendering | Examples |
|----------|-----------|---------|
| Layout | Server | `Sidebar`, `MobileNav` |
| Pages | Server | All `page.tsx` files |
| Data Display | Client | `AnalyticsCharts`, `FollowUps`, `ActivityTimeline` |
| Forms | Client | `ApplicationForm`, `ProfileForm`, `InterviewTracker` |
| Interactive | Client | `KanbanBoard`, `KanbanColumn`, `KanbanCard` |
| Notification | Client | `NotificationBell` (SSE-powered) |
| Utility | Client | `DatePicker`, `StatusBadge`, `ExportButton` |

### State Management

No global state library is used. State is managed at three levels:

- **Server-driven data** — pages fetch fresh data on each navigation via Server Components.
- **React Context** — session data (`userId`, `name`, `email`) is shared across the dashboard via `SessionProvider`.
- **Local component state** — forms, modals, and optimistic updates use `useState`.
- **URL state** — search, filter, and sort parameters are stored in URL query strings, making views bookmarkable and server-renderable.

---

## 9. Notification and Email System

### Overview

Reminders are delivered through two channels that share a single `Notification` database table as the source of truth:

1. **In-app bell** — real-time delivery via SSE; reads unread `Notification` rows every 30 seconds.
2. **Email** — sent by the cron job via Nodemailer SMTP at the time the notification is created.

### Cron Job Flow

```
Scheduled Cron (daily 8am UTC)
  └── GET /api/cron/reminders
        │  Authorization: Bearer CRON_SECRET
        │
        ├── query interviews WHERE scheduledAt = tomorrow OR day+2, outcome = PENDING
        ├── query applications WHERE followUpDate = tomorrow OR day+2
        │
        ├── for each match:
        │     ├── check deduplicate key → skip if notification already exists
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
        │  persistent connection, auto-reconnects on drop
        │
        ├── on connect: query unread Notification rows → push to client
        ├── every 30s: re-query → push updated data
        └── on client disconnect: clear interval, close stream
```

### Deduplication

Each notification record uses its `body` field as a deduplicate key. Before creating a notification, the cron job checks whether a record with that key already exists for the user. If it does, the record is skipped. This makes the cron job idempotent — safe to run multiple times per day without creating duplicate notifications or sending duplicate emails.

| Event | Deduplicate Key |
|-------|----------------|
| Interview, 1-day reminder | `interview-<interviewId>-1d` |
| Interview, 2-day reminder | `interview-<interviewId>-2d` |
| Follow-up, 1-day reminder | `followup-<applicationId>-1d` |
| Follow-up, 2-day reminder | `followup-<applicationId>-2d` |

### Email Templates

Four email types are implemented using a shared HTML base template:

| Email | Trigger |
|-------|---------|
| Email Verification | On registration |
| Login Blocked | On login attempt with unverified email |
| Password Reset | On forgot-password request |
| Interview/Follow-up Reminder | By cron job |

All emails are sent asynchronously (`.catch()` on the promise) so that email delivery failures do not block the primary operation.

---

## 10. Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   CDN / Edge    │     │   Application   │     │  Cron Scheduler  │
│  (Static Assets)│     │   (Next.js)     │◄────│  (HTTP trigger)  │
└────────┬────────┘     └────────┬────────┘     └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐     ┌──────────────┐
              │  PostgreSQL  │     │  SMTP Server │
              │   Database   │     │  (email out) │
              └─────────────┘     └──────────────┘
```

The application is deployed on Vercel with a managed PostgreSQL database. Static assets are served from Vercel's CDN. The cron job is triggered daily by an external HTTP scheduler (cron-job.org or Vercel Cron) with a `Bearer` token for authentication. Email is delivered via SMTP using Gmail App Passwords.
