"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stages = [
  { name: "Wishlist",   color: "#6b7280", category: "Not started",  cards: 3 },
  { name: "Applied",    color: "#3b82f6", category: "Not started",  cards: 8 },
  { name: "Screening",  color: "#a855f7", category: "In process",   cards: 4 },
  { name: "Assessment", color: "#f59e0b", category: "In process",   cards: 2 },
  { name: "Interview",  color: "#f97316", category: "In process",   cards: 3 },
  { name: "Get Offer",  color: "#22c55e", category: "Final stage",  cards: 1 },
  { name: "Hired",      color: "#10b981", category: "Final stage",  cards: 1 },
  { name: "Rejected",   color: "#ef4444", category: "Closed",       cards: 5 },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Not started":  "bg-slate-500/10 text-slate-500",
  "In process":   "bg-indigo-500/10 text-indigo-500",
  "Final stage":  "bg-green-500/10 text-green-500",
  "Closed":       "bg-red-500/10 text-red-500",
};

const CARD_NAMES: Record<string, string[]> = {
  Wishlist:   ["Notion", "Figma", "Linear"],
  Applied:    ["Stripe", "Vercel", "GitHub", "Shopify", "Twilio", "Cloudflare", "Datadog", "HashiCorp"],
  Screening:  ["Stripe", "Vercel", "GitHub", "Shopify"],
  Assessment: ["Stripe", "GitHub"],
  Interview:  ["Stripe", "Vercel", "GitHub"],
  "Get Offer": ["Stripe"],
  Hired:      ["Vercel"],
  Rejected:   ["Shopify", "Twilio", "Cloudflare", "Datadog", "HashiCorp"],
};

export function PipelinePreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pipeline-col",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 border-t overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">Pipeline</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Every stage, one view
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Eight default stages cover the full lifecycle — from first wishlist entry to hired. Drag cards between columns as you progress. Customise colours, add your own stages, or hide the ones you don&apos;t use.
          </p>
        </div>

        {/* Board mockup — responsive grid, no scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stages.map((stage) => (
            <div
              key={stage.name}
              className="pipeline-col opacity-0 flex flex-col rounded-xl border bg-muted/20 overflow-hidden"
            >
              {/* Column header */}
              <div className="px-2.5 py-2 border-b flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-[11px] font-semibold truncate">{stage.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{stage.cards}</span>
              </div>
              {/* Category badge */}
              <div className="px-2 py-1.5 border-b bg-background/50">
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none ${CATEGORY_COLORS[stage.category]}`}>
                  {stage.category}
                </span>
              </div>
              {/* Cards */}
              <div className="p-1.5 space-y-1.5 flex-1">
                {(CARD_NAMES[stage.name] ?? []).slice(0, 3).map((name) => (
                  <div
                    key={name}
                    className="rounded-md border bg-background px-2 py-1.5 text-[10px] shadow-sm"
                  >
                    <p className="font-medium truncate">{name}</p>
                    <div className="h-1 rounded-full bg-muted mt-1.5 w-3/4" />
                  </div>
                ))}
                {stage.cards > 3 && (
                  <p className="text-[10px] text-muted-foreground text-center py-0.5">
                    +{stage.cards - 3}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Drag and drop between columns · Stage colours are yours to choose · Categories drive your analytics
        </p>
      </div>
    </section>
  );
}
