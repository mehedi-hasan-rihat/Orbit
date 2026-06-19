# Follow-up Management — Frontend Documentation

## Components

### `FollowUps` (`src/components/follow-ups.tsx`)

**Type:** Client component

**Props:**
```typescript
{ applications: Application[] }
```

**Rendering Logic:**

Splits applications into two groups based on client's current date:
- **Overdue** (`followUpDate < today`): Red border, destructive text styling
- **Upcoming** (`followUpDate >= today`): Normal styling

Each entry shows:
- Company name
- Role
- Status badge
- Applied date
- Follow-up date
- Link to application detail

---

## Page Integration

### Dashboard (`src/app/dashboard/page.tsx`)

```tsx
const followUps = await getFollowUps();

{followUps.length > 0 && (
  <section>
    <h2>Follow-ups</h2>
    <FollowUps applications={JSON.parse(JSON.stringify(followUps))} />
  </section>
)}
```

Only rendered if there are follow-ups. Hidden when empty.

### Application Detail (`src/app/dashboard/applications/[id]/page.tsx`)

Overdue indicator in the hero section:

```tsx
const isOverdue = application.followUpDate && new Date(application.followUpDate) < new Date();

{isOverdue && (
  <span className="bg-red-100 text-red-600 ...">Follow-up overdue</span>
)}
```

---

## Files

| File | Role |
|------|------|
| `src/components/follow-ups.tsx` | Follow-up list with overdue/upcoming split |
| `src/app/dashboard/page.tsx` | Conditionally renders follow-ups section |
| `src/app/dashboard/applications/[id]/page.tsx` | Overdue badge |
