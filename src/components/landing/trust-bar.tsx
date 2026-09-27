"use client";

export function TrustBar() {
  const items = [
    "Visual Pipeline",
    "Auto Reminders",
    "Interview Tracking",
    "Analytics Dashboard",
    "Follow-up Management",
    "CSV Export",
    "Dark Mode",
    "Free Forever",
  ];

  return (
    <div className="border-y overflow-hidden py-3 bg-muted/30">
      <div className="flex gap-0 whitespace-nowrap" style={{ animation: "marquee 22s linear infinite" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-8 text-xs text-muted-foreground font-medium uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
