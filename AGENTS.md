# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Orbit — Agent Guidelines

Job application tracker: Next.js 16 (App Router), React 19, TypeScript, Prisma 7, PostgreSQL, Tailwind CSS 4. Deployed on Vercel.

## Architecture Rules

- **No API routes for mutations.** Use Server Actions (`"use server"` in `src/lib/actions/`).
- The three API routes that exist are not CRUD and should stay that way:
  - `/api/auth/verify-email` — GET link target from verification emails
  - `/api/cron/reminders` — GET, Vercel Cron, guarded by `Bearer ${CRON_SECRET}`
  - `/api/notifications/stream` — SSE for the notification bell
- **Server Components** fetch data. **Client Components** handle interactivity.
- Middleware lives in `src/proxy.ts` (Next.js 16 convention — not `middleware.ts`).

## Authentication

- Single JWT in HTTP-only cookie `orbit-session`, **7-day expiry**. Signed/verified in `src/lib/auth.ts`.
- `src/proxy.ts` verifies the JWT on `/dashboard/*`, redirects to `/login` on failure, and bounces logged-in users away from `/login` and `/register`.
- There is **no refresh-token rotation** — no `orbit-refresh` cookie, no `RefreshToken` table, no `/api/auth/refresh`. Don't write code that assumes any of them exist.
- Logout clears the cookie. There is currently no server-side force-logout.
- Never store tokens in localStorage or expose them to client JS.

## Database

- Prisma 7 with `@prisma/adapter-pg`. Schema: `prisma/schema.prisma`.
- Client is generated to `src/generated/prisma/` — import from `@/generated/prisma/client`, **never** `@prisma/client`.
- Singleton: `src/lib/prisma.ts`. Don't construct `PrismaClient` elsewhere.
- After schema changes: `npx prisma migrate dev --name <name>` then `npx prisma generate`.
- Models: `User`, `Application`, `Activity`, `Tag`, `ApplicationTag`, `Interview`, `Notification`.

## Key Patterns

### Server Actions
Every action in `src/lib/actions/` (`applications`, `auth`, `calendar`, `interviews`, `notifications`, `profile`, `tags`):

1. `await requireUser()` — a **per-module local helper**, not a shared import. Copy it if the module lacks one.
2. Validate with a Zod schema from `src/lib/validations.ts`.
3. **Check ownership**: `findFirst({ where: { id, userId } })`. Never trust a client-supplied id.
4. Mutate.
5. `revalidatePath()`.

Return shapes are inconsistent by design-drift, so **match the file you're editing**: `auth.ts` uses the typed helpers in `src/lib/response.ts` (`ok`/`fieldError`/`serverError`); every other module returns ad-hoc `{ error }` / `{ success: true }`. Don't migrate a file as a drive-by.

### Email
`src/lib/email.ts` (Nodemailer/SMTP). **Never float the send promise** — Vercel freezes the function instance when the response returns and the SMTP handshake dies mid-flight, intermittently and silently. Wrap sends in `after()` from `next/server` (`src/lib/actions/auth.ts:76`). Full writeup: `docs/issue-faced.md` #6.

### Component Conventions
- `"use client"` at top of client components.
- `useSession()` from `src/components/session-provider.tsx` for client-side user access.
- Serialize dates with `JSON.parse(JSON.stringify(data))` before passing server → client.
- For DnD/charts with hydration issues, gate on **`useSyncExternalStore`** (see `src/components/kanban-board.tsx:48`), not `useEffect` + `setState` — the ESLint config errors on `react-hooks/set-state-in-effect`.

### Styling
Tailwind CSS 4, CSS variables in `src/app/globals.css`, dark mode via `prefers-color-scheme`. No component library — all custom.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint — **not clean on main**, see `/check` for the baseline |
| `npx tsc --noEmit` | Typecheck — must be silent |

There is **no test suite**. `/check` (typecheck + lint vs. baseline) is the pre-commit gate.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (`src/proxy.ts` throws if unset) |
| `NEXT_PUBLIC_APP_URL` | Base URL for links in emails |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Nodemailer transport |
| `CRON_SECRET` | Bearer token for `/api/cron/reminders` |

Note: `.env.example` still lists `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` from an abandoned auth library and omits `JWT_SECRET` — it is stale, trust this table.

## Do NOT

- Use localStorage or sessionStorage for auth.
- Create REST API routes for CRUD (use Server Actions).
- Import from `@prisma/client` (use `@/generated/prisma/client`).
- Skip ownership checks in server actions.
- Call an async side effect without `await` or `after()` in a server action.
- Use `Date.now()` or locale-dependent formatting in SSR without a hydration guard.
- Edit files in `src/generated/` — auto-generated.
