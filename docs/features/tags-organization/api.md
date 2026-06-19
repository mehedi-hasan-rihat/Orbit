# Tags & Organization — API Documentation

## Server Actions (`src/lib/actions/tags.ts`)

---

### `createTag(formData: FormData)`

Creates a new tag for the current user.

**Input:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | string | Yes | 1–50 chars |
| color | string | Yes | Valid hex: `/^#[0-9a-fA-F]{6}$/` |

**Returns:**
```typescript
{ success: true }
{ error: { name: ["Tag already exists"] } }
{ error: { name?: string[], color?: string[] } }  // Zod errors
```

**Side Effects:** Revalidates `/dashboard`.

---

### `deleteTag(id: string)`

Deletes a tag and removes it from all applications.

**Returns:**
```typescript
{ success: true }
{ error: "Tag not found" }
```

**Side Effects:** Cascades to ApplicationTag records. Revalidates `/dashboard`.

---

### `getTags()`

Returns all tags for the current user.

**Returns:** `Tag[]` sorted by name ascending.

Returns empty array if not authenticated.
