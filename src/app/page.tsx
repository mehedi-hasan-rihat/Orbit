import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { HeroSection } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
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
            <Logo className="w-6 h-6" />
            <span className="text-base font-semibold tracking-tight">Orbit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="hidden sm:inline-flex h-9 items-center px-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <HeroSection />
      <TrustBar />

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
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5" />
              <span className="font-semibold text-sm">Orbit</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              A job application tracker built to replace the spreadsheet chaos. Visual pipeline, smart reminders, real analytics.
            </p>
            <p className="text-xs text-muted-foreground">Currently free · No credit card required</p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</p>
              <div className="space-y-2">
                <a href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                <a href="#faq" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Links</p>
              <div className="space-y-2">
                <Link href="/register" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Get started</Link>
                <Link href="/login" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
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
