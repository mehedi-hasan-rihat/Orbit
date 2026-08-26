import type { InterviewOutcome } from "@/lib/validations";

export const OUTCOME_DISPLAY: Record<InterviewOutcome, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  PASSED: { label: "Passed ✓", className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  COMPLETED: { label: "Completed", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" },
};

// Outcome values are stored as a plain string column, so anything unrecognised
// (hand-edited data, a value from a future release) still has to render.
export function outcomeDisplay(outcome: string | null | undefined) {
  return (
    OUTCOME_DISPLAY[(outcome ?? "PENDING") as InterviewOutcome] ?? {
      label: outcome ?? "Pending",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    }
  );
}
