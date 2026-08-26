# Kanban Board — System Design

## Architecture

The Kanban board is a client component that receives both application data and the column definitions from the dashboard server page. It manages local state for optimistic updates and calls a single server action when a card is dropped in a new column.

```
DashboardPage (server)
  → getApplications() — non-archived, with the stage relation included
  → getStageTypes()  — the user's stage catalogue (seeds defaults on first read)
  → filter to enabled stages → boardStages
  → JSON.parse(JSON.stringify(applications)) — serialise for client
  → KanbanBoard (client component)

On drag-drop:
  → KanbanBoard updates local state immediately (optimistic)
  → Calls updateApplicationStage(id, targetStageId)
  → Server validates ownership of BOTH the application and the stage
  → Updates application.stageId
  → Creates STATUS_CHANGED activity
  → revalidatePath("/dashboard")
  → router.refresh() reconciles UI with server state
```

The columns are data, not constants, which changes one thing about every read path feeding this board: a query that forgets to `include` the `stage` relation still type-checks and still renders — the badge just silently reads "Unassigned". The include is load-bearing and invisible to the compiler.

---

## Hydration Strategy

DnD Kit generates dynamic attributes at runtime that do not match the server-rendered HTML, which would cause React hydration mismatches. This is resolved using `useSyncExternalStore` to defer interactive rendering until after hydration:

```typescript
const mounted = useSyncExternalStore(
  () => () => {},
  () => true,
  () => false
);
```

Before hydration (`mounted = false`), static non-draggable cards are rendered. After hydration (`mounted = true`), the full DnD context is activated. This eliminates hydration errors without using `useEffect`.

---

## Touch Support

The `PointerSensor` is configured with a delay-based activation constraint:

```typescript
useSensor(PointerSensor, {
  activationConstraint: { delay: 200, tolerance: 5 },
})
```

A 200ms hold is required to initiate a drag. This allows the browser to distinguish between a scroll gesture and a drag intent on touch devices. A normal tap (under 200ms) navigates to the application detail page.

---

## Optimistic Update Pattern

When a card is dropped in a new column:
1. Local `items` state is updated immediately with the new `stageId`.
2. The server action runs asynchronously.
3. `router.refresh()` is called after the action completes to reconcile the UI with confirmed server state.

If the server action fails, the next `router.refresh()` will restore the correct state from the database.

---

## Card Ordering

Cards within a column are ordered by `createdAt` descending (newest first). There is no user-defined ordering within columns — dragging a card only changes its stage, not its position within a column.

Column order is user-defined via the stage `order` field, but there is no drag-to-reorder UI for columns themselves; new stages are appended to the end.

---

## Server Action

### `updateApplicationStage(id: string, stageId: string)`

Validated with:
```typescript
updateStageSchema = z.object({
  id:      z.string().min(1),
  stageId: z.string().min(1),
})
```

Zod can only assert that the stage id is a non-empty string — it cannot know whether the stage exists or belongs to the caller, which a closed enum used to guarantee for free. That check moved into the action as an explicit ownership lookup.

Steps:
1. Verify user session.
2. Validate input with Zod.
3. Find application by `id` and `userId` (ownership check).
4. Find stage by `stageId` and `userId` (second ownership check).
5. No-op early if the application is already in that stage.
6. Update `stageId` in the database.
7. Create a STATUS_CHANGED activity with metadata `{ from, to, toStageId }`, where `from` is the previous stage name — falling back to the legacy `status` value for pre-rework rows.
8. Call `revalidatePath("/dashboard")`.
