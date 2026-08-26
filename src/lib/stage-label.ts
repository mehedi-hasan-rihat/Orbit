// Resolving an interview's display label.
//
// Three eras of data live in the Interview table at once:
//   1. post-rework rows  → stageType relation
//   2. rows whose stage type was deleted, and legacy OTHER rows → customType
//   3. pre-rework rows   → the legacy InterviewType enum
// Every read path goes through here so all three render identically.

const LEGACY_TYPE_LABELS: Record<string, string> = {
  PHONE_SCREEN: "Phone Screen",
  ONSITE: "Onsite",
  PANEL: "Panel",
  ASSESSMENT: "Assessment",
  TASK: "Task/Assignment",
  FINAL: "Final Round",
  OTHER: "Other",
};

export interface StageLabelSource {
  stageType?: { name: string } | null;
  customType?: string | null;
  type?: string | null;
}

export function resolveStageLabel(interview: StageLabelSource): string {
  if (interview.stageType?.name) return interview.stageType.name;
  if (interview.customType) return interview.customType;
  if (interview.type) return LEGACY_TYPE_LABELS[interview.type] ?? interview.type;
  return "Interview";
}
