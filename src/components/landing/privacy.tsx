"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lock, Eye, Database, UserX } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  { icon: Lock,     title: "HTTP-only cookies",  description: "Your session token never touches JavaScript. Can't be stolen by XSS." },
  { icon: Eye,      title: "Zero tracking",       description: "No analytics scripts, no ad pixels, no third-party scripts at all." },
  { icon: Database, title: "Isolated accounts",   description: "Every query is scoped to your user ID. Other users can't reach your data." },
  { icon: UserX,    title: "Delete anytime",      description: "Your account and all data can be permanently deleted from profile settings." },
];

export function PrivacySection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".priv-card", { opacity: 0, y: 25 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 border-t bg-muted/20">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Privacy</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your job search is private</h2>
          <p className="text-muted-foreground max-w-md">Built to be as private as a notebook. Your data stays yours.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="priv-card opacity-0 rounded-xl border bg-background p-6 space-y-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <p.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
