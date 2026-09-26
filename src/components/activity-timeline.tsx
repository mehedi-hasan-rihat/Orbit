"use client";

import { useState } from "react";
import clsx from "clsx";
import { INTERVIEW_OUTCOMES } from "@/lib/validations";

interface Activity {
  id: string;
  type: string;
  description: string;
  metadata: string | null;
  createdAt: Date;
}

const typeConfig: Record<string, { color: string; label: string; className: string }> = {
  CREATED: {
    color: "#3b82f6",
    label: "Created",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  OUTCOME_CHANGE: {
    color: "#f59e0b",
    label: "Outcome",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  NOTE_ADDED: {
    color: "#8b5cf6",
    label: "Note",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  FOLLOW_UP_SET: {
    color: "#22c55e",
    label: "Reminder",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  INTERVIEW_SCHEDULED: {
    color: "#6366f1",
    label: "Scheduled",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
};

const filterOptions = [
  { value: "ALL", label: "All" },
  { value: "CREATED", label: "Created" },
  { value: "OUTCOME_CHANGE", label: "Outcomes" },
  { value: "NOTE_ADDED", label: "Notes" },
  { value: "INTERVIEW_SCHEDULED", label: "Scheduled" },
  { value: "FOLLOW_UP_SET", label: "Reminders" },
];

// Converts any SCREAMING_SNAKE outcome key to Title Case at runtime.
// Driven entirely by INTERVIEW_OUTCOMES — no manual list to maintain.
const OUTCOME_LABELS: Record<string, string> = Object.fromEntries(
  INTERVIEW_OUTCOMES.map((o) => [o, o.charAt(0) + o.slice(1).toLowerCase()])
);

/**
 * Normalises INTERVIEW_SCHEDULED activity descriptions:
 *
 * 1. Old format:  "Round 1 Technical interview: PASSED"
 *    → "Round 1 Technical interview: Scheduled → Passed"
 *
 * 2. New outcome-change format already has "from → to" — returned as-is.
 *
 * 3. Stage-scheduled entries from the Update Application modal
 *    (metadata has `stageId`, not `stageTypeId`) are returned as-is because
 *    their description already reads naturally ("Screening scheduled for …").
 */
function formatActivityDescription(activity: Activity): string {
  if (activity.type !== "INTERVIEW_SCHEDULED") return activity.description;

  try {
    const meta = JSON.parse(activity.metadata ?? "{}") as Record<string, string>;

    // New stage-scheduled entries and new outcome-change entries are already readable.
    if (meta.fromOutcome || meta.stageId) return activity.description;

    // Old entries: description ends with a raw uppercase outcome keyword.
    if (meta.outcome) {
      const rawSuffix = new RegExp(`: ${meta.outcome}$`);
      if (rawSuffix.test(activity.description)) {
        const toLabel = OUTCOME_LABELS[meta.outcome] ?? meta.outcome;
        return activity.description.replace(rawSuffix, `: Scheduled → ${toLabel}`);
      }
    }
  } catch {
    // ignore
  }

  return activity.description;
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const [filter, setFilter] = useState("ALL");

  const filtered =
    filter === "ALL"
      ? activities
      : activities.filter((a) => a.type === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={clsx(
              "h-7 px-3 rounded-full text-xs font-medium transition-colors",
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No activity{filter !== "ALL" ? " of this type" : ""} recorded yet.
        </p>
      ) : (
        <div className="max-h-128 overflow-y-auto scrollbar-thin space-y-0 pr-1">
          {filtered.map((activity, index) => {
            const config = typeConfig[activity.type] || {
              color: "#6b7280",
              label: activity.type,
              className: "bg-gray-100 text-gray-700",
            };

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: config.color }}
                  />
                  {index < filtered.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>

                {/* Content */}
                <div className={clsx("flex-1 pb-5", index === filtered.length - 1 && "pb-0")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            config.className
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm">{formatActivityDescription(activity)}</p>
                    </div>
                    <time className="text-xs text-muted-foreground shrink-0 pt-0.5">
                      {new Date(activity.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
