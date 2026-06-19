# Kanban Board — Business Requirements

## Overview

A visual pipeline on the dashboard where users drag application cards between columns to manage status.

---

## User Stories

- As a user, I see my active applications organized in columns by status on the dashboard.
- As a user, I can drag an application card from one column to another to update its status.
- As a user, I see the change reflected immediately (before server confirms).
- As a user, I see the count of applications in each column header.

---

## Columns

| Column | Color | Statuses Included |
|--------|-------|-------------------|
| Wishlist | Gray | WISHLIST |
| Applied | Blue | APPLIED |
| Interview | Amber | INTERVIEW |
| Offer | Green | OFFER |
| Rejected | Red | REJECTED |

Note: ARCHIVED applications are excluded from the Kanban board.

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| Dashboard loads | 5 columns shown with apps distributed by status |
| Drag card from Applied to Interview | Card moves instantly, server updates, activity logged |
| Drop card in same column | No change, no server call |
| Column has 0 items | Column still visible with count "0" |
| Drag initiated | Floating overlay card appears |
