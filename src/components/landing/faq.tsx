"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { question: "Can you do anything for us?",     answer: "Yes. Orbit is completely free with no limits on applications, interviews, or features. No credit card required, no trial period." },
  { question: "Does it work with BambooHR?",     answer: "Not yet, but import integrations are on the roadmap. For now you can add applications manually — most people find it takes just a few minutes." },
  { question: "Can I get unlimited?",            answer: "Orbit is already unlimited and free — no tiers, no paywalls. Every feature is available to every user." },
  { question: "Will my private data be secure?", answer: "Absolutely. Each account is fully isolated. We use HTTP-only cookies for authentication, and your data is never shared with third parties." },
  { question: "Can you export my data?",         answer: "Yes. You can export all your applications as a CSV file at any time from the Applications page." },
  { question: "Will you give me a discount?",    answer: "Orbit is free — there's nothing to discount. If that changes, early users will always be grandfathered." },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-medium">{question}</span>
        <ChevronDown className={clsx("w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div className={clsx("overflow-hidden transition-all duration-200", open ? "max-h-40 pb-4" : "max-h-0")}>
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".faq-wrap", { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 82%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 border-t">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-widest">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Pricing &amp; Plans</h2>
          <p className="text-sm text-muted-foreground">
            Common questions about Orbit.{" "}
            <a href="mailto:support@orbit.app" className="underline hover:text-foreground transition-colors">
              Get in touch
            </a>{" "}
            if you need more.
          </p>
        </div>

        <div className="faq-wrap opacity-0 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12">
          {/* Left column */}
          <div className="border rounded-xl px-6">
            {faqs.slice(0, 3).map((f) => <FAQItem key={f.question} {...f} />)}
          </div>
          {/* Right column */}
          <div className="border rounded-xl px-6">
            {faqs.slice(3).map((f) => <FAQItem key={f.question} {...f} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
