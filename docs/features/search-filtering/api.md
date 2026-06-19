# Search & Filtering — API Documentation

## Server Action

### `getApplications(params?)`

**Module:** `src/lib/actions/applications.ts`

The same action used for the application list, accepting optional filter params.

**Input:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | undefined | Text search (company/role, case-insensitive contains) |
| status | string | undefined | Status filter ("ALL" = no filter) |
| sort | string | "createdAt" | Sort field |
| tag | string | undefined | Tag ID filter |
| archived | boolean | false | Show archived apps |

**Sort values and their Prisma mapping:**

| Value | orderBy |
|-------|---------|
| `"createdAt"` | `{ createdAt: "desc" }` |
| `"updatedAt"` | `{ updatedAt: "desc" }` |
| `"company"` | `{ company: "asc" }` |
| `"appliedDate"` | `{ appliedDate: "desc" }` |
| `"followUpDate"` | `{ followUpDate: "asc" }` |

**Returns:** `Application[]` with tags included (via `include: { tags: { include: { tag: true } } }`).
