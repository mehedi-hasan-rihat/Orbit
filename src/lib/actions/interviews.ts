"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityType, StageCategory } from "@/generated/prisma/enums";
import { interviewSchema, OPEN_OUTCOMES, type InterviewOutcome } from "@/lib/validations";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function readForm(formData: FormData) {
  return {
    stageTypeId: formData.get("stageTypeId") as string,
    round: formData.get("round") as string,
    scheduledAt: (formData.get("scheduledAt") as string) || "",
    notes: (formData.get("notes") as string) || "",
    outcome: (formData.get("outcome") as string) || "PENDING",
  };
}

function isOpen(outcome: InterviewOutcome) {
  return OPEN_OUTCOMES.includes(outcome);
}

// A stage type id arrives from the client, so it gets the same ownership
// treatment as an application id — never trust it.
async function findOwnedStageType(id: string, userId: string) {
  return prisma.pipelineStageType.findFirst({ where: { id, userId } });
}

// Still the same rule — a passed round pulls an application that has not yet
// reached the interviewing part of the pipeline forward, and logs why. What
// changed is how "forward" is found: the first INTERVIEWING stage in the user's
// own pipeline order, rather than the hard-coded INTERVIEW enum value.
async function advanceOnPass(
  applicationId: string,
  userId: string,
  current: { stageId: string | null; stageName: string | null; category: StageCategory | null },
  outcome: InterviewOutcome,
) {
  if (outcome !== "PASSED") return;

  // Only stages that come before the interviewing part of the funnel advance.
  if (current.category !== null && current.category !== StageCategory.OPEN) return;

  const target = await prisma.pipelineStageType.findFirst({
    where: { userId, category: StageCategory.INTERVIEWING, enabled: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  if (!target || target.id === current.stageId) return;

  const fromLabel = current.stageName ?? "Unassigned";

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      stageId: target.id,
      activities: {
        create: {
          type: ActivityType.STATUS_CHANGED,
          description: `Status changed from ${fromLabel} to ${target.name} (interview passed)`,
          metadata: JSON.stringify({ from: fromLabel, to: target.name, toStageId: target.id }),
        },
      },
    },
  });
}

export async function createInterview(applicationId: string, formData: FormData) {
  const session = await requireUser();

  // Verify the application belongs to the user
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
    include: { stage: { select: { name: true, category: true } } },
  });
  if (!application) return { error: "Application not found" };

  const parsed = interviewSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  const outcome = data.outcome ?? "PENDING";

  const stageType = await findOwnedStageType(data.stageTypeId, session.userId);
  if (!stageType) return { error: { stageTypeId: ["Unknown stage type"] } };

  await prisma.interview.create({
    data: {
      applicationId,
      stageTypeId: stageType.id,
      round: data.round,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      notes: data.notes || null,
      outcome,
    },
  });

  await advanceOnPass(
    applicationId,
    session.userId,
    {
      stageId: application.stageId,
      stageName: application.stage?.name ?? application.status,
      category: application.stage?.category ?? null,
    },
    outcome,
  );

  // Log activity
  await prisma.activity.create({
    data: {
      applicationId,
      type: ActivityType.INTERVIEW_SCHEDULED,
      description: `Round ${data.round} ${stageType.name} interview ${data.scheduledAt ? `scheduled for ${new Date(data.scheduledAt).toLocaleDateString()}` : "added"}`,
      metadata: JSON.stringify({
        stageTypeId: stageType.id,
        stageType: stageType.name,
        round: data.round,
      }),
    },
  });

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function updateInterview(id: string, applicationId: string, formData: FormData) {
  const session = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
    include: { stage: { select: { name: true, category: true } } },
  });
  if (!application) return { error: "Application not found" };

  const parsed = interviewSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  const outcome = data.outcome ?? "PENDING";

  const stageType = await findOwnedStageType(data.stageTypeId, session.userId);
  if (!stageType) return { error: { stageTypeId: ["Unknown stage type"] } };

  const existing = await prisma.interview.findFirst({
    where: { id, applicationId },
  });
  if (!existing) return { error: "Interview not found" };

  await prisma.interview.update({
    where: { id },
    data: {
      stageTypeId: stageType.id,
      // Editing migrates a pre-rework row forward: once it points at a stage
      // type, the legacy columns must stop shadowing it in resolveStageLabel.
      type: null,
      customType: null,
      round: data.round,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      notes: data.notes || null,
      outcome,
    },
  });

  // Log outcome change and auto-update application status. PENDING and
  // SCHEDULED are states on the way to an outcome, not outcomes themselves.
  if (existing.outcome !== outcome && !isOpen(outcome)) {
    await prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.INTERVIEW_OUTCOME,
        description: `Round ${data.round} ${stageType.name} interview: ${outcome}`,
        metadata: JSON.stringify({
          stageTypeId: stageType.id,
          stageType: stageType.name,
          round: data.round,
          outcome,
        }),
      },
    });

    await advanceOnPass(
    applicationId,
    session.userId,
    {
      stageId: application.stageId,
      stageName: application.stage?.name ?? application.status,
      category: application.stage?.category ?? null,
    },
    outcome,
  );
  }

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function deleteInterview(id: string, applicationId: string) {
  const session = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.userId },
    include: { stage: { select: { name: true, category: true } } },
  });
  if (!application) return { error: "Application not found" };

  // The application is the user's, but the interview id still has to belong to
  // that application before it can be deleted.
  const existing = await prisma.interview.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Interview not found" };

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
    include: { stageType: { select: { id: true, name: true, enabled: true } } },
    orderBy: [{ round: "asc" }, { createdAt: "asc" }],
  });
}
