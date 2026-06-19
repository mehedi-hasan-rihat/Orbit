"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

interface KanbanColumnProps {
  id: string;
  title: string;
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
        "min-w-[200px] w-[200px] md:min-w-0 md:w-auto md:flex-1 flex flex-col rounded-lg border bg-muted/30 transition-colors snap-center shrink-0 md:shrink",
        isOver && "ring-2 ring-ring"
      )}
    >
      <div className="flex items-center gap-2 p-3 border-b">
        <div className={clsx("w-2.5 h-2.5 rounded-full", color)} />
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{count}</span>
      </div>
      <div className="flex-1 p-2 space-y-2 min-h-[200px]">{children}</div>
    </div>
  );
}
