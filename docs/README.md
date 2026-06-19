# Orbit — Job Application Tracker

## Overview

Orbit is a full-stack web application that helps job seekers track their entire application lifecycle — from wishlist to offer. It provides a unified dashboard with a Kanban pipeline, analytics, calendar integration, interview tracking, tagging, and CSV export.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Frontend | React 19.2.4 |
| Database | PostgreSQL |
| ORM | Prisma 7.8.0 |
| Styling | Tailwind CSS 4.3.1 |
| Auth | JWT + HTTP-only cookies, bcryptjs |
| Validation | Zod 4 |
| Charts | Recharts 3 |
| Drag & Drop | DnD Kit |
| Icons | Lucide React |

## Architecture

Orbit is a monolithic full-stack app using Next.js App Router. There are no REST/GraphQL endpoints — all data mutations go through **Server Actions** invoked directly from React components.

- **Server Components** fetch data and render pages.
- **Client Components** handle interactivity (forms, drag-drop, charts).
- **Server Actions** validate input, check authorization, mutate the database, and revalidate cached paths.

```
Browser → Server Components (SSR) → Server Actions → Prisma → PostgreSQL
       ← HTML + React hydration ←
```

## Project Structure

```
orbit/
├── prisma/
│   ├── schema.prisma          # Data models (6 tables)
│   └── migrations/            # SQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register pages
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Theme & base styles
│   ├── components/            # React components (20 files)
│   ├── generated/prisma/      # Generated Prisma client
│   └── lib/
│       ├── actions/           # Server actions (6 modules)
│       ├── auth.ts            # JWT session management
│       ├── prisma.ts          # DB client singleton
│       └── validations.ts     # Zod schemas
├── package.json
└── tsconfig.json
```

## Data Model Summary

| Model | Purpose |
|-------|---------|
| User | Account, credentials, preferences |
| Application | Core tracked job application |
| Activity | Immutable audit log per application |
| Interview | Per-round interview tracking |
| Tag | User-defined color labels |
| ApplicationTag | Many-to-many junction (Application ↔ Tag) |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | JWT signing secret (any strong random string) | Yes |
| `NODE_ENV` | `development` or `production` | Auto |

## Quick Start

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npx prisma migrate deploy
npm run dev
```

## Feature Documentation

Each feature has its own folder with separate documents:

| Feature | Folder | Contents |
|---------|--------|----------|
| Authentication | [`features/authentication/`](./features/authentication/) | requirements, system-design, api, client |
| Application Tracking | [`features/application-tracking/`](./features/application-tracking/) | requirements, system-design, api, client |
| Kanban Board | [`features/kanban-board/`](./features/kanban-board/) | requirements, system-design, api, client |
| Interview Management | [`features/interview-management/`](./features/interview-management/) | requirements, system-design, api, client |
| Analytics & Reporting | [`features/analytics-reporting/`](./features/analytics-reporting/) | requirements, system-design, api, client |
| Calendar | [`features/calendar/`](./features/calendar/) | requirements, system-design, api, client |
| Follow-up Management | [`features/follow-up-management/`](./features/follow-up-management/) | requirements, system-design, api, client |
| Tags & Organization | [`features/tags-organization/`](./features/tags-organization/) | requirements, system-design, api, client |
| Search & Filtering | [`features/search-filtering/`](./features/search-filtering/) | requirements, system-design, api, client |
| Activity Audit Trail | [`features/activity-audit-trail/`](./features/activity-audit-trail/) | requirements, system-design, api, client |
| User Profile | [`features/user-profile/`](./features/user-profile/) | requirements, system-design, api, client |

### Per-Feature File Structure

```
docs/features/<feature-name>/
├── requirements.md     # Business requirements & acceptance criteria
├── system-design.md    # Architecture, data model, flows
├── api.md              # Server action signatures & responses
└── client.md           # Components, pages, UI behavior
```

## System-Level Documents

| Document | Description |
|----------|-------------|
| [System Design](./system-design.md) | Overall architecture, data model, auth flow, security |
| [API Reference](./api-reference.md) | All Server Actions summary table |
