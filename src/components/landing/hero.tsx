"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

function MockAppForm() {
  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden text-[11px] select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <span className="text-xs font-semibold">New Application</span>
        <button className="text-muted-foreground hover:text-foreground text-sm leading-none">✕</button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">Company *</p>
            <div className="h-8 rounded-md border bg-background px-2.5 flex items-center text-foreground font-medium">Stripe</div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">Role *</p>
            <div className="h-8 rounded-md border bg-background px-2.5 flex items-center text-foreground">Frontend Engineer</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">Stage *</p>
            <div className="h-8 rounded-md border bg-background px-2.5 flex items-center justify-between">
              <span className="font-medium">Applied</span>
              <span className="text-muted-foreground text-xs">▾</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">Applied Date *</p>
            <div className="h-8 rounded-md border bg-background px-2.5 flex items-center text-muted-foreground">Sep 1, 2026</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground font-medium">Tags</p>
          <div className="flex gap-1.5 flex-wrap">
            <span className="rounded-full px-2.5 py-0.5 bg-indigo-500/12 text-indigo-500 font-medium border border-indigo-500/20">Remote</span>
            <span className="rounded-full px-2.5 py-0.5 bg-purple-500/12 text-purple-500 font-medium border border-purple-500/20">Fintech</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <div className="h-8 px-4 rounded-md border flex items-center text-muted-foreground text-xs font-medium cursor-default">Cancel</div>
          <div className="h-8 px-4 rounded-md bg-indigo-500 text-white flex items-center text-xs font-semibold cursor-default">Create</div>
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
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden text-[10px] select-none">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <span className="text-xs font-semibold">Pipeline Board</span>
        <span className="text-[10px] text-muted-foreground">Drag to move</span>
      </div>
      <div className="p-2.5 flex gap-2">
        {cols.map((col) => (
          <div key={col.name} className="flex-1 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="font-semibold truncate">{col.name}</span>
              <span className="text-muted-foreground ml-auto">{col.cards.length}</span>
            </div>
            <div className="p-1.5 space-y-1">
              {col.cards.map((c) => (
                <div key={c} className="rounded border bg-background px-2 py-1.5 shadow-sm">
                  <p className="font-medium">{c}</p>
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
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, delay: 0.2, ease: "power2.out" }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

        {/* Left — text */}
        <div className="hero-text space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3.5 py-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Currently free · No credit card required
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Your job search,<br />
            <span className="text-muted-foreground">finally organized</span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            Stop losing applications in spreadsheets. Orbit gives you a visual pipeline, automatic reminders, and real analytics — built for the way job searching actually works.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-lg px-6 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start tracking free →
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-lg border px-6 text-sm font-medium hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Set up in minutes · Export your data anytime
          </p>
        </div>

        {/* Right — stacked mockups */}
        <div className="hero-mockups space-y-3">
          <MockAppForm />
          <MockPipelineBoard />
        </div>

      </div>
    </section>
  );
}
