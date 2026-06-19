# Search & Filtering — Backend System Design

## Query Construction

All filtering happens in `getApplications(params)` in `src/lib/actions/applications.ts`.

### Base Query

```typescript
const where = {
  userId: session.userId,
  archived: params?.archived ?? false,
};
```

### Adding Filters

**Status:**
```typescript
if (params.status && params.status !== "ALL") {
  where.status = params.status;
}
```

**Search:**
```typescript
if (params.search) {
  where.OR = [
    { company: { contains: params.search, mode: "insensitive" } },
    { role: { contains: params.search, mode: "insensitive" } },
  ];
}
```

Uses Prisma's `contains` with `mode: "insensitive"` for case-insensitive partial matching. Maps to PostgreSQL `ILIKE %term%`.

**Tag:**
```typescript
if (params.tag) {
  where.tags = { some: { tagId: params.tag } };
}
```

Uses Prisma relation filter: finds applications that have at least one `ApplicationTag` with the given `tagId`.

### Sorting

```typescript
let orderBy = { createdAt: "desc" };  // default

if (params.sort === "company") orderBy = { company: "asc" };
if (params.sort === "appliedDate") orderBy = { appliedDate: "desc" };
if (params.sort === "updatedAt") orderBy = { updatedAt: "desc" };
if (params.sort === "followUpDate") orderBy = { followUpDate: "asc" };
```

---

## Database Indexes Supporting Filters

| Index | Supports |
|-------|----------|
| `(userId)` | Base user filter |
| `(userId, status)` | Status filter |
| `(userId, archived)` | Active/archived toggle |
| `(company)` | Company search + sort |

The `OR` search on company/role uses the company index for one branch but role relies on a table scan within the userId-filtered subset (acceptable for per-user data volumes).

---

## No Pagination

Currently returns all matching results. For typical users with < 1000 applications this is fine. If scaling becomes needed, cursor-based pagination can be added.
