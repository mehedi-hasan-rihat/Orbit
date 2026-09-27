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
    <section ref={ref} className="py-20 px-6 border-t bg-muted/20">
      <div className="cta-inner opacity-0 max-w-2xl mx-auto text-center space-y-6">
        <p className="text-sm font-medium text-indigo-500 uppercase tracking-widest">Get started</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Build a better landing page fast
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Free forever. No credit card. Set up in minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex h-11 items-center rounded-lg px-8 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            Learn more
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-lg border px-8 text-sm font-medium hover:bg-accent transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
