"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Lock, Eye, Database, UserX } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    icon: Lock,
    title: "HTTP-only cookies",
    description: "Your session token never touches JavaScript. Can't be stolen by XSS attacks.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Eye,
    title: "Zero tracking",
    description: "No analytics scripts, no ad pixels, no third-party beacons watching your browsing.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Database,
    title: "Isolated accounts",
    description: "Every query is scoped to your user ID at the database level. Other users can't reach your data.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: UserX,
    title: "Delete anytime",
    description: "Your account and all data can be permanently deleted at any time from your profile settings.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export function PrivacySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".privacy-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
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
    <section ref={containerRef} className="py-24 px-6 border-t">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security first
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Your job search is private
          </h2>
          <p className="text-muted-foreground text-lg">
            We built Orbit to be as private as a notebook. Your applications, notes, and contacts are yours alone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="privacy-card opacity-0 rounded-2xl border border-border/50 p-6 space-y-4 hover:border-border hover:shadow-md transition-all"
            >
              <div className={`w-11 h-11 rounded-xl ${p.bg} flex items-center justify-center`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <h3 className="font-semibold text-sm">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
