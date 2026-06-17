"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { applicationSchema, updateStatusSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "../../generated/prisma/enums";

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
    notes: formData.get("notes") as string,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await prisma.application.create({
    data: {
      userId: session.userId,
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl || null,
      status: data.status as ApplicationStatus,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplication(id: string, formData: FormData) {
  const session = await requireUser();

  const raw = {
    company: formData.get("company") as string,
    role: formData.get("role") as string,
    jobUrl: formData.get("jobUrl") as string,
    status: formData.get("status") as string,
    appliedDate: formData.get("appliedDate") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const existing = await prisma.application.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: { _form: ["Application not found"] } };
  }

  await prisma.application.update({
    where: { id },
    data: {
      company: data.company,
      role: data.role,
      jobUrl: data.jobUrl || null,
      status: data.status as ApplicationStatus,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      notes: data.notes || null,
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
    data: { status: parsed.data.status as ApplicationStatus },
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
}) {
  const session = await requireUser();

  const where: Record<string, unknown> = { userId: session.userId };

  if (params?.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params?.search) {
    where.OR = [
      { company: { contains: params.search, mode: "insensitive" } },
      { role: { contains: params.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params?.sort === "company") orderBy = { company: "asc" };
  if (params?.sort === "appliedDate") orderBy = { appliedDate: "desc" };
  if (params?.sort === "updatedAt") orderBy = { updatedAt: "desc" };

  const applications = await prisma.application.findMany({
    where,
    orderBy,
  });

  return applications;
}

export async function getApplicationStats() {
  const session = await requireUser();

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    select: { status: true },
  });

  const total = applications.length;
  const statusCounts = {
    WISHLIST: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
  };

  for (const app of applications) {
    statusCounts[app.status]++;
  }

  const interviewRate =
    total > 0
      ? ((statusCounts.INTERVIEW + statusCounts.OFFER) / total) * 100
      : 0;
  const offerRate = total > 0 ? (statusCounts.OFFER / total) * 100 : 0;

  return { total, statusCounts, interviewRate, offerRate };
}
