# Activity Audit Trail — API Documentation

## Data Access

Activities are **not** accessed through a dedicated server action. They are included as part of the application detail fetch:

### `getApplication(id: string)`

**Module:** `src/lib/actions/applications.ts`

Returns the application with activities included:

```typescript
prisma.application.findFirst({
  where: { id, userId: session.userId },
  include: {
    activities: { orderBy: { createdAt: "desc" } },
    tags: { include: { tag: true } },
  },
});
```

**Activity Shape:**
```typescript
{
  id: string;
  applicationId: string;
  type: string;       // "CREATED" | "STATUS_CHANGED" | "NOTE_ADDED" | etc.
  description: string; // Human-readable text
  metadata: string | null; // JSON string with structured data
  createdAt: Date;
}
```

---

## Write Operations

Activities are created automatically as side effects of other actions:

| Action | Creates Activity |
|--------|-----------------|
| `createApplication()` | CREATED |
| `updateApplication()` | STATUS_CHANGED, NOTE_ADDED, FOLLOW_UP_SET (conditionally) |
| `updateApplicationStatus()` | STATUS_CHANGED |
| `archiveApplication()` | STATUS_CHANGED ("Application archived") |
| `unarchiveApplication()` | STATUS_CHANGED ("Application unarchived") |
| `addQuickNote()` | NOTE_ADDED |
| `createInterview()` | INTERVIEW_SCHEDULED |
| `updateInterview()` | INTERVIEW_OUTCOME (on outcome change) |

There is **no user-facing action** to manually create, edit, or delete activities.
