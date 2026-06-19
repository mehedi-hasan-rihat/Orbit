# Interview Management — Backend System Design

## Data Model

```prisma
model Interview {
  id            String        @id @default(cuid())
  applicationId String
  application   Application   @relation(...)
  type          InterviewType
  round         Int           @default(1)
  scheduledAt   DateTime?
  notes         String?
  outcome       String?       // PASSED, FAILED, PENDING, CANCELLED
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([applicationId])
}

enum InterviewType {
  HR
  TECHNICAL
  SYSTEM_DESIGN
  BEHAVIORAL
  CULTURE_FIT
  TAKE_HOME
  FINAL
  OTHER
}
```

---

## Validation Schema

```typescript
interviewSchema = z.object({
  type: z.enum([...8 types]),
  round: z.coerce.number().min(1).max(20),
  scheduledAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  outcome: z.enum(["PENDING","PASSED","FAILED","CANCELLED"]).optional(),
})
```

---

## Authorization

Every interview action first verifies that the parent application belongs to the current user:

```typescript
const application = await prisma.application.findFirst({
  where: { id: applicationId, userId: session.userId },
});
if (!application) return { error: "Application not found" };
```

This prevents users from adding interviews to other people's applications.

---

## Activity Logging

| Action | Activity Type | When |
|--------|--------------|------|
| Create interview | INTERVIEW_SCHEDULED | Always |
| Update outcome (non-PENDING) | INTERVIEW_OUTCOME | Only when outcome changes from previous value |

Activity description format:
- Scheduled: `"Round 2 TECHNICAL interview scheduled for Jun 20, 2026"`
- Outcome: `"Round 2 TECHNICAL interview: PASSED"`

---

## Query Pattern

```typescript
prisma.interview.findMany({
  where: { applicationId },
  orderBy: [{ round: "asc" }, { createdAt: "asc" }],
})
```

Sorted by round number first, then by creation date for same-round entries.
