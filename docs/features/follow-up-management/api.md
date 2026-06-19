# Follow-up Management — API Documentation

## Server Actions

---

### `getFollowUps()`

**Module:** `src/lib/actions/applications.ts`

Returns applications with follow-up dates that are in active pipeline stages.

**Input:** None (uses session).

**Filters Applied:**
- User's own applications only
- Not archived
- Has a follow-up date
- Status NOT in [REJECTED, ARCHIVED]

**Returns:**
```typescript
Application[]  // with tags included, sorted by followUpDate ASC
```

---

## Related Actions

Follow-up dates are set via the general application CRUD actions:

- `createApplication(formData)` — accepts `followUpDate` field
- `updateApplication(id, formData)` — accepts `followUpDate` field, creates FOLLOW_UP_SET activity on change

There is no dedicated "set follow-up" action — it's part of the application form.
