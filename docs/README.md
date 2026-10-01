# Orbit — Job Application Tracker

## Project Overview

Orbit is a full-stack web application that helps job seekers manage their entire job search lifecycle. It provides a unified platform for tracking applications through a user-defined pipeline, scheduling and reviewing interview stages, setting follow-up reminders, and analysing search performance through visual dashboards.

Live at [startorbit.vercel.app](https://startorbit.vercel.app).

---

## Problem Statement

Job seekers managing multiple simultaneous applications face a fragmented experience: applications are scattered across email threads, spreadsheets, and memory. There is no proactive reminder system, no visual pipeline, and no way to measure progress. Orbit solves this with a purpose-built tracker with automation, real-time notifications, and analytics in a single cohesive application.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Frontend | React 19 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Styling | Tailwind CSS 4 |
| Authentication | HTTP-only JWT cookies, bcryptjs |
| Validation | Zod 4 |
| Charts | Recharts 3 |
| Drag & Drop | DnD Kit |
| Email | Nodemailer (SMTP) |
| Real-time | Server-Sent Events (SSE) |

---

## Architecture Summary

Orbit is a monolithic full-stack Next.js app. All data mutations go through **Server Actions** — no separate REST or GraphQL API. API Routes exist only for the SSE notification stream and the cron endpoint.

- **React Server Components** fetch data and render pages on the server.
- **Client Components** handle interactivity: forms, drag-and-drop, charts, real-time updates.
- **Server Actions** validate input (Zod), enforce ownership-based authorisation, mutate via Prisma, and revalidate cached paths.

See [architecture.md](./architecture.md) for the full breakdown.

---

## Data Model Summary

| Model | Purpose |
|-------|---------|
| `User` | Account credentials, email verification, password reset tokens |
| `Application` | Core tracked job application |
| `PipelineStageType` | User-defined pipeline stage (Kanban column) |
| `Activity` | Immutable audit log per application |
| `Note` | Free-text notes per application |
| `Reminder` | Date-based follow-up reminders per application |
| `Tag` | User-defined colour-coded label |
| `ApplicationTag` | Many-to-many junction: Application ↔ Tag |
| `Notification` | In-app and email notification records |

---

## Feature Index

| Feature | Location |
|---------|---------|
| Applications (list + detail) | `src/app/dashboard/applications/` |
| Kanban board | `src/app/dashboard/page.tsx` + `src/components/kanban-board.tsx` |
| Pipeline management | `src/app/dashboard/pipeline/` |
| Calendar | `src/app/dashboard/calendar/` |
| Analytics | `src/components/analytics-charts.tsx` |
| Reminders | `src/components/application-schedule.tsx` |
| Notes | `src/components/application-schedule.tsx` |
| Tags | `src/app/dashboard/tags/` |
| Notifications (SSE) | `src/app/api/notifications/stream/route.ts` |
| Cron reminders | `src/app/api/cron/reminders/route.ts` |
| Auth | `src/app/(auth)/` |

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [architecture.md](./architecture.md) | Full-stack architecture, request lifecycle, directory structure |
| [design-system.md](./design-system.md) | UI tokens, component patterns, layout conventions |
| [security.md](./security.md) | Auth, authorisation, input validation, environment variables |
| [prd.md](./prd.md) | Product requirements, goals, success metrics |
| [pages/dashboard/overview.md](./pages/dashboard/overview.md) | Dashboard page deep-dive |
