"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const interviewSchema = z.object({
  type: z.enum(["HR", "TECHNICAL", "SYSTEM_DESIGN", "BEHAVIORAL", "CULTURE_FIT", "TAKE_HOME", "FINAL", "OTHER"]),
  round: z.coerce.number().min(1).max(20),
  scheduledAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  outcome: z.enum(["PENDING", "PASSED", "FAILED", "CANCELLED"]).optional(),
});

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createInterview(applicationId: string, formData: FormData) {
  const session = await requireUser();

  // Verify the application belongs to the user
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
  });
  if (!application) return { error: "Application not found" };

  const raw = {
    type: formData.get("type") as string,
    round: formData.get("round") as string,
    scheduledAt: formData.get("scheduledAt") as string,
    notes: formData.get("notes") as string,
    outcome: (formData.get("outcome") as string) || "PENDING",
  };

  const parsed = interviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;

  await prisma.interview.create({
    data: {
      applicationId,
      type: data.type,
      round: data.round,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      notes: data.notes || null,
      outcome: data.outcome || "PENDING",
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      applicationId,
      type: "INTERVIEW_SCHEDULED",
      description: `Round ${data.round} ${data.type.replace("_", " ")} interview ${data.scheduledAt ? `scheduled for ${new Date(data.scheduledAt).toLocaleDateString()}` : "added"}`,
      metadata: JSON.stringify({ type: data.type, round: data.round }),
    },
  });

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function updateInterview(id: string, applicationId: string, formData: FormData) {
  const session = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
  });
  if (!application) return { error: "Application not found" };

  const raw = {
    type: formData.get("type") as string,
    round: formData.get("round") as string,
    scheduledAt: formData.get("scheduledAt") as string,
    notes: formData.get("notes") as string,
    outcome: formData.get("outcome") as string,
  };

  const parsed = interviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  const existing = await prisma.interview.findUnique({ where: { id } });

  await prisma.interview.update({
    where: { id },
    data: {
      type: data.type,
      round: data.round,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      notes: data.notes || null,
      outcome: data.outcome || "PENDING",
    },
  });

  // Log outcome change
  if (existing?.outcome !== data.outcome && data.outcome !== "PENDING") {
    await prisma.activity.create({
      data: {
        applicationId,
        type: "INTERVIEW_OUTCOME",
        description: `Round ${data.round} ${data.type.replace("_", " ")} interview: ${data.outcome}`,
        metadata: JSON.stringify({ type: data.type, round: data.round, outcome: data.outcome }),
      },
    });
  }

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function deleteInterview(id: string, applicationId: string) {
  const session = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
  });
  if (!application) return { error: "Application not found" };

  await prisma.interview.delete({ where: { id } });

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function getInterviews(applicationId: string) {
  const session = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
  });
  if (!application) return [];

  return prisma.interview.findMany({
    where: { applicationId },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });
}
