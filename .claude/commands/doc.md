---
description: Write documentation into the right file in this project's docs/
argument-hint: <topic> — e.g. the SSE notification flow
---

Document: **$ARGUMENTS**

Pick the right home — do not create a new file unless none of these fits, and say which you chose and why:

| File | Contains | Voice |
|------|----------|-------|
| `docs/README.md` | Project overview, tech stack, architecture summary, feature index | Formal, third-person, prose + tables |
| `docs/system-design.md` | Numbered deep-dive sections: architecture, data model, auth flow, data flow, routes, security, performance | Technical reference, diagrams and tables |
| `docs/issue-faced.md` | Interview talking points, incl. a numbered **"Hardest problems solved"** list | First-person, **quoted**, conversational |
| `AGENTS.md` | Rules for agents working in this repo (imported by `CLAUDE.md`) | Imperative, terse, "do / do NOT" |

Match the surrounding entries exactly — length, heading depth, and voice. `issue-faced.md` entries are quoted first-person and run a short paragraph; `system-design.md` sections are numbered with `###` subsections. An entry that reads differently from its neighbours is wrong even if the content is right.

Write what was **non-obvious**: the failure mode, the constraint, the reason a decision went the way it did. Don't restate what the code already says — no file listings, no retelling of function signatures.

Verify before you write. Every claim about behaviour must come from reading the code, not from the surrounding docs — parts of them have gone stale before.
