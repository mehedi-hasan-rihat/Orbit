# Kanban Board — Frontend Documentation

## Components

### `KanbanBoard` (`src/components/kanban-board.tsx`)

**Type:** Client component

**Props:**
```typescript
{ applications: Application[], stages: BoardStage[] }
```

`stages` are the column definitions — `{ id, name, color }` — supplied by the
dashboard page from the user's pipeline. The board renders no columns of its own.

**Libraries:** `@dnd-kit/core`, `@dnd-kit/sortable`

**Configuration:**
- Sensor: `PointerSensor` with a 200ms delay and 5px tolerance (lets touch scroll and tap still work)
- Collision: `closestCorners` algorithm
- Strategy: `verticalListSortingStrategy` per column

**State:**
- `items` — local copy of applications (for optimistic updates)
- `activeId` — currently dragged card ID (or null)

**Handlers:**

`onDragStart`:
- Sets `activeId` for overlay rendering

`onDragEnd`:
- Finds the target column by matching `over.id` against `stages`, or against the `stageId` of the card it was dropped on
- If same column as source: no-op
- Otherwise: optimistically updates local `items` state
- Calls `updateApplicationStage(id, targetStageId)`
- Calls `router.refresh()` to sync with server

---

### `KanbanColumn` (`src/components/kanban-column.tsx`)

**Type:** Client component

**Props:**
```typescript
{ id: string, title: string, color: string, count: number, children: ReactNode }
```

- Droppable container
- `color` is a **hex value** from the user's stage, applied as an inline style — not a Tailwind class name as it was when columns were fixed
- Shows column header with title, colour indicator dot, and item count
- Visual ring highlight when a card is dragged over

---

### `KanbanCard` (`src/components/kanban-card.tsx`)

**Type:** Client component

**Props:**
```typescript
{ application: Application, isOverlay?: boolean }
```

- Draggable item using `useSortable` hook
- Shows: company name, role, applied date
- While dragging: 50% opacity
- Overlay variant: slight rotation for visual feedback
- Clicking navigates to application detail page

---

## Visual Layout

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Wishlist │ │ Applied  │ │Interview │ │  Offer   │ │ Rejected │
│   (3)    │ │   (5)    │ │   (2)    │ │   (1)    │ │   (0)    │
├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ [Card 1] │ │ [Card 4] │ │ [Card 9] │ │[Card 11] │ │          │
│ [Card 2] │ │ [Card 5] │ │[Card 10] │ │          │ │          │
│ [Card 3] │ │ [Card 6] │ │          │ │          │ │          │
│          │ │ [Card 7] │ │          │ │          │ │          │
│          │ │ [Card 8] │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

Illustrative only — the column set, their names, their order, and their colours all come from the user's pipeline.

Horizontal scrollable on mobile.

---

## Files

| File | Role |
|------|------|
| `src/components/kanban-board.tsx` | DnD context, state, handlers |
| `src/components/kanban-column.tsx` | Droppable column |
| `src/components/kanban-card.tsx` | Draggable card |
| `src/app/dashboard/page.tsx` | Fetches applications and stages, filters to enabled, renders board |
| `src/lib/actions/pipeline.ts` | Supplies the stage catalogue |
