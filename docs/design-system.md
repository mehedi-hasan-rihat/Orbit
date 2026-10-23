# Orbit — Design System

## 1. Design Philosophy

Minimal editorial — clean type, generous whitespace, a near-black background, and confident use of near-white text. The interface is dark-only. Status indicators (pending/approved/rejected) are the only place color earns its presence. Interactions are quiet but responsive. The interface recedes so the content occupies full attention.

## Principles

- Use Tailwind CSS 4 design tokens everywhere. Never use raw hex colours in `className`.
- Match the existing visual language before introducing new patterns.
- All interactive elements must be accessible (keyboard navigable, ARIA labels where needed).
- Mobile-first. The app must be usable on small screens.
- `"use client"` only when the component needs interactivity or browser APIs. Prefer Server Components.
- Headings use `font-weight: 400` (normal). Editorial tone through size and tracking, not weight.

---

## 2. Colour Palette

All tokens live in `src/app/globals.css` as CSS custom properties. The app is **dark-only** — no light theme.

### Base Surface

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#0a0a0a` | Page background |
| `--color-surface` | `#161616` | Card backgrounds, table rows, input backgrounds |
| `--color-foreground` | `#f5f5f5` | Primary text, headings, icons |
| `--color-muted` | `#999999` | Secondary text, labels, placeholder copy |
| `--color-border` | `#2a2a2a` | Dividers, input borders, table rules |

### Interactive & Overlay

| Token | Value | Use |
|---|---|---|
| `--color-control` | `#ffffff0d` (~5% white) | Subtle hover fills on controls |
| `--color-glass` | `#0a0a0ab8` | Frosted overlay backgrounds (header) |
| `--color-floating` | `#1a1a1af0` | Floating panels, dropdowns, modals |
| `--color-floating-hover` | `#242424f5` | Hover state inside floating |
| `--color-floating-active` | `#2e2e2ef5` | Active/pressed floating |
| `--color-focus` | `#7fb3cf` | Focus ring (accessible blue-slate) |
| `--blur-floating` | `16px` | Backdrop blur for glass surfaces |

### Semantic Status

| Token | Value | Use |
|---|---|---|
| `--color-status-pending` | `#fbbf24` | Pending badge text |
| `--color-status-pending-bg` | `#422006` | Pending badge background |
| `--color-status-approved` | `#4ade80` | Approved badge text |
| `--color-status-approved-bg` | `#052e16` | Approved badge background |
| `--color-status-rejected` | `#f87171` | Rejected badge text |
| `--color-status-rejected-bg` | `#450a0a` | Rejected badge background |

### shadcn/ui bridge tokens

| Token | Maps to |
|---|---|
| `--color-background` | `--color-canvas` |
| `--color-card` | `--color-surface` |
| `--color-primary` | `#f5f5f5` |
| `--color-primary-foreground` | `#0a0a0a` |
| `--color-muted-foreground` | `#999999` |
| `--color-border` | `#2a2a2a` |
| `--color-destructive` | `#f87171` |
| `--color-ring` | `#7fb3cf` |

User-defined colours (pipeline stage dots, tag badges) come from the DB as hex strings and are applied via inline `style={{ backgroundColor: color }}` — never via dynamic Tailwind class generation.

---

## 3. Typography

**Inter** at weight 400 (normal) throughout. No bold weight in headings — editorial tone is achieved through size and tracking.

### Type Scale

| Role | Size | Line-height | Tracking | Notes |
|---|---|---|---|---|
| Page heading (h1) | `clamp(28px, 4vw, 40px)` | `1.15` | `-0.03em` | Auth pages, portal title |
| Section heading (h2) | `28px` | `32px` | `-0.03em` | Dashboard section titles |
| Subsection (h3) | `15px` | `24px` | `0` | Card labels, table headers |
| Body | `15px` | `24px` | `0` | Default prose |
| Small / meta | `13px` | `20px` | `0` | Timestamps, helper text |
| Label / badge | `12px` | `16px` | `0.02em` | Status chips, UI labels |

Use `text-[13px]` for small/meta text in Tailwind classes. Use `text-[15px]` for subsection headings.

---

## 4. Spacing & Layout

### Page Structure

- Max content width: **1376px** centered
- Page gutter: `32px` → `24px` (md) → `20px` (sm) → `16px` (xs)
- Header height: `64px` desktop / `80px` mobile

### Spacing Tokens

| Name | Value | Tailwind |
|---|---|---|
| Section gap | `112px` desktop / `88px` tablet / `112px` mobile | `--spacing-section` |
| Column gap | `40px` desktop / `24px` tablet/mobile | `--spacing-column` |
| Card padding | `24px` / `32px` on md | `p-6` / `p-8` |
| Form field gap | `16px` | `gap-4` |
| Button height | `36px` | `h-9` |

Use `8px` increments for micro-spacing.

---

## 5. Borders & Radius

| Component | Radius |
|---|---|
| Page cards / auth container | `--radius-card` (28px → 40px responsive) |
| Table / data panel | `20px` |
| Input fields | `12px` (`rounded-xl`) |
| Buttons (primary/secondary) | `9999px` (`rounded-full`) — pill shape |
| Badges / status chips | `9999px` (`rounded-full`) |
| Floating menus / dropdowns | `20px` |
| Dialogs / modals | `32px` (`rounded-[32px]`) |

Border: `1px solid var(--color-border)` everywhere. Never thicker.

---

## 6. Component Patterns

### Buttons

Two variants — **primary** (foreground fill) and **ghost** (transparent with border).

```
Primary:  bg-primary text-primary-foreground hover:bg-[#454545] rounded-full px-5 h-9
Ghost:    border border-border bg-transparent hover:bg-control rounded-full px-5 h-9
```

- Disabled: `opacity-50 cursor-not-allowed`
- Loading: spinner replaces label, button disabled
- Focus: `outline-2 outline-offset-5 outline-[var(--color-focus)]`
- Destructive (reject): ghost styling with `text-destructive` and `hover:bg-[var(--color-status-rejected-bg)]`

No filled red/green buttons. Status is communicated through badges, not button color.

### Form Inputs

```
bg-surface border border-border rounded-xl px-4 h-9
placeholder: text-muted text-[13px]
focus: outline-2 outline-offset-2 outline-[var(--color-focus)]
error: border-[var(--color-status-rejected)]
```

Error messages: `text-[13px] text-[var(--color-status-rejected)] mt-1`
Labels: `text-[13px] text-muted-foreground` above the input, `mb-1` spacing.

### Cards

```
bg-surface rounded-xl border border-border p-6
```

### Status Badges

Pill-shaped, filled with semantic background color:

```
PENDING:  bg-[var(--color-status-pending-bg)]  text-[var(--color-status-pending)]  rounded-full px-2.5 py-0.5 text-xs
APPROVED: bg-[var(--color-status-approved-bg)] text-[var(--color-status-approved)] rounded-full px-2.5 py-0.5 text-xs
REJECTED: bg-[var(--color-status-rejected-bg)] text-[var(--color-status-rejected)] rounded-full px-2.5 py-0.5 text-xs
```

### Navigation / Header

```
height: var(--header-height) [64px desktop]
bg: var(--color-glass) with backdrop-blur-[var(--blur-floating)]
border-bottom: 1px solid var(--color-border)
position: sticky top-0 z-20
```

### Data Table

```
bg-surface rounded-xl border border-border overflow-hidden
thead: text-[13px] text-muted-foreground border-b border-border
tbody tr: border-b border-border last:border-0 hover:bg-[#20202008]
td: text-sm py-3 px-4
```

No zebra striping. Only hover row highlight with a 4% black tint.

### Dialogs / Confirmation Modals

```
backdrop: bg-[#20202050] backdrop-blur-[8px]
panel: bg-[var(--color-floating)] backdrop-blur-[var(--blur-floating)] rounded-[32px] p-8 shadow-[0_8px_32px_#20202012]
max-w: min(520px, calc(100% - 32px))
```

### Loading / Skeleton States

Skeletons use `bg-muted animate-pulse` with `rounded-xl`. Match the shape of the real content.

### Empty States

```
py-28 text-center
icon: 40px, text-muted, mb-4
heading: text-[15px] text-foreground
body: text-[13px] text-muted-foreground
```

---

## 7. Responsive Behavior

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile (default) | `< 768px` | Single-column, full-width cards, larger touch targets (h-10), stacked nav |
| Tablet (`md`) | `768px–1199px` | Two-column where appropriate, reduced gutters |
| Desktop (`xl`) | `≥ 1200px` | Full layout, sidebar nav visible, table horizontal scroll removed |

Forms stay single-column at all breakpoints. Auth pages center a card with `max-w-[440px]`.

---

## 8. Motion & Interaction

- Transition duration: `150ms` (default)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (standard ease)
- Hover states on buttons/rows: background color transition only
- Focus rings: immediate (no delay)
- Dialogs: simple opacity + slight scale from 0.97 → 1, `150ms ease`
- `@media (prefers-reduced-motion: reduce)`: disable all transforms and transitions

---

## 9. Accessibility Baseline

- All interactive elements are keyboard-operable
- Focus ring: `outline: 2px solid var(--color-focus); outline-offset: 5px`
- Form inputs have visible labels (never placeholder-only)
- Status badges include a text label (not icon-only)
- Tables have `<caption>` or `aria-label` and proper `scope` on `<th>`
- Dialogs trap focus and restore on close
- Loading states announce via `aria-live="polite"`
- Color contrast: foreground `#f5f5f5` on canvas `#0a0a0a` = 17.4:1; muted `#999` on canvas = 7.2:1

---

## 10. Outcome Colours

Defined once in `src/lib/validations.ts` under `OUTCOMES`. All outcome-coloured UI (badges, chart legend entries) reads from this single source.

| Outcome | Colour |
|---------|--------|
| SCHEDULED | Blue |
| ASSIGNED | Amber |
| COMPLETED | Indigo |
| PASSED | Green |
| FAILED | Red |
| CANCELLED | Slate |
