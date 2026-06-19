# Analytics & Reporting — Backend System Design

## Stats Calculation

### `getApplicationStats()`

Fetches all non-archived applications for the user (only `status` and `createdAt` fields for efficiency).

```typescript
const applications = await prisma.application.findMany({
  where: { userId, archived: false },
  select: { status: true, createdAt: true },
});
```

Computes:
- `total` — array length
- `statusCounts` — loops through and counts each status
- `interviewRate` — `(INTERVIEW + OFFER) / total * 100`
- `offerRate` — `OFFER / total * 100`
- `thisWeek` — filter where `createdAt >= now - 7 days`

All computation happens in-memory (no complex SQL aggregation). This is fine for per-user data (typically hundreds of records, not millions).

---

### `getCompanyStats()`

Fetches all applications (including archived) with `company` and `status`.

Groups by company name:
```typescript
const companyMap: Record<string, { total, interviews, offers }> = {};
for (const app of applications) {
  companyMap[app.company].total++;
  if (app.status === "INTERVIEW") companyMap[app.company].interviews++;
  if (app.status === "OFFER") companyMap[app.company].offers++;
}
```

Returns sorted by total descending.

---

### `exportApplicationsCsv()`

Fetches ALL applications (including archived) with tags.

```typescript
const applications = await prisma.application.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
  include: { tags: { include: { tag: true } } },
});
```

Generates CSV:
- Headers: Company, Role, Status, Applied Date, Follow-up Date, Job URL, Tags, Notes, Created
- Tags joined with `;`
- Commas in notes replaced with `;`
- All values wrapped in quotes for safety
- Returns the CSV as a plain string (client handles download)

---

## Performance Notes

- Stats are computed per-request (no caching layer).
- For typical users (< 1000 applications), this is fast enough.
- Database indexes on `userId` ensure quick filtering.
- Charts render client-side from pre-computed data (no additional fetches).
