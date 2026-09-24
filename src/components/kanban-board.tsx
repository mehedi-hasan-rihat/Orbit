"use client";

import { useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { updateApplicationStage } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
  id: string;
  company: string;
  role: string;
  stageId: string | null;
  appliedDate: Date | null;
  createdAt: Date;
}

export interface BoardStage {
  id: string;
  name: string;
  color: string;
}

export interface BoardColumnData {
  stageId: string;
  count: number;
  applications: Application[];
}

// Normalise the incoming data into a flat map for DnD state management.
// We keep a "displayed" set per stage (the initial preview slice) and the
// total count for each stage so we can show "+X more".
function buildState(columns: BoardColumnData[]) {
  const items: Application[] = [];
  const totalByStage: Record<string, number> = {};
  for (const col of columns) {
    items.push(...col.applications);
    totalByStage[col.stageId] = col.count;
  }
  return { items, totalByStage };
}

export function KanbanBoard({
  columns,
  stages,
}: {
  columns: BoardColumnData[];
  stages: BoardStage[];
}) {
  const initial = buildState(columns);
  const [items, setItems] = useState<Application[]>(initial.items);
  // totalByStage tracks the *true* total per stage, updated optimistically on drag.
  const [totalByStage, setTotalByStage] = useState<Record<string, number>>(
    initial.totalByStage
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const activeItem = items.find((item) => item.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeApp = items.find((item) => item.id === active.id);
    if (!activeApp) return;

    let targetStageId: string;
    const overColumn = stages.find((col) => col.id === over.id);
    if (overColumn) {
      targetStageId = overColumn.id;
    } else {
      const overApp = items.find((item) => item.id === over.id);
      if (overApp?.stageId) {
        targetStageId = overApp.stageId;
      } else {
        return;
      }
    }

    if (activeApp.stageId === targetStageId) return;

    const fromStageId = activeApp.stageId;

    // Optimistically update the displayed items and totals.
    setItems((prev) =>
      prev.map((item) =>
        item.id === active.id ? { ...item, stageId: targetStageId } : item
      )
    );
    setTotalByStage((prev) => ({
      ...prev,
      ...(fromStageId ? { [fromStageId]: Math.max(0, (prev[fromStageId] ?? 0) - 1) } : {}),
      [targetStageId]: (prev[targetStageId] ?? 0) + 1,
    }));

    await updateApplicationStage(active.id as string, targetStageId);
    router.refresh();
  }

  // Pre-hydration: static cards without DnD attributes
  if (!mounted) {
    return (
      <div className="flex flex-wrap gap-3 pb-4">
        {stages.map((column) => {
          const columnItems = items.filter((item) => item.stageId === column.id);
          const total = totalByStage[column.id] ?? columnItems.length;
          const more = total - columnItems.length;
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.name}
              color={column.color}
              count={total}
            >
              {columnItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border bg-background p-3 shadow-sm"
                >
                  <p className="text-sm font-medium truncate">{item.company}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.role}
                  </p>
                </div>
              ))}
              {more > 0 && (
                <Link
                  href="/dashboard/applications"
                  className="block text-xs text-muted-foreground text-center py-1.5 rounded-md border border-dashed hover:border-solid hover:text-foreground transition-colors"
                >
                  +{more} more
                </Link>
              )}
            </KanbanColumn>
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap gap-3 pb-4">
        {stages.map((column) => {
          const columnItems = items.filter(
            (item) => item.stageId === column.id
          );
          const total = totalByStage[column.id] ?? columnItems.length;
          const more = total - columnItems.length;
          return (
            <SortableContext
              key={column.id}
              items={columnItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.name}
                color={column.color}
                count={total}
              >
                {columnItems.map((item) => (
                  <KanbanCard key={item.id} application={item} />
                ))}
                {more > 0 && (
                  <Link
                    href="/dashboard/applications"
                    className="block text-xs text-muted-foreground text-center py-1.5 rounded-md border border-dashed hover:border-solid hover:text-foreground transition-colors"
                  >
                    +{more} more
                  </Link>
                )}
              </KanbanColumn>
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? <KanbanCard application={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
