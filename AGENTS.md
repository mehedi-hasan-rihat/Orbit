<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Orbit — Agent Guidelines

## Project Overview

Orbit is a job application tracker built with Next.js 16 (App Router), React 19, TypeScript, Prisma 7, PostgreSQL, and Tailwind CSS 4. It uses Server Actions exclusively — no REST/GraphQL endpoints.

## Architecture Rules

- **No API routes** for data mutations. Use Server Actions (`"use server"` functions in `src/lib/actions/`).
- The only API route is `/api/auth/refresh` for token rotation.
- **Server Components** fetch data. **Client Components** handle interactivity.
- Middleware lives in `src/proxy.ts` (Next.js 16 convention).

## Authentication

- Short-lived access tokens (15min JWT) in HTTP-only cookie `orbit-session`.
- Long-lived refresh tokens (7 days) stored in DB + HTTP-only cookie `orbit-refresh`.
- Middleware validates access token; if expired, redirects to `/api/auth/refresh` for transparent rotation.
- Force logout = delete refresh tokens from `RefreshToken` table.
- Never store tokens in localStorage or expose them to client JS.

## Database

- ORM: Prisma 7 with `@prisma/adapter-pg` (PostgreSQL driver adapter).
- Schema: `prisma/schema.prisma`
- Generated client: `src/generated/prisma/`
- Singleton: `src/lib/prisma.ts`
- After schema changes: `npx prisma migrate dev --name <name>` then `npx prisma generate`.

## Key Patterns

### Server Actions
Every action in `src/lib/actions/`:
1. Calls `requireUser()` to verify session.
2. Validates input with Zod (`src/lib/validations.ts`).
3. Checks resource ownership (`findFirst({ where: { id, userId } })`).
4. Mutates DB.
5. Calls `revalidatePath()` to invalidate cache.

### Component Conventions
- Client components: `"use client"` at top.
- Use `useSession()` hook (from `src/components/session-provider.tsx`) for client-side user access.
- Serialize dates with `JSON.parse(JSON.stringify(data))` before passing from server to client.
- For DnD/charts that cause hydration issues, use `mounted` state pattern (render static on server, interactive after hydration).

### Styling
- Tailwind CSS 4 with CSS variables for theming (see `src/app/globals.css`).
- Dark mode via `prefers-color-scheme`.
- No component library — all custom components.

## File Structure

```
src/
├── app/                    # Routes (App Router)
│   ├── (auth)/             # Public auth pages
│   ├── api/auth/refresh/   # Token refresh endpoint
│   └── dashboard/          # Protected pages
├── components/             # React components
├── generated/prisma/       # Prisma generated client (don't edit)
└── lib/
    ├── actions/            # Server actions (auth, applications, interviews, tags, profile, calendar, admin)
    ├── auth.ts             # JWT + refresh token management
    ├── prisma.ts           # DB client singleton
    └── validations.ts      # Zod schemas
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint |
| `npx prisma migrate dev --name <name>` | Create migration |
| `npx prisma generate` | Regenerate client after schema change |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | JWT signing secret |

## Do NOT

- Use localStorage or sessionStorage for auth.
- Create REST API routes for CRUD (use Server Actions).
- Import from `@prisma/client` directly (use `@/generated/prisma/client`).
- Skip ownership checks in server actions.
- Use `Date.now()` or locale-dependent formatting in SSR without a `mounted` guard.
- Edit files in `src/generated/` — they are auto-generated.
