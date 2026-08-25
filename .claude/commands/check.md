---
description: Typecheck and lint the working tree against the known-clean baseline
---

## 1. Objective

The pre-commit gate for the project. No test suite, and `npm run build` is slow — use this instead.

Six other commands end by calling this one, so it stays short: only the sections that do work are here.

## 2. Execution

```bash
npx tsc --noEmit
npm run lint
```

Report and stop. Don't fix what you find unless asked.

## 3. Verification — the baseline

`tsc` must be **completely silent**. Any output is a real error from the current change.

`npm run lint` is **not** clean on `main`. This baseline is pre-existing — don't fix it, don't report it as a finding:

| File | Issue |
|------|-------|
| `src/app/(auth)/register/page.tsx:50` | `react/no-unescaped-entities` |
| `src/components/notification-bell.tsx:122` | `react/no-unescaped-entities` |
| `src/components/analytics-charts.tsx:50` | `react-hooks/set-state-in-effect` |
| `src/components/date-picker.tsx:70` | `react-hooks/set-state-in-effect` |
| `src/app/dashboard/page.tsx:7` | unused `MobileNav` (warning) |

Total baseline: **4 errors, 1 warning**.

## 4. Limitations

Types and lint only. Nothing behind email, SMTP, cron, SSE, the database, or the browser is exercised. A caller reporting "`/check` passed" must not imply the change works at runtime.

## 5. Report

- Whether `tsc` was silent.
- Whether the lint count **matches** the baseline or **exceeds** it — say which, explicitly.
- Only problems outside the table, with `file:line`.
