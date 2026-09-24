# Orbit — Product Requirements Document

## Problem Statement

Job seekers managing multiple simultaneous applications face a fragmented experience: applications are scattered across email threads, spreadsheets, and memory. There is no proactive reminder system, no visual pipeline, and no way to measure progress objectively.

## Goals

- Give users a single place to track every job application through their entire lifecycle.
- Let users define their own pipeline stages instead of forcing a fixed status set.
- Surface actionable follow-up reminders automatically.
- Measure the job search with real metrics: interview rate, offer rate, weekly velocity.
- Be fast and low-friction — adding an application should take under 30 seconds.

## Non-Goals

- Job discovery or job board integration.
- Collaborative / team features.
- Native mobile app (responsive web only).

## Users

Single user per account. No roles, no organisations. All data is private and scoped to the authenticated user.

## Core Features

| Feature | Description |
|---------|-------------|
| Application tracking | Add, edit, archive, close applications with company, role, stage, notes, tags |
| Custom pipeline | User-defined stage catalogue — the columns on the Kanban board |
| Kanban board | Drag-and-drop board showing applications grouped by stage |
| Interview management | Per-round tracking inside an application |
| Follow-up reminders | Date-based reminders with in-app and email notifications |
| Analytics | Interview rate, offer rate, stage distribution, weekly velocity |
| Calendar | Month view of all scheduled interviews and follow-ups |
| Tags | Colour-coded labels for cross-cutting organisation |
| Export | CSV export of all applications |

## Success Metrics

- User can add and view their first application without confusion.
- Kanban board renders quickly regardless of application count.
- Follow-up reminders are delivered reliably via email and in-app SSE.
- No data loss — closed/archived applications preserve their full history.
