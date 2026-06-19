"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UserPlus, PlusCircle, ArrowRightLeft, TrendingUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create your account",
    description: "Sign up in seconds. No credit card, no trial period. Free forever.",
  },
  {
    icon: PlusCircle,
    number: "02",
    title: "Add applications",
    description: "Log jobs with company, role, URL, and status. Tag them, set follow-up dates.",
  },
  {
    icon: ArrowRightLeft,
    number: "03",
    title: "Track your pipeline",
    description: "Drag applications through stages as you progress. See everything at a glance.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Optimize your search",
    description: "Use analytics to see what's working. Interview rates, response rates, best channels.",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".step-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Up and running in minutes
          </h2>
        </div>

        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="step-item opacity-0 flex gap-5 items-start">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <step.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">{step.number}</span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
