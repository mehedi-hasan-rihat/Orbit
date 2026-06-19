# Calendar — Frontend Documentation

## Components

### `CalendarView` (`src/components/calendar-view.tsx`)

**Type:** Client component

**Props:**
```typescript
{ events: CalendarEvent[] }
```

**Dependencies:** `react-calendar` library

**Layout:**
- Left (main): Interactive month calendar
- Right (sidebar): Upcoming 7-day event list

**Calendar Behavior:**
- Renders a monthly grid.
- Day cells show colored dots if events exist on that day:
  - Indigo dot = Interview
  - Amber dot = Follow-up
- Clicking a day selects it and shows events for that date below.
- Month navigation (prev/next).

**Selected Day Panel:**
- Shows all events for the selected date.
- Each event displays: title, company, role, type, time, status badge.
- Events link to `/dashboard/applications/[applicationId]`.

**Upcoming Sidebar:**
- Filters events where `date >= today` and `date <= today + 7 days`.
- Lists chronologically.
- Color-coded by type.
- Links to application detail.

---

## Page

### Calendar Page (`src/app/dashboard/calendar/page.tsx`)

**Type:** Server component

```tsx
const events = await getCalendarEvents();
return <CalendarView events={JSON.parse(JSON.stringify(events))} />;
```

---

## Files

| File | Role |
|------|------|
| `src/components/calendar-view.tsx` | Calendar UI + event display |
| `src/app/dashboard/calendar/page.tsx` | Server page fetching events |
| `src/lib/actions/calendar.ts` | Event aggregation action |
