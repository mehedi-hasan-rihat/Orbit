"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "I was managinf 40+ applications in a Google Sheet and losing my mind. Orbit replaced all of that in one afternoon.",
    name: "Sarah K.",
    role: "Software Engineer",
    avatar: "S",
  },
  {
    quote: "The Kanban board makes it so easy to see where everything stands. I finally feel in control of my job search.",
    name: "James R.",
    role: "Product Manager",
    avatar: "J",
  },
  {
    quote: "Follow-up reminders alone have saved me from ghosting so many companies. Simple but incredibly effective.",
    name: "Priya M.",
    role: "UX Designer",
    avatar: "P",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".t-card", { opacity: 0, y: 25 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 border-t">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What people say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="t-card opacity-0 rounded-xl border bg-background p-6 space-y-4 hover:shadow-sm transition-shadow">
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
