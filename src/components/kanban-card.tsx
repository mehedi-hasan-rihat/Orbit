"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

interface KanbanCardProps {
  application: {
    id: string;
    company: string;
    role: string;
    appliedDate: Date | null;
  };
  isOverlay?: boolean;
}

export function KanbanCard({ application, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "rounded-md border bg-background p-3 cursor-grab active:cursor-grabbing shadow-sm",
        isDragging && "opacity-50",
        isOverlay && "shadow-lg rotate-2"
      )}
    >
      <p className="text-sm font-medium truncate">{application.company}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">
        {application.role}
      </p>
      {application.appliedDate && (
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(application.appliedDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
