"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "100%", label: "Free forever",           sub: "No tiers, no paywalls" },
  { value: "8",    label: "Pipeline stages",         sub: "Wishlist through hired" },
  { value: "2×",   label: "Fewer missed follow-ups", sub: "Automated on every deadline" },
  { value: "0",    label: "Spreadsheets needed",     sub: "One place replaces the chaos" },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".stat-item", { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-16 px-6 border-t">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-item opacity-0 space-y-1">
            <p className="text-3xl font-bold tracking-tight">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
