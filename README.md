# Orbit

A job application tracker that helps you manage your entire job search — from wishlist to offer.

🔗 **Live:** [startorbit.vercel.app](https://startorbit.vercel.app/)

## Features

- **Pipeline Tracking** — Track applications through 8 stages (Wishlist → Applied → Screening → Interview → Offer → Rejected → Withdrawn → Archived)
- **Kanban Board** — Drag-and-drop cards between columns to update status
- **Interview Management** — Track multiple rounds with type, schedule, notes, and outcomes
- **Analytics Dashboard** — Charts, conversion rates, and weekly metrics
- **Calendar View** — See all interviews and follow-ups on an interactive calendar
- **Smart Notifications** — Real-time bell alerts in the dashboard via SSE, plus email reminders 2 days and 1 day before every interview, follow-up, and deadline
- **Follow-up Reminders** — Overdue detection with dashboard alerts
- **Tags** — Custom color-coded labels for organizing applications
- **Activity Trail** — Every change logged automatically
- **CSV Export** — Download all applications as a spreadsheet
- **Search & Filters** — Full-text search, status/tag filters, multiple sort options

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| Frontend | React 19 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Styling | Tailwind CSS 4 |
| Auth | HTTP-only cookies, bcryptjs |
| Validation | Zod |
| Charts | Recharts |
| Drag & Drop | DnD Kit |
| Email | Nodemailer (SMTP) |
| Realtime | Server-Sent Events (SSE) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Session signing secret (any strong random string) |
| `CRON_SECRET` | Secret to authenticate cron job requests |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used in email links) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port |
| `SMTP_SECURE` | `true` for SSL, `false` for STARTTLS |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password / app password |
| `SMTP_FROM` | From address shown in emails |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client + production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── (auth)/            # Login & Register pages
│   ├── api/
│   │   ├── notifications/stream/  # SSE endpoint
│   │   └── cron/reminders/        # Cron job endpoint
│   ├── dashboard/         # Protected dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
├── generated/prisma/      # Generated Prisma client
└── lib/
    ├── actions/           # Server actions
    ├── auth.ts            # Session management
    ├── email.ts           # Nodemailer email utility
    ├── prisma.ts          # DB client
    └── validations.ts     # Zod schemas
```

## Documentation

Full documentation is in the [`docs/`](./docs/) folder:

- [**Overview & Architecture**](./docs/README.md)
- [**System Design**](./docs/system-design.md)
- **Feature docs** — Each feature has its own folder in `docs/features/` with requirements, system-design, api, and client docs.

## Deployment

Requires a Node.js runtime and PostgreSQL database. Works with Vercel, Railway, Fly.io, or any platform supporting Next.js.

```bash
npm run build
npm start
```
