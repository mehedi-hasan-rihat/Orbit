# Orbit — Caching

## Overview

Orbit uses Next.js 16 App Router with cookie-based auth. Every dashboard page is
**dynamic** (reads a cookie on every request) which means without explicit caching
configuration, the browser re-fetches from the server on every navigation and shows
`loading.tsx` every time.

Three layers of caching are in play:

| Layer | Where it lives | What it caches | Invalidated by |
|---|---|---|---|
| React `cache()` | Server, per-request | Deduped function calls within one render | Automatic (new request) |
| Next.js Router Cache | Browser memory | RSC payloads of visited route segments | `revalidatePath`, time expiry, hard refresh |
| Next.js Data Cache | Server file system | `fetch()` results | `revalidatePath`, `revalidateTag`, TTL |

Orbit does not use `fetch()` for data — it calls Prisma directly through Server Actions —
so the Data Cache is not relevant here. The two that matter are React `cache()` and the
Router Cache.

---

## Layer 1 — React `cache()` on `getSession`

**File**: `src/lib/auth.ts`

```ts
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
});
```

**Why**: The dashboard layout (`layout.tsx`) and every page both call `getSession()`.
Without `cache()`, that is two `cookies()` reads per render on every request. React's
`cache()` deduplicates the call — the first caller reads the cookie, every subsequent
caller within the same render pass gets the cached result for free.

**Scope**: Per-request only. The memoization is reset on the next request. This is not
persistent caching — it is deduplication within a single server render.

---

## Layer 2 — Router Cache (`staleTimes`)

**File**: `next.config.ts`

```ts
experimental: {
  staleTimes: {
    dynamic: 30,  // seconds
    static: 300,
  },
},
```

**Why**: Dynamic pages (anything that reads cookies, headers, or searchParams) have a
default `staleTimes.dynamic` of **0 seconds** since Next.js 15. This means the client
Router Cache never holds them — every `<Link>` click or `router.push()` causes a full
server round-trip and shows `loading.tsx`.

Setting `dynamic: 30` tells the Router Cache to hold the RSC payload of each visited
route segment for 30 seconds. Navigating between dashboard pages within that window is
instant with no loading flash.

**Safety**: `revalidatePath("/dashboard", "layout")` (called after every mutation) still
busts the Router Cache immediately. There is no risk of the user seeing stale data after
a create/update/delete — the 30-second window only applies when no mutation has occurred.

---

## Layer 3 — `revalidatePath` after mutations

**File**: all `src/lib/actions/*.ts` mutation functions

```ts
revalidatePath("/dashboard", "layout");
```

**Why the second argument matters**:

- `revalidatePath("/dashboard")` — default `"page"` type. Invalidates **only** the
  `/dashboard` page segment. Child routes (`/dashboard/applications`,
  `/dashboard/applications/[id]`, `/dashboard/pipeline`, etc.) are **not** invalidated.
- `revalidatePath("/dashboard", "layout")` — invalidates the layout segment and
  **all nested route segments beneath it**. One call covers every dashboard page.

Using the wrong form was the original cause of broken caching: mutations appeared to
succeed but the list page showed stale data until a manual refresh, because the
applications page cache was never actually cleared.

**Rule**: Every server action mutation must call `revalidatePath("/dashboard", "layout")`
as its last step before returning. Never use multiple `revalidatePath` calls targeting
child paths — the layout call covers them all.

---

## Why `router.refresh()` was removed from client components

Client components (`applications-list.tsx`, `quick-actions.tsx`, `application-form.tsx`,
`application-actions.tsx`) previously called `router.refresh()` after every mutation.

`router.refresh()` forces a full server re-render of the current route, bypassing the
Router Cache entirely. When `revalidatePath` was broken (targeting only `/dashboard`),
`router.refresh()` was the only way to make the list update after a mutation — so it
accumulated as a workaround.

Once `revalidatePath("/dashboard", "layout")` is used correctly, `router.refresh()` is
redundant: the cache is already busted by the server action, and Next.js will serve fresh
data on the next navigation. Keeping `router.refresh()` caused the double-load — the
server action busted the cache, then the client immediately forced another full re-render
on top of that.

The only remaining `router.push()` calls are for URL-driven filter/search navigation,
which is correct — those are intentional navigations, not cache workarounds.

---

## The double-load on `/dashboard/applications`

Two bugs combined to cause the page to load twice:

**Bug 1 — `useEffect` firing on mount** (`applications-list.tsx`):
The search debounce effect ran immediately when the component mounted (even with empty
search), scheduling `applyFilters()` 500ms after first render. Fixed with a `isMounted`
ref that skips the initial effect run.

**Bug 2 — default sort written to URL** (`applications-list.tsx`):
`applyFilters` unconditionally added `sort=createdAt` to every `router.push()`. Visiting
`/dashboard/applications` caused an immediate client navigation to
`/dashboard/applications?sort=createdAt` (a different URL = new page render = second DB
query). Fixed by only writing `sort` to the URL when it differs from the default.

---

## Summary of all changes made

| File | Change |
|---|---|
| `next.config.ts` | Added `staleTimes: { dynamic: 30, static: 300 }` |
| `src/lib/auth.ts` | Wrapped `getSession` with React `cache()` |
| `src/lib/actions/applications.ts` | All 9 mutations: `revalidatePath("/dashboard", "layout")` |
| `src/lib/actions/pipeline.ts` | All 5 mutations: collapsed 3× calls to 1× layout revalidation |
| `src/lib/actions/tags.ts` | Both mutations: `revalidatePath("/dashboard", "layout")` |
| `src/lib/actions/reminders.ts` | All 4 mutations: collapsed 3× calls to 1× layout revalidation |
| `src/lib/actions/profile.ts` | `revalidatePath("/dashboard", "layout")` |
| `src/components/applications-list.tsx` | Removed `router.refresh()` from delete handler; added `isMounted` guard to search effect; skip default sort from URL |
| `src/components/quick-actions.tsx` | Removed `router.refresh()` and unused `useRouter`/`Link` imports |
| `src/components/application-form.tsx` | Removed `router.refresh()` and unused `useRouter` import |
| `src/components/application-actions.tsx` | Removed `router.refresh()` from `run()` helper and delete handler |
