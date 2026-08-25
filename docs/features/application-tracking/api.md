# Application Tracking — API Reference

## Server Actions

---

### `createApplication(formData: FormData)`

Creates a new job application.

**Input:**

| Field | Required | Validation |
|-------|----------|-----------|
| company | Yes | 1–200 characters |
| role | Yes | 1–200 characters |
| jobUrl | No | Valid URL or empty |
| stageId | Yes | Id of a stage owned by the caller |
| appliedDate | No | ISO date string (YYYY-MM-DD) or empty |
| followUpDate | No | ISO date string (YYYY-MM-DD) or empty |
| notes | No | Maximum 5,000 characters |
| tags | No | Comma-separated tag IDs |

**Returns:**
```typescript
{ success: true; id: string }
{ error: { [field]: string[] } }
```

**Side Effects:** Creates a CREATED activity record.

---

### `updateApplication(id: string, formData: FormData)`

Updates an existing application. Accepts the same fields as `createApplication`.

**Returns:**
```typescript
{ success: true }
{ error: { [field]: string[] } }
{ error: { _form: ["Application not found"] } }
```

**Side Effects:** Creates STATUS_CHANGED, NOTE_ADDED, and/or FOLLOW_UP_SET activity records as appropriate.

---

### `updateApplicationStage(id: string, stageId: string)`

Quick stage update used by the Kanban board on drag-and-drop and by the quick-actions menu.

**Input:**

| Parameter | Validation |
|-----------|-----------|
| id | Non-empty string, must be owned by the caller |
| stageId | Non-empty string, must be a stage owned by the caller |

**Returns:**
```typescript
{ success: true }
{ error: "Invalid data" }
{ error: "Application not found" }
{ error: "Stage not found" }
```

A no-op (already in that stage) returns `{ success: true }` without writing an activity.

**Side Effects:** Creates a STATUS_CHANGED activity with `{ from, to }` metadata.

---

### `archiveApplication(id: string)`

Sets `archived = true` on the application.

**Returns:** `{ success: true }` or `{ error: "Application not found" }`

---

### `unarchiveApplication(id: string)`

Sets `archived = false` on the application.

**Returns:** `{ success: true }` or `{ error: "Application not found" }`

---

### `deleteApplication(id: string)`

Permanently deletes the application and all related data via cascade.

**Returns:** `{ success: true }` or `{ error: "Application not found" }`

---

### `getApplications(params?)`

Fetches a filtered and sorted list of applications.

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | — | Case-insensitive partial match on company or role |
| stageId | string | — | Filter by stage id ("ALL" disables the filter) |
| sort | string | `createdAt` | Sort field |
| tag | string | — | Filter by tag ID |
| archived | boolean | `false` | Show archived applications |

**Sort options:** `createdAt` (newest first), `updatedAt` (recently updated), `company` (A–Z), `appliedDate` (newest first), `followUpDate` (soonest first).

**Returns:** `Application[]` with tags included.

---

### `getApplication(id: string)`

Fetches a single application with its activities and tags.

**Returns:** `Application | null`

---

### `getApplicationStats()`

Returns aggregate metrics for the analytics dashboard.

**Returns:**
```typescript
{
  total: number;
  stageCounts: Array<{ id, name, color, category, value: number }>;
  interviewing: number;
  offers: number;
  interviewRate: number;  // percentage
  offerRate: number;      // percentage
  thisWeek: number;
}
```

---

### `getFollowUps()`

Returns non-archived applications with follow-up dates set, excluding any application sitting in a `CLOSED` stage. Sorted by `followUpDate` ascending.

**Returns:** `Application[]` with tags and the `stage` relation included.

---

### `getCompanyStats()`

Returns per-company aggregated counts.

**Returns:** `Array<{ company: string; total: number; interviews: number; offers: number }>` sorted by total descending.

---

### `checkDuplicate(company: string, role: string)`

Checks whether an active application already exists for the given company and role (case-insensitive).

**Returns:** `{ id, company, role, status, stage } | null` — the warning renders `stage.name`, falling back to the legacy `status`.

---

### `addQuickNote(id: string, note: string)`

Appends a timestamped note to the application's existing notes field.

**Returns:** `{ success: true }` or `{ error: "Not found" }`

**Side Effects:** Creates a NOTE_ADDED activity.

---

### `exportApplicationsCsv()`

Generates a CSV export of all applications including archived ones.

**Returns:** `string` — complete CSV content with headers.

**Columns:** Company, Role, Status, Applied Date, Follow-up Date, Job URL, Tags, Notes, Created.
