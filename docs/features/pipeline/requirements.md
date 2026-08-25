# Pipeline — Business Requirements

## Overview

Users define the stages their applications move through. The same stages are the Kanban board's columns, the application list's filter options, the status badges, the analytics distribution, and the types an interview round can be filed under.

---

## User Stories

- As a user, I get a sensible default pipeline without configuring anything.
- As a user, I can add a stage with my own name, colour, and category.
- As a user, I can rename a stage, and every application and interview round already using it follows the new name.
- As a user, I can recolour a stage and see it change on the board, the badges, and the charts at once.
- As a user, I can hide a stage I no longer use without disturbing anything filed under it.
- As a user, I can delete a stage that nothing is using.
- As a user, I am told why a stage cannot be deleted rather than losing the applications in it.

---

## Stage Fields

| Field | Purpose |
|-------|---------|
| Name | Display label, unique per user |
| Colour | Hex value used by the board column, status badge, and charts |
| Category | `OPEN`, `INTERVIEWING`, `SUCCESS`, or `CLOSED` — what the metrics are computed from |
| Order | Position on the board |
| Enabled | Whether it appears as a board column |

Round numbers and interview outcomes are **not** customisable. Outcomes are a fixed vocabulary of eight; only stage types are user-owned.

---

## Constraints

- Stage names must be unique per user.
- Stage name: 1–100 characters.
- Stage colour: valid hex (#RRGGBB).
- A stage holding applications cannot be deleted — it must be emptied or hidden.
- Defaults are seeded on first read, so users who predate the feature get a pipeline too.

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| New user opens the board | Nine default columns, Withdrawn and Archived seeded hidden |
| Rename "Offer" to "Got the job" | Board column, badges, and charts all update; offer rate is unchanged |
| Add a stage with category `INTERVIEWING` | It appears on the board and in the interview round type picker |
| Add a stage with category `CLOSED` | It appears on the board; applications in it stop generating follow-up reminders |
| Hide a stage holding applications | Column disappears; the applications keep the stage and still show its badge |
| Delete a stage holding applications | Refused, with a message naming the count |
| Delete a stage used only by interview rounds | Succeeds; those rounds keep the name as a plain label |
