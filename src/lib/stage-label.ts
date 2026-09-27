// Resolving an interview's display label.
//
// Two sources: stageType relation (current), or customType snapshot
// (taken when a stage type is deleted).

export interface StageLabelSource {
  stageType?: { name: string } | null;
  customType?: string | null;
}

export function resolveStageLabel(interview: StageLabelSource): string {
  if (interview.stageType?.name) return interview.stageType.name;
  if (interview.customType) return interview.customType;
  return "Interview";
}
