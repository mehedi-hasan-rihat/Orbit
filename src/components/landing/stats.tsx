"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "100%", label: "Free forever", sub: "No hidden tiers or paywalls" },
  { value: "8", label: "Pipeline stages", sub: "Fully customisable to your flow" },
  { value: "2×", label: "Faster follow-ups", sub: "Automated reminders on every deadline" },
  { value: "0", label: "Spreadsheets needed", sub: "Replace the chaos with one view" },
];

export function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 px-6 border-t border-b bg-muted/10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-item opacity-0 text-center space-y-1.5">
            <p className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {s.value}
            </p>
            <p className="text-sm font-semibold">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
