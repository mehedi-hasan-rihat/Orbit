# Interview Management — Frontend Documentation

## Components

### `InterviewTracker` (`src/components/interview-tracker.tsx`)

**Type:** Client component

**Props:**
```typescript
{ applicationId: string, interviews: Interview[] }
```

**Features:**
- Displays a list of all interview rounds for the application.
- Each round shows: type badge, round number, scheduled date/time, outcome badge, notes.
- "Add Interview" button opens a form.
- Each interview has Edit and Delete actions.
- Outcome color coding: Pending (gray), Passed (green), Failed (red), Cancelled (amber).

**Form Fields (add/edit mode):**
- Type dropdown (8 options)
- Round number input
- Date/time picker for scheduling
- Notes textarea
- Outcome dropdown

**Behavior:**
1. User clicks "Add Interview"
2. Form appears inline or in modal
3. On submit: calls `createInterview(applicationId, formData)`
4. On success: `router.refresh()` to reload data
5. Edit: pre-fills form, calls `updateInterview(id, applicationId, formData)`
6. Delete: confirms, calls `deleteInterview(id, applicationId)`

---

## Page Integration

The interview tracker appears on the application detail page (`src/app/dashboard/applications/[id]/page.tsx`):

```tsx
const interviews = await getInterviews(id);
// ...
<InterviewTracker
  applicationId={application.id}
  interviews={JSON.parse(JSON.stringify(interviews))}
/>
```

The detail page also shows interview stats in the hero section:
- Total interview count
- Passed count
- Pending count

---

## Files

| File | Role |
|------|------|
| `src/components/interview-tracker.tsx` | Interview list + forms |
| `src/app/dashboard/applications/[id]/page.tsx` | Fetches and renders interviews |
