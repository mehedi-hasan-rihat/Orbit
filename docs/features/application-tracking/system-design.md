# Application Tracking — System Design

## Architecture

Application CRUD operations are handled by server actions in the applications module. Every mutation follows a consistent pattern:

1. Verify the user session.
2. Validate input with Zod.
3. Check resource ownership via `findFirst({ where: { id, userId } })`.
4. Mutate the database.
5. Create activity records for auditing.
6. Call `revalidatePath()` to invalidate cached pages.

---

## Data Model

```prisma
model Application {
  id             String            @id @default(cuid())
  userId         String
  company        String
  role           String
  jobUrl         String?
  stageId        String?            // → PipelineStageType, onDelete: Restrict
  status         ApplicationStatus? // Legacy — pre-pipeline rows only, never written
  appliedDate    DateTime?
  followUpDate   DateTime?
  notes          String?
  resumeUrl      String?
  coverLetterUrl String?
  archived       Boolean           @default(false)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  activities     Activity[]
  interviews     Interview[]
  tags           ApplicationTag[]
}

// Legacy. Retained because pre-pipeline rows still hold these values and
// removing an enum value requires recreating the type with casting.
enum ApplicationStatus {
  WISHLIST | APPLIED | SCREENING | INTERVIEW | OFFER | REJECTED | WITHDRAWN | ARCHIVED
}
```

An application's stage is a row the user owns, not an enum value. The enum column
survives as a read-only fallback: a backfill migration matched every existing row to
a stage, and `resolveStage()` reads `status` only if `stageId` is somehow absent.

### Indexes

| Index | Purpose |
|-------|---------|
| `(userId)` | Fetch all applications for a user |
| `(userId, stageId)` | Stage-filtered queries |
| `(userId, archived)` | Active vs archived split |
| `(company)` | Company search and grouping |

---

## Validation Schema

```typescript
applicationSchema = z.object({
  company:      z.string().min(1).max(200),
  role:         z.string().min(1).max(200),
  jobUrl:       z.string().url().optional().or(z.literal("")),
  stageId:      z.string().min(1),   // ownership verified in the action, not here
  appliedDate:  z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  notes:        z.string().max(5000).optional().or(z.literal("")),
  tags:         z.string().optional().or(z.literal("")), // comma-separated IDs
})
```

---

## Key Processing Flows

### Create Application

```
1. requireUser() → verify session
2. Zod validate formData
3. Parse tag IDs from comma-separated string
4. prisma.application.create with nested:
   - activities: { create: { type: CREATED, description: ... } }
   - tags: { create: tagIds.map(id => ({ tagId: id })) }
5. revalidatePath("/dashboard")
6. Return { success: true, id }
```

### Update Application

```
1. requireUser() → verify session
2. Zod validate formData
3. prisma.application.findFirst({ id, userId }) → ownership check
4. Compare old vs new values:
   - stage changed → push STATUS_CHANGED activity (description uses stage names)
   - notes changed → push NOTE_ADDED activity
   - followUpDate changed → push FOLLOW_UP_SET activity
5. Delete all existing ApplicationTag records for this application
6. prisma.application.update with new data, activities, and tags
7. revalidatePath("/dashboard")
```

The tag update uses a delete-and-recreate strategy rather than diffing, which is simpler and efficient for the typical number of tags per application.

### Archive and Unarchive

Sets `archived = true` or `false` and creates a STATUS_CHANGED activity with the description "Application archived" or "Application unarchived".

### Delete

Calls `prisma.application.delete()`. Cascade rules automatically remove all related Activities, Interviews, and ApplicationTags.

---

## Query Patterns

### Filtered List

The `getApplications(params)` action constructs a dynamic Prisma `where` clause:

- **search**: `{ OR: [{ company: { contains, mode: "insensitive" } }, { role: { contains, mode: "insensitive" } }] }` — maps to PostgreSQL `ILIKE %term%`
- **stageId**: exact match on the stage row id (skipped if value is "ALL")
- **tag**: `{ tags: { some: { tagId } } }` — relation filter
- **archived**: boolean flag (defaults to `false`)
- **sort**: maps to Prisma `orderBy` (createdAt, updatedAt, company, appliedDate, followUpDate)

### Application Detail

Returns a single application with `activities` (ordered by `createdAt` desc), `tags` with tag details, and the `stage` relation. The stage include is required by every caller that renders a status badge.

### Statistics

Fetches all non-archived applications with their stage category, plus the user's stage catalogue. Computes totals, per-stage counts, interview rate, offer rate, and this-week count in-memory. Rates key off `StageCategory`, not stage names. No complex SQL aggregation is required.

### Duplicate Check

```typescript
prisma.application.findFirst({
  where: {
    userId, archived: false,
    company: { equals: company, mode: "insensitive" },
    role:    { equals: role,    mode: "insensitive" },
  },
  select: { id: true, company: true, role: true, status: true,
            stage: { select: { name: true, color: true } } },
})
```

Called with a 500ms debounce on the client to avoid excessive queries while the user is typing.

---

## CSV Export

The `exportApplicationsCsv()` action fetches all user applications including archived ones, with tags. It generates a CSV string with headers: Company, Role, Status, Applied Date, Follow-up Date, Job URL, Tags, Notes, Created. Tags are joined with semicolons. Commas in notes are replaced with semicolons. All values are wrapped in double quotes. The client receives the string, creates a Blob, and triggers a file download.

---

## Authorisation Pattern

Every action uses the same ownership verification pattern:

```typescript
const session = await requireUser(); // throws if no session
const existing = await prisma.application.findFirst({
  where: { id, userId: session.userId },
});
if (!existing) return { error: "Application not found" };
```

This ensures no user can access or modify another user's applications, even with a known application ID.
