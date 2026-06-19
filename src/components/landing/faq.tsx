"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "Is Orbit really free?",
    answer: "Yes. Orbit is completely free to use with no limits on applications, interviews, or features. No credit card required, no trial period.",
  },
  {
    question: "Can I import from a spreadsheet?",
    answer: "Not yet, but it's on the roadmap. For now you can add applications manually — most people find it takes just a few minutes to set up.",
  },
  {
    question: "Is my data private?",
    answer: "Absolutely. Each account is fully isolated. We use HTTP-only cookies for authentication, and your data is never shared with third parties.",
  },
  {
    question: "Can I export my data?",
    answer: "Yes. You can export all your applications as a CSV file at any time from the Applications page. Your data is always yours.",
  },
  {
    question: "Does it work on mobile?",
    answer: "Yes. Orbit is fully responsive with a dedicated mobile navigation and touch-friendly interface including drag-and-drop on the pipeline.",
  },
  {
    question: "What makes this different from Notion or Trello?",
    answer: "Orbit is purpose-built for job tracking. It has interview round tracking, follow-up reminders, analytics, and a pipeline designed specifically for the application process — no setup required.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium pr-4">{question}</span>
        <ChevronDown className={clsx("w-4 h-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={clsx(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-40 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-list",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 border-t">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="faq-list opacity-0 rounded-2xl border divide-y-0 px-6">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
