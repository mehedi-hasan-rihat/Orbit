import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ReminderEmailOptions {
  to: string;
  userName: string;
  company: string;
  role: string;
  daysUntil: number;
  type: "interview" | "followup";
  date: Date;
  interviewLabel?: string;
  applicationUrl: string;
}

export async function sendReminderEmail(opts: ReminderEmailOptions) {
  const isInterview = opts.type === "interview";

  const dateStr = opts.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = opts.date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const dayLabel = opts.daysUntil === 1 ? "Tomorrow" : dateStr;
  const urgencyColor = opts.daysUntil === 1 ? "#ef4444" : "#f59e0b";
  const urgencyLabel = opts.daysUntil === 1 ? "TOMORROW" : dateStr.toUpperCase();

  const subject = isInterview
    ? `⏰ Interview Reminder: ${opts.company} — ${opts.daysUntil === 1 ? "Tomorrow" : `on ${dateStr}`}`
    : `📅 Follow-up Reminder: ${opts.company} — ${opts.daysUntil === 1 ? "Tomorrow" : `on ${dateStr}`}`;

  const headerIcon = isInterview ? "🎤" : "📅";
  const headerTitle = isInterview ? "Interview Reminder" : "Follow-up Reminder";
  const headerSubtitle = isInterview
    ? `Upcoming interview ${opts.daysUntil === 1 ? "tomorrow" : `on ${dateStr}`}`
    : `Follow-up due ${opts.daysUntil === 1 ? "tomorrow" : `on ${dateStr}`}`;

  const detailRows = isInterview
    ? [
        { label: "Company", value: opts.company },
        { label: "Role", value: opts.role },
        { label: "Interview Type", value: opts.interviewLabel ?? "Interview" },
        { label: "Date", value: dateStr },
        { label: "Time", value: timeStr },
      ]
    : [
        { label: "Company", value: opts.company },
        { label: "Role", value: opts.role },
        { label: "Follow-up Date", value: dateStr },
      ];

  const detailRowsHtml = detailRows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:500;white-space:nowrap;width:140px;border-bottom:1px solid #f3f4f6;">
          ${row.label}
        </td>
        <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">
          ${row.value}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#000;border-radius:10px;padding:8px 16px;">
                    <span style="color:#fff;font-size:16px;font-weight:700;letter-spacing:-0.3px;">⬤ Orbit</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

              <!-- Header band -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 32px 28px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:14px;vertical-align:middle;">
                          <div style="width:48px;height:48px;background:rgba(255,255,255,0.1);border-radius:12px;text-align:center;line-height:48px;font-size:24px;">
                            ${headerIcon}
                          </div>
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.5);">
                            ${headerSubtitle}
                          </p>
                          <h1 style="margin:4px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                            ${headerTitle}
                          </h1>
                        </td>
                      </tr>
                    </table>

                    <!-- Urgency pill -->
                    <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
                      <tr>
                        <td style="background:${urgencyColor};border-radius:99px;padding:5px 14px;">
                          <span style="font-size:12px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
                            ${urgencyLabel}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:28px 32px 0;">
                    <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">
                      Hi <strong>${opts.userName}</strong>,
                    </p>
                    <p style="margin:10px 0 0;font-size:15px;color:#6b7280;line-height:1.6;">
                      ${opts.daysUntil === 1 ? "Your reminder is due <strong style='color:#111827;'>tomorrow</strong>. Here are the details:" : `This is an early heads-up — it's coming up on <strong style='color:#111827;'>${dateStr}</strong>.`}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;">
                ${detailRowsHtml}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 32px 36px;">
                    <a href="${opts.applicationUrl}"
                       style="display:inline-block;background:#000000;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:10px;letter-spacing:0.1px;">
                      View Application →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 8px;" align="center">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                You're receiving this because you have a reminder set in
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#6b7280;text-decoration:underline;">Orbit</a>.
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#d1d5db;">
                © ${new Date().getFullYear()} Orbit — Job Application Tracker
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject,
    html,
  });
}
