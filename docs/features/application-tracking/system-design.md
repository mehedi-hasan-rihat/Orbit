# Application Tracking — Backend System Design

## Architecture

Application CRUD is handled by server actions in `src/lib/actions/applications.ts`. Every mutation:
1. Verifies user session
2. Validates input with Zod
3. Checks resource ownership
4. Mutates the database
5. Creates activity records for auditing
6. Calls `revalidatePath()` to invalidate cached pages

---

## Data Model

```prisma
model Application {
  id             String            @id @default(cuid())
  userId         String
  company        String
  role           String
  jobUrl         String?
  status         ApplicationStatus @default(WISHLIST)
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

enum ApplicationStatus {
  WISHLIST
  APPLIED
  INTERVIEW
  OFFER
  REJECTED
  ARCHIVED
}
```

### Indexes

| Index | Purpose |
|-------|---------|
| `(userId)` | All apps for a user |
| `(userId, status)` | Status-filtered queries |
| `(userId, archived)` | Active vs archived split |
| `(company)` | Company search/group |

---

## Validation

```typescript
// src/lib/validations.ts
applicationSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  jobUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["WISHLIST","APPLIED","INTERVIEW","OFFER","REJECTED","ARCHIVED"]),
  appliedDate: z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")), // comma-separated IDs
})
```

---

## Key Flows

### Create Application

```
1. requireUser() → verify session
2. Zod validate formData
3. Parse tag IDs from comma-separated string
4. prisma.application.create({
     data: { userId, company, role, ..., 
       activities: { create: { type: "CREATED", ... } },
       tags: { create: tagIds.map(id => ({ tagId: id })) }
     }
   })
5. revalidatePath("/dashboard")
6. Return { success: true, id }
```

### Update Application

```
1. requireUser() → verify session
2. Zod validate formData
3. prisma.application.findFirst({ id, userId }) → ownership check
4. Compare old vs new: track status changes, note changes, follow-up changes
5. Delete all existing ApplicationTag records for this app
6. prisma.application.update({ data, activities: { create: [...changes] }, tags: { create: newTags } })
7. revalidatePath("/dashboard")
```

### Archive / Unarchive

```
1. Verify ownership
2. Set archived = true/false
3. Create activity: "Application archived" or "Application unarchived"
4. revalidatePath("/dashboard")
```

### Delete

```
1. Verify ownership
2. prisma.application.delete({ where: { id } })
   → Cascades: Activities, Interviews, ApplicationTags all deleted
3. revalidatePath("/dashboard")
```

---

## Query Patterns

### Filtered List (`getApplications`)

Supports:
- **search**: case-insensitive `contains` on company OR role
- **status**: exact match (or skip if "ALL")
- **tag**: `where.tags = { some: { tagId } }`
- **archived**: boolean flag
- **sort**: maps to Prisma `orderBy`

Includes `tags: { include: { tag: true } }` for display.

### Application Detail (`getApplication`)

Returns single app with:
- `activities` (ordered by createdAt desc)
- `tags` with tag details

### Stats (`getApplicationStats`)

Aggregates all non-archived apps:
- Counts per status
- Interview rate = (INTERVIEW + OFFER) / total
- Offer rate = OFFER / total
- This week = apps with createdAt >= 7 days ago

### Duplicate Check (`checkDuplicate`)

```typescript
prisma.application.findFirst({
  where: {
    userId, archived: false,
    company: { equals: company, mode: "insensitive" },
    role: { equals: role, mode: "insensitive" },
  }
})
```

Debounced on the client (500ms) to avoid excessive queries.

---

## CSV Export

`exportApplicationsCsv()` fetches all user applications (including archived), formats as CSV string with headers. Client creates a Blob and triggers download.

---

## Authorization Pattern

Every action uses the same pattern:

```typescript
const session = await requireUser(); // throws if no session
const existing = await prisma.application.findFirst({
  where: { id, userId: session.userId },
});
if (!existing) return { error: "Application not found" };
```

No user can access another user's applications.
