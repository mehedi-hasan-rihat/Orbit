# Application Tracking — Frontend Documentation

## Pages

### Applications List (`src/app/dashboard/applications/page.tsx`)

**Type:** Server component

**Behavior:**
1. Reads URL search params: `search`, `status`, `sort`, `tag`, `archived`.
2. Calls `getApplications(params)` and `getTags()` in parallel.
3. Serializes data and passes to `ApplicationsList` client component.

---

### Application Detail (`src/app/dashboard/applications/[id]/page.tsx`)

**Type:** Server component

**Behavior:**
1. Reads `id` from route params.
2. Calls `getApplication(id)` and `getInterviews(id)` in parallel.
3. Returns `notFound()` if application doesn't exist.
4. Renders: breadcrumb, hero section, stats strip, notes editor, interview tracker, activity timeline.

**Sections:**
- **Hero** — Company name, status badge, overdue indicator, tags, job URL link.
- **Stats Strip** — Applied date, follow-up date, interview count (passed/pending), last updated.
- **Left Column (3/5)** — Notes editor + Interview tracker.
- **Right Column (2/5)** — Activity timeline (sticky on scroll).

---

## Components

### `ApplicationsList` (`src/components/applications-list.tsx`)

**Type:** Client component

**Props:**
```typescript
{
  applications: Application[];
  availableTags: Tag[];
  search: string;
  status: string;
  sort: string;
  showArchived: boolean;
}
```

**Features:**
- Search input (updates URL param on change)
- Status dropdown filter
- Sort dropdown
- Active/Archived tab toggle
- New Application button (opens modal)
- Desktop: table layout (Company, Role, Status, Applied Date, Actions)
- Mobile: card layout
- Per-row actions: Edit, View, Delete, Quick Actions dropdown

---

### `ApplicationForm` (`src/components/application-form.tsx`)

**Type:** Client component (modal overlay)

**Props:**
```typescript
{
  application?: ExistingApp;  // if editing
  availableTags: Tag[];
  onClose: () => void;
}
```

**Features:**
- Create or Edit mode (determined by presence of `application` prop)
- Fields: company, role, jobUrl, status (dropdown), appliedDate (DatePicker), followUpDate (DatePicker), notes (textarea)
- Tag multiselect (pill buttons)
- Duplicate warning with debounced check (500ms)
- Loading state on submit
- Field-level error display

**Flow:**
1. User fills form
2. On company/role change (create mode): debounced `checkDuplicate()` call
3. On submit: calls `createApplication()` or `updateApplication()`
4. On success: `router.refresh()` + `onClose()`
5. On error: displays field errors

---

### `InlineNoteEditor` (`src/components/inline-note-editor.tsx`)

**Type:** Client component

**Props:** `{ applicationId: string, currentNotes: string | null }`

**Features:**
- Displays current notes or "No notes yet"
- "Add Note" button toggles a textarea
- Calls `addQuickNote(id, text)` on submit
- Refreshes page data after save

---

### `ExportButton` (`src/components/export-button.tsx`)

**Type:** Client component

**Behavior:**
1. Calls `exportApplicationsCsv()` server action
2. Creates a Blob from the CSV string
3. Generates download URL
4. Triggers file download: `orbit-applications-YYYY-MM-DD.csv`

---

### `StatusBadge` (`src/components/status-badge.tsx`)

**Type:** Client component

**Props:** `{ status: string }`

Renders a colored pill badge. Color mapping:
- WISHLIST → gray
- APPLIED → blue
- INTERVIEW → amber
- OFFER → green
- REJECTED → red

---

### `QuickActions` (`src/components/quick-actions.tsx`)

**Type:** Client component (dropdown menu)

**Actions:**
- Move to stage (5 status options)
- Add note (inline input)
- Schedule interview (link to detail page)
- Archive/Unarchive

---

### `DatePicker` (`src/components/date-picker.tsx`)

**Type:** Client component

**Props:** `{ id, name, placeholder, value? }`

Custom calendar widget with:
- Month/year navigation
- Day grid
- "Today" button
- "Clear" button
- Returns ISO date string via hidden input

---

## Data Flow

```
Server Page
  ├── getApplications(urlParams) → Application[]
  ├── getTags() → Tag[]
  └── Renders ApplicationsList(props)
        ├── User interacts (filter, search, sort)
        │   └── Updates URL params → page re-renders server-side
        ├── User clicks "New" or "Edit"
        │   └── ApplicationForm modal opens
        │         └── Calls createApplication / updateApplication
        │               └── router.refresh() → server re-fetches
        └── User clicks Delete / Archive
              └── Calls deleteApplication / archiveApplication
                    └── router.refresh()
```
