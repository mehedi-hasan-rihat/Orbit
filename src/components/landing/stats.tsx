"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "1M+",  label: "Applications tracked",    sub: "Across all users" },
  { value: "93%",  label: "Found it helpful",         sub: "vs. spreadsheets" },
  { value: "4.9",  label: "Average rating",           sub: "From early users" },
  { value: "Free", label: "Forever, no limits",       sub: "No credit card needed" },
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
    <section ref={ref} className="py-16 px-6 border-b">
      <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
        {stats.map((s) => (
          <div key={s.label} className="stat-item opacity-0 space-y-1">
            <p className="text-4xl font-bold tracking-tight text-indigo-500">{s.value}</p>
            <p className="text-sm font-semibold">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
