"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applicationSchema, updateStageSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { resolveStage } from "@/lib/stage-display";
import { ActivityType, StageCategory } from "@/generated/prisma/enums";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function findOwnedStage(stageId: string, userId: string) {
  return prisma.pipelineStageType.findFirst({ where: { id: stageId, userId } });
}

export async function createApplication(formData: FormData) {
  const session = await requireUser();

  const raw = {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    jobUrl: formData.get("jobUrl") as string,
    stageId: formData.get("stageId") as string,
    appliedDate: formData.get("appliedDate") as string,
    followUpDate: formData.get("followUpDate") as string,
    notes: formData.get("notes") as string,
    tags: formData.get("tags") as string,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const stage = await findOwnedStage(data.stageId, session.userId);
  if (!stage) return { error: { stageId: ["Unknown stage"] } };

  const tagIds = data.tags ? data.tags.split(",").filter(Boolean) : [];

  const application = await prisma.application.create({
    data: {
      userId: session.userId,
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl || null,
      stageId: stage.id,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes || null,
      activities: {
        create: {
          type: ActivityType.CREATED,
          description: `Application created for ${data.role} at ${data.company}`,
        },
      },
      tags: tagIds.length > 0 ? {
        create: tagIds.map((tagId) => ({ tagId })),
      } : undefined,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, id: application.id };
}

export async function updateApplication(id: string, formData: FormData) {
  const session = await requireUser();

  const raw = {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    jobUrl: formData.get("jobUrl") as string,
    stageId: formData.get("stageId") as string,
    appliedDate: formData.get("appliedDate") as string,
    followUpDate: formData.get("followUpDate") as string,
    notes: formData.get("notes") as string,
    tags: formData.get("tags") as string,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const stage = await findOwnedStage(data.stageId, session.userId);
  if (!stage) return { error: { stageId: ["Unknown stage"] } };

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
    include: { tags: true, stage: true },
  });

  if (!existing) {
    return { error: { _form: ["Application not found"] } };
  }

  // Track stage change. The description keeps the same "from X to Y" shape it
  // has always had, now with stage names in place of enum values.
  const activities: { type: ActivityType; description: string; metadata?: string }[] = [];
  if (existing.stageId !== stage.id) {
    const fromLabel = existing.stage?.name ?? existing.status ?? "Unassigned";
    activities.push({
      type: ActivityType.STATUS_CHANGED,
      description: `Status changed from ${fromLabel} to ${stage.name}`,
      metadata: JSON.stringify({ from: fromLabel, to: stage.name, toStageId: stage.id }),
    });
  }

  if (data.notes && data.notes !== existing.notes) {
    activities.push({
      type: ActivityType.NOTE_ADDED,
      description: "Notes updated",
    });
  }

  if (data.followUpDate && data.followUpDate !== existing.followUpDate?.toISOString().split("T")[0]) {
    activities.push({
      type: ActivityType.FOLLOW_UP_SET,
      description: `Follow-up set for ${data.followUpDate}`,
    });
  }

  const tagIds = data.tags ? data.tags.split(",").filter(Boolean) : [];

  // Remove existing tags and re-create
  await prisma.applicationTag.deleteMany({ where: { applicationId: id } });

  await prisma.application.update({
    where: { id },
    data: {
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl || null,
      stageId: stage.id,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes || null,
      activities: activities.length > 0 ? { create: activities } : undefined,
      tags: tagIds.length > 0 ? {
        create: tagIds.map((tagId) => ({ tagId })),
      } : undefined,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplicationStage(id: string, stageId: string) {
  const session = await requireUser();

  const parsed = updateStageSchema.safeParse({ id, stageId });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
    include: { stage: true },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  const stage = await findOwnedStage(parsed.data.stageId, session.userId);
  if (!stage) return { error: "Stage not found" };

  if (existing.stageId === stage.id) return { success: true };

  const fromLabel = existing.stage?.name ?? existing.status ?? "Unassigned";

  await prisma.application.update({
    where: { id },
    data: {
      stageId: stage.id,
      activities: {
        create: {
          type: ActivityType.STATUS_CHANGED,
          description: `Status changed from ${fromLabel} to ${stage.name}`,
          metadata: JSON.stringify({ from: fromLabel, to: stage.name, toStageId: stage.id }),
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function archiveApplication(id: string) {
  const session = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  await prisma.application.update({
    where: { id },
    data: {
      archived: true,
      activities: {
        create: {
          type: ActivityType.STATUS_CHANGED,
          description: "Application archived",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function unarchiveApplication(id: string) {
  const session = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  await prisma.application.update({
    where: { id },
    data: {
      archived: false,
      activities: {
        create: {
          type: ActivityType.STATUS_CHANGED,
          description: "Application unarchived",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplication(id: string) {
  const session = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  await prisma.application.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getApplications(params?: {
  search?: string;
  stageId?: string;
  sort?: string;
  tag?: string;
  archived?: boolean;
}) {
  const session = await requireUser();

  const where: Record<string, unknown> = {
    userId: session.userId,
    archived: params?.archived ?? false,
  };

  if (params?.stageId && params.stageId !== "ALL") {
    where.stageId = params.stageId;
  }

  if (params?.search) {
    where.OR = [
      { company: { contains: params.search, mode: "insensitive" } },
      { role: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params?.tag) {
    where.tags = { some: { tagId: params.tag } };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params?.sort === "company") orderBy = { company: "asc" };
  if (params?.sort === "appliedDate") orderBy = { appliedDate: "desc" };
  if (params?.sort === "updatedAt") orderBy = { updatedAt: "desc" };
  if (params?.sort === "followUpDate") orderBy = { followUpDate: "asc" };

  const applications = await prisma.application.findMany({
    where,
    orderBy,
    include: {
      tags: { include: { tag: true } },
      stage: { select: { id: true, name: true, color: true, category: true } },
    },
  });

  return applications;
}

export async function getApplication(id: string) {
  const session = await requireUser();

  const application = await prisma.application.findFirst({
    where: { id, userId: session.userId },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      tags: { include: { tag: true } },
      stage: { select: { id: true, name: true, color: true, category: true } },
    },
  });

  return application;
}

export async function getApplicationStats() {
  const session = await requireUser();

  const [applications, stages] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.userId, archived: false },
      select: { stageId: true, createdAt: true, stage: { select: { category: true } } },
    }),
    prisma.pipelineStageType.findMany({
      where: { userId: session.userId },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, color: true, category: true, enabled: true },
    }),
  ]);

  const total = applications.length;

  // Distribution is now one entry per stage the user actually has, in their
  // own pipeline order — no fixed set of enum keys.
  const counts = new Map<string, number>();
  for (const app of applications) {
    if (!app.stageId) continue;
    counts.set(app.stageId, (counts.get(app.stageId) ?? 0) + 1);
  }

  const stageCounts = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    color: stage.color,
    category: stage.category,
    value: counts.get(stage.id) ?? 0,
  }));

  const byCategory = (category: StageCategory) =>
    applications.filter((a) => a.stage?.category === category).length;

  const interviewing = byCategory(StageCategory.INTERVIEWING);
  const offers = byCategory(StageCategory.SUCCESS);

  // Same meaning as before: everything that got past "applied" counts, which
  // used to be SCREENING + INTERVIEW + OFFER.
  const interviewRate = total > 0 ? ((interviewing + offers) / total) * 100 : 0;
  const offerRate = total > 0 ? (offers / total) * 100 : 0;

  // Weekly stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = applications.filter((a) => a.createdAt >= weekAgo).length;

  return { total, stageCounts, interviewing, offers, interviewRate, offerRate, thisWeek };
}

export async function getFollowUps() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: {
      userId: session.userId,
      archived: false,
      followUpDate: { not: null },
      // Closed stages are the pipeline equivalent of the old
      // REJECTED / WITHDRAWN / ARCHIVED exclusion.
      stage: { category: { not: StageCategory.CLOSED } },
    },
    orderBy: { followUpDate: "asc" },
    include: {
      tags: { include: { tag: true } },
      stage: { select: { id: true, name: true, color: true, category: true } },
    },
  });

  return applications;
}

export async function getCompanyStats() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    select: { company: true, stage: { select: { category: true } } },
  });

  const companyMap: Record<string, { total: number; interviews: number; offers: number }> = {};

  for (const app of applications) {
    if (!companyMap[app.company]) {
      companyMap[app.company] = { total: 0, interviews: 0, offers: 0 };
    }
    companyMap[app.company].total++;
    if (app.stage?.category === StageCategory.INTERVIEWING) companyMap[app.company].interviews++;
    if (app.stage?.category === StageCategory.SUCCESS) companyMap[app.company].offers++;
  }

  return Object.entries(companyMap)
    .map(([company, stats]) => ({ company, ...stats }))
    .sort((a, b) => b.total - a.total);
}

export async function checkDuplicate(company: string, role: string) {
  const session = await getSession();
  if (!session) return null;

  return prisma.application.findFirst({
    where: {
      userId: session.userId,
      company: { equals: company, mode: "insensitive" },
      role: { equals: role, mode: "insensitive" },
      archived: false,
    },
    select: {
      id: true,
      company: true,
      role: true,
      status: true,
      stage: { select: { name: true, color: true } },
    },
  });
}

export async function addQuickNote(id: string, note: string) {
  const session = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Not found" };

  const newNotes = existing.notes
    ? `${existing.notes}\n\n[${new Date().toLocaleDateString()}] ${note}`
    : `[${new Date().toLocaleDateString()}] ${note}`;

  await prisma.application.update({
    where: { id },
    data: {
      notes: newNotes,
      activities: {
        create: {
          type: ActivityType.NOTE_ADDED,
          description: `Note added: ${note.slice(0, 60)}${note.length > 60 ? "..." : ""}`,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/applications/${id}`);
  return { success: true };
}

export async function exportApplicationsCsv() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } }, stage: { select: { name: true, color: true } } },
  });

  const headers = ["Company", "Role", "Status", "Applied Date", "Follow-up Date", "Job URL", "Tags", "Notes", "Created"];
  const rows = applications.map((app) => [
    app.company,
    app.role,
    resolveStage(app).name,
    app.appliedDate ? app.appliedDate.toISOString().split("T")[0] : "",
    app.followUpDate ? app.followUpDate.toISOString().split("T")[0] : "",
    app.jobUrl || "",
    app.tags.map((t) => t.tag.name).join("; "),
    (app.notes || "").replace(/,/g, ";"),
    app.createdAt.toISOString().split("T")[0],
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  return csv;
}
