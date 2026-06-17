import { z } from "zod";

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
  appliedDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type UpdateStatusData = z.infer<typeof updateStatusSchema>;
