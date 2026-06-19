"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function markNotificationsRead() {
  const session = await getSession();
  if (!session) return;
  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });
}
