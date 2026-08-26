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

// The follow-up date is editable on its own from the detail page, without
// round-tripping the whole application form.
export const followUpSchema = z.object({
  followUpDate: z.string().optional().or(z.literal("")),
});

// How many open follow-ups one application may carry. A cap rather than a
// schema constraint: it is a rule about what is useful to track, and completed
// ones never count against it.
export const MAX_ACTIVE_FOLLOW_UPS = 2;

export const followUpEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  details: z.string().max(2000).optional().or(z.literal("")),
  dueAt: z.string().min(1, "A date is required"),
});

export type FollowUpEntryData = z.infer<typeof followUpEntrySchema>;

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type TagFormData = z.infer<typeof tagSchema>;

// ─── Interview pipeline ──────────────────────────────────────────────────────

// Outcomes are a fixed vocabulary — only the stage *types* are user-editable.
//
// This describes one round, not the application. REJECTED and WITHDRAWN used to
// live here too and were duplicates twice over: at the round level they said
// nothing FAILED/CANCELLED didn't, and at the application level that meaning now
// belongs to the `closed` and `offered` flags. Both were backfilled away in
// 20260826150000_offered_flag_and_outcome_dedup.
export const INTERVIEW_OUTCOMES = [
  "PENDING",
  "SCHEDULED",
  "COMPLETED",
  "PASSED",
  "FAILED",
  "CANCELLED",
] as const;

export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[number];

// Outcomes that mean "this round has not happened yet" — these are the ones the
// reminder cron still chases, and the ones that are not worth an activity entry.
export const OPEN_OUTCOMES: InterviewOutcome[] = ["PENDING", "SCHEDULED"];

export const STAGE_CATEGORIES = ["OPEN", "INTERVIEWING", "SUCCESS", "CLOSED"] as const;
export type StageCategoryValue = (typeof STAGE_CATEGORIES)[number];

// What each category means for the aggregations that used to hard-code status
// names: interview rate and follow-up eligibility.
//
// SUCCESS no longer drives the offer numbers — that is the `offered` flag on the
// application, because an offer is an outcome and not a place you sit. The
// category stays for users who had, or still want, a stage shaped that way.
export const CATEGORY_LABELS: Record<StageCategoryValue, string> = {
  OPEN: "Not started",
  INTERVIEWING: "In process",
  SUCCESS: "Final stage",
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
] as const satisfies readonly {
  name: string;
  color: string;
  category: StageCategoryValue;
  enabled: boolean;
}[];

// The stages every pipeline is guaranteed to have. Seeded like the rest, but
// locked afterwards: name, category, visibility and existence are fixed, and
// they are restored if one ever goes missing. Everything else in
// DEFAULT_STAGE_TYPES is only a starting suggestion the user owns outright.
export const SYSTEM_STAGE_NAMES = [
  "Wishlist",
  "Applied",
  "Screening",
  "Interview",
] as const satisfies readonly (typeof DEFAULT_STAGE_TYPES)[number]["name"][];

export type SystemStageName = (typeof SYSTEM_STAGE_NAMES)[number];

// Stages that were seeded once and shouldn't have been. "Archived" is not a
// place in the pipeline — archiving is a flag on the application
// (Application.archived) with its own tab and its own actions. The leftover
// seeded row is cleared on the next pipeline read if it was never used.
export const RETIRED_STAGE_NAMES: readonly string[] = ["Archived"];

export function isSystemStageName(name: string): name is SystemStageName {
  return (SYSTEM_STAGE_NAMES as readonly string[]).includes(name);
}

// Case-insensitive on purpose. @@unique([userId, name]) is case-sensitive, so
// a second "wishlist" would be accepted next to the locked "Wishlist" and read
// as a duplicate column on the board.
export function isReservedStageName(name: string): boolean {
  const candidate = name.trim().toLowerCase();
  return SYSTEM_STAGE_NAMES.some((n) => n.toLowerCase() === candidate);
}

// Retired names stay unavailable rather than merely unseeded: the reconcile
// pass clears an unused hidden "Archived", so letting one be recreated would
// mean it vanished again the moment the user hid it.
export function isRetiredStageName(name: string): boolean {
  const candidate = name.trim().toLowerCase();
  return RETIRED_STAGE_NAMES.some((n) => n.toLowerCase() === candidate);
}

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
