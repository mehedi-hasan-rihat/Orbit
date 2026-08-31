import Link from "next/link";
import { Logo } from "@/components/landing/logo";

export const metadata = {
  title: "Privacy Policy — Orbit",
  description: "Privacy Policy for Orbit job application management.",
};

const LAST_UPDATED = "September 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
            <span className="text-sm font-semibold">Orbit</span>
          </Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="space-y-2 pb-8 border-b">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Legal</p>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

            <p>
              Orbit ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
            </p>

            <h2>1. Information We Collect</h2>
            <p><strong>Account information:</strong> When you register, we collect your name and email address.</p>
            <p><strong>Application data:</strong> The job applications, notes, tags, interview entries, and follow-ups you create are stored and associated with your account.</p>
            <p><strong>Usage data:</strong> We do not run analytics scripts or tracking pixels. We do not collect browsing behaviour.</p>

            <h2>2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the Service</li>
              <li>To send you email reminders for interviews and follow-ups you scheduled</li>
              <li>To send account-related emails (verification, password reset)</li>
              <li>To respond to support requests</li>
            </ul>
            <p>We do not use your data for advertising, profiling, or any purpose beyond operating the Service.</p>

            <h2>3. Data Storage and Security</h2>
            <p>
              Your data is stored in a PostgreSQL database. Sessions use HTTP-only cookies — your session token is never exposed to JavaScript and cannot be stolen by XSS attacks. All data is scoped to your user account at the database level; other users cannot access your data.
            </p>

            <h2>4. Email Communications</h2>
            <p>
              We send emails only when you explicitly trigger them (e.g. verification email, password reset) or when Orbit sends reminders for interviews and follow-ups you have scheduled. You can stop receiving reminders by removing the relevant interview entries or follow-ups from your account.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              We use an SMTP provider to send transactional emails. Your email address is passed to this provider solely for the purpose of delivering emails to you. We do not use third-party analytics, advertising, or tracking services.
            </p>

            <h2>6. Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties, except as required by law or as necessary to operate the Service (e.g. the SMTP provider above).
            </p>

            <h2>7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access:</strong> You can view all your data within the Service at any time.</li>
              <li><strong>Export:</strong> You can export your applications as a CSV from the Applications page.</li>
              <li><strong>Deletion:</strong> You can permanently delete your account and all associated data from your profile settings. Deletion is immediate and irreversible.</li>
              <li><strong>Correction:</strong> You can update your name and email from your profile settings.</li>
            </ul>

            <h2>8. Cookies</h2>
            <p>
              Orbit uses a single HTTP-only cookie (<code>orbit-session</code>) to maintain your authenticated session. This cookie is essential for the Service to function. We do not use cookies for tracking or advertising.
            </p>

            <h2>9. Children</h2>
            <p>
              The Service is not directed at children under the age of 16. We do not knowingly collect data from anyone under 16.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will update the "Last updated" date at the top. Continued use of the Service constitutes acceptance of the updated policy.
            </p>

            <h2>11. Contact</h2>
            <p>
              If you have any questions or requests regarding your privacy, please contact us at <a href="mailto:support@orbit.app" className="underline hover:text-foreground">support@orbit.app</a>.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Orbit</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
