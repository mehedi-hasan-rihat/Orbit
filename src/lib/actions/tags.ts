"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { tagSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createTag(formData: FormData) {
  const session = await requireUser();

  const raw = {
    name: formData.get("name") as string,
    color: formData.get("color") as string,
  };

  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.tag.findFirst({
    where: { userId: session.userId, name: parsed.data.name },
  });

  if (existing) {
    return { error: { name: ["Tag already exists"] } };
  }

  await prisma.tag.create({
    data: {
      userId: session.userId,
      name: parsed.data.name,
      color: parsed.data.color,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTag(id: string) {
  const session = await requireUser();

  const existing = await prisma.tag.findFirst({
    where: { id, userId: session.userId },
  });

  if (!existing) {
    return { error: "Tag not found" };
  }

  await prisma.tag.delete({ where: { id } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTags() {
  const session = await getSession();
  if (!session) return [];

  return prisma.tag.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
  });
}
