# Activity Audit Trail — Frontend Documentation

## Components

### `ActivityTimeline` (`src/components/activity-timeline.tsx`)

**Type:** Client component

**Props:**
```typescript
{ activities: Activity[] }
```

**Features:**

**Filter Tabs:**
- All
- Created
- Status
- Notes
- Interviews
- Follow-ups

Each tab filters activities by type. "All" shows everything.

**Timeline Rendering:**
- Vertical timeline with colored dots per type
- Each entry: description text + relative timestamp ("2 hours ago", "3 days ago")
- Newest first (server already sorts by createdAt desc)

**Type → Dot Color:**
| Type | Color |
|------|-------|
| CREATED | green |
| STATUS_CHANGED | blue |
| NOTE_ADDED | purple |
| FOLLOW_UP_SET | amber |
| INTERVIEW_SCHEDULED | indigo |
| INTERVIEW_OUTCOME | depends on outcome |

---

## Page Integration

Activity timeline is rendered in the right column of the application detail page:

```tsx
// src/app/dashboard/applications/[id]/page.tsx
<div className="lg:col-span-2">
  <div className="lg:sticky lg:top-6">
    <h2>Activity</h2>
    <ActivityTimeline activities={JSON.parse(JSON.stringify(application.activities))} />
  </div>
</div>
```

Sticky on desktop so it stays visible while scrolling through notes and interviews.

---

## Files

| File | Role |
|------|------|
| `src/components/activity-timeline.tsx` | Timeline UI with filter tabs |
| `src/app/dashboard/applications/[id]/page.tsx` | Renders timeline in right column |
