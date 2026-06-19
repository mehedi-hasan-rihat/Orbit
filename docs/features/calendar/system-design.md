# Calendar — Backend System Design

## Event Aggregation

The calendar backend is a single server action that combines two data sources into one unified event list.

### `getCalendarEvents()`

**Source 1: Interviews**
```typescript
prisma.interview.findMany({
  where: {
    scheduledAt: { not: null },
    application: { userId, archived: false },
  },
  include: { application: { select: { id, company, role, status } } },
  orderBy: { scheduledAt: "asc" },
})
```

**Source 2: Follow-ups**
```typescript
prisma.application.findMany({
  where: {
    userId, archived: false,
    followUpDate: { not: null },
  },
  select: { id, company, role, status, followUpDate },
  orderBy: { followUpDate: "asc" },
})
```

**Merge:**
Both results are mapped into a unified `CalendarEvent` shape and sorted by date:

```typescript
interface CalendarEvent {
  id: string;
  applicationId: string;
  type: "INTERVIEW" | "FOLLOWUP";
  title: string;
  company: string;
  role: string;
  date: Date;
  status: ApplicationStatus;
  outcome: string | null;
}
```

Interview titles: `"Google — Round 2 TECHNICAL"`
Follow-up titles: `"Follow-up: Google"`

---

## Filtering

Only non-archived applications' events are included. This is enforced at the query level.

---

## Performance

- Two queries run in sequence (both indexed).
- Client-side component handles day-level filtering from the full array.
- No pagination needed (events are bounded by user activity).
