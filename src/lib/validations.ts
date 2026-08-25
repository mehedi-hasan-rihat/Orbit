import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["WISHLIST", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN", "ARCHIVED"]),
  appliedDate: z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")), // comma-separated tag ids
});

export const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["WISHLIST", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN", "ARCHIVED"]),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type UpdateStatusData = z.infer<typeof updateStatusSchema>;
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

// Seeded for every user on first read of their pipeline.
export const DEFAULT_STAGE_TYPES = [
  "Screening",
  "Interview",
  "Technical Interview",
  "HR",
  "Assessment",
  "Offer",
] as const;

export const stageTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const interviewSchema = z.object({
  stageTypeId: z.string().min(1, "Type is required"),
  round: z.coerce.number().min(1).max(20),
  scheduledAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  outcome: z.enum(INTERVIEW_OUTCOMES).optional(),
});

export type StageTypeFormData = z.infer<typeof stageTypeSchema>;
export type InterviewFormData = z.infer<typeof interviewSchema>;
