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
    <section ref={ref} className="py-20 px-6 border-t border-border bg-surface">
      <div className="cta-inner opacity-0 max-w-2xl mx-auto text-center space-y-6">
        <p className="text-[13px] text-muted-foreground uppercase tracking-widest">Get started</p>
        <h2 className="text-3xl sm:text-4xl tracking-tight">
          Build a better landing page fast
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Free forever. No credit card. Set up in minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-full px-5 text-sm bg-primary text-primary-foreground hover:bg-[#3a3a3a] transition-colors"
          >
            Learn more
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-full border border-border px-5 text-sm text-foreground hover:bg-control transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
