"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ClipboardList,
  KanbanSquare,
  BarChart3,
  CalendarDays,
  Tags,
  ShieldCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ClipboardList,
    title: "Application Tracking",
    description: "Log every application with company, role, URL, dates, notes, and tags. Never lose track again.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: KanbanSquare,
    title: "Visual Pipeline",
    description: "Drag and drop between stages. See your entire job search status at a glance on a Kanban board.",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Interview rates, offer rates, weekly trends. Real data to optimize your strategy.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Reminders",
    description: "All interviews and follow-ups on one calendar. Overdue reminders so nothing falls through.",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Tags,
    title: "Smart Tags",
    description: "Label applications with custom colors. Filter by Remote, Referral, Priority — whatever works for you.",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    description: "HTTP-only cookies, encrypted sessions, zero tracking. Your data stays yours.",
    gradient: "from-red-500/10 to-rose-500/10",
    iconColor: "text-red-500",
  },
];

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to land the job
          </h2>
          <p className="text-muted-foreground text-lg">
            Built around the real workflow of finding, applying, and landing a job — not generic project management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`feature-card opacity-0 group relative rounded-2xl border border-border/50 p-6 space-y-4 transition-all hover:border-border hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${f.gradient}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-background border flex items-center justify-center ${f.iconColor}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
