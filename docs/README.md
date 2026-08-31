# Orbit — Job Application Tracker

## Project Overview

Orbit is a full-stack web application designed to help job seekers manage their entire job search lifecycle. It provides a unified platform for tracking applications through a pipeline the user defines themselves, scheduling and reviewing interview rounds, setting follow-up reminders, and analysing search performance through visual dashboards.

The application is live at [startorbit.vercel.app](https://startorbit.vercel.app).

---

## Problem Statement

Job seekers managing multiple simultaneous applications face a fragmented experience: applications are scattered across email threads, spreadsheets, and memory. There is no proactive reminder system, no visual pipeline, and no way to measure progress. Orbit solves this by providing a purpose-built tracker with automation, real-time notifications, and analytics in a single cohesive application.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Frontend | React 19.2.4 |
| Database | PostgreSQL |
| ORM | Prisma 7.8.0 |
| Styling | Tailwind CSS 4.3.1 |
| Authentication | HTTP-only JWT cookies, bcryptjs |
| Validation | Zod 4 |
| Charts | Recharts 3 |
| Drag & Drop | DnD Kit |
| Icons | Lucide React |
| Email | Nodemailer (SMTP) |
| Real-time | Server-Sent Events (SSE) |
| Landing Animations | GSAP |

---

## Architecture Summary

Orbit follows a monolithic full-stack architecture built on the Next.js App Router. All data mutations are handled through **Server Actions** — server-side functions invoked directly from React components, eliminating the need for a separate REST or GraphQL API layer.

- **React Server Components** fetch data and render pages on the server.
- **Client Components** handle interactivity: forms, drag-and-drop, charts, and real-time updates.
- **Server Actions** validate input with Zod, enforce ownership-based authorisation, mutate the database via Prisma, and revalidate cached paths.
- **API Routes** are used only for the SSE notification stream and the cron job endpoint.

```
Browser → Server Components (SSR/RSC) → Server Actions → Prisma ORM → PostgreSQL
       ← HTML + React hydration ←
```

---

## Data Model Summary

| Model | Purpose |
|-------|---------|
| User | Account credentials, email verification, password reset |
| Application | Core tracked job application entity |
| PipelineStageType | User-defined pipeline stage — board column, filter option, and interview round type |
| Activity | Immutable audit log entry per application |
| Interview | Per-round interview tracking |
| Tag | User-defined colour-coded label |
| ApplicationTag | Many-to-many junction between Application and Tag |
| Notification | In-app and email reminder records |

---

## Feature Index

| Feature | Documentation |
|---------|--------------|
| Authentication | [features/authentication/](./features/authentication/) |
| Application Managment | [features/application-tracking/](./features/application-tracking/) |
| Pipeline | [features/pipeline/](./features/pipeline/) |
| Kanban Board | [features/kanban-board/](./features/kanban-board/) |
| Interview Management | [features/interview-management/](./features/interview-management/) |
| Analytics & Reporting | [features/analytics-reporting/](./features/analytics-reporting/) |
| Calendar | [features/calendar/](./features/calendar/) |
| Follow-up Management | [features/follow-up-management/](./features/follow-up-management/) |
| Tags & Organisation | [features/tags-organization/](./features/tags-organization/) |
| Search & Filtering | [features/search-filtering/](./features/search-filtering/) |
| Activity Audit Trail | [features/activity-audit-trail/](./features/activity-audit-trail/) |
| User Profile | [features/user-profile/](./features/user-profile/) |
| Notifications & Email | [features/notifications/](./features/notifications/) |

Each feature folder contains four documents:

| Document | Contents |
|----------|----------|
| `requirements.md` | Business requirements and acceptance criteria |
| `system-design.md` | Backend architecture, data model, and processing flows |
| `api.md` | Server action signatures, inputs, outputs, and side effects |
| `client.md` | Component descriptions, props, and UI behaviour |

---

## System-Level Documentation

| Document | Description |
|----------|-------------|
| [System Design](./system-design.md) | Overall architecture, data model, authentication flow, security design, performance strategy, and deployment |
