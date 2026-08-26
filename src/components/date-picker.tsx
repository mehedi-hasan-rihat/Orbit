"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface DatePickerProps {
  id?: string;
  name: string;
  value?: string;        // "YYYY-MM-DD"
  placeholder?: string;
  onChange?: (value: string) => void;
  includeTime?: boolean; // for datetime-local
  required?: boolean;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const PANEL_WIDTH = 288; // w-72
const EDGE_MARGIN = 8;
const TRIGGER_GAP = 4;

// Popover is rendered into document.body, so it needs viewport coordinates.
type Position = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

function computePosition(trigger: HTMLElement, includeTime?: boolean): Position {
  const rect = trigger.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const width = Math.min(PANEL_WIDTH, vw - EDGE_MARGIN * 2);
  const left = Math.min(
    Math.max(rect.left, EDGE_MARGIN),
    Math.max(vw - EDGE_MARGIN - width, EDGE_MARGIN)
  );

  const spaceBelow = vh - rect.bottom - TRIGGER_GAP - EDGE_MARGIN;
  const spaceAbove = rect.top - TRIGGER_GAP - EDGE_MARGIN;
  const estimatedHeight = includeTime ? 400 : 340;

  // Flip above only when below can't fit it and above is roomier.
  if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
    return { left, width, bottom: vh - rect.top + TRIGGER_GAP, maxHeight: spaceAbove };
  }
  return { left, width, top: rect.bottom + TRIGGER_GAP, maxHeight: spaceBelow };
}

function toDisplayDate(iso: string, includeTime?: boolean) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  if (includeTime) {
    return d.toLocaleString([], {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function DatePicker({
  id, name, value = "", placeholder = "Pick a date",
  onChange, includeTime, required,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [selected, setSelected] = useState(value);      // "YYYY-MM-DD"
  const [timeValue, setTimeValue] = useState("09:00");  // HH:MM
  const [viewYear, setViewYear] = useState(() => {
    if (value) return new Date(value).getFullYear();
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value).getMonth();
    return new Date().getMonth();
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape. The popover is portalled, so both nodes matter.
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Keep the panel pinned to the trigger while an ancestor scrolls or the window resizes.
  useEffect(() => {
    if (!open) return;
    function reposition() {
      if (triggerRef.current) setPosition(computePosition(triggerRef.current, includeTime));
    }
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, includeTime]);

  // Sync if value prop changes
  useEffect(() => {
    if (value) {
      setSelected(value.slice(0, 10));
      if (includeTime && value.length > 10) {
        setTimeValue(value.slice(11, 16));
      }
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, includeTime]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayStr();

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    if (triggerRef.current) setPosition(computePosition(triggerRef.current, includeTime));
    setOpen(true);
  }

  function handleDayClick(day: number) {
    const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    setSelected(dateStr);
    if (!includeTime) {
      commit(dateStr, timeValue);
      setOpen(false);
    }
  }

  function handleTimeChange(t: string) {
    setTimeValue(t);
    if (selected) commit(selected, t);
  }

  function commit(dateStr: string, time: string) {
    const full = includeTime ? `${dateStr}T${time}` : dateStr;
    onChange?.(full);
  }

  function handleConfirm() {
    if (selected) {
      commit(selected, timeValue);
      setOpen(false);
    }
  }

  function handleClear() {
    setSelected("");
    onChange?.("");
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build the hidden input value
  const hiddenValue = selected
    ? includeTime ? `${selected}T${timeValue}` : selected
    : "";

  const displayValue = selected ? toDisplayDate(hiddenValue, includeTime) : "";

  const popover = open && position && (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        bottom: position.bottom,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
      className="z-[100] overflow-y-auto rounded-xl border bg-background shadow-lg p-3 space-y-3"
    >

      {/* Month/year nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground"
        >
          ‹
        </button>
        <span className="text-sm font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {DAYS.map(d => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSelected = dateStr === selected;
          const isToday    = dateStr === today;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDayClick(day)}
              className={clsx(
                "h-8 w-full rounded-md text-sm transition-colors",
                isSelected && "bg-primary text-primary-foreground font-semibold",
                !isSelected && isToday && "border border-primary text-primary font-semibold",
                !isSelected && !isToday && "hover:bg-accent text-foreground"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time picker */}
      {includeTime && (
        <div className="border-t pt-3 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Time</label>
          <input
            type="time"
            value={timeValue}
            onChange={e => handleTimeChange(e.target.value)}
            className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t pt-3">
        <button
          type="button"
          onClick={() => {
            const d = new Date();
            const t = todayStr();
            setSelected(t);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
            if (!includeTime) { commit(t, timeValue); setOpen(false); }
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Today
        </button>
        <div className="flex gap-2">
          {selected && (
            <button
              type="button"
              onClick={handleClear}
              className="h-7 px-2.5 rounded-md text-xs border hover:bg-accent transition-colors text-muted-foreground"
            >
              Clear
            </button>
          )}
          {includeTime && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selected}
              className="h-7 px-3 rounded-md text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={hiddenValue} required={required} />

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={toggleOpen}
        className={clsx(
          "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          !displayValue && "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <svg className="w-4 h-4 text-muted-foreground shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {popover && createPortal(popover, document.body)}
    </div>
  );
}
