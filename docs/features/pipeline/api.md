# Pipeline — API Documentation

## Server Actions (`src/lib/actions/pipeline.ts`)

Every action follows the project pattern: local `requireUser()`, Zod validation,
ownership check on `(id, userId)`, mutate, `revalidatePath()`.

---

### `getStageTypes()` (read)

Fetches the caller's stage catalogue, seeding the defaults if they have none.

**Returns:** `PipelineStageType[]` ordered by `order`, then `name`.

Never returns an empty array for a valid session — the seed runs first.

---

### `getStageTypesWithUsage()` (read)

As above, plus usage counts, for the management screen.

**Returns:**
```typescript
Array<{
  id, name, color, category, order, enabled,
  usageCount: number;       // interview rounds using this stage
  applicationCount: number; // applications sitting in it
}>
```

`applicationCount` is what the UI needs to explain a refused delete before the user
attempts it.

---

### `createStageType(formData)` (write)

**Input:** `name` (1–100), `color` (hex), `category` (one of the four).

**Returns:**
```typescript
{ success: true, id: string }
{ error: { name: ["That type already exists"] } }
{ error: { ...fieldErrors } }
```

Appends to the end of the user's order. Returns the new `id` so the interview form can
create a stage inline and immediately file a round under it.

---

### `updateStageType(id, formData)` (write)

Renames and/or recolours and/or recategorises a stage.

**Returns:** `{ success: true }` | `{ error: "Stage type not found" }` | `{ error: { name: [...] } }`

**Side effect:** none on `Application` or `Interview`. Both reference the row, so the
change propagates without touching either table.

---

### `setStageTypeEnabled(id, enabled)` (write)

Shows or hides a stage on the board.

**Returns:** `{ success: true }` | `{ error: "Stage type not found" }`

Hiding never reassigns anything; records already using the stage keep it.

---

### `deleteStageType(id)` (write)

**Returns:**
```typescript
{ success: true }
{ error: "Stage type not found" }
{ error: "<name> still holds N applications. Move them to another stage, or disable this one instead." }
```

**Side effects, in order:**
1. Counts applications in the stage; **refuses** if any (the FK is `Restrict`).
2. Copies the stage name into `Interview.customType` for every round using it.
3. Deletes the row, which nulls `Interview.stageTypeId` via `SetNull`.

---

## Revalidation

All writes revalidate `/dashboard/pipeline`, `/dashboard/applications`, and
`/dashboard` — a stage change alters the board columns, the filter options, and the
analytics distribution, not just the management page.
