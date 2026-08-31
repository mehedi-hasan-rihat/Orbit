"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { question: "Is Orbit really free?", answer: "Yes. Orbit is completely free with no limits on applications, interviews, or features. No credit card required, no trial period." },
  { question: "Can I import from a spreadsheet?", answer: "Not yet, but it's on the roadmap. For now you can add applications manually — most people find it takes just a few minutes to get set up." },
  { question: "Is my data private?", answer: "Absolutely. Each account is fully isolated. We use HTTP-only cookies for authentication, and your data is never shared with third parties." },
  { question: "Can I export my data?", answer: "Yes. You can export all your applications as a CSV file at any time from the Applications page." },
  { question: "Does it work on mobile?", answer: "Yes. Orbit is fully responsive with a dedicated mobile navigation and touch-friendly drag-and-drop pipeline." },
  { question: "What makes this different from Notion or Trello?", answer: "Orbit is purpose-built for job tracking — interview round tracking, follow-up reminders, analytics, and a pipeline designed specifically for the application process. No setup required." },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left gap-4">
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
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">FAQ</p>
          <h2 className="text-3xl font-bold tracking-tight">Common questions</h2>
          <p className="text-sm text-muted-foreground">Can&apos;t find what you&apos;re looking for? <a href="mailto:support@orbit.app" className="underline hover:text-foreground transition-colors">Get in touch.</a></p>
        </div>
        <div className="faq-wrap opacity-0 lg:col-span-2 border rounded-xl px-6">
          {faqs.map((f) => <FAQItem key={f.question} {...f} />)}
        </div>
      </div>
    </section>
  );
}
