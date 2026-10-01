"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applicationSchema, updateStageSchema, OUTCOME_STAGE_NAMES, INTERVIEW_OUTCOMES } from "@/lib/validations";
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
    stageOutcome: formData.get("stageOutcome") as string,
    stageScheduledAt: formData.get("stageScheduledAt") as string,
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

  // Applied Date is required for every stage except Wishlist.
  if (stage.name !== "Wishlist" && !data.appliedDate) {
    return { error: { appliedDate: ["Applied date is required"] } };
  }

  // stageOutcome is required when the stage is a scheduling stage.
  const isSchedulingStage = ["Screening", "Assessment", "Interview"].includes(stage.name);
  if (isSchedulingStage && !data.stageOutcome) {
    return { error: { stageOutcome: ["Status is required for this stage"] } };
  }
  if (isSchedulingStage && data.stageOutcome && !(INTERVIEW_OUTCOMES as readonly string[]).includes(data.stageOutcome)) {
    return { error: { stageOutcome: ["Invalid status value"] } };
  }

  // stageScheduledAt is required only when outcome is SCHEDULED (future appointment).
  // For other terminal outcomes the date is optional but still stored.
  const isScheduled = data.stageOutcome === "SCHEDULED" || data.stageOutcome === "ASSIGNED";
  if (isSchedulingStage && isScheduled && !data.stageScheduledAt) {
    return { error: { stageScheduledAt: ["Scheduled date is required for this stage"] } };
  }

  // stageScheduledAt (date) is required for outcome stages.
  const isOutcomeStage = OUTCOME_STAGE_NAMES.includes(stage.name);
  if (isOutcomeStage && !data.stageScheduledAt) {
    return { error: { stageScheduledAt: ["Date is required for this stage"] } };
  }

  const tagIds = data.tags ? data.tags.split(",").filter(Boolean) : [];

  const application = await prisma.application.create({
    data: {
      userId: session.userId,
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl || null,
      stageId: stage.id,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      stageOutcome: data.stageOutcome || null,
      stageScheduledAt: data.stageScheduledAt ? new Date(data.stageScheduledAt) : null,
      activities: {
        create: [
          {
            type: ActivityType.CREATED,
            description: `Application created for ${data.role} at ${data.company}`,
          },
          ...(isSchedulingStage && data.stageScheduledAt ? [{
            type: ActivityType.OUTCOME_CHANGE,
            description: data.stageOutcome && !["SCHEDULED", "ASSIGNED"].includes(data.stageOutcome)
              ? `${stage.name} ${data.stageOutcome.toLowerCase()} on ${new Date(data.stageScheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
              : `${stage.name} scheduled for ${new Date(data.stageScheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
            metadata: JSON.stringify({ stageType: stage.name, stageId: stage.id, scheduledAt: data.stageScheduledAt, outcome: data.stageOutcome }),
          }] : []),
        ],
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
    stageOutcome: formData.get("stageOutcome") as string,
    stageScheduledAt: formData.get("stageScheduledAt") as string,
    tags: formData.get("tags") as string,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const stage = await findOwnedStage(data.stageId, session.userId);
  if (!stage) return { error: { stageId: ["Unknown stage"] } };

  // Applied Date is required for every stage except Wishlist.
  if (stage.name !== "Wishlist" && !data.appliedDate) {
    return { error: { appliedDate: ["Applied date is required"] } };
  }

  // stageOutcome is required when the stage is a scheduling stage.
  const isSchedulingStage = ["Screening", "Assessment", "Interview"].includes(stage.name);
  if (isSchedulingStage && !data.stageOutcome) {
    return { error: { stageOutcome: ["Status is required for this stage"] } };
  }
  if (isSchedulingStage && data.stageOutcome && !(INTERVIEW_OUTCOMES as readonly string[]).includes(data.stageOutcome)) {
    return { error: { stageOutcome: ["Invalid status value"] } };
  }

  // stageScheduledAt is required only when outcome is SCHEDULED (future appointment).
  // For other terminal outcomes the date is optional but still stored.
  const isScheduled = data.stageOutcome === "SCHEDULED" || data.stageOutcome === "ASSIGNED";
  if (isSchedulingStage && isScheduled && !data.stageScheduledAt) {
    return { error: { stageScheduledAt: ["Scheduled date is required for this stage"] } };
  }

  // stageScheduledAt (date) is required for outcome stages.
  const isOutcomeStage = OUTCOME_STAGE_NAMES.includes(stage.name);
  if (isOutcomeStage && !data.stageScheduledAt) {
    return { error: { stageScheduledAt: ["Date is required for this stage"] } };
  }

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
    include: { tags: true, stage: true },
  });

  if (!existing) {
    return { error: { _form: ["Application not found"] } };
  }

  const stageChanged = existing.stageId !== stage.id;

  // Track stage change.
  const activities: { type: ActivityType; description: string; metadata?: string }[] = [];
  if (stageChanged) {
    const fromLabel = existing.stage?.name ?? "Unassigned";
    activities.push({
      type: ActivityType.OUTCOME_CHANGE,
      description: `Status changed from ${fromLabel} to ${stage.name}`,
      metadata: JSON.stringify({ from: fromLabel, to: stage.name, toStageId: stage.id }),
    });
  }

  // Track when a scheduled date is set or changed for the current stage.
  const newScheduledAt = data.stageScheduledAt ? new Date(data.stageScheduledAt) : null;
  const oldScheduledAt = existing.stageScheduledAt;
  const scheduledAtChanged =
    newScheduledAt?.toISOString() !== (oldScheduledAt?.toISOString() ?? undefined);

  // Clear stageScheduledAt only when the stage changed AND the user didn't
  // provide a new date for the new stage. If they set a date in the same
  // submit, keep it — it belongs to the new stage.
  const resolvedScheduledAt = (stageChanged && !newScheduledAt) ? null : newScheduledAt;

  if (isSchedulingStage && resolvedScheduledAt && scheduledAtChanged) {
    const dateStr = resolvedScheduledAt.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const isTerminalOutcome = data.stageOutcome && !["SCHEDULED", "ASSIGNED"].includes(data.stageOutcome);
    const description = isTerminalOutcome
      ? `${stage.name} ${data.stageOutcome!.toLowerCase()} on ${dateStr}`
      : `${stage.name} scheduled for ${dateStr}`;
    activities.push({
      type: ActivityType.OUTCOME_CHANGE,
      description,
      metadata: JSON.stringify({ stageType: stage.name, stageId: stage.id, scheduledAt: resolvedScheduledAt.toISOString(), outcome: data.stageOutcome }),
    });
  }

  if (isOutcomeStage && resolvedScheduledAt && scheduledAtChanged) {
    const dateStr = resolvedScheduledAt.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    activities.push({
      type: ActivityType.OUTCOME_CHANGE,
      description: `${stage.name} on ${dateStr}`,
      metadata: JSON.stringify({ stageType: stage.name, stageId: stage.id, scheduledAt: resolvedScheduledAt.toISOString() }),
    });
  }

  const tagIds = data.tags ? data.tags.split(",").filter(Boolean) : [];

  await prisma.$transaction(async (tx) => {
    // If the stage changed or the date needs clearing, null it out first before
    // any other writes so the calendar and cron see a clean state immediately.
    if (resolvedScheduledAt === null) {
      await tx.application.update({
        where: { id },
        data: { stageScheduledAt: null, stageOutcome: stageChanged ? null : undefined },
      });
    }

    // Delete existing tags, then re-create atomically.
    await tx.applicationTag.deleteMany({ where: { applicationId: id } });

    await tx.application.update({
      where: { id },
      data: {
        company: data.company,
        role: data.role,
        jobUrl: data.jobUrl || null,
        stage: { connect: { id: stage.id } },
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
        stageOutcome: data.stageOutcome || null,
        stageScheduledAt: resolvedScheduledAt,
        activities: activities.length > 0 ? { create: activities } : undefined,
        tags: tagIds.length > 0 ? {
          create: tagIds.map((tagId) => ({ tagId })),
        } : undefined,
      },
    });
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

  const fromLabel = existing.stage?.name ?? "Unassigned";

  await prisma.application.update({
    where: { id },
    data: {
      stage: { connect: { id: stage.id } },
      stageOutcome: null, // clear sub-status when moving to a new stage
      stageScheduledAt: null, // clear scheduled date when moving to a new stage
      activities: {
        create: {
          type: ActivityType.OUTCOME_CHANGE,
          description: `Status changed from ${fromLabel} to ${stage.name}`,
          metadata: JSON.stringify({ from: fromLabel, to: stage.name, toStageId: stage.id }),
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// Moves the application to the user's "Rejected" pipeline stage.
// Used when a stage outcome is Failed/Cancelled and the user opts in.
// Returns { alreadyRejected: true } if the app is already on that stage,
// or { noStage: true } if the user hasn't defined a Rejected stage yet.
export async function moveToRejectedStage(id: string) {
  const session = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
    include: { stage: true },
  });
  if (!existing) return { error: "Application not found" };

  const rejectedStage = await prisma.pipelineStageType.findFirst({
    where: { userId: session.userId, name: "Rejected" },
  });
  if (!rejectedStage) return { noStage: true };

  if (existing.stageId === rejectedStage.id) return { alreadyRejected: true };

  const fromLabel = existing.stage?.name ?? "Unknown";

  await prisma.application.update({
    where: { id },
    data: {
      stage: { connect: { id: rejectedStage.id } },
      stageOutcome: null,
      stageScheduledAt: null,
      activities: {
        create: {
          type: ActivityType.OUTCOME_CHANGE,
          description: `Status changed from ${fromLabel} to Rejected`,
          metadata: JSON.stringify({ from: fromLabel, to: "Rejected", toStageId: rejectedStage.id }),
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
          type: ActivityType.OUTCOME_CHANGE,
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
          type: ActivityType.OUTCOME_CHANGE,
          description: "Application unarchived",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// Closing is deliberately not "move it to a Rejected stage": the stage, notes,
// tags and interview rounds are all left untouched, so the record still shows
// how far the application actually got. Only `closed`/`closedAt` change.
export async function closeApplication(id: string) {
  const session = await requireUser();

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  if (existing.closed) {
    return { success: true };
  }

  await prisma.application.update({
    where: { id },
    data: {
      closed: true,
      closedAt: new Date(),
      activities: {
        create: {
          type: ActivityType.OUTCOME_CHANGE,
          description: "Application closed",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${id}`);
  return { success: true };
}

export async function reopenApplication(id: string) {
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
      closed: false,
      closedAt: null,
      activities: {
        create: {
          type: ActivityType.OUTCOME_CHANGE,
          description: "Application reopened",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${id}`);
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
  closed?: boolean;
}) {
  const session = await requireUser();

  const where: Record<string, unknown> = {
    userId: session.userId,
    archived: params?.archived ?? false,
  };

  // The two flags are orthogonal, so the archive deliberately shows everything
  // that was archived whether it was closed first or not. Outside the archive,
  // closed applications get their own tab instead of cluttering the active one.
  if (!params?.archived) {
    where.closed = params?.closed ?? false;
  }

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
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  return application;
}

export async function getApplicationStats() {
  const session = await requireUser();

  const [applications, stages] = await Promise.all([
    // Closed applications stay in the numbers on purpose. They are the bulk of
    // the denominator — drop them and the interview/offer rates only measure
    // the applications still in flight, which reads far rosier than reality.
    prisma.application.findMany({
      where: { userId: session.userId, archived: false },
      select: {
        stageId: true,
        createdAt: true,
        stage: { select: { category: true } },
      },
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

  // Offers = applications in a SUCCESS-category stage (Get Offer / Hired).
  const offers = applications.filter((a) => a.stage?.category === StageCategory.SUCCESS).length;

  // Interview rate: everything that reached INTERVIEWING or SUCCESS counts.
  const reached = applications.filter(
    (a) => a.stage?.category === StageCategory.INTERVIEWING || a.stage?.category === StageCategory.SUCCESS,
  ).length;
  const interviewRate = total > 0 ? (reached / total) * 100 : 0;
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
      closed: false,
      reminders: { some: { done: false } },
      stage: { category: { not: StageCategory.CLOSED } },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      tags: { include: { tag: true } },
      stage: { select: { id: true, name: true, color: true, category: true } },
      reminders: { where: { done: false }, orderBy: { dueAt: "asc" }, take: 1 },
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

// ---------------------------------------------------------------------------
// Kanban-optimised data loader.
// Instead of fetching every application and grouping client-side, this runs
// one count + one limited SELECT per enabled stage — all inside a single
// Prisma transaction — so the board can render instantly regardless of how
// many applications exist.
// ---------------------------------------------------------------------------
export interface KanbanColumnData {
  stageId: string;
  count: number;
  applications: {
    id: string;
    company: string;
    role: string;
    stageId: string;
    appliedDate: Date | null;
    createdAt: Date;
  }[];
}

export async function getKanbanData(): Promise<KanbanColumnData[]> {
  const session = await requireUser();

  // Fetch only the enabled stages in user-defined order.
  const stages = await prisma.pipelineStageType.findMany({
    where: { userId: session.userId, enabled: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true },
  });

  const PREVIEW_LIMIT = 5;
  const baseWhere = { userId: session.userId, archived: false, closed: false };

  // Run all per-stage queries concurrently.
  const results = await Promise.all(
    stages.map(async (stage) => {
      const where = { ...baseWhere, stageId: stage.id };
      const [count, applications] = await Promise.all([
        prisma.application.count({ where }),
        prisma.application.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: PREVIEW_LIMIT,
          select: {
            id: true,
            company: true,
            role: true,
            stageId: true,
            appliedDate: true,
            createdAt: true,
          },
        }),
      ]);
      return {
        stageId: stage.id,
        count,
        applications: applications.map((a) => ({
          ...a,
          stageId: a.stageId as string, // always set — we filtered by stageId
        })),
      };
    })
  );

  return results;
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
      closed: false,
    },
    select: {
      id: true,
      company: true,
      role: true,
      stage: { select: { name: true, color: true } },
    },
  });
}

export async function exportApplicationsCsv() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } }, stage: { select: { name: true, color: true } } },
  });

  // "Status" is the stage the application kept, which a closed row preserves —
  // so the export needs its own column to tell a live row from a finished one.
  const headers = ["Company", "Role", "Status", "Closed", "Applied Date", "Job URL", "Tags", "Created"];
  const rows = applications.map((app) => [
    app.company,
    app.role,
    resolveStage(app).name,
    app.closed ? (app.closedAt?.toISOString().split("T")[0] ?? "Yes") : "",
    app.appliedDate ? app.appliedDate.toISOString().split("T")[0] : "",
    app.jobUrl || "",
    app.tags.map((t) => t.tag.name).join("; "),
    app.createdAt.toISOString().split("T")[0],
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  return csv;
}

// Returns scheduled applications and open reminders that are due today or
// overdue. Used by the dashboard "Due today" section and the detail page banners.
export async function getDueItems() {
  const session = await requireUser();
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [scheduled, reminders] = await Promise.all([
    // Applications with a stage scheduled date that is today or in the past
    // and still in an open/scheduled outcome state.
    prisma.application.findMany({
      where: {
        userId: session.userId,
        archived: false,
        closed: false,
        stageScheduledAt: { lte: todayEnd },
        OR: [
          { stageOutcome: { in: ["SCHEDULED", "ASSIGNED"] } },
          { stageOutcome: null },
        ],
      },
      select: {
        id: true,
        company: true,
        role: true,
        stageScheduledAt: true,
        stageOutcome: true,
        stage: { select: { name: true, color: true } },
      },
      orderBy: { stageScheduledAt: "asc" },
    }),

    // Open reminders due today or overdue
    prisma.reminder.findMany({
      where: {
        done: false,
        dueAt: { lte: todayEnd },
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

  return {
    scheduled: scheduled.map((a) => ({
      id: a.id,
      company: a.company,
      role: a.role,
      date: a.stageScheduledAt!,
      stageName: a.stage?.name ?? "Stage",
      stageColor: a.stage?.color ?? "#6366f1",
    })),
    reminders: reminders.map((f) => ({
      id: f.application.id,
      reminderId: f.id,
      company: f.application.company,
      role: f.application.role,
      title: f.title,
      date: f.dueAt,
    })),
  };
}
