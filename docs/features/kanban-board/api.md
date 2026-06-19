# Kanban Board — API Documentation

## Server Actions Used

The Kanban board relies on two server actions:

---

### `getApplications()` (read)

Called by the dashboard page (server component) to fetch all non-archived applications. No params = returns all active apps sorted by `createdAt` desc.

**Returns:** `Application[]` with tags.

Used to populate all 5 columns by filtering client-side on `status`.

---

### `updateApplicationStatus(id: string, status: string)` (write)

Called on drag-drop when a card lands in a different column.

**Input:**

| Param | Type | Validation |
|-------|------|-----------|
| id | string | Non-empty |
| status | string | One of: WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED, ARCHIVED |

**Returns:**
```typescript
{ success: true }  // status updated
{ error: "Invalid data" }  // validation failed
{ error: "Application not found" }  // not owned by user
```

**Side Effects:**
- Updates application status in DB
- Creates `STATUS_CHANGED` activity with metadata: `{ from: "APPLIED", to: "INTERVIEW" }`
- Calls `revalidatePath("/dashboard")`
