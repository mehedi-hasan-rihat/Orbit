"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  { name: "Wishlist",   color: "#6b7280", category: "Not started", cards: ["Notion", "Figma", "Linear"] },
  { name: "Applied",    color: "#3b82f6", category: "Not started", cards: ["Stripe", "Vercel", "GitHub", "Shopify", "+4"] },
  { name: "Screening",  color: "#a855f7", category: "In process",  cards: ["Stripe", "Vercel", "GitHub", "Shopify"] },
  { name: "Assessment", color: "#f59e0b", category: "In process",  cards: ["Stripe", "GitHub"] },
  { name: "Interview",  color: "#f97316", category: "In process",  cards: ["Stripe", "Vercel", "GitHub"] },
  { name: "Get Offer",  color: "#22c55e", category: "Final stage", cards: ["Stripe"] },
  { name: "Hired",      color: "#10b981", category: "Final stage", cards: ["Vercel"] },
  { name: "Rejected",   color: "#ef4444", category: "Closed",      cards: ["Shopify", "Twilio", "+3"] },
];

const CATEGORY_STYLE: Record<string, string> = {
  "Not started": "bg-slate-500/10 text-slate-500",
  "In process":  "bg-indigo-500/10 text-indigo-500",
  "Final stage": "bg-green-500/10 text-green-500",
  "Closed":      "bg-red-500/10 text-red-500",
};

export function PipelinePreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".pp-col", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 border-t bg-muted/20">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Pipeline</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Every stage, one view</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Eight stages · drag to move · categories drive your analytics
            </p>
          </div>
        </div>

        {/* 8-column board */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stages.map((stage) => (
            <div key={stage.name} className="pp-col opacity-0 flex flex-col rounded-lg border bg-background overflow-hidden">
              <div className="px-2.5 py-2 border-b flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-[10px] font-semibold truncate">{stage.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{stage.cards.length}</span>
              </div>
              <div className="px-2 py-1 border-b bg-muted/30">
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${CATEGORY_STYLE[stage.category]}`}>
                  {stage.category}
                </span>
              </div>
              <div className="p-1.5 space-y-1 flex-1">
                {stage.cards.slice(0, 3).map((name) => (
                  <div key={name} className="rounded border bg-muted/20 px-2 py-1.5">
                    <p className="text-[9px] font-medium truncate">{name}</p>
                    <div className="h-0.5 w-3/4 rounded-full bg-muted mt-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
