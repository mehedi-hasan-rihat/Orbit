# Interview Management — API Documentation

## Server Actions (`src/lib/actions/interviews.ts`)

---

### `createInterview(applicationId: string, formData: FormData)`

Adds a new interview round to an application.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| type | string | Yes | One of 8 InterviewType values |
| round | string/number | Yes | 1–20 |
| scheduledAt | string | No | ISO datetime or empty |
| notes | string | No | Max 5000 chars |
| outcome | string | No | PENDING, PASSED, FAILED, CANCELLED (defaults to PENDING) |

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
- If outcome changed from previous value AND new outcome ≠ PENDING: creates INTERVIEW_OUTCOME activity

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

**Returns:** `Interview[]` sorted by round ASC, then createdAt ASC.

Returns empty array if application not found or not owned by user.
