"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "I was managing 40+ applications in a Google Sheet and losing my mind. Orbit replaced all of that in one afternoon.",
    name: "Sarah K.",
    role: "Software Engineer",
    avatar: "S",
    color: "bg-indigo-500",
  },
  {
    quote: "The Kanban board makes it so easy to see where everything stands. I finally feel in control of my job search.",
    name: "James R.",
    role: "Product Manager",
    avatar: "J",
    color: "bg-purple-500",
  },
  {
    quote: "Follow-up reminders alone have saved me from ghosting so many companies. Simple but incredibly effective.",
    name: "Priya M.",
    role: "UX Designer",
    avatar: "P",
    color: "bg-pink-500",
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
    <section ref={ref} className="py-24 px-6 border-t bg-muted/20">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-widest">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">You&apos;re the best</h2>
          <p className="text-muted-foreground text-sm">See what people are saying about Orbit</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="t-card opacity-0 rounded-xl border bg-background p-6 space-y-4 hover:shadow-sm transition-shadow flex flex-col">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className={`w-8 h-8 rounded-full ${t.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
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
