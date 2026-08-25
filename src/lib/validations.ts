import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stageId: z.string().min(1, "Stage is required"),
  appliedDate: z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")), // comma-separated tag ids
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type TagFormData = z.infer<typeof tagSchema>;

// ─── Interview pipeline ──────────────────────────────────────────────────────

// Outcomes are a fixed vocabulary — only the stage *types* are user-editable.
export const INTERVIEW_OUTCOMES = [
  "PENDING",
  "SCHEDULED",
  "PASSED",
  "FAILED",
  "REJECTED",
  "CANCELLED",
  "WITHDRAWN",
  "COMPLETED",
] as const;

export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[number];

// Outcomes that mean "this round has not happened yet" — these are the ones the
// reminder cron still chases, and the ones that are not worth an activity entry.
export const OPEN_OUTCOMES: InterviewOutcome[] = ["PENDING", "SCHEDULED"];

export const STAGE_CATEGORIES = ["OPEN", "INTERVIEWING", "SUCCESS", "CLOSED"] as const;
export type StageCategoryValue = (typeof STAGE_CATEGORIES)[number];

// What each category means for the aggregations that used to hard-code status
// names: interview rate, offer rate, and follow-up eligibility.
export const CATEGORY_LABELS: Record<StageCategoryValue, string> = {
  OPEN: "Not started",
  INTERVIEWING: "In process",
  SUCCESS: "Offer",
  CLOSED: "Closed",
};

// Stages an interview round can be filed under. OPEN and CLOSED stages are
// application lifecycle states, not things you sit an interview for.
export const ROUND_CATEGORIES: StageCategoryValue[] = ["INTERVIEWING", "SUCCESS"];

// Seeded for every user on first read of their pipeline. Order here is the
// order stages appear on the board.
export const DEFAULT_STAGE_TYPES = [
  { name: "Wishlist", color: "#6b7280", category: "OPEN", enabled: true },
  { name: "Applied", color: "#3b82f6", category: "OPEN", enabled: true },
  { name: "Screening", color: "#a855f7", category: "INTERVIEWING", enabled: true },
  { name: "Interview", color: "#f59e0b", category: "INTERVIEWING", enabled: true },
  { name: "Technical Interview", color: "#0ea5e9", category: "INTERVIEWING", enabled: true },
  { name: "HR", color: "#ec4899", category: "INTERVIEWING", enabled: true },
  { name: "Assessment", color: "#14b8a6", category: "INTERVIEWING", enabled: true },
  { name: "Offer", color: "#22c55e", category: "SUCCESS", enabled: true },
  { name: "Rejected", color: "#ef4444", category: "CLOSED", enabled: true },
  { name: "Withdrawn", color: "#f97316", category: "CLOSED", enabled: false },
  { name: "Archived", color: "#64748b", category: "CLOSED", enabled: false },
] as const satisfies readonly {
  name: string;
  color: string;
  category: StageCategoryValue;
  enabled: boolean;
}[];

export const stageTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  category: z.enum(STAGE_CATEGORIES),
});

export const updateStageSchema = z.object({
  id: z.string().min(1),
  stageId: z.string().min(1, "Stage is required"),
});

export const interviewSchema = z.object({
  stageTypeId: z.string().min(1, "Type is required"),
  round: z.coerce.number().min(1).max(20),
  scheduledAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  outcome: z.enum(INTERVIEW_OUTCOMES).optional(),
});

export type StageTypeFormData = z.infer<typeof stageTypeSchema>;
export type UpdateStageData = z.infer<typeof updateStageSchema>;
export type InterviewFormData = z.infer<typeof interviewSchema>;
