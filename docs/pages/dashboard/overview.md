# Dashboard Page — Overview

**Route:** `/dashboard`

**File:** `src/app/dashboard/page.tsx`

## Purpose

The dashboard is the main landing page after login. It provides a high-level view of the entire job search:
- **Analytics** — total applications, interview rate, offer rate, stage distribution
- **Kanban board** — visual pipeline with drag-and-drop
- **Follow-ups** — upcoming and overdue reminders
- **Recent applications** — table of last 5 applications

## Data Sources

The page calls these server actions on load:
- `getKanbanData()` — per-stage count + 5 preview applications
- `getApplications()` — all applications (for the recent table)
- `getApplicationStats()` — aggregated metrics
- `getFollowUps()` — applications with follow-up dates
- `getStageTypes()` — pipeline stage catalogue

## Components

| Component | Purpose | Type |
|-----------|---------|------|
| `AnalyticsCharts` | Bar chart (stage distribution) + metrics grid | Client |
| `KanbanBoard` | Drag-and-drop pipeline view | Client |
| `FollowUps` | Follow-up reminder list | Client |
| Recent Applications Table | Last 5 applications | Server |

## Layout

Vertical sections, separated by `space-y-10`:
1. Analytics (always visible)
2. Follow-ups (conditional — only if `followUps.length > 0`)
3. Kanban board (always visible)
4. Recent applications (always visible)

## Features

- [Kanban Board](./kanban-board/)
- Analytics Charts (pending)
- Follow-ups Widget (pending)
