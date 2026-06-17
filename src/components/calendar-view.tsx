"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

interface CalendarEvent {
  id: string;
  applicationId: string;
  type: "INTERVIEW" | "FOLLOWUP";
  title: string;
  company: string;
  role: string;
  date: Date;
  status: string;
  outcome: string | null;
}

interface CalendarViewProps {
  events: CalendarEvent[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

function isPast(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
}

export function CalendarView({ events }: CalendarViewProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(currentYear, currentMonth, i + 1)),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function getEventsForDate(date: Date) {
    return events.filter((e) => isSameDay(new Date(e.date), date));
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming events (next 7 days)
  const upcoming = events.filter((e) => {
    const d = new Date(e.date);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 border rounded-xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="h-8 w-8 rounded-md border flex items-center justify-center text-sm hover:bg-accent transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDate(today); }}
              className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="h-8 w-8 rounded-md border flex items-center justify-center text-sm hover:bg-accent transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="bg-background h-16 sm:h-20" />;

            const dayEvents = getEventsForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const past = isPast(date) && !isToday(date);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={clsx(
                  "bg-background h-16 sm:h-20 p-1.5 text-left transition-colors hover:bg-accent/50 flex flex-col",
                  isSelected && "ring-2 ring-inset ring-primary",
                  past && "opacity-50"
                )}
              >
                <span
                  className={clsx(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday(date) && "bg-primary text-primary-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
                <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((e) => (
                    <div
                      key={e.id}
                      className={clsx(
                        "rounded px-1 text-[10px] font-medium truncate leading-4",
                        e.type === "INTERVIEW"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      )}
                    >
                      {e.company}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-900/50" />
            Interview
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/50" />
            Follow-up
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Selected day events */}
        {selectedDate && (
          <div className="border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold">
              {selectedDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No events on this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/dashboard/applications/${e.applicationId}`}
                    className="block border rounded-lg p-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          e.type === "INTERVIEW"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                        )}
                      >
                        {e.type === "INTERVIEW" ? "Interview" : "Follow-up"}
                      </span>
                      {e.outcome && e.outcome !== "PENDING" && (
                        <span className={clsx(
                          "text-xs font-medium",
                          e.outcome === "PASSED" ? "text-green-600" : "text-red-500"
                        )}>
                          {e.outcome}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1">{e.company}</p>
                    <p className="text-xs text-muted-foreground">{e.role}</p>
                    {e.type === "INTERVIEW" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming 7 days */}
        <div className="border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">Upcoming (7 days)</h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nothing scheduled in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((e) => (
                <Link
                  key={e.id}
                  href={`/dashboard/applications/${e.applicationId}`}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="text-center shrink-0 w-10">
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString([], { month: "short" })}
                    </p>
                    <p className="text-base font-bold leading-none">
                      {new Date(e.date).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{e.company}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.role}</p>
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium mt-0.5",
                        e.type === "INTERVIEW"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      )}
                    >
                      {e.type === "INTERVIEW" ? "Interview" : "Follow-up"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
