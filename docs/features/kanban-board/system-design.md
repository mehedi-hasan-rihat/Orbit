# Kanban Board — Backend System Design

## Architecture

The Kanban board uses a single server action for status updates. Data fetching is handled by the dashboard page (server component) using `getApplications()`.

---

## Data Flow

```
DashboardPage (server)
  → getApplications() (no filter, gets all non-archived)
  → Serialize: JSON.parse(JSON.stringify(applications))
  → Pass to KanbanBoard (client component)

On drag-drop:
  → KanbanBoard calls updateApplicationStatus(id, newStatus)
  → Server validates ownership + status enum
  → Updates DB
  → Creates STATUS_CHANGED activity
  → revalidatePath("/dashboard")
```

---

## Server Action Used

### `updateApplicationStatus(id: string, status: string)`

Validated with:
```typescript
updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["WISHLIST","APPLIED","INTERVIEW","OFFER","REJECTED","ARCHIVED"]),
})
```

Steps:
1. Verify user session
2. Validate input
3. Find application by id + userId (ownership check)
4. Update status
5. Create activity: `STATUS_CHANGED` with metadata `{ from: oldStatus, to: newStatus }`
6. Revalidate path

---

## No Ordering Persistence

Cards within a column are sorted by `createdAt` desc. There is no user-defined ordering within columns — dragging only changes status, not position.
