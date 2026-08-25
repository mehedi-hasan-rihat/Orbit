"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { stageTypeSchema, DEFAULT_STAGE_TYPES } from "@/lib/validations";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// Seeding is lazy rather than done at registration: it has to cover the users
// who already existed before the pipeline was introduced, not just new ones.
// createMany + skipDuplicates leans on @@unique([userId, name]) so two
// concurrent first-reads cannot double-seed.
async function seedDefaults(userId: string) {
  await prisma.pipelineStageType.createMany({
    data: DEFAULT_STAGE_TYPES.map((name, i) => ({ userId, name, order: i })),
    skipDuplicates: true,
  });
}

export async function getStageTypes() {
  const session = await getSession();
  if (!session) return [];

  const existing = await prisma.pipelineStageType.findMany({
    where: { userId: session.userId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  if (existing.length > 0) return existing;

  await seedDefaults(session.userId);
  return prisma.pipelineStageType.findMany({
    where: { userId: session.userId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

// Stage types with their usage count, for the management screen — deleting a
// type that is in use has consequences the user should see first.
export async function getStageTypesWithUsage() {
  const session = await getSession();
  if (!session) return [];

  await getStageTypes(); // ensures defaults exist

  const types = await prisma.pipelineStageType.findMany({
    where: { userId: session.userId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { interviews: true } } },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    order: t.order,
    enabled: t.enabled,
    usageCount: t._count.interviews,
  }));
}

export async function createStageType(formData: FormData) {
  const session = await requireUser();

  const parsed = stageTypeSchema.safeParse({ name: formData.get("name") as string });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const name = parsed.data.name.trim();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { userId: session.userId, name },
  });
  if (existing) return { error: { name: ["That type already exists"] } };

  const last = await prisma.pipelineStageType.findFirst({
    where: { userId: session.userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const created = await prisma.pipelineStageType.create({
    data: { userId: session.userId, name, order: (last?.order ?? -1) + 1 },
  });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  return { success: true, id: created.id };
}

export async function renameStageType(id: string, formData: FormData) {
  const session = await requireUser();

  const parsed = stageTypeSchema.safeParse({ name: formData.get("name") as string });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const name = parsed.data.name.trim();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Stage type not found" };

  const clash = await prisma.pipelineStageType.findFirst({
    where: { userId: session.userId, name, NOT: { id } },
  });
  if (clash) return { error: { name: ["That type already exists"] } };

  // Interviews reference the row, not the label, so the rename propagates to
  // every stage already using this type without touching the Interview table.
  await prisma.pipelineStageType.update({ where: { id }, data: { name } });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  return { success: true };
}

export async function setStageTypeEnabled(id: string, enabled: boolean) {
  const session = await requireUser();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Stage type not found" };

  // Disabling only hides it from the picker for new stages; interviews already
  // using it keep rendering it.
  await prisma.pipelineStageType.update({ where: { id }, data: { enabled } });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  return { success: true };
}

export async function deleteStageType(id: string) {
  const session = await requireUser();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Stage type not found" };

  // The FK is ON DELETE SET NULL, which would leave affected interviews with no
  // label at all. Snapshot the name into customType first so they keep reading
  // the way they did before the type was removed.
  await prisma.interview.updateMany({
    where: { stageTypeId: id },
    data: { customType: existing.name },
  });

  await prisma.pipelineStageType.delete({ where: { id } });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  return { success: true };
}
