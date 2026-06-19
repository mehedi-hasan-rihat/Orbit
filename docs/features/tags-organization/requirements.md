# Tags & Organization — Business Requirements

## Overview

Users create custom color-coded tags to organize and categorize their applications.

---

## User Stories

- As a user, I can create custom tags with a name and color.
- As a user, I can assign multiple tags to any application.
- As a user, I can filter my application list by tag.
- As a user, I can delete tags I no longer need.
- As a user, I can manage all my tags on a dedicated page.

---

## Constraints

- Tag names must be unique per user (case-sensitive).
- Tag name: 1–50 characters.
- Tag color: valid hex (#RRGGBB).
- Deleting a tag removes it from all applications.

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Create tag "Remote" with blue | Tag created, appears in list |
| Create duplicate "Remote" | Error: "Tag already exists" |
| Assign tag to application | Tag pill appears on app |
| Filter by tag | Only matching applications shown |
| Delete tag | Tag removed from all applications |
| Tag name > 50 chars | Validation error |
| Invalid hex color | Validation error |
