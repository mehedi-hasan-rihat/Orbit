# Search & Filtering — Business Requirements

## Overview

The application list supports full-text search, status filtering, tag filtering, sorting, and an active/archived toggle.

---

## User Stories

- As a user, I can search applications by company name or role.
- As a user, I can filter by a specific pipeline status.
- As a user, I can filter by a tag.
- As a user, I can sort my list by different criteria.
- As a user, I can switch between active and archived views.
- As a user, my filters are reflected in the URL (bookmarkable).

---

## Filter Options

### Search
- Case-insensitive partial match on company OR role.
- Applied as the user types (URL update triggers server re-render).

### Status Filter
- Options: All, Wishlist, Applied, Interview, Offer, Rejected.
- Single-select dropdown.

### Tag Filter
- Options: All tags + "All" option.
- Single-select dropdown.

### Sort
| Option | Order |
|--------|-------|
| Newest | createdAt desc |
| Recently Updated | updatedAt desc |
| Company | A-Z alphabetical |
| Applied Date | newest applied first |
| Follow-up Date | soonest first |

### View Toggle
- Active (default): `archived = false`
- Archived: `archived = true`

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Search "goo" | Shows apps where company or role contains "goo" |
| Filter status = INTERVIEW | Only interview-stage apps shown |
| Filter by tag "Remote" | Only apps tagged "Remote" shown |
| Sort by Company | Alphabetical order |
| Switch to Archived tab | Shows only archived apps |
| Clear all filters | Shows all active apps, newest first |
| URL reflects filters | Sharable/bookmarkable |
