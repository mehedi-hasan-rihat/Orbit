"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "I was tracking 40+ applications in a Google Sheet and losing my mind. Orbit replaced all of that in one afternoon.",
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonial-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
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
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by job seekers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="testimonial-card opacity-0 rounded-2xl border border-border/50 p-6 space-y-4 bg-muted/20"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
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
