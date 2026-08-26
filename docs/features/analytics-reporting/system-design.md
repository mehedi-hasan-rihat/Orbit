# Analytics & Reporting — Backend System Design

## Stats Calculation

### `getApplicationStats()`

Fetches two things in parallel: the user's non-archived applications (with each
one's stage category) and the user's stage catalogue.

```typescript
const [applications, stages] = await Promise.all([
  prisma.application.findMany({
    where: { userId, archived: false },
    select: { stageId: true, createdAt: true, stage: { select: { category: true } } },
  }),
  prisma.pipelineStageType.findMany({ where: { userId }, orderBy: [{ order: "asc" }, { name: "asc" }] }),
]);
```

The catalogue query looks redundant — the applications already carry their stage —
but it is what lets an empty stage appear in the distribution at all, and in the
right position. Counting only what applications reference would silently drop every
stage the user has not used yet.

Computes:
- `total` — array length
- `stageCounts` — counts keyed by `stageId`, then mapped over the catalogue so order and colour come from the pipeline
- `interviewing` / `offers` — counts by `StageCategory.INTERVIEWING` / `SUCCESS`
- `interviewRate` — `(interviewing + offers) / total * 100`
- `offerRate` — `offers / total * 100`
- `thisWeek` — filter where `createdAt >= now - 7 days`

Categories rather than names are what make these rates survive customisation: a user
who renames "Offer" to "Got the job", or adds a "Final Round" stage, still gets
correct numbers. A name-based rule would quietly return zero.

All computation happens in-memory (no complex SQL aggregation). This is fine for per-user data (typically hundreds of records, not millions).

---

### `getCompanyStats()`

Fetches all applications (including archived) with `company` and the stage category.

Groups by company name:
```typescript
const companyMap: Record<string, { total, interviews, offers }> = {};
for (const app of applications) {
  companyMap[app.company].total++;
  if (app.stage?.category === StageCategory.INTERVIEWING) companyMap[app.company].interviews++;
  if (app.stage?.category === StageCategory.SUCCESS) companyMap[app.company].offers++;
}
```

This widened slightly: the old rule counted only applications sitting in `INTERVIEW`,
so one parked in `SCREENING` scored zero interviews for that company. Every
interviewing stage now counts.

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
