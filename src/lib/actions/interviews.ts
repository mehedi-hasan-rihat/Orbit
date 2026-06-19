"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActivityType } from "@/generated/prisma/enums";

const interviewSchema = z.object({
  type: z.enum(["PHONE_SCREEN", "ONSITE", "PANEL", "ASSESSMENT", "TASK", "FINAL", "OTHER"]),
  customType: z.string().max(100).optional().or(z.literal("")),
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
    customType: (formData.get("customType") as string) || "",
    round: formData.get("round") as string,
    scheduledAt: (formData.get("scheduledAt") as string) || "",
    notes: (formData.get("notes") as string) || "",
    outcome: (formData.get("outcome") as string) || "PENDING",
  };

  const parsed = interviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;

  await prisma.interview.create({
    data: {
      applicationId,
      type: data.type,
      customType: data.type === "OTHER" && data.customType ? data.customType : null,
      round: data.round,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      notes: data.notes || null,
      outcome: data.outcome || "PENDING",
    },
  });

  const typeLabel = data.type === "OTHER" && data.customType ? data.customType : data.type.replace("_", " ");

  // Auto-advance status based on outcome
  const earlyStages = ["WISHLIST", "APPLIED", "SCREENING"];
  if (data.outcome === "PASSED" && earlyStages.includes(application.status)) {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW",
        activities: {
          create: {
            type: ActivityType.STATUS_CHANGED,
            description: `Status changed from ${application.status} to INTERVIEW (interview passed)`,
            metadata: JSON.stringify({ from: application.status, to: "INTERVIEW" }),
          },
        },
      },
    });
  }

  // Log activity
  await prisma.activity.create({
    data: {
      applicationId,
      type: ActivityType.INTERVIEW_SCHEDULED,
      description: `Round ${data.round} ${typeLabel} interview ${data.scheduledAt ? `scheduled for ${new Date(data.scheduledAt).toLocaleDateString()}` : "added"}`,
      metadata: JSON.stringify({ type: data.type, round: data.round, customType: data.customType || null }),
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
    customType: (formData.get("customType") as string) || "",
    round: formData.get("round") as string,
    scheduledAt: (formData.get("scheduledAt") as string) || "",
    notes: (formData.get("notes") as string) || "",
    outcome: (formData.get("outcome") as string) || "PENDING",
  };

  const parsed = interviewSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  const existing = await prisma.interview.findUnique({ where: { id } });

  await prisma.interview.update({
    where: { id },
    data: {
      type: data.type,
      customType: data.type === "OTHER" && data.customType ? data.customType : null,
      round: data.round,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      notes: data.notes || null,
      outcome: data.outcome || "PENDING",
    },
  });

  // Log outcome change and auto-update application status
  if (existing?.outcome !== data.outcome && data.outcome !== "PENDING") {
    const typeLabel = data.type === "OTHER" && data.customType ? data.customType : data.type.replace("_", " ");
    await prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.INTERVIEW_OUTCOME,
        description: `Round ${data.round} ${typeLabel} interview: ${data.outcome}`,
        metadata: JSON.stringify({ type: data.type, round: data.round, outcome: data.outcome }),
      },
    });

    // Auto-advance status based on outcome
    const earlyStages = ["WISHLIST", "APPLIED", "SCREENING"];
    if (data.outcome === "PASSED" && earlyStages.includes(application.status)) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: "INTERVIEW",
          activities: {
            create: {
              type: ActivityType.STATUS_CHANGED,
              description: `Status changed from ${application.status} to INTERVIEW (interview passed)`,
              metadata: JSON.stringify({ from: application.status, to: "INTERVIEW" }),
            },
          },
        },
      });
    }
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
