import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    count: notifications.length,
    items: notifications.map((n) => ({
      id: n.id,
      type: n.type === "INTERVIEW_REMINDER" ? "interview" : "followup",
      title: n.title,
      body: n.body,
      applicationId: n.applicationId,
      createdAt: n.createdAt,
    })),
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send(await getNotifications(session.userId));

      const interval = setInterval(async () => {
        if (closed) { clearInterval(interval); return; }
        try {
          send(await getNotifications(session.userId));
        } catch {
          clearInterval(interval);
        }
      }, 30_000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
