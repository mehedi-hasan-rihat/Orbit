"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applicationSchema, updateStatusSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@/generated/prisma/enums";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createApplication(formData: FormData) {
  const session = await requireUser();

  const raw = {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    jobUrl: formData.get("jobUrl") as string,
    status: formData.get("status") as string,
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
  const tagIds = data.tags ? data.tags.split(",").filter(Boolean) : [];

  const application = await prisma.application.create({
    data: {
      userId: session.userId,
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl || null,
      status: data.status as ApplicationStatus,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes || null,
      activities: {
        create: {
          type: "CREATED",
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
    status: formData.get("status") as string,
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

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
    include: { tags: true },
  });

  if (!existing) {
    return { error: { _form: ["Application not found"] } };
  }

  // Track status change
  const activities: { type: string; description: string; metadata?: string }[] = [];
  if (existing.status !== data.status) {
    activities.push({
      type: "STATUS_CHANGED",
      description: `Status changed from ${existing.status} to ${data.status}`,
      metadata: JSON.stringify({ from: existing.status, to: data.status }),
    });
  }

  if (data.notes && data.notes !== existing.notes) {
    activities.push({
      type: "NOTE_ADDED",
      description: "Notes updated",
    });
  }

  if (data.followUpDate && data.followUpDate !== existing.followUpDate?.toISOString().split("T")[0]) {
    activities.push({
      type: "FOLLOW_UP_SET",
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
      status: data.status as ApplicationStatus,
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

export async function updateApplicationStatus(id: string, status: string) {
  const session = await requireUser();

  const parsed = updateStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: "Application not found" };
  }

  await prisma.application.update({
    where: { id },
    data: {
      status: parsed.data.status as ApplicationStatus,
      activities: {
        create: {
          type: "STATUS_CHANGED",
          description: `Status changed from ${existing.status} to ${parsed.data.status}`,
          metadata: JSON.stringify({ from: existing.status, to: parsed.data.status }),
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
          type: "STATUS_CHANGED",
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
          type: "STATUS_CHANGED",
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
  status?: string;
  sort?: string;
  tag?: string;
  archived?: boolean;
}) {
  const session = await requireUser();

  const where: Record<string, unknown> = {
    userId: session.userId,
    archived: params?.archived ?? false,
  };

  if (params?.status && params.status !== "ALL") {
    where.status = params.status;
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
    },
  });

  return application;
}

export async function getApplicationStats() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: session.userId, archived: false },
    select: { status: true, createdAt: true },
  });

  const total = applications.length;
  const statusCounts = {
    WISHLIST: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
    ARCHIVED: 0,
  };

  for (const app of applications) {
    statusCounts[app.status]++;
  }

  const interviewRate =
    total > 0
      ? ((statusCounts.INTERVIEW + statusCounts.OFFER) / total) * 100
      : 0;
  const offerRate = total > 0 ? (statusCounts.OFFER / total) * 100 : 0;

  // Weekly stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = applications.filter((a) => a.createdAt >= weekAgo).length;

  return { total, statusCounts, interviewRate, offerRate, thisWeek };
}

export async function getFollowUps() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: {
      userId: session.userId,
      archived: false,
      followUpDate: { not: null },
      status: { notIn: ["REJECTED", "ARCHIVED"] },
    },
    orderBy: { followUpDate: "asc" },
    include: { tags: { include: { tag: true } } },
  });

  return applications;
}

export async function getCompanyStats() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    select: { company: true, status: true },
  });

  const companyMap: Record<string, { total: number; interviews: number; offers: number }> = {};

  for (const app of applications) {
    if (!companyMap[app.company]) {
      companyMap[app.company] = { total: 0, interviews: 0, offers: 0 };
    }
    companyMap[app.company].total++;
    if (app.status === "INTERVIEW") companyMap[app.company].interviews++;
    if (app.status === "OFFER") companyMap[app.company].offers++;
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
    select: { id: true, company: true, role: true, status: true },
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
          type: "NOTE_ADDED",
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
    include: { tags: { include: { tag: true } } },
  });

  const headers = ["Company", "Role", "Status", "Applied Date", "Follow-up Date", "Job URL", "Tags", "Notes", "Created"];
  const rows = applications.map((app) => [
    app.company,
    app.role,
    app.status,
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
