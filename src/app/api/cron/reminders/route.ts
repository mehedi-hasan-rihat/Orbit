import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://startorbit.vercel.app";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  console.log(`[cron] auth header: ${auth}`);

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[cron] Unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const day1 = startOfDay(addDays(today, 1));
  const day2 = startOfDay(addDays(today, 2));
  console.log(`[cron] Running at ${new Date().toISOString()} — checking ${day1.toDateString()} and ${day2.toDateString()}`);

  let created = 0;
  let emailed = 0;
  let skipped = 0;
  const logs: string[] = [];

  for (const daysUntil of [1, 2]) {
    const targetDay = daysUntil === 1 ? day1 : day2;
    const nextDay = addDays(targetDay, 1);

    // --- Interviews ---
    const interviews = await prisma.interview.findMany({
      where: {
        scheduledAt: { gte: targetDay, lt: nextDay },
        outcome: "PENDING",
        application: { archived: false },
      },
      include: {
        application: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    console.log(`[cron] Found ${interviews.length} interview(s) for +${daysUntil}d`);

    for (const interview of interviews) {
      const { user } = interview.application;
      const label =
        interview.type === "OTHER" && interview.customType
          ? interview.customType
          : `Round ${interview.round} ${interview.type.replace(/_/g, " ")}`;

      const dedupeKey = `interview-${interview.id}-${daysUntil}d`;
      const exists = await prisma.notification.findFirst({ where: { userId: user.id, body: dedupeKey } });
      if (exists) {
        console.log(`[cron] SKIP notification (already exists): ${dedupeKey}`);
        skipped++;
        continue;
      }

      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          type: "INTERVIEW_REMINDER",
          title: `Interview at ${interview.application.company}`,
          body: dedupeKey,
          applicationId: interview.applicationId,
        },
      });
      created++;
      console.log(`[cron] ✅ Notification created: ${notification.id} — ${dedupeKey}`);
      logs.push(`notification:created:${dedupeKey}`);

      try {
        await sendReminderEmail({
          to: user.email,
          userName: user.name,
          company: interview.application.company,
          role: interview.application.role,
          daysUntil,
          type: "interview",
          date: interview.scheduledAt!,
          interviewLabel: label,
          applicationUrl: `${APP_URL}/dashboard/applications/${interview.applicationId}`,
        });
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
        emailed++;
        console.log(`[cron] ✅ Email sent to ${user.email} for interview ${dedupeKey}`);
        logs.push(`email:sent:${user.email}:${dedupeKey}`);
      } catch (err) {
        console.error(`[cron] ❌ Email FAILED for interview ${dedupeKey} → ${user.email}`, err);
        logs.push(`email:failed:${user.email}:${dedupeKey}`);
      }
    }

    // --- Follow-ups ---
    const followUps = await prisma.application.findMany({
      where: {
        archived: false,
        followUpDate: { gte: targetDay, lt: nextDay },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    console.log(`[cron] Found ${followUps.length} follow-up(s) for +${daysUntil}d`);

    for (const app of followUps) {
      const { user } = app;
      const dedupeKey = `followup-${app.id}-${daysUntil}d`;
      const exists = await prisma.notification.findFirst({ where: { userId: user.id, body: dedupeKey } });
      if (exists) {
        console.log(`[cron] SKIP notification (already exists): ${dedupeKey}`);
        skipped++;
        continue;
      }

      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          type: "FOLLOW_UP_REMINDER",
          title: `Follow-up: ${app.company}`,
          body: dedupeKey,
          applicationId: app.id,
        },
      });
      created++;
      console.log(`[cron] ✅ Notification created: ${notification.id} — ${dedupeKey}`);
      logs.push(`notification:created:${dedupeKey}`);

      try {
        await sendReminderEmail({
          to: user.email,
          userName: user.name,
          company: app.company,
          role: app.role,
          daysUntil,
          type: "followup",
          date: app.followUpDate!,
          applicationUrl: `${APP_URL}/dashboard/applications/${app.id}`,
        });
        await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
        emailed++;
        console.log(`[cron] ✅ Email sent to ${user.email} for follow-up ${dedupeKey}`);
        logs.push(`email:sent:${user.email}:${dedupeKey}`);
      } catch (err) {
        console.error(`[cron] ❌ Email FAILED for follow-up ${dedupeKey} → ${user.email}`, err);
        logs.push(`email:failed:${user.email}:${dedupeKey}`);
      }
    }
  }

  console.log(`[cron] Done — created: ${created}, emailed: ${emailed}, skipped: ${skipped}`);
  return Response.json({ ok: true, created, emailed, skipped, logs });
}
