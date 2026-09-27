import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { HeroSection } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { StatsSection } from "@/components/landing/stats";
import { FeaturesSection } from "@/components/landing/features";
import { PipelinePreviewSection } from "@/components/landing/pipeline-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ComparisonSection } from "@/components/landing/comparison";
import { PrivacySection } from "@/components/landing/privacy";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { FAQSection } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-hidden font-sans">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/90 border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* <Logo className="w-6 h-6" /> */}
            <span className="text-base font-semibold tracking-tight">Orbit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      <TrustBar />
      <StatsSection />

      <div id="features">
        <FeaturesSection />
      </div>

      <PipelinePreviewSection />

      <div id="how-it-works">
        <HowItWorks />
      </div>

      <ComparisonSection />
      <PrivacySection />
      <TestimonialsSection />

      <div id="faq">
        <FAQSection />
      </div>

      <CTASection />

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-start justify-between gap-10">
          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <div className="flex items-center gap-2">
              {/* <Logo className="w-5 h-5" /> */}
              <span className="font-semibold text-sm">Orbit</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A job application tracker built to replace spreadsheet chaos. Visual pipeline, smart reminders, real analytics.
            </p>
            <p className="text-xs text-muted-foreground">Currently free · No credit card required</p>
            {/* Social icons placeholder */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</p>
              <div className="space-y-2.5">
                <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                <a href="#faq" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                <Link href="/pricing" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tracking</p>
              <div className="space-y-2.5">
                <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Pipeline</a>
                <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
                <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Reminders</a>
                <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Calendar</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
              <div className="space-y-2.5">
                <Link href="/register" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Get started</Link>
                <Link href="/login" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
              <div className="space-y-2.5">
                <Link href="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© 2026 Orbit. Built by <a href="https://mehedi-hasan-rihat.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Mehedi Hasan</a>.</span>
            <span>Your data is yours — always.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
