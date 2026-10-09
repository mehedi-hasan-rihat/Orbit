"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@/generated/prisma/enums";
import { reminderEntrySchema, MAX_ACTIVE_REMINDERS } from "@/lib/validations";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function findOwnedApplication(applicationId: string, userId: string) {
  return prisma.application.findFirst({ where: { id: applicationId, userId } });
}

function readForm(formData: FormData) {
  return {
    title: (formData.get("title") as string) ?? "",
    details: (formData.get("details") as string) || "",
    dueAt: (formData.get("dueAt") as string) ?? "",
  };
}

export async function getRemindersFor(applicationId: string) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return [];

  return prisma.reminder.findMany({
    where: { applicationId },
    orderBy: [{ done: "asc" }, { dueAt: "asc" }],
  });
}

export async function createReminder(applicationId: string, formData: FormData) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const parsed = reminderEntrySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) return { error: { dueAt: ["Invalid date"] } };

  const active = await prisma.reminder.count({
    where: { applicationId, done: false },
  });
  if (active >= MAX_ACTIVE_REMINDERS) {
    return {
      error: `You can track ${MAX_ACTIVE_REMINDERS} reminders at a time. Complete or remove one first.`,
    };
  }

  await prisma.reminder.create({
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
      type: ActivityType.REMINDER_SET,
      description: `Reminder added: ${parsed.data.title.trim()} (${dueAt.toLocaleDateString()})`,
      metadata: JSON.stringify({ title: parsed.data.title.trim(), dueAt: dueAt.toISOString() }),
    },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function updateReminder(id: string, applicationId: string, formData: FormData) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const parsed = reminderEntrySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const dueAt = new Date(parsed.data.dueAt);
  if (isNaN(dueAt.getTime())) return { error: { dueAt: ["Invalid date"] } };

  const existing = await prisma.reminder.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Reminder not found" };

  await prisma.reminder.update({
    where: { id },
    data: {
      title: parsed.data.title.trim(),
      details: parsed.data.details?.trim() || null,
      dueAt,
    },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function setReminderDone(id: string, applicationId: string, done: boolean) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const existing = await prisma.reminder.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Reminder not found" };

  if (!done) {
    const active = await prisma.reminder.count({ where: { applicationId, done: false } });
    if (active >= MAX_ACTIVE_REMINDERS) {
      return {
        error: `You already have ${MAX_ACTIVE_REMINDERS} open reminders. Complete or remove one first.`,
      };
    }
  }

  await prisma.reminder.update({
    where: { id },
    data: { done, doneAt: done ? new Date() : null },
  });

  if (done) {
    await prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.REMINDER_SET,
        description: `Reminder done: ${existing.title}`,
      },
    });
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function deleteReminder(id: string, applicationId: string) {
  const session = await requireUser();

  const application = await findOwnedApplication(applicationId, session.userId);
  if (!application) return { error: "Application not found" };

  const existing = await prisma.reminder.findFirst({ where: { id, applicationId } });
  if (!existing) return { error: "Reminder not found" };

  await prisma.reminder.delete({ where: { id } });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
