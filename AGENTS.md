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
- After schema changes: `npx prisma generate`. For the migration itself see the drift note below — **`migrate dev` is not safe here**.
- Models: `User`, `Application`, `Activity`, `Tag`, `ApplicationTag`, `PipelineStageType`, `Interview`, `Notification`.
- Not every FK cascades. `Application.stageId` is **Restrict**, `Interview.stageTypeId` is **SetNull** — both deliberate, see Pipeline below.
- The migration history is **divergent from the DB** (two names for the same email-verification migration), so `migrate dev` offers a destructive reset. Hand-write the SQL, apply with `prisma db execute`, then `prisma migrate resolve --applied <name>`.

## Key Patterns

### Server Actions
Every action in `src/lib/actions/` (`applications`, `auth`, `calendar`, `interviews`, `notifications`, `pipeline`, `profile`, `tags`):

1. `await requireUser()` — a **per-module local helper**, not a shared import. Copy it if the module lacks one.
2. Validate with a Zod schema from `src/lib/validations.ts`.
3. **Check ownership**: `findFirst({ where: { id, userId } })`. Never trust a client-supplied id — this includes `stageId`, which now arrives from the client on every board drag and form submit.
4. Mutate.
5. `revalidatePath()`.

Return shapes are inconsistent by design-drift, so **match the file you're editing**: `auth.ts` uses the typed helpers in `src/lib/response.ts` (`ok`/`fieldError`/`serverError`); every other module returns ad-hoc `{ error }` / `{ success: true }`. Don't migrate a file as a drive-by.

### Email
`src/lib/email.ts` (Nodemailer/SMTP). **Never float the send promise** — Vercel freezes the function instance when the response returns and the SMTP handshake dies mid-flight, intermittently and silently. Wrap sends in `after()` from `next/server` (`src/lib/actions/auth.ts:76`). Full writeup: `docs/issue-faced.md` #6.

### Pipeline stages
An application's stage is a **row the user owns** (`PipelineStageType`), not an enum value.

- `Application.stageId` → `PipelineStageType`. `ApplicationStatus` is **legacy**: still in the schema, still holds values on pre-rework rows, but **never written**. Same for `Interview.type` / `InterviewType`.
- Read a stage for display through `resolveStage()` (`src/lib/stage-display.ts`) or `resolveStageLabel()` (`src/lib/stage-label.ts`). Both fall back to the legacy column. Don't read `.status` or `.type` directly.
- **Any query feeding a `StatusBadge` or the board must `include` the `stage` relation.** Nothing in the type system catches a missing include — the badge silently renders "Unassigned".
- Never hard-code a status name. Aggregations key off `StageCategory` (`OPEN` / `INTERVIEWING` / `SUCCESS` / `CLOSED`): interview rate is `INTERVIEWING + SUCCESS`, offer rate is `SUCCESS`, follow-ups exclude `CLOSED`.
- Defaults are seeded **lazily** on first read of `getStageTypes()`, not at registration — existing users predate the feature. `createMany` + `skipDuplicates` against `@@unique([userId, name])` makes it concurrency-safe.
- Deleting a stage that still holds applications is **refused** (the FK is `Restrict`). Deleting one used by interview rounds snapshots its name into `Interview.customType` first.

### Outcomes and follow-ups
An outcome is a **flag on the application**, not a stage. A stage is where you sit; `offered` and `closed` are what happened.

- `Application.offered` / `closed` leave `stageId`, notes, tags and rounds untouched, so a card still shows the stage the offer (or the rejection) came out of. They are orthogonal: an unanswered offer is not closed.
- **Offer rate and company stats read `offered`, never `StageCategory.SUCCESS`.** `Offer` and `Rejected` are no longer seeded or in `SYSTEM_STAGE_NAMES`, so a user can delete them — anything keying off SUCCESS silently reports zero once they do.
- `INTERVIEW_OUTCOMES` describes **one round**, not the application. `REJECTED`/`WITHDRAWN` were removed as duplicates of `FAILED`/`CANCELLED`; `outcome` is a plain `String?`, so unrecognised values still render through `outcomeDisplay`.
- A follow-up is a `FollowUp` row with a title, details and `dueAt`. Max **2 open** per application, enforced in `createFollowUp` *and* in `setFollowUpDone` — without the second check, "complete two, add two, reopen" walks straight past the cap.
- **`Application.followUpDate` is a derived mirror** of the soonest open `FollowUp`, rewritten by `syncMirror()` (`src/lib/actions/follow-ups.ts:23`) after every follow-up write. It exists only so the list sort, board and dashboard can read one date. Never write it from anywhere else — the row it mirrors is what the reminder cron actually queries, so a direct write desyncs the two and the UI starts showing a date nothing will ever chase. This is why the application form no longer has a follow-up field.
- Reminders are asymmetric on purpose: interviews fire **2 days and 1 day before** (an appointment you prepare for), follow-ups fire **on the due date** (a task, nothing to prepare). Dedupe keys are per-interview and per-follow-up, so several due the same day each send once.

### Component Conventions
- `"use client"` at top of client components.
- `useSession()` from `src/components/session-provider.tsx` for client-side user access.
- Serialize dates with `JSON.parse(JSON.stringify(data))` before passing server → client.
- For DnD/charts with hydration issues, gate on **`useSyncExternalStore`** (see `src/components/kanban-board.tsx:47`), not `useEffect` + `setState` — the ESLint config errors on `react-hooks/set-state-in-effect`.

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
- Skip ownership checks in server actions (a `stageId` is a client-supplied id too).
- Call an async side effect without `await` or `after()` in a server action.
- Use `Date.now()` or locale-dependent formatting in SSR without a hydration guard.
- Hard-code a stage or status name (`"INTERVIEW"`, `"OFFER"`) in a query or a UI list — read the user's stages, branch on `StageCategory`.
- Write `Application.status` or `Interview.type`. They are legacy read-only columns.
- Run `prisma migrate dev` — the history is divergent and it will offer to reset the database.
- Edit files in `src/generated/` — auto-generated.
