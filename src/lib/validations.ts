import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stageId: z.string().min(1, "Stage is required"),
  appliedDate: z.string().optional().or(z.literal("")),
  stageOutcome: z.string().optional().or(z.literal("")),
  stageScheduledAt: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

// How many open reminders one application may carry.
export const MAX_ACTIVE_REMINDERS = 2;

export const reminderEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  details: z.string().max(2000).optional().or(z.literal("")),
  dueAt: z.string().min(1, "A date is required"),
});

export type ReminderEntryData = z.infer<typeof reminderEntrySchema>;
export type TagFormData = z.infer<typeof tagSchema>;

// ─── Stage outcomes ───────────────────────────────────────────────────────────

// Fixed vocabulary for the sub-status of the current stage step.
export const INTERVIEW_OUTCOMES = [
  "PENDING",
  "SCHEDULED",
  "COMPLETED",
  "PASSED",
  "FAILED",
  "CANCELLED",
] as const;

export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[number];

// Outcomes that mean the stage step hasn't happened yet — the cron chases these.
export const OPEN_OUTCOMES: InterviewOutcome[] = ["PENDING", "SCHEDULED"];

// Stages whose status dropdown appears on the application form.
export const SCHEDULING_STAGE_NAMES: readonly string[] = [
  "Screening",
  "Assessment",
  "Interview",
];

// Stages that record a date when the outcome was reached (no time).
export const OUTCOME_STAGE_NAMES: readonly string[] = [
  "Get Offer",
  "Hired",
  "Rejected",
];

// ─── Pipeline stage categories ────────────────────────────────────────────────

export const STAGE_CATEGORIES = ["OPEN", "INTERVIEWING", "SUCCESS", "CLOSED"] as const;
export type StageCategoryValue = (typeof STAGE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<StageCategoryValue, string> = {
  OPEN: "Not started",
  INTERVIEWING: "In process",
  SUCCESS: "Final stage",
  CLOSED: "Closed",
};

// ─── Default pipeline stages ──────────────────────────────────────────────────

export const DEFAULT_STAGE_TYPES = [
  { name: "Wishlist",   color: "#6b7280", category: "OPEN",         enabled: true },
  { name: "Applied",    color: "#3b82f6", category: "OPEN",         enabled: true },
  { name: "Screening",  color: "#a855f7", category: "OPEN",         enabled: true },
  { name: "Assessment", color: "#f59e0b", category: "INTERVIEWING", enabled: true },
  { name: "Interview",  color: "#f97316", category: "INTERVIEWING", enabled: true },
  { name: "Get Offer",  color: "#22c55e", category: "SUCCESS",      enabled: true },
  { name: "Hired",      color: "#10b981", category: "SUCCESS",      enabled: true },
  { name: "Rejected",   color: "#ef4444", category: "CLOSED",       enabled: true },
] as const satisfies readonly {
  name: string;
  color: string;
  category: StageCategoryValue;
  enabled: boolean;
}[];

export const SYSTEM_STAGE_NAMES = [
  "Wishlist",
  "Applied",
  "Screening",
  "Assessment",
  "Interview",
  "Get Offer",
  "Hired",
  "Rejected",
] as const satisfies readonly (typeof DEFAULT_STAGE_TYPES)[number]["name"][];

export type SystemStageName = (typeof SYSTEM_STAGE_NAMES)[number];

export const RETIRED_STAGE_NAMES: readonly string[] = ["Archived", "Technical Interview"];

export function isSystemStageName(name: string): name is SystemStageName {
  return (SYSTEM_STAGE_NAMES as readonly string[]).includes(name);
}

export function isReservedStageName(name: string): boolean {
  const candidate = name.trim().toLowerCase();
  return SYSTEM_STAGE_NAMES.some((n) => n.toLowerCase() === candidate);
}

export function isRetiredStageName(name: string): boolean {
  const candidate = name.trim().toLowerCase();
  return RETIRED_STAGE_NAMES.some((n) => n.toLowerCase() === candidate);
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const stageTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  category: z.enum(STAGE_CATEGORIES),
});

export const updateStageSchema = z.object({
  id: z.string().min(1),
  stageId: z.string().min(1, "Stage is required"),
});

export type StageTypeFormData = z.infer<typeof stageTypeSchema>;
export type UpdateStageData = z.infer<typeof updateStageSchema>;
