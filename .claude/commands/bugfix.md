---
description: Diagnose and fix a bug, root cause first
argument-hint: <symptom> — e.g. tag colors reset after edit
---

Bug: **$ARGUMENTS**

There is no test suite, so you cannot lean on a red test to prove the diagnosis. Establish the mechanism in the code before changing anything, and state it plainly. If you can't explain why the symptom happens, say so instead of guessing at a fix.

Check these first — every one of them has actually bitten this project, and all four produce symptoms that look like something else:

- **Works locally, flaky on Vercel** → a floated promise. The function instance is frozen when the response returns, killing in-flight async work silently and intermittently. Fix with `after()` from `next/server`, not by retrying. Writeup: `docs/issue-faced.md` #6.
- **Hydration mismatch / "renders differently on server"** → `Date` formatting, `Date.now()`, or DnD/chart internals in SSR. Gate on `useSyncExternalStore` (`src/components/kanban-board.tsx:48`). Do **not** reach for `useEffect` + `setState` — the ESLint config errors on it.
- **Data missing after submit** → the field isn't in the Zod schema in `src/lib/validations.ts`. `FormData` is parsed, not spread, so unknown fields vanish without error.
- **Stale UI after a mutation** → missing or too-narrow `revalidatePath()` in the action.

Also worth ruling out: a `Date` crossing the server→client boundary without `JSON.parse(JSON.stringify(...))`, and an import from `@prisma/client` instead of `@/generated/prisma/client`.

Fix the cause, not the symptom. Don't add defensive try/catch around something you haven't explained.

Verify with `/check`, then tell me what you couldn't verify without running the app — for anything touching email, SMTP, or cron, that's most of it.
