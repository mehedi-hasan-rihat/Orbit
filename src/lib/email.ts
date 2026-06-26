import nodemailer from "nodemailer";

/* ──────────────────────────────────────────────
   TRANSPORT
────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ──────────────────────────────────────────────
   BASE TEMPLATE
────────────────────────────────────────────── */
function baseTemplate(opts: {
  title: string;
  subtitle?: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>

<body style="margin:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;">
  <table width="100%" style="padding:40px 16px;background:#f9fafb;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;">

          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              <div style="display:inline-block;background:#000;color:#fff;padding:8px 16px;border-radius:10px;font-weight:700;">
                Orbit
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">

              <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px;">
                <h1 style="margin:0;color:#fff;font-size:18px;">${opts.title}</h1>
                ${opts.subtitle ? `<p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">${opts.subtitle}</p>` : ""}
              </div>

              ${opts.body}

              <div style="padding:16px 24px;color:#9ca3af;font-size:12px;">
                Orbit — Job Application Tracker
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ──────────────────────────────────────────────
   REUSABLE BLOCKS
────────────────────────────────────────────── */
const blocks = {
  greeting: (name: string, text: string) => `
    <div style="padding:20px 24px;color:#374151;font-size:14px;line-height:1.6;">
      <p style="margin:0;">Hi <strong>${name}</strong>,</p>
      <p style="margin:10px 0 0;color:#6b7280;">${text}</p>
    </div>
  `,

  button: (label: string, url: string) => `
    <div style="padding:20px 24px;text-align:center;">
      <a href="${url}" style="background:#000;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
        ${label}
      </a>
    </div>
  `,

  link: (url: string) => `
    <div style="padding:0 24px 24px;font-size:12px;color:#9ca3af;word-break:break-all;">
      ${url}
    </div>
  `,

  metaTable: (rows: { label: string; value: string }[]) => `
    <table width="100%" style="border-top:1px solid #f3f4f6;">
      ${rows
        .map(
          (r) => `
        <tr>
          <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:140px;border-bottom:1px solid #f3f4f6;">
            ${r.label}
          </td>
          <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">
            ${r.value}
          </td>
        </tr>`
        )
        .join("")}
    </table>
  `,
};

/* ──────────────────────────────────────────────
   1. SIGNUP VERIFICATION EMAIL
────────────────────────────────────────────── */
export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${opts.token}`;

  const html = baseTemplate({
    title: "Verify your email",
    subtitle: "Activate your Orbit account",
    body: `
      ${blocks.greeting(opts.name, "Confirm your email address to activate your account.")}
      ${blocks.button("Verify Email", url)}
      ${blocks.link(url)}
    `,
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: "Verify your Orbit account",
    html,
  });
}

/* ──────────────────────────────────────────────
   2. LOGIN BLOCKED (EMAIL NOT VERIFIED)
────────────────────────────────────────────── */
export async function sendEmailNotVerifiedEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${opts.token}`;

  const html = baseTemplate({
    title: "Email not verified",
    subtitle: "Login blocked until verification",
    body: `
      ${blocks.greeting(
        opts.name,
        "You tried to sign in but your email is not verified yet."
      )}
      ${blocks.button("Verify Email", url)}
      ${blocks.link(url)}
    `,
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: "Verify your email to continue",
    html,
  });
}

/* ──────────────────────────────────────────────
   3. PASSWORD RESET EMAIL
────────────────────────────────────────────── */
export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${opts.token}`;

  const html = baseTemplate({
    title: "Reset password",
    subtitle: "Secure account recovery",
    body: `
      ${blocks.greeting(
        opts.name,
        "We received a request to reset your password. This link expires in 1 hour."
      )}
      ${blocks.button("Reset Password", url)}
      ${blocks.link(url)}
    `,
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: "Reset your Orbit password",
    html,
  });
}

/* ──────────────────────────────────────────────
   4. REMINDER EMAIL (INTERVIEW / FOLLOWUP)
────────────────────────────────────────────── */
export async function sendReminderEmail(opts: {
  to: string;
  userName: string;
  company: string;
  role: string;
  daysUntil: number;
  type: "interview" | "followup";
  date: Date;
  interviewLabel?: string;
  applicationUrl: string;
}) {
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
  });

  const urgencyLabel = opts.daysUntil === 1 ? "TOMORROW" : dateStr.toUpperCase();

  const html = baseTemplate({
    title: isInterview ? "Interview Reminder" : "Follow-up Reminder",
    subtitle: `${opts.company} — ${isInterview ? "Interview" : "Follow-up"}`,
    body: `
      ${blocks.greeting(
        opts.userName,
        opts.daysUntil === 1
          ? "Your event is tomorrow."
          : `This is a reminder for ${dateStr}.`
      )}

      ${blocks.metaTable(
        isInterview
          ? [
              { label: "Company", value: opts.company },
              { label: "Role", value: opts.role },
              { label: "Type", value: opts.interviewLabel ?? "Interview" },
              { label: "Date", value: dateStr },
              { label: "Time", value: timeStr },
            ]
          : [
              { label: "Company", value: opts.company },
              { label: "Role", value: opts.role },
              { label: "Date", value: dateStr },
            ]
      )}

      <div style="padding:20px 24px;text-align:center;">
        <a href="${opts.applicationUrl}" style="background:#000;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          View Application
        </a>
      </div>

      <div style="padding:0 24px 24px;font-size:11px;color:#9ca3af;">
        ${urgencyLabel}
      </div>
    `,
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: isInterview
      ? `Interview Reminder: ${opts.company}`
      : `Follow-up Reminder: ${opts.company}`,
    html,
  });
}