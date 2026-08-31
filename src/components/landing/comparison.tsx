"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  { feature: "Visual pipeline (Kanban)",    orbit: true, spreadsheet: false, notion: false },
  { feature: "Drag-and-drop stage updates", orbit: true, spreadsheet: false, notion: false },
  { feature: "Interview round tracking",    orbit: true, spreadsheet: false, notion: false },
  { feature: "Follow-up reminders",         orbit: true, spreadsheet: false, notion: false },
  { feature: "Built-in analytics",          orbit: true, spreadsheet: false, notion: false },
  { feature: "Calendar view",               orbit: true, spreadsheet: false, notion: false },
  { feature: "Zero setup time",             orbit: true, spreadsheet: true,  notion: false },
  { feature: "Free forever",                orbit: true, spreadsheet: true,  notion: true  },
];

export function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".comp-table", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 px-6 border-t">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Comparison</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Why Orbit over spreadsheets?</h2>
          <p className="text-muted-foreground">Purpose-built beats DIY every time.</p>
        </div>

        <div className="comp-table opacity-0 rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-indigo-500 w-24">Orbit</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground w-28">Spreadsheet</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground w-24">Notion</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.feature} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-sm">{row.feature}</td>
                  <td className="py-3 px-4 text-center">{row.orbit ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{row.spreadsheet ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}</td>
                  <td className="py-3 px-4 text-center">{row.notion ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
