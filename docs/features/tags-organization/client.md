# Tags & Organization — Frontend Documentation

## Components

### `TagManager` (`src/components/tag-manager.tsx`)

**Type:** Client component

**Props:**
```typescript
{ tags: Tag[] }
```

**Features:**

**Create Form:**
- Name input (1–50 chars)
- Color picker: 8 preset color swatches
- Submit button

**Tag List:**
- Grid layout of existing tags
- Each tag: colored pill + delete button (visible on hover)
- Delete calls `deleteTag(id)` with confirmation

**Empty State:** Tips about how to use tags (e.g., "Remote", "Referral", "High Priority").

---

### Tag Selection in `ApplicationForm`

In the application create/edit form (`src/components/application-form.tsx`):

```tsx
{availableTags.map((tag) => (
  <button
    type="button"
    onClick={() => toggleTag(tag.id)}
    style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : undefined}
  >
    {tag.name}
  </button>
))}
```

- Multiselect via toggle buttons (pill-styled).
- Selected tags get filled background with tag color + white text.
- Unselected tags show border outline.
- Selection stored in local state, serialized as comma-separated IDs on submit.

---

### Tag Display

Tags appear in multiple places:
- **Application list** — small colored pills in the row
- **Application detail hero** — colored pills below role
- **Kanban cards** — not shown (space constraint)

---

## Pages

### Tags Page (`src/app/dashboard/tags/page.tsx`)

**Type:** Server component

```tsx
const tags = await getTags();
return <TagManager tags={JSON.parse(JSON.stringify(tags))} />;
```

Layout: tag manager (2/3) + usage tips sidebar (1/3).

---

## Files

| File | Role |
|------|------|
| `src/components/tag-manager.tsx` | Tag CRUD UI |
| `src/components/application-form.tsx` | Tag multiselect in form |
| `src/app/dashboard/tags/page.tsx` | Tags page |
