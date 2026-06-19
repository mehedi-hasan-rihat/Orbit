# Calendar — API Documentation

## Server Actions (`src/lib/actions/calendar.ts`)

---

### `getCalendarEvents()`

Fetches all scheduled interviews and follow-up dates for the current user's non-archived applications.

**Input:** None (uses session).

**Returns:**
```typescript
Array<{
  id: string;              // interview.id or "followup-{app.id}"
  applicationId: string;   // parent application ID
  type: "INTERVIEW" | "FOLLOWUP";
  title: string;           // "Company — Round N TYPE" or "Follow-up: Company"
  company: string;
  role: string;
  date: Date;              // scheduledAt or followUpDate
  status: string;          // parent application's status
  outcome: string | null;  // interview outcome (null for follow-ups)
}>
```

Sorted by `date` ascending (earliest first).

**Filters:**
- Only includes interviews with `scheduledAt != null`
- Only includes applications with `followUpDate != null`
- Excludes archived applications

Returns empty array if unauthenticated.
