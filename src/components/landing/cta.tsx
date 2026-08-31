"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cta-inner", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 82%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 border-t bg-muted/20">
      <div className="cta-inner opacity-0 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Get started</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to take control of your job search?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Free forever. No credit card. Set up in minutes — not hours.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:justify-end">
          <Link href="/register"
            className="inline-flex h-11 items-center justify-center px-8 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            Create free account →
          </Link>
          <Link href="/login"
            className="inline-flex h-11 items-center justify-center border rounded-lg px-8 text-sm font-medium hover:bg-accent transition-all">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
