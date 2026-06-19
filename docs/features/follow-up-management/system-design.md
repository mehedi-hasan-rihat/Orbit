# Follow-up Management — Backend System Design

## Query: `getFollowUps()`

Located in `src/lib/actions/applications.ts`.

```typescript
prisma.application.findMany({
  where: {
    userId: session.userId,
    archived: false,
    followUpDate: { not: null },
    status: { notIn: ["REJECTED", "ARCHIVED"] },
  },
  orderBy: { followUpDate: "asc" },
  include: { tags: { include: { tag: true } } },
})
```

### Filtering Logic

| Condition | Rationale |
|-----------|-----------|
| `archived: false` | Don't remind about archived apps |
| `followUpDate: not null` | Only apps with reminders |
| `status NOT IN (REJECTED, ARCHIVED)` | No point following up on dead apps |

### Sorting

Sorted by `followUpDate` ascending — soonest/most-overdue first.

---

## Overdue Detection

The backend does **not** separate overdue vs upcoming. It returns all follow-ups and the frontend splits them:

```typescript
// Frontend logic
const now = new Date();
const overdue = followUps.filter(app => new Date(app.followUpDate) < now);
const upcoming = followUps.filter(app => new Date(app.followUpDate) >= now);
```

This avoids server-side timezone issues — the client's local time determines "overdue".

---

## Activity Logging

When a follow-up date is set or changed via `updateApplication()`:

```typescript
if (data.followUpDate !== existing.followUpDate) {
  activities.push({
    type: "FOLLOW_UP_SET",
    description: `Follow-up set for ${data.followUpDate}`,
  });
}
```
