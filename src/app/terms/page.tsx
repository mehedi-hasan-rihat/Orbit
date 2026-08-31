import Link from "next/link";
import { Logo } from "@/components/landing/logo";

export const metadata = {
  title: "Terms of Service — Orbit",
  description: "Terms of Service for Orbit job application management.",
};

const LAST_UPDATED = "September 1, 2026";

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

            <p>
              Welcome to Orbit. By accessing or using Orbit ("the Service") at <Link href="/" className="underline hover:text-foreground">orbit.app</Link>, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account or using the Service, you confirm that you are at least 16 years old and agree to these Terms. If you do not agree, do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Orbit is a job application managment tool that helps users organise job applications, schedule interviews, set follow-up reminders, and view analytics about their job search. The Service is provided "as is" and may be updated, changed, or discontinued at any time.
            </p>

            <h2>3. Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account credentials. You must not share your password or allow others to access your account. You are responsible for all activity that occurs under your account.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Reverse engineer or attempt to extract the source code</li>
              <li>Use automated tools to scrape or abuse the Service</li>
              <li>Upload malicious content or interfere with other users</li>
            </ul>

            <h2>5. Pricing</h2>
            <p>
              Orbit is <strong>currently free to use</strong>. We reserve the right to introduce paid plans, change pricing, or modify what is included in any tier at any time. We will provide reasonable notice of any pricing changes through the Service or by email. Continued use of the Service after such notice constitutes acceptance of the new pricing.
            </p>

            <h2>6. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>. We do not sell your personal data. All data you enter is associated with your account only.
            </p>

            <h2>7. Data Deletion</h2>
            <p>
              You may delete your account and all associated data at any time from your profile settings. Upon deletion, your data is permanently removed from our systems.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              Orbit and its original content, features, and functionality are owned by the creator and are protected by applicable intellectual property laws. Your data remains yours.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided without warranty of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Orbit shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>

            <h2>11. Changes to These Terms</h2>
            <p>
              We may update these Terms at any time. We will update the "Last updated" date at the top of this page. Continued use of the Service after changes constitutes your acceptance of the new Terms.
            </p>

            <h2>12. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:support@orbit.app" className="underline hover:text-foreground">support@orbit.app</a>.
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
