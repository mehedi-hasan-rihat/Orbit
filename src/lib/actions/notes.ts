"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@/generated/prisma/enums";
import { z } from "zod";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(5000),
});

// Verify the application belongs to the user before touching its notes.
async function findOwnedApplication(applicationId: string, userId: string) {
  return prisma.application.findFirst({ where: { id: applicationId, userId } });
}

export async function createNote(applicationId: string, formData: FormData) {
  const session = await requireUser();

  const app = await findOwnedApplication(applicationId, session.userId);
  if (!app) return { error: "Application not found" };

  const parsed = noteSchema.safeParse({ content: formData.get("content") as string });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await prisma.$transaction([
    prisma.note.create({
      data: { applicationId, content: parsed.data.content },
    }),
    prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.NOTE_ADDED,
        description: `Note added: ${parsed.data.content.slice(0, 60)}${parsed.data.content.length > 60 ? "…" : ""}`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function updateNote(noteId: string, applicationId: string, formData: FormData) {
  const session = await requireUser();

  const app = await findOwnedApplication(applicationId, session.userId);
  if (!app) return { error: "Application not found" };

  const parsed = noteSchema.safeParse({ content: formData.get("content") as string });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  // Make sure the note belongs to this application (not just any note id).
  const existing = await prisma.note.findFirst({ where: { id: noteId, applicationId } });
  if (!existing) return { error: "Note not found" };

  await prisma.$transaction([
    prisma.note.update({
      where: { id: noteId },
      data: { content: parsed.data.content },
    }),
    prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.NOTE_ADDED,
        description: `Note updated: ${parsed.data.content.slice(0, 60)}${parsed.data.content.length > 60 ? "…" : ""}`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function deleteNote(noteId: string, applicationId: string) {
  const session = await requireUser();

  const app = await findOwnedApplication(applicationId, session.userId);
  if (!app) return { error: "Application not found" };

  const existing = await prisma.note.findFirst({ where: { id: noteId, applicationId } });
  if (!existing) return { error: "Note not found" };

  await prisma.$transaction([
    prisma.note.delete({ where: { id: noteId } }),
    prisma.activity.create({
      data: {
        applicationId,
        type: ActivityType.NOTE_ADDED,
        description: "Note deleted",
      },
    }),
  ]);

  revalidatePath(`/dashboard/applications/${applicationId}`);
  return { success: true };
}

export async function getNotes(applicationId: string) {
  const session = await requireUser();

  const app = await findOwnedApplication(applicationId, session.userId);
  if (!app) return [];

  return prisma.note.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });
}
