"use client";

import { useState, useEffect } from "react";
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
import { updateApplicationStatus } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: Date | null;
  createdAt: Date;
}

const columns = [
  { id: "WISHLIST", title: "Wishlist", color: "bg-gray-500" },
  { id: "APPLIED", title: "Applied", color: "bg-blue-500" },
  { id: "INTERVIEW", title: "Interview", color: "bg-amber-500" },
  { id: "OFFER", title: "Offer", color: "bg-green-500" },
  { id: "REJECTED", title: "Rejected", color: "bg-red-500" },
];

export function KanbanBoard({
  applications,
}: {
  applications: Application[];
}) {
  const [items, setItems] = useState(applications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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

    // Determine target column
    let targetStatus: string;
    const overColumn = columns.find((col) => col.id === over.id);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      const overApp = items.find((item) => item.id === over.id);
      if (overApp) {
        targetStatus = overApp.status;
      } else {
        return;
      }
    }

    if (activeApp.status === targetStatus) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === active.id ? { ...item, status: targetStatus } : item
      )
    );

    // Update DB
    await updateApplicationStatus(active.id as string, targetStatus);
    router.refresh();
  }

  if (!mounted) {
    return (
      <div className="flex gap-4 pb-4">
        {columns.map((column) => {
          const columnItems = items.filter((item) => item.status === column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
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
      <div className="flex gap-4 pb-4">
        {columns.map((column) => {
          const columnItems = items.filter(
            (item) => item.status === column.id
          );
          return (
            <SortableContext
              key={column.id}
              items={columnItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
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
