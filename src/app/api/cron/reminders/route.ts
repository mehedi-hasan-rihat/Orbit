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

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[cron] Unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const day1 = startOfDay(addDays(today, 1));
  const day2 = startOfDay(addDays(today, 2));
  console.log(`[cron] Running at ${new Date().toISOString()} — scheduled on ${day1.toDateString()} / ${day2.toDateString()}, reminders due ${today.toDateString()}`);

  let created = 0;
  let emailed = 0;
  let skipped = 0;
  const logs: string[] = [];

  async function notify(opts: {
    userId: string;
    email: string;
    userName: string;
    applicationId: string;
    dedupeKey: string;
    type: "SCHEDULED" | "REMINDER";
    title: string;
    send: () => Promise<unknown>;
  }) {
    const exists = await prisma.notification.findFirst({
      where: { userId: opts.userId, body: opts.dedupeKey },
    });
    if (exists) { skipped++; return; }

    const notification = await prisma.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        body: opts.dedupeKey,
        applicationId: opts.applicationId,
      },
    });
    created++;
    logs.push(`notification:created:${opts.dedupeKey}`);

    try {
      await opts.send();
      await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true } });
      emailed++;
      logs.push(`email:sent:${opts.email}:${opts.dedupeKey}`);
    } catch (err) {
      console.error(`[cron] Email FAILED for ${opts.dedupeKey}`, err);
      logs.push(`email:failed:${opts.email}:${opts.dedupeKey}`);
    }
  }

  // --- Stage-scheduled applications: 2 days out, then 1 day out ---
  for (const daysUntil of [1, 2]) {
    const targetDay = daysUntil === 1 ? day1 : day2;
    const nextDay = addDays(targetDay, 1);

    const stageScheduled = await prisma.application.findMany({
      where: {
        stageScheduledAt: { gte: targetDay, lt: nextDay },
        archived: false,
        closed: false,
        OR: [
          { stageOutcome: null },
          { stageOutcome: "SCHEDULED" },
          { stageOutcome: "ASSIGNED" },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        stage: { select: { name: true } },
      },
    });

    console.log(`[cron] Found ${stageScheduled.length} stage-scheduled application(s) for +${daysUntil}d`);

    for (const app of stageScheduled) {
      const { user } = app;
      const label = app.stage?.name ?? "Stage";

      await notify({
        userId: user.id,
        email: user.email,
        userName: user.name,
        applicationId: app.id,
        dedupeKey: `stage-scheduled-${app.id}-${daysUntil}d`,
        type: "SCHEDULED",
        title: `${label} at ${app.company}`,
        send: () =>
          sendReminderEmail({
            to: user.email,
            userName: user.name,
            company: app.company,
            role: app.role,
            daysUntil,
            type: "scheduled",
            date: app.stageScheduledAt!,
            interviewLabel: label,
            applicationUrl: `${APP_URL}/dashboard/applications/${app.id}`,
          }),
      });
    }
  }

  // --- Reminders: on the day they are due ---
  const reminders = await prisma.reminder.findMany({
    where: {
      dueAt: { gte: today, lt: day1 },
      done: false,
      application: { archived: false, closed: false },
    },
    include: {
      application: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  console.log(`[cron] Found ${reminders.length} reminder(s) due today`);

  for (const reminder of reminders) {
    const app = reminder.application;
    const { user } = app;

    await notify({
      userId: user.id,
      email: user.email,
      userName: user.name,
      applicationId: app.id,
      dedupeKey: `reminder-${reminder.id}-due`,
      type: "REMINDER",
      title: `${reminder.title} — ${app.company}`,
      send: () =>
        sendReminderEmail({
          to: user.email,
          userName: user.name,
          company: app.company,
          role: app.role,
          daysUntil: 0,
          type: "reminder",
          date: reminder.dueAt,
          followUpTitle: reminder.title,
          followUpDetails: reminder.details,
          applicationUrl: `${APP_URL}/dashboard/applications/${app.id}`,
        }),
    });
  }

  console.log(`[cron] Done — created: ${created}, emailed: ${emailed}, skipped: ${skipped}`);
  return Response.json({ ok: true, created, emailed, skipped, logs });
}
