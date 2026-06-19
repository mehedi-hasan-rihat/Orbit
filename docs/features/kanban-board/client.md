# Kanban Board — Frontend Documentation

## Components

### `KanbanBoard` (`src/components/kanban-board.tsx`)

**Type:** Client component

**Props:**
```typescript
{ applications: Application[] }
```

**Libraries:** `@dnd-kit/core`, `@dnd-kit/sortable`

**Configuration:**
- Sensor: `PointerSensor` with 8px activation distance (prevents accidental drags on click)
- Collision: `closestCorners` algorithm
- Strategy: `verticalListSortingStrategy` per column

**State:**
- `items` — local copy of applications (for optimistic updates)
- `activeId` — currently dragged card ID (or null)

**Handlers:**

`onDragStart`:
- Sets `activeId` for overlay rendering

`onDragEnd`:
- Finds the target column (either dropped on a column or on a card within a column)
- If same column as source: no-op
- Otherwise: optimistically updates local `items` state
- Calls `updateApplicationStatus(id, newStatus)`
- Calls `router.refresh()` to sync with server

---

### `KanbanColumn` (`src/components/kanban-column.tsx`)

**Type:** Client component

**Props:**
```typescript
{ id: string, title: string, color: string, count: number, children: ReactNode }
```

- Droppable container
- Shows column header with title, color indicator dot, and item count
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

Horizontal scrollable on mobile.

---

## Files

| File | Role |
|------|------|
| `src/components/kanban-board.tsx` | DnD context, state, handlers |
| `src/components/kanban-column.tsx` | Droppable column |
| `src/components/kanban-card.tsx` | Draggable card |
| `src/app/dashboard/page.tsx` | Fetches data, renders board |
