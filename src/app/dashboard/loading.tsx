// Generic dashboard loading skeleton — used by all dashboard routes that
// don't define their own loading.tsx (pipeline, calendar, profile, tags, etc.)
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Content block rows */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-xl p-5 space-y-3">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
