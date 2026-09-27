// Resolving an application's stage for display.

export interface StageSource {
  stage?: { name: string; color: string } | null;
}

export function resolveStage(application: StageSource): { name: string; color: string } {
  if (application.stage) return application.stage;
  return { name: "Unassigned", color: "#6b7280" };
}
