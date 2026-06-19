# Analytics & Reporting — Frontend Documentation

## Components

### `AnalyticsCharts` (`src/components/analytics-charts.tsx`)

**Type:** Client component

**Props:**
```typescript
{
  stats: {
    total: number;
    statusCounts: { WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED, ARCHIVED: number };
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

2. **Bar Chart** (if total > 0):
   - Library: Recharts `BarChart`
   - X-axis: status names
   - Y-axis: count
   - Each bar colored by status
   - Tooltip on hover

3. **Pie Chart** (if total > 0):
   - Library: Recharts `PieChart`
   - Donut style (innerRadius=60, outerRadius=100)
   - Legend below chart
   - Only shows statuses with count > 0

4. **Empty State** (if total = 0):
   - "No data yet" message with guidance

**Color Map:**
```
WISHLIST  → #6b7280 (gray)
APPLIED   → #3b82f6 (blue)
INTERVIEW → #f59e0b (amber)
OFFER     → #22c55e (green)
REJECTED  → #ef4444 (red)
```

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
