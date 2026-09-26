"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getCalendarEvents() {
  const session = await getSession();
  if (!session) return [];

  const [scheduled, reminders] = await Promise.all([
    // Stage-scheduled events: set from the Update Application modal
    prisma.application.findMany({
      where: {
        userId: session.userId,
        archived: false,
        closed: false,
        stageScheduledAt: { not: null },
      },
      select: {
        id: true,
        company: true,
        role: true,
        stageScheduledAt: true,
        stage: { select: { name: true, color: true } },
        stageOutcome: true,
      },
      orderBy: { stageScheduledAt: "asc" },
    }),

    // Reminders: individual FollowUp rows set from the Reminders section
    prisma.followUp.findMany({
      where: {
        done: false,
        application: { userId: session.userId, archived: false, closed: false },
      },
      select: {
        id: true,
        title: true,
        dueAt: true,
        application: { select: { id: true, company: true, role: true } },
      },
      orderBy: { dueAt: "asc" },
    }),
  ]);

  return [
    ...scheduled.map((a) => ({
      id: `scheduled-${a.id}`,
      applicationId: a.id,
      type: "SCHEDULED" as const,
      company: a.company,
      role: a.role,
      date: a.stageScheduledAt!,
      outcome: a.stageOutcome,
      stageName: a.stage?.name ?? null,
      title: `${a.stage?.name ?? "Stage"}: ${a.company}`,
    })),
    ...reminders.map((f) => ({
      id: `reminder-${f.id}`,
      applicationId: f.application.id,
      type: "REMINDER" as const,
      company: f.application.company,
      role: f.application.role,
      date: f.dueAt,
      outcome: null,
      stageName: null,
      title: f.title,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
