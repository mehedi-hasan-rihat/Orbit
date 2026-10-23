"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Inline UI mockups ────────────────────────────────────────────────────────

function MockApplicationForm() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden text-[11px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-xs">New Application</span>
        <span className="text-muted-foreground">✕</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Company *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2 flex items-center text-foreground">Stripe</div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Role *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2 flex items-center text-foreground">Frontend Engineer</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Stage *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2 flex items-center justify-between">
              <span className="text-foreground">Applied</span>
              <span className="text-muted-foreground">▾</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Applied Date *</p>
            <div className="h-8 rounded-xl border border-border bg-background px-2 flex items-center text-muted-foreground">Sep 1, 2026</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Tags</p>
          <div className="flex gap-1.5">
            <span className="rounded-full px-2.5 py-0.5 bg-surface border border-border text-foreground">Remote</span>
            <span className="rounded-full px-2.5 py-0.5 bg-surface border border-border text-foreground">Fintech</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <div className="h-8 px-4 rounded-full border border-border flex items-center text-muted-foreground">Cancel</div>
          <div className="h-8 px-4 rounded-full bg-primary text-primary-foreground flex items-center">Create</div>
        </div>
      </div>
    </div>
  );
}

function MockKanbanBoard() {
  const columns = [
    { name: "Wishlist", color: "#6b7280", cards: ["Notion", "Figma"] },
    { name: "Applied", color: "#3b82f6", cards: ["Stripe", "Linear"] },
    { name: "Screening", color: "#a855f7", cards: ["Vercel"] },
    { name: "Interview", color: "#f97316", cards: ["GitHub"] },
  ];
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <span className="text-xs">Pipeline Board</span>
        <span className="text-[10px] text-muted-foreground">Drag to move</span>
      </div>
      <div className="p-3 flex gap-2 overflow-hidden">
        {columns.map((col) => (
          <div key={col.name} className="flex-1 min-w-0 rounded-xl border border-border bg-muted/20 flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="text-[10px] truncate">{col.name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{col.cards.length}</span>
            </div>
            <div className="p-1.5 space-y-1.5 flex-1">
              {col.cards.map((card) => (
                <div key={card} className="rounded-xl border border-border bg-background px-2 py-1.5 text-[10px]">
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockDetailPage() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden text-[11px]">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <p className="text-sm">Stripe</p>
          <p className="text-muted-foreground text-[10px]">Frontend Engineer</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-pending)]" />
          Screening
        </span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs tracking-tight">Schedule &amp; Notes</p>
        {/* entry */}
        <div className="rounded-xl border border-border p-3 flex items-start gap-3 bg-surface">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center leading-none shrink-0">
            <span className="text-[8px] uppercase opacity-70">Sep</span>
            <span className="text-xs">08</span>
          </div>
          <div className="min-w-0 flex-1">
            <p>Screening</p>
            <p className="text-muted-foreground text-[10px]">Mon, 10:00 AM · in 3 days</p>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[10px] bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)] shrink-0">Scheduled</span>
        </div>
        {/* follow-up */}
        <div className="rounded-xl border border-border bg-background p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted flex flex-col items-center justify-center leading-none shrink-0">
            <span className="text-[8px] uppercase opacity-50">Sep</span>
            <span className="text-xs">15</span>
          </div>
          <div className="min-w-0 flex-1">
            <p>Follow up with Stripe</p>
            <p className="text-muted-foreground text-[10px]">Due Sep 15</p>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[10px] bg-[var(--color-status-approved-bg)] text-[var(--color-status-approved)] shrink-0">Open</span>
        </div>
      </div>
    </div>
  );
}

function MockAnalytics() {
  const bars = [
    { label: "Wishlist", value: 40, color: "#6b7280" },
    { label: "Applied", value: 75, color: "#3b82f6" },
    { label: "Screening", value: 55, color: "#a855f7" },
    { label: "Assessment", value: 35, color: "#f59e0b" },
    { label: "Interview", value: 25, color: "#f97316" },
    { label: "Get Offer", value: 10, color: "#22c55e" },
  ];
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden text-[11px]">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-xs">Analytics</span>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>Interview rate <strong className="text-foreground">34%</strong></span>
          <span>Offer rate <strong className="text-foreground">8%</strong></span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground shrink-0 truncate">{bar.label}</span>
            <div className="flex-1 h-4 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${bar.value}%`, backgroundColor: bar.color, opacity: 0.8 }}
              />
            </div>
            <span className="w-6 text-right text-muted-foreground">{Math.round(bar.value / 5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Add your applications",
    description:
      "Log every job with company, role, URL, stage and applied date. Tag them for filtering, add notes, and pick the stage that reflects where you actually are — Wishlist through Rejected.",
    mock: <MockApplicationForm />,
  },
  {
    number: "02",
    title: "Move cards through your pipeline",
    description:
      "The kanban board gives you a live view of every active application. Drag a card to a new column as the process moves — Screening, Assessment, Interview, Get Offer, Hired.",
    mock: <MockKanbanBoard />,
  },
  {
    number: "03",
    title: "Schedule interviews and follow-ups",
    description:
      "On each application's detail page, add interview entries with a date and type. Set follow-ups with a title and due date. Orbit emails reminders automatically — 2 days before interviews, on the day for follow-ups.",
    mock: <MockDetailPage />,
  },
  {
    number: "04",
    title: "Track your numbers",
    description:
      "The dashboard shows your interview rate, offer rate and stage breakdown at a glance. See exactly where applications drop off and which companies are worth chasing.",
    mock: <MockAnalytics />,
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hiw-step",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 65%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[13px] text-muted-foreground uppercase tracking-wider">How it works</p>
          <h2 className="text-3xl sm:text-4xl tracking-tight">
            From wishlist to offer, all in one place
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Orbit follows your real job search flow — no spreadsheet juggling, no missed follow-ups.
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`hiw-step opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text */}
              <div className="space-y-4">
                <span className="text-5xl text-muted-foreground/20 font-mono leading-none">
                  {step.number}
                </span>
                <h3 className="text-2xl tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Mockup */}
              <div className="rounded-2xl bg-muted/30 border border-border p-4">
                {step.mock}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
