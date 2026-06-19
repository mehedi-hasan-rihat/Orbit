"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  { feature: "Visual pipeline (Kanban)", orbit: true, spreadsheet: false, notion: false },
  { feature: "Drag-and-drop status updates", orbit: true, spreadsheet: false, notion: false },
  { feature: "Interview round tracking", orbit: true, spreadsheet: false, notion: false },
  { feature: "Follow-up reminders", orbit: true, spreadsheet: false, notion: false },
  { feature: "Built-in analytics", orbit: true, spreadsheet: false, notion: false },
  { feature: "Calendar view", orbit: true, spreadsheet: false, notion: false },
  { feature: "Zero setup time", orbit: true, spreadsheet: true, notion: false },
  { feature: "Free forever", orbit: true, spreadsheet: true, notion: true },
];

function CellIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="w-4 h-4 text-green-500 mx-auto" />
  ) : (
    <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
  );
}

export function ComparisonSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".comparison-table",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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
    <section ref={containerRef} className="py-24 px-6 bg-muted/20 border-t">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-indigo-500 uppercase tracking-wider">Comparison</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Why Orbit over spreadsheets?
          </h2>
          <p className="text-muted-foreground">
            Purpose-built beats DIY every time.
          </p>
        </div>

        <div className="comparison-table opacity-0 rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-indigo-500 w-24">Orbit</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground w-28">Spreadsheet</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground w-24">Notion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm">{row.feature}</td>
                    <td className="py-3 px-4"><CellIcon value={row.orbit} /></td>
                    <td className="py-3 px-4"><CellIcon value={row.spreadsheet} /></td>
                    <td className="py-3 px-4"><CellIcon value={row.notion} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
