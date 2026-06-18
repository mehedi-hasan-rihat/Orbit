"use server";

import { prisma } from "@/lib/prisma";
import { getSession, setSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: { _form: ["Unauthorized"] } };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, email } = parsed.data;

  // Check email taken by another user
  if (email !== session.email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: session.userId } },
    });
    if (existing) {
      return { error: { email: ["Email already in use"] } };
    }
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, email },
  });

  // Refresh session cookie with new name/email
  await setSession({ userId: user.id, name: user.name, email: user.email });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: { _form: ["Unauthorized"] } };

  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = passwordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: { _form: ["User not found"] } };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) {
    return { error: { currentPassword: ["Current password is incorrect"] } };
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.userId },
    data: { password: hashed },
  });

  return { success: true };
}

export async function deleteAccount() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: session.userId } });
  return { success: true };
}

export async function getProfileStats() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return null;

  const [total, offers, interviews] = await Promise.all([
    prisma.application.count({ where: { userId: session.userId } }),
    prisma.application.count({ where: { userId: session.userId, status: "OFFER" } }),
    prisma.application.count({ where: { userId: session.userId, status: "INTERVIEW" } }),
  ]);

  return { user, total, offers, interviews };
}
