# Kanban Board — Requirements

## Overview

The Kanban board provides a visual pipeline on the main dashboard. Users can see all active applications organised by status and drag cards between columns to update their stage.

---

## User Stories

- As a user, I see my active applications organised in columns by pipeline status on the dashboard.
- As a user, I can drag an application card from one column to another to update its status.
- As a user, the status change is reflected immediately before the server confirms it.
- As a user, I see the count of applications in each column header.
- As a user, I can drag cards on touch devices as well as with a mouse.

---

## Columns

| Column | Colour | Status |
|--------|--------|--------|
| Wishlist | Grey | WISHLIST |
| Applied | Blue | APPLIED |
| Screening | Purple | SCREENING |
| Interview | Amber | INTERVIEW |
| Offer | Green | OFFER |
| Rejected | Red | REJECTED |

Archived applications are excluded from the Kanban board.

---

## Acceptance Criteria

| Scenario | Expected Outcome |
|----------|-----------------|
| Dashboard loads | Six columns shown with applications distributed by status |
| Drag card from Applied to Interview | Card moves instantly; server updates status; STATUS_CHANGED activity logged |
| Drop card in same column | No change; no server call made |
| Column has zero items | Column still visible with count "0" |
| Drag initiated | A floating overlay card appears following the cursor |
| Touch device | 200ms hold initiates drag; normal tap navigates to detail page |
