import { OUTCOMES, type InterviewOutcome } from "@/lib/validations";

// Re-export for backwards compatibility — all display data now lives in OUTCOMES.
export const OUTCOME_DISPLAY = OUTCOMES;

export function outcomeDisplay(outcome: string | null | undefined) {
  return (
    OUTCOMES[(outcome ?? "PENDING") as InterviewOutcome] ?? {
      label: outcome ?? "Pending",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      color: "#6b7280",
    }
  );
}
