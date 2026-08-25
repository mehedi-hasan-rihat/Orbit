# Analytics & Reporting — Frontend Documentation

## Components

### `AnalyticsCharts` (`src/components/analytics-charts.tsx`)

**Type:** Client component

**Props:**
```typescript
{
  stats: {
    total: number;
    stageCounts: Array<{ id, name, color, category: string, value: number }>;
    interviewing: number;
    offers: number;
    interviewRate: number;
    offerRate: number;
    thisWeek: number;
  }
}
```

**Renders:**

1. **5 Metric Cards** (grid):
   - Total applications
   - This Week count
   - Interviews count
   - Interview Rate (%)
   - Offer Rate (%)

2. **Bar Chart — "Applications by Stage"** (if total > 0):
   - Library: Recharts `BarChart`
   - X-axis: stage names, in the user's pipeline order
   - Y-axis: count
   - Each bar filled with the stage's own colour
   - Tooltip on hover
   - Empty stages are filtered out — with a fully custom pipeline the axis would otherwise fill with zero-height columns

3. **Pie Chart — "Stage Distribution"** (if total > 0):
   - Library: Recharts `PieChart`
   - Donut style (innerRadius=60, outerRadius=100)
   - Legend below chart
   - Shares the same filtered dataset as the bar chart

4. **Empty State** (if total = 0):
   - "No data yet" message with guidance

**Colours:** none are defined in this component. Each bar and slice uses the hex
colour stored on the stage, so the charts, the board columns, and the status badges
all stay in agreement without a shared constant.

---

### `ExportButton` (`src/components/export-button.tsx`)

**Type:** Client component

**Behavior:**
1. User clicks "Export CSV"
2. Calls `exportApplicationsCsv()` server action
3. Creates `new Blob([csvString], { type: "text/csv" })`
4. Creates object URL
5. Programmatically triggers download
6. Filename: `orbit-applications-YYYY-MM-DD.csv`

---

## Pages

### Dashboard (`src/app/dashboard/page.tsx`)

Renders analytics at the top of the page:
```tsx
const stats = await getApplicationStats();
<AnalyticsCharts stats={stats} />
```

### Companies (`src/app/dashboard/companies/page.tsx`)

Renders a table with:
- Company name
- Total applications
- Interviews
- Offers
- Interview rate per company

Data from `getCompanyStats()`.

---

## Files

| File | Role |
|------|------|
| `src/components/analytics-charts.tsx` | Charts + metric cards |
| `src/components/export-button.tsx` | CSV download |
| `src/app/dashboard/page.tsx` | Dashboard with analytics |
| `src/app/dashboard/companies/page.tsx` | Company stats table |
