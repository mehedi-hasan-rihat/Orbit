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
  stageCounts: Array<{     // one entry per stage, in the user's pipeline order
    id: string;
    name: string;
    color: string;
    category: StageCategory;
    value: number;
  }>;
  interviewing: number;    // applications in an INTERVIEWING stage
  offers: number;          // applications in a SUCCESS stage
  interviewRate: number;   // (interviewing + offers) / total * 100
  offerRate: number;       // offers / total * 100
  thisWeek: number;        // apps created in last 7 days
}
```

`stageCounts` includes stages with a `value` of `0` — the caller decides whether to
drop them. Rates are derived from `StageCategory`, never from stage names, so they
survive a rename or a custom stage.

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
| Status | Stage name (`application.stage.name`), falling back to the legacy `status` for pre-pipeline rows. The header is still `Status` — it is an external format and renaming the column would break existing spreadsheets. |
| Applied Date | `application.appliedDate` (YYYY-MM-DD or empty) |
| Follow-up Date | `application.followUpDate` (YYYY-MM-DD or empty) |
| Job URL | `application.jobUrl` or empty |
| Tags | Tag names joined with `;` |
| Notes | `application.notes` (commas → semicolons) |
| Created | `application.createdAt` (YYYY-MM-DD) |

**Note:** Includes archived applications (full export).
