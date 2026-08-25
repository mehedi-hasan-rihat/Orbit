# Pipeline — Frontend Documentation

## Components

### `PipelineManager` (`src/components/pipeline-manager.tsx`)

**Type:** Client component

**Props:**
```typescript
{ stageTypes: Array<{ id, name, color, category, order, enabled, usageCount, applicationCount }> }
```

**Renders:**

1. **Add form** — colour swatch, name input, category select, submit.
2. **Stage rows** — colour dot, name, a summary line (`category · N applications · N rounds · hidden`), and Edit / Hide / Delete controls.
3. **Inline editor** — the row swaps in place for colour, name, and category inputs; there is no modal.

**Behaviour:**
- Delete is blocked client-side when `applicationCount > 0`, with the same message the server would return. The server check is the real one; this just avoids a pointless round-trip.
- Every mutation calls `router.refresh()` on success.
- A single `error` string renders above the list, sourced from either a field error or a plain-string error via a shared `readError()` helper.

---

## Page

### `/dashboard/pipeline` (`src/app/dashboard/pipeline/page.tsx`)

**Type:** Server component

Fetches `getStageTypesWithUsage()` and renders `PipelineManager` in a two-column
layout matching the Tags page: manager on the left, explanatory sidebar on the right
covering how stages map to the board, what the outcome vocabulary is, and the
difference between hiding and deleting.

---

## Where stages surface elsewhere

| Component | Use |
|-----------|-----|
| `KanbanBoard` | Enabled stages become columns, in order, with their colours |
| `StatusBadge` | Renders the stage name and colour; falls back to the legacy status |
| `ApplicationsList` | Filter dropdown options |
| `ApplicationForm` | Stage select |
| `QuickActions` | "Move to stage" menu |
| `AnalyticsCharts` | Bar and pie series, coloured per stage |
| `InterviewTracker` | Round type picker, plus inline stage creation |

Because these all read the same rows, a rename or recolour is consistent everywhere
without a shared colour constant.
