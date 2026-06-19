# Analytics & Reporting — Business Requirements

## Overview

The dashboard provides visual analytics about the user's job search progress. Users can also export data as CSV.

---

## User Stories

### Dashboard Metrics
- As a user, I see key metrics at a glance: total applications, this week's count, interview rate, offer rate.
- As a user, I see a bar chart showing applications by status.
- As a user, I see a pie chart showing status distribution.

### Company Statistics
- As a user, I can view a table of all companies I've applied to with counts of applications, interviews, and offers.

### CSV Export
- As a user, I can download all my applications as a CSV file.
- The file includes all relevant fields and tags.

---

## Metrics Definitions

| Metric | Formula |
|--------|---------|
| Total | Count of non-archived applications |
| This Week | Apps where createdAt >= 7 days ago |
| Interview Rate | (INTERVIEW + OFFER) / Total × 100 |
| Offer Rate | OFFER / Total × 100 |

---

## Acceptance Criteria

| Scenario | Expected |
|----------|----------|
| User has 0 applications | Shows "No data yet" message |
| User has applications | 5 metric cards + 2 charts |
| Export CSV | Downloads file with all apps (including archived) |
| Company page | Table sorted by total applications desc |
