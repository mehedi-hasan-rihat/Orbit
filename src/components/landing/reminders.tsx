"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BellRing, Mail, CalendarCheck, Clock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function MockEmail() {
  return (
    <div className="rounded-xl border bg-background shadow-md overflow-hidden text-xs">
      {/* Email client bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-[10px] text-muted-foreground">Inbox · you@email.com</span>
      </div>
      {/* Email header */}
      <div className="px-4 py-3 border-b space-y-1 bg-muted/20">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">Interview reminder — Stripe · Screening</p>
          <span className="text-[10px] text-muted-foreground">Today, 08:00</span>
        </div>
        <p className="text-[10px] text-muted-foreground">From: reminders@orbit.app · To: you@email.com</p>
      </div>
      {/* Email body */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-muted-foreground">Hi there,</p>
        <p className="leading-relaxed">
          You have a <strong className="text-foreground">Screening interview</strong> with{" "}
          <strong className="text-foreground">Stripe</strong> scheduled for{" "}
          <strong className="text-foreground">tomorrow at 10:00 AM</strong>.
        </p>
        <div className="rounded-lg border bg-indigo-500/5 border-indigo-500/20 px-3 py-2.5 flex items-start gap-2.5">
          <CalendarCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Sep 8 · 10:00 AM</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">Frontend Engineer · Round 1</p>
          </div>
        </div>
        <p className="text-muted-foreground text-[10px]">Good luck! — The Orbit team</p>
      </div>
    </div>
  );
}

const points = [
  {
    icon: CalendarCheck,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    title: "2 days before interviews",
    description: "Get a heads-up with enough time to prepare, research, and confirm the details.",
  },
  {
    icon: Clock,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "1 day before interviews",
    description: "A final reminder the day before so nothing catches you off guard.",
  },
  {
    icon: Mail,
    color: "text-green-500",
    bg: "bg-green-500/10",
    title: "On the day for follow-ups",
    description: "Follow-up tasks get an email on their due date — no chase required.",
  },
  {
    icon: BellRing,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "In-app notifications",
    description: "The bell icon in your dashboard shows all upcoming and overdue items at a glance.",
  },
];

export function RemindersSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reminder-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
        }
      );
      gsap.fromTo(
        ".reminder-email",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
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
    <section ref={containerRef} className="py-24 px-6 bg-muted/20 border-t">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">Reminders</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Never miss an interview again
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Orbit sends automatic email reminders for every interview and follow-up you schedule — no calendar integration required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Points */}
          <div className="space-y-5">
            {points.map((p) => (
              <div key={p.title} className="reminder-item opacity-0 flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center shrink-0`}>
                  <p.icon className={`w-5 h-5 ${p.color}`} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mock email */}
          <div className="reminder-email opacity-0">
            <MockEmail />
          </div>
        </div>
      </div>
    </section>
  );
}
