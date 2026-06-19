# Analytics & Reporting — API Documentation

## Server Actions (`src/lib/actions/applications.ts`)

---

### `getApplicationStats()`

Returns aggregate metrics for the dashboard.

**Input:** None (uses session for user ID).

**Returns:**
```typescript
{
  total: number;           // non-archived application count
  statusCounts: {
    WISHLIST: number;
    APPLIED: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
    ARCHIVED: number;
  };
  interviewRate: number;   // (INTERVIEW + OFFER) / total * 100
  offerRate: number;       // OFFER / total * 100
  thisWeek: number;        // apps created in last 7 days
}
```

---

### `getCompanyStats()`

Returns per-company aggregation.

**Input:** None.

**Returns:**
```typescript
Array<{
  company: string;
  total: number;
  interviews: number;
  offers: number;
}>
```

Sorted by `total` descending.

---

### `exportApplicationsCsv()`

Generates a full CSV export of all applications.

**Input:** None.

**Returns:** `string` — Complete CSV content with headers.

**CSV Columns:**
| Column | Source |
|--------|--------|
| Company | `application.company` |
| Role | `application.role` |
| Status | `application.status` |
| Applied Date | `application.appliedDate` (YYYY-MM-DD or empty) |
| Follow-up Date | `application.followUpDate` (YYYY-MM-DD or empty) |
| Job URL | `application.jobUrl` or empty |
| Tags | Tag names joined with `;` |
| Notes | `application.notes` (commas → semicolons) |
| Created | `application.createdAt` (YYYY-MM-DD) |

**Note:** Includes archived applications (full export).
