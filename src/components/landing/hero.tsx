"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

function MockAppForm() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden text-[11px] select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-xs">New Application</span>
        <button className="text-muted-foreground hover:text-foreground text-sm leading-none">✕</button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Company *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2.5 flex items-center text-foreground">Stripe</div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Role *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2.5 flex items-center text-foreground">Frontend Engineer</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Stage *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2.5 flex items-center justify-between">
              <span>Applied</span>
              <span className="text-muted-foreground text-xs">▾</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Applied Date *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2.5 flex items-center text-muted-foreground">Sep 1, 2026</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Tags</p>
          <div className="flex gap-1.5 flex-wrap">
            <span className="rounded-full px-2.5 py-0.5 bg-surface border border-border text-foreground">Remote</span>
            <span className="rounded-full px-2.5 py-0.5 bg-surface border border-border text-foreground">Fintech</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <div className="h-8 px-4 rounded-full border border-border flex items-center text-muted-foreground text-xs cursor-default">Cancel</div>
          <div className="h-8 px-4 rounded-full bg-primary text-primary-foreground flex items-center text-xs cursor-default">Create</div>
        </div>
      </div>
    </div>
  );
}

function MockPipelineBoard() {
  const cols = [
    { name: "Wishlist",  color: "#6b7280", cards: ["Notion", "Figma"] },
    { name: "Applied",   color: "#3b82f6", cards: ["Stripe", "Linear"] },
    { name: "Screening", color: "#a855f7", cards: ["Vercel"] },
    { name: "Interview", color: "#f97316", cards: ["GitHub"] },
  ];
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden text-[10px] select-none">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <span className="text-xs">Pipeline Board</span>
        <span className="text-[10px] text-muted-foreground">Drag to move</span>
      </div>
      <div className="p-2.5 flex gap-2">
        {cols.map((col) => (
          <div key={col.name} className="flex-1 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="truncate">{col.name}</span>
              <span className="text-muted-foreground ml-auto">{col.cards.length}</span>
            </div>
            <div className="p-1.5 space-y-1">
              {col.cards.map((c) => (
                <div key={c} className="rounded border border-border bg-background px-2 py-1.5">
                  <p>{c}</p>
                  <div className="h-0.5 w-2/3 rounded-full bg-muted mt-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-text > *",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
      gsap.fromTo(
        ".hero-mockups > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.3, ease: "power2.out" }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto text-center hero-text space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-approved)] animate-pulse" />
          Currently free · No credit card required
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15]">
          Get your job search<br />
          <span className="text-foreground">done right</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Stop losing applications in spreadsheets. Orbit gives you a visual pipeline, automatic reminders, and real analytics — built for the way job searching actually works.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-full px-5 text-sm bg-primary text-primary-foreground hover:bg-[#3a3a3a] transition-colors"
          >
            Start for free →
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-full border border-border px-5 text-sm text-foreground hover:bg-control transition-colors"
          >
            Sign in
          </Link>
        </div>

        <p className="text-[13px] text-muted-foreground">Set up in minutes · Export your data anytime</p>
      </div>

      {/* Mockups below the headline */}
      <div className="hero-mockups max-w-4xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MockAppForm />
        <MockPipelineBoard />
      </div>
    </section>
  );
}
