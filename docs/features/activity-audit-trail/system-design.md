# Activity Audit Trail — Backend System Design

## Data Model

```prisma
model Activity {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(...)
  type          String
  description   String
  metadata      String?     // JSON string
  createdAt     DateTime    @default(now())

  @@index([applicationId])
}
```

---

## Design Decisions

### Immutability
- Activities are append-only. No update or delete operations exist.
- They are removed only via cascade when the parent application is deleted.

### String Type (not Enum)
- `type` is stored as a plain string, not a Prisma enum.
- This allows adding new activity types without database migrations.

### JSON Metadata
- `metadata` stores structured data as a JSON string.
- Parsed on the frontend when needed for display.

---

## Creation Patterns

### Inline with Application Mutations

Activities are created as Prisma nested writes within application updates:

```typescript
await prisma.application.update({
  where: { id },
  data: {
    status: newStatus,
    activities: {
      create: {
        type: "STATUS_CHANGED",
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        metadata: JSON.stringify({ from: oldStatus, to: newStatus }),
      },
    },
  },
});
```

### Standalone (in interview actions)

```typescript
await prisma.activity.create({
  data: {
    applicationId,
    type: "INTERVIEW_SCHEDULED",
    description: `Round ${round} ${type} interview scheduled for ${date}`,
    metadata: JSON.stringify({ type, round }),
  },
});
```

---

## Metadata Shapes

```json
// STATUS_CHANGED
{ "from": "APPLIED", "to": "INTERVIEW" }

// INTERVIEW_SCHEDULED
{ "type": "TECHNICAL", "round": 2 }

// INTERVIEW_OUTCOME
{ "type": "HR", "round": 1, "outcome": "PASSED" }
```

---

## Query

Activities are fetched as part of `getApplication()`:

```typescript
prisma.application.findFirst({
  where: { id, userId },
  include: {
    activities: { orderBy: { createdAt: "desc" } },
  },
});
```

Sorted newest-first for timeline display.
