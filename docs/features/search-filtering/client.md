# Search & Filtering — Frontend Documentation

## URL-Based State

All filter state lives in URL query parameters:

```
/dashboard/applications?search=google&status=INTERVIEW&sort=updatedAt&tag=abc123&archived=true
```

This makes filters:
- Server-renderable (no client-side data fetching)
- Bookmarkable and shareable
- Browser back/forward compatible

---

## Page Flow

### Server Component (`src/app/dashboard/applications/page.tsx`)

1. Reads `searchParams` from the page props.
2. Passes params to `getApplications()`.
3. Serializes results and passes to `ApplicationsList` client component.

```tsx
export default async function ApplicationsPage({ searchParams }) {
  const params = await searchParams;
  const applications = await getApplications({
    search: params.search,
    status: params.status,
    sort: params.sort || "createdAt",
    tag: params.tag,
    archived: params.archived === "true",
  });
  // ...render
}
```

### Client Component (`src/components/applications-list.tsx`)

**Filter Bar UI:**
- Search input (controlled, updates URL on change with debounce)
- Status dropdown (All, Wishlist, Applied, Interview, Offer, Rejected)
- Sort dropdown (Newest, Recently Updated, Company, Applied Date, Follow-up)
- Active/Archived tab buttons

**URL Update Pattern:**
```typescript
function updateFilter(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  if (value) params.set(key, value);
  else params.delete(key);
  router.push(`/dashboard/applications?${params.toString()}`);
}
```

Changing a filter updates the URL → triggers server re-render → new data flows through.

---

## Files

| File | Role |
|------|------|
| `src/app/dashboard/applications/page.tsx` | Reads searchParams, calls getApplications |
| `src/components/applications-list.tsx` | Filter bar + list rendering |
