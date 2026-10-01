import { OUTCOMES, type InterviewOutcome } from "@/lib/validations";

export const OUTCOME_DISPLAY = OUTCOMES;

// null/undefined = "not set" → returns null, callers render nothing
export function outcomeDisplay(outcome: string | null | undefined) {
  if (!outcome) return null;
  return (
    OUTCOMES[outcome as InterviewOutcome] ?? {
      label: outcome,
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      color: "#6b7280",
    }
  );
}
