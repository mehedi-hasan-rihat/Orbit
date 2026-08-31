"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Mockups ──────────────────────────────────────────────────────────────────

function MockPipeline() {
  const cols = [
    { name: "Applied",   color: "#3b82f6", cards: ["Stripe", "Linear", "Vercel"] },
    { name: "Screening", color: "#a855f7", cards: ["Stripe", "Vercel"] },
    { name: "Interview", color: "#f97316", cards: ["GitHub"] },
    { name: "Get Offer", color: "#22c55e", cards: ["Stripe"] },
  ];
  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/40 flex items-center justify-between">
        <span className="text-xs font-semibold">Pipeline Board</span>
        <span className="text-[10px] text-muted-foreground">Drag to move</span>
      </div>
      <div className="p-3 flex gap-2">
        {cols.map((col) => (
          <div key={col.name} className="flex-1 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="text-[10px] font-semibold truncate">{col.name}</span>
            </div>
            <div className="p-1.5 space-y-1.5">
              {col.cards.map((c) => (
                <div key={c} className="rounded-md border bg-background px-2 py-1.5 shadow-sm">
                  <p className="text-[10px] font-medium">{c}</p>
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

function MockAnalytics() {
  const bars = [
    { label: "Applied",    value: 100, color: "#3b82f6" },
    { label: "Screening",  value: 52,  color: "#a855f7" },
    { label: "Interview",  value: 34,  color: "#f97316" },
    { label: "Get Offer",  value: 8,   color: "#22c55e" },
    { label: "Hired",      value: 4,   color: "#10b981" },
  ];
  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-muted/40 flex items-center justify-between">
        <span className="text-xs font-semibold">Analytics</span>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>Interview rate <strong className="text-foreground">34%</strong></span>
          <span>Offer rate <strong className="text-foreground">8%</strong></span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {bars.map((b) => (
          <div key={b.label} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-semibold">{b.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${b.value}%`, backgroundColor: b.color, opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockReminder() {
  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden text-xs">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/40 border-b">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-[10px] text-muted-foreground">Inbox · you@email.com</span>
      </div>
      <div className="px-4 py-2.5 border-b bg-muted/20 flex justify-between items-start gap-2">
        <p className="font-semibold text-[11px]">Interview reminder — Stripe · Screening</p>
        <span className="text-[10px] text-muted-foreground shrink-0">Today</span>
      </div>
      <div className="px-4 py-3 space-y-2 text-[11px]">
        <p className="text-muted-foreground">Hi there,</p>
        <p>You have a <strong>Screening interview</strong> with <strong>Stripe</strong> tomorrow at <strong>10:00 AM</strong>.</p>
        <div className="rounded-lg border bg-indigo-500/5 border-indigo-500/20 px-3 py-2 flex items-center gap-2">
          <span className="text-indigo-500 text-sm">📅</span>
          <div>
            <p className="font-semibold">Sep 8 · 10:00 AM</p>
            <p className="text-[10px] text-muted-foreground">Frontend Engineer · Round 1</p>
          </div>
        </div>
        <p className="text-muted-foreground text-[10px]">Good luck! — The Orbit team</p>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    number: "01",
    title: "Every application, one board",
    description:
      "Drag cards between stages as you progress. Eight default stages cover the full journey — Wishlist through Hired. Add your own, recolour them, or hide what you don't need. The board updates instantly.",
    bullets: ["8 pipeline stages out of the box", "Drag-and-drop between columns", "Custom colours and hidden stages"],
    mock: <MockPipeline />,
  },
  {
    number: "02",
    title: "Know exactly what's working",
    description:
      "Interview rate, offer rate, stage breakdown — all calculated from your real data. See where applications drop off so you can focus your energy where it actually counts.",
    bullets: ["Interview and offer rate tracking", "Stage-by-stage funnel view", "Weekly activity trends"],
    mock: <MockAnalytics />,
    flip: true,
  },
  {
    number: "03",
    title: "Never miss an interview",
    description:
      "Orbit sends email reminders automatically — 2 days before and 1 day before every interview. Follow-up tasks get a reminder on their due date. No calendar integration required.",
    bullets: ["2-day and 1-day interview reminders", "Follow-up email on the due date", "In-app notification bell"],
    mock: <MockReminder />,
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ref.current?.querySelectorAll(".feat-row").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 78%" },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-24">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for the way job searching works
          </h2>
        </div>

        {features.map((f) => (
          <div
            key={f.number}
            className={`feat-row opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
              f.flip ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            {/* Text */}
            <div className="space-y-5">
              <p className="text-4xl font-bold text-muted-foreground/25 font-mono">{f.number}</p>
              <h3 className="text-2xl font-bold tracking-tight">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              <ul className="space-y-2 pt-1">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 text-[9px] font-bold">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup */}
            <div>{f.mock}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
