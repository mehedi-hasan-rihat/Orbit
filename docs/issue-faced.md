# Orbit — Interview Talking Points

## One-liner

"I built a full-stack job application tracker that helps users manage their entire job search pipeline with drag-and-drop, interview tracking, analytics, and calendar integration."

---

## What it does (30 sec)

"Users sign up, add job applications, and track them through stages — from wishlist to offer. It has a Kanban board for visual pipeline management, interview round tracking with scheduling, follow-up reminders, analytics with conversion rates, tagging, and CSV export. Everything is responsive and works on mobile."

---

## Tech decisions (why, not just what)

| Decision | Why |
|----------|-----|
| Next.js 16 App Router + Server Actions | No separate API layer — mutations happen server-side directly from components. Simpler architecture, fewer files. |
| JWT access tokens (15min) + refresh tokens in DB | Stateless JWT for speed, refresh rotation for revocability. Admin can force-logout by deleting refresh tokens. |
| HTTP-only cookies | Prevents XSS token theft — client JS never touches the token. |
| Prisma + PostgreSQL | Type-safe ORM, migrations as code, enum support for pipeline stages. |
| DnD Kit for Kanban | Lightweight, accessible, works with React 19. Had to work around SSR hydration issues. |
| GSAP for landing page | Scroll-triggered animations, timeline sequencing — smoother than CSS-only. |

---

## Hardest problems solved

### 1. Auth revocation in stateless JWT

"Pure JWTs can't be force-revoked. I implemented short-lived access tokens with refresh token rotation stored in the database. Force logout = delete refresh tokens, user expires in 15 minutes max."

### 2. React hydration mismatches

"DnD Kit and Recharts generate dynamic attributes at runtime that don't match server HTML. Fixed using useSyncExternalStore to defer interactive rendering until after hydration — no useEffect cascade."

### 3. Mobile drag-and-drop

"Touch events conflict with scroll. Used delay-based pointer activation (200ms hold to drag) and touch-action: none on draggable elements to let the browser distinguish scroll from drag intent."

### 4. Dropdown clipping in overflow containers

"Table action menus were getting cut off. Rendered them via React portals into document.body with dynamic positioning that detects available viewport space and opens up or down."

### 5. PostgreSQL enum migrations

"Adding enum values is straightforward, but removing them requires type recreation with casting. A corrupted migration file forced a full migration reset — learned to always verify migration SQL before applying."

---

## Key numbers

- 11 features, 20+ components, 6 server action modules
- 8-stage pipeline, 7 interview types, activity audit trail
- Mobile-responsive with hamburger nav + touch-friendly Kanban
- Custom auth with token rotation (no third-party dependency)
- Zero localStorage — fully server-driven with HTTP-only cookies

---

## If asked "what would you do differently?"

- "I'd add optimistic UI for more actions beyond just the Kanban — form submissions feel slightly slow because they wait for the server round-trip."
- "I'd implement real-time with WebSockets or server-sent events so the dashboard updates live if you have multiple tabs."
- "I'd add rate limiting on auth endpoints — right now there's no brute-force protection beyond bcrypt cost."

---

## If asked "what's next?"

- Email notifications for follow-up reminders
- AI-powered resume tailoring per job description
- Browser extension to save jobs directly from LinkedIn/Indeed
- Collaborative mode for career coaches

---

## Tips

- Lead with the problem you solved, not the tech you used.
- Interviewers care about your decision-making, not your dependency list.
- Keep it conversational. If they want depth, they'll ask follow-ups.
