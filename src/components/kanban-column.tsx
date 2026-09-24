"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

interface KanbanColumnProps {
  id: string;
  title: string;
  /** Hex colour from the user's pipeline stage, not a Tailwind class. */
  color: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({
  id,
  title,
  color,
  count,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        // Fixed readable width — columns wrap onto a new row when the
        // viewport is too narrow rather than shrinking indefinitely.
        // Border switches to dashed when a card is dragged over this column.
        "w-55 shrink-0 grow flex flex-col rounded-lg bg-muted/30 transition-colors",
        isOver
          ? "border-2 border-dashed border-ring"
          : "border"
      )}
    >
      <div className="flex items-center gap-2 p-3 border-b">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-medium truncate">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto shrink-0">{count}</span>
      </div>
      <div className="p-2 space-y-2 min-h-20">{children}</div>
    </div>
  );
}
