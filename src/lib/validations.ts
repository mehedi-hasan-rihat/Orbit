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

// Single source of truth for every outcome value and its display properties.
// Adding a new outcome means adding one entry here — nothing else needs updating.
export const OUTCOMES = {
  PENDING:   { label: "Pending",   color: "#6b7280", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  SCHEDULED: { label: "Scheduled", color: "#3b82f6", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  ASSIGNED:  { label: "Assigned",  color: "#f59e0b", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  COMPLETED: { label: "Completed", color: "#6366f1", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" },
  PASSED:    { label: "Passed",    color: "#22c55e", className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  FAILED:    { label: "Failed",    color: "#ef4444", className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  CANCELLED: { label: "Cancelled", color: "#64748b", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
} as const;

export type InterviewOutcome = keyof typeof OUTCOMES;

// Derived list — no need to maintain separately
export const INTERVIEW_OUTCOMES = Object.keys(OUTCOMES) as InterviewOutcome[];

// Outcomes that mean the stage step hasn't happened yet — the cron chases these.
export const OPEN_OUTCOMES: InterviewOutcome[] = ["PENDING", "SCHEDULED", "ASSIGNED"];

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
