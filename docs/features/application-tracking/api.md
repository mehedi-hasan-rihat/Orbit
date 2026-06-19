# Application Tracking — API Documentation

## Server Actions (`src/lib/actions/applications.ts`)

---

### `createApplication(formData: FormData)`

Creates a new job application.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| company | string | Yes | 1–200 chars |
| role | string | Yes | 1–200 chars |
| jobUrl | string | No | Valid URL or empty |
| status | string | No | Enum (defaults to WISHLIST) |
| appliedDate | string | No | ISO date (YYYY-MM-DD) or empty |
| followUpDate | string | No | ISO date (YYYY-MM-DD) or empty |
| notes | string | No | Max 5000 chars |
| tags | string | No | Comma-separated tag IDs |

**Returns:**
```typescript
{ success: true, id: string }  // on success
{ error: { [field]: string[] } }  // on validation failure
```

**Side Effects:** Creates CREATED activity.

---

### `updateApplication(id: string, formData: FormData)`

Updates an existing application. Same input fields as create.

**Returns:**
```typescript
{ success: true }
{ error: { [field]: string[] } }
{ error: { _form: ["Application not found"] } }
```

**Side Effects:** Creates activity records for status, notes, and follow-up changes.

---

### `updateApplicationStatus(id: string, status: string)`

Quick status update (used by Kanban board).

**Input:**
| Param | Validation |
|-------|-----------|
| id | Non-empty string |
| status | One of: WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED, ARCHIVED |

**Returns:**
```typescript
{ success: true }
{ error: "Invalid data" | "Application not found" }
```

**Side Effects:** Creates STATUS_CHANGED activity with `{ from, to }` metadata.

---

### `archiveApplication(id: string)`

Sets `archived = true`.

**Returns:** `{ success: true }` or `{ error: "Application not found" }`

---

### `unarchiveApplication(id: string)`

Sets `archived = false`.

**Returns:** `{ success: true }` or `{ error: "Application not found" }`

---

### `deleteApplication(id: string)`

Permanently deletes the application and all related data.

**Returns:** `{ success: true }` or `{ error: "Application not found" }`

**Cascade:** Activities, Interviews, ApplicationTags all deleted.

---

### `getApplications(params?)`

Fetches filtered application list.

**Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | — | Text search on company/role |
| status | string | — | Filter by status ("ALL" = no filter) |
| sort | string | "createdAt" | Sort field |
| tag | string | — | Filter by tag ID |
| archived | boolean | false | Show archived instead of active |

**Sort values:** `createdAt`, `updatedAt`, `company`, `appliedDate`, `followUpDate`

**Returns:** `Application[]` with tags included.

---

### `getApplication(id: string)`

Fetches single application with activities and tags.

**Returns:** `Application | null`

---

### `getApplicationStats()`

**Returns:**
```typescript
{
  total: number;
  statusCounts: { WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED, ARCHIVED: number };
  interviewRate: number;  // percentage
  offerRate: number;      // percentage
  thisWeek: number;
}
```

---

### `getFollowUps()`

Returns non-archived applications with follow-up dates in active stages (excludes REJECTED, ARCHIVED). Sorted by followUpDate ascending.

---

### `getCompanyStats()`

**Returns:** `Array<{ company: string, total: number, interviews: number, offers: number }>` sorted by total desc.

---

### `checkDuplicate(company: string, role: string)`

**Returns:** `{ id, company, role, status } | null`

---

### `addQuickNote(id: string, note: string)`

Appends `[date] note` to existing notes field.

**Returns:** `{ success: true }` or `{ error: "Not found" }`

**Side Effects:** Creates NOTE_ADDED activity.

---

### `exportApplicationsCsv()`

**Returns:** CSV string with headers: Company, Role, Status, Applied Date, Follow-up Date, Job URL, Tags, Notes, Created.
