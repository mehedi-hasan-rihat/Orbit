# Application Tracking — Frontend

## Pages

### Applications List Page

**Type:** Server component

Reads URL search parameters (`search`, `status`, `sort`, `tag`, `archived`) and passes them to `getApplications()` and `getTags()` in parallel. Serialises the results and passes them to the `ApplicationsList` client component.

---

### Application Detail Page

**Type:** Server component

Reads the application ID from the route parameters. Calls `getApplication(id)` and `getInterviews(id)` in parallel. Returns a 404 response if the application does not exist or does not belong to the current user.

**Page sections:**
- **Hero** — Company name, role, status badge, overdue follow-up indicator, tags, and job URL link.
- **Stats strip** — Applied date, follow-up date, interview count (passed and pending), and last updated timestamp.
- **Left column** — Notes editor and interview tracker.
- **Right column** — Activity timeline (sticky on desktop scroll).

---

## Components

### ApplicationsList

**Type:** Client component

Renders the filter bar and application list. The filter bar contains a search input, status dropdown, sort dropdown, and active/archived tab toggle. Changing any filter updates the URL query string, which triggers a server re-render with fresh data.

On desktop, applications are displayed in a table layout (Company, Role, Status, Applied Date, Actions). On mobile, a card layout is used. Each row provides Edit, View, Delete, and Quick Actions options.

---

### ApplicationForm

**Type:** Client component (modal overlay)

Used for both creating and editing applications. In create mode, performs a debounced duplicate check (500ms) as the user types the company and role. Renders fields for all application properties including a tag multiselect and custom date pickers. Calls `createApplication()` or `updateApplication()` on submission and refreshes the page on success.

---

### InlineNoteEditor

**Type:** Client component

Displays the current notes for an application. An "Add Note" button reveals a textarea. On submission, calls `addQuickNote(id, text)` and refreshes the page.

---

### ExportButton

**Type:** Client component

Calls `exportApplicationsCsv()`, creates a Blob from the returned CSV string, and programmatically triggers a file download named `orbit-applications-YYYY-MM-DD.csv`.

---

### StatusBadge

**Type:** Client component

Renders a colour-coded pill badge for a given application status. Colour mapping: Wishlist → grey, Applied → blue, Screening → purple, Interview → amber, Offer → green, Rejected → red.

---

### QuickActions

**Type:** Client component (dropdown menu)

Provides quick access to: move to a different stage, add a note, archive or unarchive the application. Rendered via a React portal into `document.body` with dynamic positioning to prevent clipping in overflow containers.

---

### DatePicker

**Type:** Client component

A custom calendar widget with month navigation, a day grid, a "Today" shortcut, and a "Clear" option. Returns an ISO date string via a hidden input field.

---

## Data Flow

```
Server Page
  ├── getApplications(urlParams) → Application[]
  ├── getTags() → Tag[]
  └── Renders ApplicationsList(props)
        ├── User changes filter or sort
        │   └── URL params updated → server re-renders with new data
        ├── User opens create or edit form
        │   └── ApplicationForm modal → createApplication / updateApplication
        │         └── router.refresh() on success
        └── User deletes or archives
              └── deleteApplication / archiveApplication
                    └── router.refresh() on success
```
