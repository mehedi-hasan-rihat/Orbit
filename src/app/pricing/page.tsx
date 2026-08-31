import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing — Orbit",
  description: "Orbit is currently free to use. No credit card required.",
};

// ─── UPDATE THIS when introducing paid plans ──────────────────────────────────
const PRICING_STATUS: "free" | "paid" = "free";

const FREE_FEATURES = [
  "Unlimited applications",
  "Full pipeline (8 stages)",
  "Interview & follow-up tracking",
  "Automatic email reminders",
  "Analytics dashboard",
  "Tags and custom notes",
  "CSV export",
  "Dark mode",
];
// ─────────────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
            <span className="text-sm font-semibold">Orbit</span>
          </Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
        </div>
      </header>

      <main className="flex-1 py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-14">

          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Pricing</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {PRICING_STATUS === "free"
                ? "Currently free to use"
                : "Simple, transparent pricing"}
            </h1>
            {PRICING_STATUS === "free" && (
              <p className="text-muted-foreground max-w-md mx-auto">
                Orbit is free while we&apos;re building it. We may introduce paid plans in the future — if we do, we&apos;ll give you plenty of notice and a generous free tier will always exist.
              </p>
            )}
          </div>

          {/* Plan card */}
          {PRICING_STATUS === "free" && (
            <div className="max-w-sm mx-auto rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/3 p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Free plan</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground mb-1">/ month</span>
                </div>
                <p className="text-sm text-muted-foreground">No credit card · No expiry</p>
              </div>

              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="flex h-10 items-center justify-center rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get started free →
              </Link>
            </div>
          )}

          {/* Pricing note */}
          <div className="max-w-xl mx-auto rounded-xl border bg-muted/30 p-6 space-y-3 text-center">
            <p className="text-sm font-semibold">A note on future pricing</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may introduce paid tiers in the future. When we do, we will announce it clearly, give existing users advance notice, and ensure a free tier remains available. Your data is always exportable — you&apos;re never locked in.
            </p>
            <p className="text-xs text-muted-foreground">
              See our <Link href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link> for full details on pricing changes.
            </p>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-lg font-semibold">Common questions</h2>
            <div className="space-y-5 divide-y">
              {[
                {
                  q: "Will Orbit always be free?",
                  a: "We don't make that promise. It's free now and we intend to keep a free tier, but we may introduce paid features in the future. We'll always give advance notice.",
                },
                {
                  q: "What happens to my data if paid plans are introduced?",
                  a: "Nothing changes to your existing data. You'll have time to decide whether to upgrade or export everything via CSV before any limits apply.",
                },
                {
                  q: "Do I need a credit card to sign up?",
                  a: "No. Sign up with just your email address. No payment details are collected.",
                },
                {
                  q: "Can I cancel / delete my account?",
                  a: "Yes, at any time from your profile settings. Deletion is immediate and permanent.",
                },
              ].map((item) => (
                <div key={item.q} className="pt-5 space-y-1.5 first:pt-0">
                  <p className="text-sm font-medium">{item.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Orbit</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors font-medium text-foreground">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
