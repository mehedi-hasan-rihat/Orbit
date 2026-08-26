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

export function KanbanBoard({
  applications,
  stages,
}: {
  applications: Application[];
  stages: BoardStage[];
}) {
  const [items, setItems] = useState(applications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const router = useRouter();

  // Use delay-based activation so touch-hold initiates drag
  // while normal scroll/tap still works
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

    setItems((prev) =>
      prev.map((item) =>
        item.id === active.id ? { ...item, stageId: targetStageId } : item
      )
    );

    await updateApplicationStage(active.id as string, targetStageId);
    router.refresh();
  }

  // Pre-hydration: static cards without DnD attributes
  if (!mounted) {
    return (
      <div className="flex gap-3 pb-4 overflow-x-auto snap-x snap-mandatory md:snap-none">
        {stages.map((column) => {
          const columnItems = items.filter((item) => item.stageId === column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.name}
              color={column.color}
              count={columnItems.length}
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
      <div className="flex gap-3 pb-4 overflow-x-auto snap-x snap-mandatory md:snap-none">
        {stages.map((column) => {
          const columnItems = items.filter(
            (item) => item.stageId === column.id
          );
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
                count={columnItems.length}
              >
                {columnItems.map((item) => (
                  <KanbanCard key={item.id} application={item} />
                ))}
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
