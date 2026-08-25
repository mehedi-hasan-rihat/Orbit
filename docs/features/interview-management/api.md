# Interview Management — API Documentation

## Server Actions (`src/lib/actions/interviews.ts`)

---

### `createInterview(applicationId: string, formData: FormData)`

Adds a new interview round to an application.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| stageTypeId | string | Yes | Id of a stage type owned by the caller |
| round | string/number | Yes | 1–20 |
| scheduledAt | string | No | ISO datetime or empty |
| notes | string | No | Max 5000 chars |
| outcome | string | No | One of the 8 `INTERVIEW_OUTCOMES` (defaults to PENDING) |

**Returns:**
```typescript
{ success: true }
{ error: "Application not found" }
{ error: { [field]: string[] } }  // Zod validation errors
```

**Side Effects:**
- Creates interview record
- Creates INTERVIEW_SCHEDULED activity

---

### `updateInterview(id: string, applicationId: string, formData: FormData)`

Updates an existing interview round.

**Input:** Same fields as create.

**Returns:**
```typescript
{ success: true }
{ error: "Application not found" }
{ error: { [field]: string[] } }
```

**Side Effects:**
- Updates interview record
- If outcome changed AND the new outcome is not open (`PENDING`/`SCHEDULED`): creates INTERVIEW_OUTCOME activity

---

### `deleteInterview(id: string, applicationId: string)`

Permanently removes an interview round.

**Returns:**
```typescript
{ success: true }
{ error: "Application not found" }
```

---

### `getInterviews(applicationId: string)`

Fetches all interview rounds for an application.

**Returns:** `Interview[]` with the `stageType` relation included, sorted by round ASC, then createdAt ASC.

Returns empty array if application not found or not owned by user.
