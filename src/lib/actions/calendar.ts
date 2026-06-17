"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getCalendarEvents() {
  const session = await getSession();
  if (!session) return [];

  // Get all interviews with scheduled dates
  const interviews = await prisma.interview.findMany({
    where: {
      scheduledAt: { not: null },
      application: { userId: session.userId, archived: false },
    },
    include: {
      application: { select: { id: true, company: true, role: true, status: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  // Get all applications with follow-up dates
  const followUps = await prisma.application.findMany({
    where: {
      userId: session.userId,
      archived: false,
      followUpDate: { not: null },
    },
    select: { id: true, company: true, role: true, status: true, followUpDate: true },
    orderBy: { followUpDate: "asc" },
  });

  const events = [
    ...interviews.map((i) => ({
      id: i.id,
      applicationId: i.application.id,
      type: "INTERVIEW" as const,
      title: `${i.application.company} — Round ${i.round} ${i.type.replace("_", " ")}`,
      company: i.application.company,
      role: i.application.role,
      date: i.scheduledAt!,
      status: i.application.status,
      outcome: i.outcome,
    })),
    ...followUps.map((f) => ({
      id: `followup-${f.id}`,
      applicationId: f.id,
      type: "FOLLOWUP" as const,
      title: `Follow-up: ${f.company}`,
      company: f.company,
      role: f.role,
      date: f.followUpDate!,
      status: f.status,
      outcome: null,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
}
