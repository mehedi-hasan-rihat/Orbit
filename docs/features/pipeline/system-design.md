# Pipeline — Backend System Design

## Data Model

```prisma
enum StageCategory {
  OPEN          // not yet in process — Wishlist, Applied
  INTERVIEWING  // actively progressing through rounds
  SUCCESS       // Offer
  CLOSED        // Rejected, Withdrawn, Archived
}

model PipelineStageType {
  id           String        @id @default(cuid())
  userId       String
  name         String
  color        String        @default("#6b7280")
  category     StageCategory @default(INTERVIEWING)
  order        Int           @default(0)
  enabled      Boolean       @default(true)
  interviews   Interview[]
  applications Application[]

  @@unique([userId, name])
  @@index([userId])
}
```

One catalogue serves two purposes: it is the stage an application sits in
(`Application.stageId`) and the type an interview round is filed under
(`Interview.stageTypeId`). Keeping them separate would have meant two nearly
identical management screens for lists a user thinks of as one thing.

---

## Why Category Exists

The stages are user-owned strings, but the metrics are not negotiable — interview
rate, offer rate, and follow-up eligibility all have to keep working after a user
renames "Offer" or adds "Final Round".

`StageCategory` is the stable axis those computations key off:

| Consumer | Old rule | New rule |
|----------|----------|----------|
| Interview rate | `SCREENING + INTERVIEW + OFFER` | `INTERVIEWING + SUCCESS` |
| Offer rate | `OFFER` | `SUCCESS` |
| Follow-up eligibility | `status notIn [REJECTED, WITHDRAWN, ARCHIVED]` | `stage.category != CLOSED` |
| Interview round picker | all `InterviewType` values | `INTERVIEWING` and `SUCCESS` stages |
| Auto-advance on a passed round | set status to `INTERVIEW` | first enabled `INTERVIEWING` stage, in user order |

Without it there is no way to express "this custom stage counts as progress" — the
rates would silently return zero for anyone who customised their pipeline.

---

## Seeding

Defaults are seeded **lazily**, on the first read of `getStageTypes()`, rather than at
registration. Registration-time seeding would only ever cover new accounts, and the
feature was introduced to users who already existed.

```typescript
await prisma.pipelineStageType.createMany({
  data: DEFAULT_STAGE_TYPES.map((d, i) => ({ userId, ...d, order: i })),
  skipDuplicates: true,
});
```

`skipDuplicates` leans on `@@unique([userId, name])`, so two concurrent first-reads
cannot double-seed.

---

## Deletion

The two foreign keys pointing at a stage type resolve deletion differently, on
purpose:

| Reference | Rule | Behaviour |
|-----------|------|-----------|
| `Application.stageId` | `Restrict` | The action counts applications first and **refuses** with a message naming the count. `SetNull` would leave those cards with no stage and no board column at all. |
| `Interview.stageTypeId` | `SetNull` | The action copies the stage name into `Interview.customType` **before** deleting, so the round keeps its label. It simply stops following future renames. |

Hiding (`enabled: false`) is the non-destructive path and is always available: the
stage leaves the board but everything filed under it is untouched, and it stays
selectable on records already using it.

---

## Migration from ApplicationStatus

Applications previously carried an `ApplicationStatus` enum. The migration had to
seed stages and backfill every row without discarding curation from users who had
already edited their pipeline, so it branches:

- **Users with an existing pipeline** get only the stages needed to represent an
  `ApplicationStatus`. Interview-only defaults they had deleted are *not* re-added —
  that deletion was deliberate.
- **Users with no pipeline** get the full default catalogue.

Lifecycle stages are inserted at negative and high `order` values (`-2`, `-1`, `100`+)
so they bracket any existing ordering rather than renumbering it.

The enum column is kept, made nullable, and never written again. It is the fallback
`resolveStage()` reads when a row has no `stageId`.
