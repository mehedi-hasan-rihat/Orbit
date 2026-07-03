# Kanban Board — System Design

## Architecture

The Kanban board is a client component that receives application data from the dashboard server page. It manages local state for optimistic updates and calls a single server action when a card is dropped in a new column.

```
DashboardPage (server)
  → getApplications() — all non-archived applications
  → JSON.parse(JSON.stringify(applications)) — serialise for client
  → KanbanBoard (client component)

On drag-drop:
  → KanbanBoard updates local state immediately (optimistic)
  → Calls updateApplicationStatus(id, newStatus)
  → Server validates ownership and status enum
  → Updates database
  → Creates STATUS_CHANGED activity
  → revalidatePath("/dashboard")
  → router.refresh() reconciles UI with server state
```

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
1. Local `items` state is updated immediately with the new status.
2. The server action runs asynchronously.
3. `router.refresh()` is called after the action completes to reconcile the UI with confirmed server state.

If the server action fails, the next `router.refresh()` will restore the correct state from the database.

---

## Card Ordering

Cards within a column are ordered by `createdAt` descending (newest first). There is no user-defined ordering within columns — dragging a card only changes its status, not its position within a column.

---

## Server Action

### `updateApplicationStatus(id: string, status: string)`

Validated with:
```typescript
updateStatusSchema = z.object({
  id:     z.string().min(1),
  status: z.enum([...8 ApplicationStatus values]),
})
```

Steps:
1. Verify user session.
2. Validate input with Zod.
3. Find application by `id` and `userId` (ownership check).
4. Update status in the database.
5. Create a STATUS_CHANGED activity with metadata `{ from: oldStatus, to: newStatus }`.
6. Call `revalidatePath("/dashboard")`.
