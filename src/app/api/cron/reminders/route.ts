import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { resolveStageLabel } from "@/lib/stage-label";
import { OPEN_OUTCOMES } from "@/lib/validations";

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
  console.log(
    `[cron] Running at ${new Date().toISOString()} — interviews on ${day1.toDateString()} / ${day2.toDateString()}, follow-ups due ${today.toDateString()}`,
  );

  let created = 0;
  let emailed = 0;
  let skipped = 0;
  const logs: string[] = [];

  // Sending is the same for both kinds; only what goes in the mail differs.
  async function notify(opts: {
    userId: string;
    email: string;
    userName: string;
    applicationId: string;
    dedupeKey: string;
    type: "INTERVIEW_REMINDER" | "FOLLOW_UP_REMINDER";
    title: string;
    send: () => Promise<unknown>;
  }) {
    const exists = await prisma.notification.findFirst({
      where: { userId: opts.userId, body: opts.dedupeKey },
    });
    if (exists) {
      console.log(`[cron] SKIP notification (already exists): ${opts.dedupeKey}`);
      skipped++;
      return;
    }

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
    console.log(`[cron] Notification created: ${notification.id} — ${opts.dedupeKey}`);
    logs.push(`notification:created:${opts.dedupeKey}`);

    try {
      await opts.send();
      await prisma.notification.update({
        where: { id: notification.id },
        data: { emailSent: true },
      });
      emailed++;
      console.log(`[cron] Email sent to ${opts.email} for ${opts.dedupeKey}`);
      logs.push(`email:sent:${opts.email}:${opts.dedupeKey}`);
    } catch (err) {
      console.error(`[cron] Email FAILED for ${opts.dedupeKey} → ${opts.email}`, err);
      logs.push(`email:failed:${opts.email}:${opts.dedupeKey}`);
    }
  }

  // --- Interviews: 2 days out, then 1 day out ---
  // An appointment you have to prepare for, so the warning comes early.
  for (const daysUntil of [1, 2]) {
    const targetDay = daysUntil === 1 ? day1 : day2;
    const nextDay = addDays(targetDay, 1);

    const interviews = await prisma.interview.findMany({
      where: {
        scheduledAt: { gte: targetDay, lt: nextDay },
        outcome: { in: OPEN_OUTCOMES },
        application: { archived: false, closed: false },
      },
      include: {
        stageType: { select: { name: true } },
        application: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    console.log(`[cron] Found ${interviews.length} interview(s) for +${daysUntil}d`);

    for (const interview of interviews) {
      const { user } = interview.application;
      const label = resolveStageLabel(interview);

      await notify({
        userId: user.id,
        email: user.email,
        userName: user.name,
        applicationId: interview.applicationId,
        dedupeKey: `interview-${interview.id}-${daysUntil}d`,
        type: "INTERVIEW_REMINDER",
        title: `Interview at ${interview.application.company}`,
        send: () =>
          sendReminderEmail({
            to: user.email,
            userName: user.name,
            company: interview.application.company,
            role: interview.application.role,
            daysUntil,
            type: "interview",
            date: interview.scheduledAt!,
            interviewLabel: label,
            applicationUrl: `${APP_URL}/dashboard/applications/${interview.applicationId}`,
          }),
      });
    }
  }

  // --- Follow-ups: on the day they are due ---
  // A follow-up is a task, not an appointment — there is nothing to prepare
  // for, so warning about it days early would just be noise. It fires on the
  // date that was set. One row per thing being chased, each with its own title
  // and details, and an application can have several due the same day, so the
  // dedupe key is per follow-up rather than per application.
  const followUps = await prisma.followUp.findMany({
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

  console.log(`[cron] Found ${followUps.length} follow-up(s) due today`);

  for (const followUp of followUps) {
    const app = followUp.application;
    const { user } = app;

    await notify({
      userId: user.id,
      email: user.email,
      userName: user.name,
      applicationId: app.id,
      dedupeKey: `followup-${followUp.id}-due`,
      type: "FOLLOW_UP_REMINDER",
      title: `${followUp.title} — ${app.company}`,
      send: () =>
        sendReminderEmail({
          to: user.email,
          userName: user.name,
          company: app.company,
          role: app.role,
          daysUntil: 0,
          type: "followup",
          date: followUp.dueAt,
          followUpTitle: followUp.title,
          followUpDetails: followUp.details,
          applicationUrl: `${APP_URL}/dashboard/applications/${app.id}`,
        }),
    });
  }

  console.log(`[cron] Done — created: ${created}, emailed: ${emailed}, skipped: ${skipped}`);
  return Response.json({ ok: true, created, emailed, skipped, logs });
}
