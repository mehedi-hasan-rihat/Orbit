"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
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

function MobilePipeline({
  items,
  onStatusChange,
}: {
  items: Application[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const [activeColumn, setActiveColumn] = useState(columns[0].id);
  const columnItems = items.filter((item) => item.status === activeColumn);

  return (
    <div className="space-y-3">
      {/* Column tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {columns.map((col) => {
          const count = items.filter((i) => i.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setActiveColumn(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeColumn === col.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards for active column */}
      {columnItems.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No applications in {columns.find((c) => c.id === activeColumn)?.title}
        </p>
      ) : (
        <div className="space-y-2">
          {columnItems.map((item) => (
            <div
              key={item.id}
              className="rounded-md border bg-background p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.company}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.role}
                  </p>
                </div>
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value)}
                  className="text-xs border rounded-md px-1.5 py-1 bg-background shrink-0"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const activeItem = items.find((item) => item.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const app = items.find((item) => item.id === id);
    if (!app || app.status === newStatus) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    await updateApplicationStatus(id, newStatus);
    router.refresh();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeApp = items.find((item) => item.id === active.id);
    if (!activeApp) return;

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

    setItems((prev) =>
      prev.map((item) =>
        item.id === active.id ? { ...item, status: targetStatus } : item
      )
    );

    await updateApplicationStatus(active.id as string, targetStatus);
    router.refresh();
  }

  if (!mounted) {
    return (
      <div className="flex gap-4 pb-4 overflow-x-auto">
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
    <>
      {/* Mobile: tab-based pipeline with select dropdowns */}
      <div className="md:hidden">
        <MobilePipeline items={items} onStatusChange={handleStatusChange} />
      </div>

      {/* Desktop: full drag-and-drop Kanban */}
      <div className="hidden md:block">
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
      </div>
    </>
  );
}
