# Kanban Board — Requirements

## Overview

The Kanban board provides a visual pipeline on the main dashboard. Users can see all active applications organised by stage and drag cards between columns to move them. The columns are the user's own pipeline stages, not a fixed set.

---

## User Stories

- As a user, I see my active applications organised in columns by pipeline stage on the dashboard.
- As a user, I can drag an application card from one column to another to move it to that stage.
- As a user, the stage change is reflected immediately before the server confirms it.
- As a user, I see the count of applications in each column header.
- As a user, I can drag cards on touch devices as well as with a mouse.
- As a user, the columns reflect the stages I defined on the Pipeline page, in my order and my colours.
- As a user, stages I have hidden do not take up a column, but applications already in them are unaffected.

---

## Columns

Columns are generated from the user's enabled `PipelineStageType` rows, ordered by their `order` field, each rendered with the colour the user chose. There is no fixed column set.

New accounts are seeded with a default pipeline that reproduces the previous fixed columns:

| Stage | Colour | Category |
|-------|--------|----------|
| Wishlist | Grey | OPEN |
| Applied | Blue | OPEN |
| Screening | Purple | INTERVIEWING |
| Interview | Amber | INTERVIEWING |
| Technical Interview | Sky | INTERVIEWING |
| HR | Pink | INTERVIEWING |
| Assessment | Teal | INTERVIEWING |
| Offer | Green | SUCCESS |
| Rejected | Red | CLOSED |
| Withdrawn | Orange | CLOSED (hidden) |
| Archived | Slate | CLOSED (hidden) |

Withdrawn and Archived are seeded hidden, so a new board opens with nine columns rather than surfacing every terminal state.

Archived applications are excluded from the Kanban board.

---

## Acceptance Criteria

| Scenario | Expected Outcome |
|----------|-----------------|
| Dashboard loads | One column per enabled stage, in the user's order, applications distributed by stage |
| Drag card from Applied to Interview | Card moves instantly; server updates `stageId`; STATUS_CHANGED activity logged |
| User renames a stage | Column header changes; no application rows are touched, since cards reference the stage row |
| User hides a stage holding cards | Column disappears; the applications keep that stage and still show its badge elsewhere |
| Drop card in same column | No change; no server call made |
| Column has zero items | Column still visible with count "0" |
| Drag initiated | A floating overlay card appears following the cursor |
| Touch device | 200ms hold initiates drag; normal tap navigates to detail page |
