# Tags & Organization — Backend System Design

## Data Model

```prisma
model Tag {
  id           String           @id @default(cuid())
  userId       String
  name         String
  color        String           @default("#6b7280")
  createdAt    DateTime         @default(now())
  applications ApplicationTag[]

  @@unique([userId, name])
  @@index([userId])
}

model ApplicationTag {
  id            String @id @default(cuid())
  applicationId String
  tagId         String

  @@unique([applicationId, tagId])
  @@index([applicationId])
  @@index([tagId])
}
```

---

## Uniqueness

The `@@unique([userId, name])` constraint ensures no user has duplicate tag names. This is checked both at the application layer (pre-check query) and at the database level (constraint).

---

## Tag Assignment Strategy

When creating or editing an application, tags are managed with a "delete-and-recreate" pattern:

```typescript
// Remove all existing tag associations
await prisma.applicationTag.deleteMany({ where: { applicationId: id } });

// Recreate with new set
await prisma.application.update({
  where: { id },
  data: {
    tags: {
      create: tagIds.map((tagId) => ({ tagId })),
    },
  },
});
```

This avoids complex diffing logic while remaining efficient for the typical number of tags per application (< 10).

---

## Cascade on Delete

When a tag is deleted:
- Prisma cascades: all `ApplicationTag` records referencing that tag are deleted.
- Applications themselves are unaffected.

When an application is deleted:
- All `ApplicationTag` records for that application are cascaded away.

---

## Tag Filtering in Application Queries

```typescript
if (params.tag) {
  where.tags = { some: { tagId: params.tag } };
}
```

Uses Prisma's `some` relation filter to find applications that have at least one `ApplicationTag` matching the given tag ID.
