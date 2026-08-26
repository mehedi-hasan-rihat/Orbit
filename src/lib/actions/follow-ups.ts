"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@/generated/prisma/enums";
import { followUpEntrySchema, MAX_ACTIVE_FOLLOW_UPS } from "@/lib/validations";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// Never trust an application id from the client.
async function findOwnedApplication(applicationId: string, userId: string) {
  return prisma.application.findFirst({ where: { id: applicationId, userId } });
}

// Application.followUpDate is a mirror of the soonest still-open follow-up. The
// list sort, the board and the reminder queries all read that one column, so it
// is recomputed after every write here rather than left to drift.
async function syncMirror(applicationId: string) {
  const soonest = await prisma.followUp.findFirst({
    where: { applicationId, done: false },
    orderBy: { dueAt: "asc" },
    select: { dueAt: true },
  });

  await prisma.application.update({
    where: { id: applicationId },
    data: { followUpDate: soonest?.dueAt ?? null },
  });
}

function readForm(formData: FormData) {
  return {
    title: (formData.get("title") as string) ?? "",
    details: (formData.get("details") as string) || "",
    dueAt: (formData.get("dueAt") as string) ?? "",
  };
}

export async function getFollowUpsFor(applicationId: string) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return [];

  return prisma.followUp.findMany({
    where: { applicationId },
    orderBy: [{ done: "asc" }, { dueAt: "asc" }],
  });
}

export async function createFollowUp(applicationId: string, formData: FormData) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const parsed = followUpEntrySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) return { error: { dueAt: ["Invalid date"] } };

  // Completed follow-ups don't count — the cap is on what you're still chasing.
  const active = await prisma.followUp.count({
    where: { applicationId, done: false },
  });
  if (active >= MAX_ACTIVE_FOLLOW_UPS) {
    return {
      error: `You can track ${MAX_ACTIVE_FOLLOW_UPS} follow-ups at a time. Complete or remove one first.`,
    };
  }

  await prisma.followUp.create({
    data: {
      applicationId,
      title: parsed.data.title.trim(),
      details: parsed.data.details?.trim() || null,
      dueAt,
    },
  });

  await prisma.activity.create({
    data: {
      applicationId,
      type: ActivityType.FOLLOW_UP_SET,
      description: `Follow-up added: ${parsed.data.title.trim()} (${dueAt.toLocaleDateString()})`,
      metadata: JSON.stringify({ title: parsed.data.title.trim(), dueAt: dueAt.toISOString() }),
    },
  });

  await syncMirror(applicationId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function updateFollowUp(id: string, applicationId: string, formData: FormData) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const parsed = followUpEntrySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) return { error: { dueAt: ["Invalid date"] } };

  // The application is the user's, but the follow-up id still has to belong to it.
  const existing = await prisma.followUp.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Follow-up not found" };

  await prisma.followUp.update({
    where: { id },
    data: {
      title: parsed.data.title.trim(),
      details: parsed.data.details?.trim() || null,
      dueAt,
    },
  });

  await syncMirror(applicationId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function setFollowUpDone(id: string, applicationId: string, done: boolean) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const existing = await prisma.followUp.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Follow-up not found" };

  // Reopening one is refused when it would put the application over the cap,
  // otherwise "complete, add two more, reopen" walks straight past it.
  if (!done) {
    const active = await prisma.followUp.count({ where: { applicationId, done: false } });
    if (active >= MAX_ACTIVE_FOLLOW_UPS) {
      return {
        error: `You already have ${MAX_ACTIVE_FOLLOW_UPS} open follow-ups. Complete or remove one first.`,
      };
    }
  }

  await prisma.followUp.update({
    where: { id },
    data: { done, doneAt: done ? new Date() : null },
  });

  if (done) {
    await prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.FOLLOW_UP_SET,
        description: `Follow-up done: ${existing.title}`,
      },
    });
  }

  await syncMirror(applicationId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function deleteFollowUp(id: string, applicationId: string) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const existing = await prisma.followUp.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Follow-up not found" };

  await prisma.followUp.delete({ where: { id } });

  await syncMirror(applicationId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}
