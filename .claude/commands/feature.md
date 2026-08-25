---
description: Build a new feature end-to-end through this project's vertical slice
argument-hint: <what to build> — e.g. archive applications
---

Feature: **$ARGUMENTS**

Plan the slice before writing code, and tell me which of these layers it touches. Skip the ones it doesn't.

1. **Schema** — `prisma/schema.prisma`, then `/migrate <name>`.
2. **Validation** — Zod schema in `src/lib/validations.ts`. Never inline.
3. **Server action** — `src/lib/actions/<module>.ts`, following `/action`. Ownership check is mandatory.
4. **Page** — `src/app/dashboard/<route>/page.tsx` as a **Server Component** that fetches via `prisma` and passes data down. Serialize with `JSON.parse(JSON.stringify(data))` before handing anything with a `Date` to a client component.
5. **Client component** — `src/components/<name>.tsx` with `"use client"` for interactivity only.
6. **Navigation** — if you added a dashboard route, add it to **both** nav arrays. They are duplicated and drift silently:
   - `src/components/sidebar.tsx:18`
   - `src/components/mobile-nav.tsx:14`

Also consider, and say if you decided against:

- **Activity log** — mutations to an `Application` write an `Activity` row (`ActivityType.CREATED`, `STATUS_CHANGED`, `NOTE_ADDED`, `FOLLOW_UP_SET`). See `src/lib/actions/applications.ts:49`. New enum values need a migration.
- **Notification** — if the user should be told, write a `Notification`; the bell reads it over SSE from `/api/notifications/stream`.
- **Email** — must go through `after()` from `next/server`. Never float the promise.

No component library — build custom with Tailwind 4 and the CSS variables in `src/app/globals.css`. Match neighbouring components rather than introducing a new visual idiom.

Finish with `/check`.
