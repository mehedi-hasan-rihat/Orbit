"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  stageTypeSchema,
  DEFAULT_STAGE_TYPES,
  RETIRED_STAGE_NAMES,
  isSystemStageName,
  isReservedStageName,
  isRetiredStageName,
} from "@/lib/validations";
import type { StageCategory } from "@/generated/prisma/enums";
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
    data: DEFAULT_STAGE_TYPES.map((d, i) => ({
      userId,
      name: d.name,
      color: d.color,
      category: d.category as StageCategory,
      enabled: d.enabled,
      order: i,
    })),
    skipDuplicates: true,
  });
}

// Brings an existing pipeline in line with the current catalogue. Every branch
// is gated on something already present in the rows we just read, so a healthy
// pipeline costs no extra queries. Returns whether anything changed.
async function reconcileStages(
  userId: string,
  existing: { id: string; name: string; order: number; enabled: boolean }[],
) {
  let changed = false;

  // The system stages are guaranteed, not merely seeded: one lost before they
  // were locked is restored here. Restored rows are appended rather than
  // slotted back into place — there is no reordering UI, so order only grows.
  const missing = DEFAULT_STAGE_TYPES.filter(
    (d) => isSystemStageName(d.name) && !existing.some((e) => e.name === d.name),
  );
  if (missing.length > 0) {
    const nextOrder = Math.max(-1, ...existing.map((e) => e.order)) + 1;
    await prisma.pipelineStageType.createMany({
      data: missing.map((d, i) => ({
        userId,
        name: d.name,
        color: d.color,
        category: d.category as StageCategory,
        enabled: true,
        order: nextOrder + i,
      })),
      skipDuplicates: true,
    });
    changed = true;
  }

  // A system stage hidden before the lock existed would otherwise stay hidden
  // with no way back — the toggle now refuses to touch it.
  const hidden = existing.filter((e) => isSystemStageName(e.name) && !e.enabled);
  if (hidden.length > 0) {
    await prisma.pipelineStageType.updateMany({
      where: { userId, name: { in: hidden.map((h) => h.name) } },
      data: { enabled: true },
    });
    changed = true;
  }

  // Clear the retired seeds ("Archived") for users who were seeded before they
  // were dropped. The name can no longer be created, so any surviving row is
  // that old seed rather than something the user made. Still gated on holding
  // nothing: a stage with cards in it stays until the user moves them, since
  // deleting it would have to invent a stage to put them in.
  const retired = existing.filter((e) => RETIRED_STAGE_NAMES.includes(e.name));
  for (const stage of retired) {
    const [applications, interviews] = await Promise.all([
      prisma.application.count({ where: { stageId: stage.id } }),
      prisma.interview.count({ where: { stageTypeId: stage.id } }),
    ]);
    if (applications > 0 || interviews > 0) continue;

    // Application.stageId is ON DELETE RESTRICT, so a card moved in between the
    // count and the delete makes this throw rather than strand anything. Leave
    // the row for the next read instead of failing the page.
    const removed = await prisma.pipelineStageType
      .deleteMany({ where: { id: stage.id, userId } })
      .catch(() => null);
    if (removed && removed.count > 0) changed = true;
  }

  return changed;
}

export async function getStageTypes() {
  const session = await getSession();
  if (!session) return [];

  const existing = await prisma.pipelineStageType.findMany({
    where: { userId: session.userId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  if (existing.length === 0) {
    await seedDefaults(session.userId);
  } else if (!(await reconcileStages(session.userId, existing))) {
    return existing;
  }

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
    include: { _count: { select: { interviews: true, applications: true } } },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    category: t.category,
    order: t.order,
    enabled: t.enabled,
    isSystem: isSystemStageName(t.name),
    usageCount: t._count.interviews,
    applicationCount: t._count.applications,
  }));
}

export async function createStageType(formData: FormData) {
  const session = await requireUser();

  const parsed = stageTypeSchema.safeParse({
    name: formData.get("name") as string,
    color: (formData.get("color") as string) || "#6b7280",
    category: (formData.get("category") as string) || "INTERVIEWING",
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const name = parsed.data.name.trim();

  // The exact name is caught by the lookup below; this also catches the
  // case-variants ("wishlist") the unique constraint would happily accept.
  if (isReservedStageName(name)) {
    return { error: { name: [`"${name}" is a default stage — it already exists`] } };
  }

  if (isRetiredStageName(name)) {
    return {
      error: {
        name: ["Archiving isn't a stage — use Archive on the application itself"],
      },
    };
  }

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
    data: {
      userId: session.userId,
      name,
      color: parsed.data.color,
      category: parsed.data.category as StageCategory,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
  return { success: true, id: created.id };
}

export async function updateStageType(id: string, formData: FormData) {
  const session = await requireUser();

  const parsed = stageTypeSchema.safeParse({
    name: formData.get("name") as string,
    color: (formData.get("color") as string) || "#6b7280",
    category: (formData.get("category") as string) || "INTERVIEWING",
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const name = parsed.data.name.trim();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Stage type not found" };

  // A default stage keeps its name and category — the category is what every
  // aggregation is built on, and the name is what the legacy status fallback in
  // stage-display.ts resolves to. Colour is cosmetic, so it stays editable.
  if (isSystemStageName(existing.name)) {
    if (name !== existing.name) {
      return { error: { name: [`${existing.name} is a default stage and cannot be renamed`] } };
    }
    if (parsed.data.category !== existing.category) {
      return { error: `${existing.name} is a default stage — its category is fixed.` };
    }

    await prisma.pipelineStageType.update({
      where: { id },
      data: { color: parsed.data.color },
    });

    revalidatePath("/dashboard/pipeline");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard");
    return { success: true };
  }

  if (isReservedStageName(name)) {
    return { error: { name: [`"${name}" is a default stage — pick another name`] } };
  }

  if (isRetiredStageName(name)) {
    return {
      error: {
        name: ["Archiving isn't a stage — use Archive on the application itself"],
      },
    };
  }

  const clash = await prisma.pipelineStageType.findFirst({
    where: { userId: session.userId, name, NOT: { id } },
  });
  if (clash) return { error: { name: ["That type already exists"] } };

  // Interviews and applications reference the row, not the label, so a rename
  // propagates everywhere without touching either table.
  await prisma.pipelineStageType.update({
    where: { id },
    data: { name, color: parsed.data.color, category: parsed.data.category as StageCategory },
  });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setStageTypeEnabled(id: string, enabled: boolean) {
  const session = await requireUser();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Stage type not found" };

  // Default stages are always on the board — hiding one would strand the cards
  // sitting in it with no column to show them in.
  if (isSystemStageName(existing.name)) {
    return { error: `${existing.name} is a default stage and is always shown.` };
  }

  // Disabling only hides it from the picker for new stages; interviews already
  // using it keep rendering it.
  await prisma.pipelineStageType.update({ where: { id }, data: { enabled } });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteStageType(id: string) {
  const session = await requireUser();

  const existing = await prisma.pipelineStageType.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return { error: "Stage type not found" };

  if (isSystemStageName(existing.name)) {
    return { error: `${existing.name} is a default stage and cannot be deleted.` };
  }

  // Applications hold the FK with ON DELETE RESTRICT: a stage that still has
  // cards on the board cannot be dropped without silently stranding them.
  // Refuse and let the user move or disable it instead.
  const inUse = await prisma.application.count({ where: { stageId: id } });
  if (inUse > 0) {
    return {
      error: `${existing.name} still holds ${inUse} application${inUse === 1 ? "" : "s"}. Move them to another stage, or disable this one instead.`,
    };
  }

  // Interviews hold it with ON DELETE SET NULL, which would leave them with no
  // label at all. Snapshot the name into customType first so they keep reading
  // the way they did before the stage was removed.
  await prisma.interview.updateMany({
    where: { stageTypeId: id },
    data: { customType: existing.name },
  });

  await prisma.pipelineStageType.delete({ where: { id } });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard");
  return { success: true };
}
