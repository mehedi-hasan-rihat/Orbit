import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "ARCHIVED"]),
  appliedDate: z.string().optional().or(z.literal("")),
  followUpDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")), // comma-separated tag ids
});

export const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "ARCHIVED"]),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type UpdateStatusData = z.infer<typeof updateStatusSchema>;
export type TagFormData = z.infer<typeof tagSchema>;
