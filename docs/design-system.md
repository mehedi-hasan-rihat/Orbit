# Orbit — Design System

## Principles

- Use Tailwind CSS 4 design tokens everywhere. Never use raw hex colours in className.
- Match the existing visual language before introducing new patterns.
- All interactive elements must be accessible (keyboard navigable, ARIA labels where needed).
- Mobile-first. The app must be usable on small screens.

## Colour Tokens

| Token | Usage |
|-------|-------|
| `bg-background` | Page and card backgrounds |
| `bg-muted` | Subtle background fills (table headers, empty states) |
| `bg-muted/30` | Very subtle tint (Kanban column backgrounds) |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary / helper text |
| `border` | Default border colour |
| `ring` / `ring-ring` | Focus rings and drag-over highlights |

User-defined colours (pipeline stage dots, tag badges) come from the DB as hex strings and are applied via inline `style={{ backgroundColor: color }}` — never via Tailwind dynamic class generation.

## Typography

- Page titles: `text-2xl font-bold`
- Section headings: `text-xl font-bold`
- Card titles: `text-sm font-medium`
- Helper / meta text: `text-xs text-muted-foreground`

## Spacing

- Section gaps: `space-y-10` between major dashboard sections.
- Card internal padding: `p-3` (compact), `p-5` (comfortable).
- Form gaps: `space-y-4`.

## Components

### Kanban Board

- Container: `flex flex-wrap gap-3 pb-4` — columns wrap to new rows on narrow viewports.
- Column: `w-55 shrink-0 grow` — fixed minimum width, grows to fill row space.
- Column border default: `border` (solid, 1px).
- Column border on drag-over: `border-2 border-dashed border-ring`.
- Card: `rounded-md border bg-background p-3 shadow-sm`.
- "+X more" link: `border border-dashed` pill, links to `/dashboard/applications`.

### Forms

- Inputs: `border rounded-md px-3 py-2 text-sm bg-background`.
- Error text: `text-xs text-red-500 mt-1`.
- Submit buttons: `bg-primary text-primary-foreground`.

### Badges / Status

- Stage badges: coloured dot + name, colour from `PipelineStageType.color`.
- Tag badges: `rounded-full text-xs px-2 py-0.5`, colour from `Tag.color`.

### Tables

- Container: `border rounded-lg overflow-hidden`.
- Header: `bg-muted/50`.
- Row hover: `hover:bg-muted/30 transition-colors`.

## Layout

- Dashboard shell: sidebar + main content, defined in `src/app/dashboard/layout.tsx`.
- Content max-width is controlled by the layout — individual pages do not set their own max-width.
- Sticky sidebar on desktop; mobile nav drawer.

## Dark Mode

Tailwind `dark:` variants are used. The user's theme preference is stored in `User.theme` and applied via a class on `<html>`. Values: `"light"`, `"dark"`, `"system"`.
