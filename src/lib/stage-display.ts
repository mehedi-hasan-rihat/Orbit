// Resolving an application's stage for display.
//
// Applications written before the pipeline rework carry an ApplicationStatus
// enum value and no stageId. The backfill migration matched every existing row
// to a stage, but this fallback keeps such a row renderable if one ever appears
// (a restored backup, a row whose stage was force-removed).

const LEGACY_STATUS_DISPLAY: Record<string, { name: string; color: string }> = {
  WISHLIST:   { name: "Wishlist",   color: "#6b7280" },
  APPLIED:    { name: "Applied",    color: "#3b82f6" },
  SCREENING:  { name: "Screening",  color: "#a855f7" },
  INTERVIEW:  { name: "Interview",  color: "#f97316" },
  OFFER:      { name: "Get Offer",  color: "#22c55e" },
  REJECTED:   { name: "Rejected",   color: "#ef4444" },
  WITHDRAWN:  { name: "Withdrawn",  color: "#f97316" },
  ARCHIVED:   { name: "Archived",   color: "#64748b" },
};

export interface StageSource {
  stage?: { name: string; color: string } | null;
  status?: string | null;
}

export function resolveStage(application: StageSource): { name: string; color: string } {
  if (application.stage) return application.stage;
  if (application.status && LEGACY_STATUS_DISPLAY[application.status]) {
    return LEGACY_STATUS_DISPLAY[application.status];
  }
  return { name: "Unassigned", color: "#6b7280" };
}
