# Orbit — Design System

## Principles

- Use Tailwind CSS 4 design tokens everywhere. Never use raw hex colours in `className`.
- Match the existing visual language before introducing new patterns.
- All interactive elements must be accessible (keyboard navigable, ARIA labels where needed).
- Mobile-first. The app must be usable on small screens.
- `"use client"` only when the component needs interactivity or browser APIs. Prefer Server Components.

---

## Colour Tokens

| Token | Usage |
|-------|-------|
| `bg-background` | Page and card backgrounds |
| `bg-muted` | Subtle background fills (table headers, empty states) |
| `bg-muted/30` | Very subtle tint (Kanban column backgrounds, reminder rows) |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary / helper text |
| `border` | Default border colour |
| `ring` / `ring-ring` | Focus rings and drag-over highlights |
| `bg-destructive` / `text-destructive` | Error states, delete actions |
| `bg-primary` / `text-primary-foreground` | Primary CTA buttons |

User-defined colours (pipeline stage dots, tag badges) come from the DB as hex strings and are applied via inline `style={{ backgroundColor: color }}` — never via dynamic Tailwind class generation.

---

## Typography

| Use | Classes |
|-----|---------|
| Page titles | `text-2xl font-bold tracking-tight` |
| Section headings | `text-xl font-semibold` |
| Card / label text | `text-sm font-medium` |
| Helper / meta text | `text-xs text-muted-foreground` |
| Uppercase section labels | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` |

---

## Spacing

- Section gaps: `space-y-10` between major dashboard sections.
- Card internal padding: `p-3` (compact), `p-5` (comfortable), `p-6` (modal).
- Form field gaps: `space-y-4`.
- Form label + input: `space-y-2`.

---

## Components

### Kanban Board

- Container: `flex flex-wrap gap-3 pb-4` — columns wrap on narrow viewports.
- Column: `w-55 shrink-0 grow` — fixed minimum width, grows to fill row space.
- Column border default: `border` (solid, 1px).
- Column border on drag-over: `border-2 border-dashed border-ring`.
- Card: `rounded-md border bg-background p-3 shadow-sm`.
- "+X more" link: `border border-dashed` pill, links to `/dashboard/applications`.

### Modals

- Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-black/50`.
- Panel: `w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto`.
- Title row: `flex items-center justify-between mb-6`.
- Close button: `text-muted-foreground hover:text-foreground`.

### Forms

- Inputs: `flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`.
- Selects: same classes as inputs.
- Textareas: `flex w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none`.
- Error text: `text-xs text-destructive`.
- Required marker: `<span className="text-destructive">*</span>`.
- Primary submit: `h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50`.
- Secondary/cancel: `h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent`.

### Badges / Status

- Stage badges: coloured dot + name, colour from `PipelineStageType.color` via inline style.
- Outcome badges: `rounded-full px-2.5 py-0.5 text-xs font-medium` with per-outcome background/text colour from `OUTCOMES` in `validations.ts`.
- Tag badges: `rounded-full text-xs px-3 py-1 font-medium border-2`, selected state fills with tag colour.

### Tables

- Container: `border rounded-lg overflow-hidden`.
- Header: `bg-muted/50 text-xs font-medium text-muted-foreground uppercase`.
- Row hover: `hover:bg-muted/30 transition-colors`.

### Buttons (small inline actions)

- Default action: `text-xs text-muted-foreground hover:text-foreground`.
- Destructive action: `text-xs text-destructive hover:text-destructive/80`.
- Disabled state: `disabled:opacity-50`.

---

## Layout

- Dashboard shell: sidebar (desktop) + mobile nav drawer, defined in `src/app/dashboard/layout.tsx`.
- Content max-width is controlled by the layout — individual pages do not set their own max-width.
- Sidebar navigation uses `src/components/sidebar.tsx`; mobile nav uses `src/components/mobile-nav.tsx`.

---

## Dark Mode

Tailwind `dark:` variants throughout. The user's theme preference is stored in `User.theme` (`"light"`, `"dark"`, `"system"`) and applied as a class on `<html>`. The profile page lets users switch theme.

---

## Outcome Colours

Defined once in `src/lib/validations.ts` under `OUTCOMES`. All outcome-coloured UI (badges, chart legend entries) reads from this single source.

| Outcome | Colour |
|---------|--------|
| SCHEDULED | Blue |
| ASSIGNED | Amber |
| COMPLETED | Indigo |
| PASSED | Green |
| FAILED | Red |
| CANCELLED | Slate |
