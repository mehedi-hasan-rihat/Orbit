---
description: Typecheck and lint the working tree against the known-clean baseline
---

There is no test suite in this project. `npm run build` is slow (it runs `prisma generate` first), so use this as the pre-commit gate instead.

Run both:

```bash
npx tsc --noEmit
npm run lint
```

`tsc` must be completely silent. Any output is a real error introduced by the current change.

`npm run lint` is **not** clean on `main`. This baseline is pre-existing — do not fix these unless asked, and do not report them as findings:

| File | Issue |
|------|-------|
| `src/app/(auth)/register/page.tsx:50` | `react/no-unescaped-entities` |
| `src/components/notification-bell.tsx:122` | `react/no-unescaped-entities` |
| `src/components/analytics-charts.tsx:50` | `react-hooks/set-state-in-effect` |
| `src/components/date-picker.tsx:70` | `react-hooks/set-state-in-effect` |
| `src/app/dashboard/page.tsx:7` | unused `MobileNav` (warning) |

Total baseline: **4 errors, 1 warning**. Report only problems outside this table, and say explicitly whether the count matches the baseline or exceeds it.
