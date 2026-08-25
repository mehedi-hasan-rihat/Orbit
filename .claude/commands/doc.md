---
description: Write documentation into the right file in this project's docs/
argument-hint: <topic> — e.g. the SSE notification flow
---

Document: **$ARGUMENTS**

## 1. Objective

Write the non-obvious part of this topic into the file where it belongs, in that file's voice.

## 2. Input / Scope

One entry in one existing file. Don't restructure the docs.

## 3. Context — pick the right home

Don't create a new file unless none of these fits, and **say which you chose and why**:

| File | Contains | Voice |
|------|----------|-------|
| `docs/README.md` | Project overview, tech stack, architecture summary, feature index | Formal, third-person, prose + tables |
| `docs/system-design.md` | Numbered deep-dive sections: architecture, data model, auth flow, data flow, routes, security, performance | Technical reference, diagrams and tables |
| `docs/issue-faced.md` | Interview talking points, incl. a numbered **"Hardest problems solved"** list | First-person, **quoted**, conversational |
| `AGENTS.md` | Rules for agents working in this repo (imported by `CLAUDE.md`) | Imperative, terse, "do / do NOT" |

## 4. Investigation

**Verify before you write.** Every claim about behaviour comes from reading the code, not the surrounding docs — parts of them have gone stale before.

Then read the neighbouring entries to learn the file's shape.

## 5. Pattern / Constraints

Match the neighbours exactly — length, heading depth, voice. `issue-faced.md` entries are quoted first-person, a short paragraph; `system-design.md` sections are numbered with `###` subsections. **An entry that reads differently from its neighbours is wrong even if the content is right.**

Write what was **non-obvious**: the failure mode, the constraint, the reason a decision went the way it did. Don't restate the code — no file listings, no function signatures.

## 6. Analysis

Before writing, state the one thing a reader couldn't get from the code itself. That is the entry. If there isn't one, say so rather than padding.

## 7. Decision

Name the target file and why, plus any claim you verified that contradicts the existing docs.

## 8. Execution

Write the entry into the chosen file. Don't touch other entries.

## 9. Verification

Re-read it beside its neighbours: voice, length, heading depth. Confirm every claim traces to a file you actually read; cite `file:line` where it helps.

## 10. Limitations

State any claim documented from reading alone, without exercising the behaviour — email, cron, SSE, production-only paths.

## 11. Report

**Target file** — and why
**Written** — what the entry covers
**Stale docs found** — existing claims the code contradicts, or "None"
**Not verified** — claims unconfirmed at runtime
