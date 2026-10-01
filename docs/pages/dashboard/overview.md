# Dashboard Page — Overview

**Route:** `/dashboard`  
**File:** `src/app/dashboard/page.tsx`

---

## Purpose

The dashboard is the main landing page after login. It gives a high-level view of the entire job search:

- **Due today** — scheduled stages and overdue reminders that need attention.
- **Analytics** — total applications, interview rate, offer rate, weekly count, stage distribution chart.
- **Kanban board** — visual drag-and-drop pipeline grouped by stage.
- **Recent applications** — the 5 most recently added applications.

---

## Data Sources

All data is fetched server-side before render. The page calls:

| Action | Purpose |
|--------|---------|
| `getKanbanData()` | Per-stage count + 5 preview cards |
| `getApplications({ sort: "createdAt" })` | Last 5 applications for the recent table |
| `getApplicationStats()` | Aggregated metrics (totals, rates, weekly) |
| `getDueItems()` | Scheduled stages due today/overdue + reminders due today |
| `getStageTypes()` | Stage catalogue (passed to KanbanBoard and ApplicationForm) |
| `getTags()` | Tag catalogue (passed to ApplicationForm) |

---

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `KanbanBoard` | Client | Drag-and-drop pipeline board |
| `AnalyticsCharts` | Client | Metrics grid + stage distribution bar chart |
| `QuickActions` | Client | "New Application" button that opens ApplicationForm |
| Due Today section | Server-rendered | Scheduled stage cards + reminder cards |
| Recent Applications table | Server-rendered | Last 5 applications with stage badge |

---

## Layout

Top-to-bottom sections separated by `space-y-10`:

1. **Header row** — page title + QuickActions (New Application button).
2. **Due Today** — conditional; only shown if `dueItems.scheduled.length > 0 || dueItems.reminders.length > 0`.
3. **Analytics** — always shown.
4. **Kanban board** — always shown.
5. **Recent applications** — always shown.

---

## Due Today Logic

`getDueItems()` returns two lists:

- **scheduled** — applications where `stageScheduledAt <= end of today` AND `stageOutcome` is `null`, `SCHEDULED`, or `ASSIGNED` (open outcomes only). Sorted by `stageScheduledAt asc`.
- **reminders** — `Reminder` rows where `dueAt <= end of today` AND `done = false`. Sorted by `dueAt asc`.

The section title changes based on whether items are overdue vs due today.

---

## Kanban Board Behaviour

- Columns are the user's enabled `PipelineStageType` rows in `order asc` order.
- Each column shows: count badge, up to 5 application cards, a "+X more" link if count > 5.
- Drag-and-drop calls `updateApplicationStage(id, stageId)` on drop, which clears `stageOutcome` and `stageScheduledAt` for the moved application.
- Optimistic state: the board updates immediately client-side; the server revalidates in the background.
