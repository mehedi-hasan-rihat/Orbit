// Skeleton for /dashboard/applications — mirrors ApplicationsList layout exactly.
export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex gap-0 border-b">
          {["Active", "Closed", "Archived"].map((tab) => (
            <div
              key={tab}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border-b-2 border-transparent -mb-px"
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="h-8 flex-1 sm:max-w-xs rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="hidden sm:grid items-center px-4 py-2.5 bg-muted/40 border-b"
          style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
        >
          {["Company", "Role", "Stage", "Outcome", "Applied", "Actions"].map((h) => (
            <div key={h} className="h-3.5 w-16 rounded bg-muted animate-pulse" />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="hidden sm:grid items-center px-4 py-3"
              style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
            >
              {/* Company */}
              <div className="space-y-1.5 pr-3">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              </div>
              {/* Role */}
              <div className="pr-3">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
              </div>
              {/* Stage badge */}
              <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
              {/* Outcome */}
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
              {/* Date */}
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              {/* Actions */}
              <div className="flex justify-end gap-1">
                <div className="h-7 w-12 rounded-md bg-muted animate-pulse" />
                <div className="h-7 w-10 rounded-md bg-muted animate-pulse" />
                <div className="h-7 w-14 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          ))}

          {/* Mobile card skeletons */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`m-${i}`} className="sm:hidden p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-14 rounded-md bg-muted animate-pulse" />
                <div className="h-8 w-12 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
