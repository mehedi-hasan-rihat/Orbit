# Interview Management — Backend System Design

## Data Model

```prisma
model Interview {
  id            String        @id @default(cuid())
  applicationId String
  application   Application   @relation(...)
  stageTypeId   String?        // → PipelineStageType, onDelete: SetNull
  stageType     PipelineStageType?
  type          InterviewType? // Legacy — pre-pipeline rows only, never written
  customType    String?        // Free-form label: legacy OTHER rows, and the
                               // snapshot taken when a stage type is deleted
  round         Int            @default(1)
  scheduledAt   DateTime?
  notes         String?
  outcome       String?        // One of INTERVIEW_OUTCOMES
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([applicationId])
  @@index([stageTypeId])
}

// Legacy. Retained because pre-pipeline rows still hold these values.
enum InterviewType {
  PHONE_SCREEN | ONSITE | PANEL | ASSESSMENT | TASK | FINAL | OTHER
}
```

A round's type is a `PipelineStageType` row the user owns. The picker offers stages in
the `INTERVIEWING` and `SUCCESS` categories — `OPEN` and `CLOSED` stages are
application lifecycle states, not things you sit an interview for.

Three eras of data coexist in this table, and `resolveStageLabel()` renders all three:
a row with a `stageType`, a row whose stage type was deleted (name snapshotted into
`customType`), and a pre-pipeline row carrying only the legacy enum.

---

## Validation Schema

```typescript
interviewSchema = z.object({
  stageTypeId: z.string().min(1),  // ownership verified in the action
  round: z.coerce.number().min(1).max(20),
  scheduledAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  outcome: z.enum(INTERVIEW_OUTCOMES).optional(),
})
```

`INTERVIEW_OUTCOMES` is a fixed vocabulary of eight — `PENDING`, `SCHEDULED`,
`PASSED`, `FAILED`, `REJECTED`, `CANCELLED`, `WITHDRAWN`, `COMPLETED`. Only the
stage *types* are user-editable; outcomes are not.

`OPEN_OUTCOMES` (`PENDING` and `SCHEDULED`) is the subset meaning "this round has not
happened yet". It is what the reminder cron chases, and adding `SCHEDULED` to the
vocabulary without adding it here would have silently stopped reminders for every
scheduled interview.

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

The stage type id is a second client-supplied id and gets the same treatment — a
well-formed id can still belong to another user, a guarantee the closed enum used to
provide for free.

---

## Activity Logging

| Action | Activity Type | When |
|--------|--------------|------|
| Create interview | INTERVIEW_SCHEDULED | Always |
| Update outcome | INTERVIEW_OUTCOME | Only when the outcome changes **and** is not an open outcome |

`SCHEDULED` is excluded alongside `PENDING`: both are states on the way to an outcome,
and logging "interview: SCHEDULED" as an `INTERVIEW_OUTCOME` would misrepresent it.

Activity description format:
- Scheduled: `"Round 2 Technical Interview interview scheduled for Jun 20, 2026"`
- Outcome: `"Round 2 Technical Interview interview: PASSED"`

### Status auto-advance

A `PASSED` outcome pulls the application forward if it is still in an `OPEN` stage.
The target is the first enabled `INTERVIEWING` stage in the user's own pipeline
order — previously this was the hard-coded `INTERVIEW` enum value, which no longer
exists as a write target.

---

## Query Pattern

```typescript
prisma.interview.findMany({
  where: { applicationId },
  include: { stageType: { select: { id: true, name: true, enabled: true } } },
  orderBy: [{ round: "asc" }, { createdAt: "asc" }],
})
```

Sorted by round number first, then by creation date for same-round entries.
