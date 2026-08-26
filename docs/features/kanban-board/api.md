# Kanban Board — API Documentation

## Server Actions Used

The Kanban board relies on three server actions:

---

### `getApplications()` (read)

Called by the dashboard page (server component) to fetch all non-archived applications. No params = returns all active apps sorted by `createdAt` desc.

**Returns:** `Application[]` with tags **and the `stage` relation**.

Used to populate the columns by filtering client-side on `stageId`. The `stage` include is required: without it the card and badge have no name or colour to render.

---

### `getStageTypes()` (read)

Called by the dashboard page to fetch the column definitions. Seeds the default catalogue on first read if the user has none, so it never returns an empty pipeline for a valid user.

**Returns:** `PipelineStageType[]` ordered by `order`, then `name`.

The dashboard filters to `enabled` stages before passing them to the board.

---

### `updateApplicationStage(id: string, stageId: string)` (write)

Called on drag-drop when a card lands in a different column.

**Input:**

| Param | Type | Validation |
|-------|------|-----------|
| id | string | Non-empty |
| stageId | string | Non-empty, **and must resolve to a stage owned by the caller** |

**Returns:**
```typescript
{ success: true }  // stage updated, or already in that stage
{ error: "Invalid data" }  // validation failed
{ error: "Application not found" }  // not owned by user
{ error: "Stage not found" }  // stage not owned by user
```

**Side Effects:**
- Updates `application.stageId` in DB
- Creates `STATUS_CHANGED` activity with metadata: `{ from: "Applied", to: "Interview", toStageId: "..." }` — names now, not enum values
- Calls `revalidatePath("/dashboard")`

Note the extra failure mode compared to the enum version: a stage id can be well-formed and still not belong to the caller, so ownership is checked twice — once for the application, once for the stage.
