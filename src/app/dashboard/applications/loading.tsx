// Skeleton for /dashboard/applications — mirrors ApplicationsList layout exactly.
export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded-md bg-[#2a2a2a] animate-pulse" />
          <div className="h-4 w-24 rounded-md bg-[#222222] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-full bg-[#2a2a2a] animate-pulse" />
          <div className="h-8 w-16 rounded-full bg-[#2a2a2a] animate-pulse" />
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col gap-3">
        {/* Tab pills */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#1a1a1a] w-fit">
          {["Active", "Closed", "Archived"].map((tab, i) => (
            <div
              key={tab}
              className={`px-4 py-1.5 rounded-full text-[13px] ${
                i === 0 ? "bg-[#2e2e2e] w-14" : "w-14"
              } h-7 animate-pulse bg-[#2a2a2a]`}
            />
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="h-9 flex-1 sm:max-w-xs rounded-xl bg-[#2a2a2a] animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-[#2a2a2a] animate-pulse" />
          <div className="h-9 w-36 rounded-xl bg-[#2a2a2a] animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="hidden sm:grid items-center px-4 py-2.5 bg-[#1a1a1a] border-b border-border"
          style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
        >
          {["Company", "Role", "Stage", "Outcome", "Applied", "Actions"].map((h) => (
            <div key={h} className="h-3 w-14 rounded bg-[#2a2a2a] animate-pulse" />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="hidden sm:grid items-center px-4 py-3"
              style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
            >
              {/* Company */}
              <div className="space-y-1.5 pr-3">
                <div className="h-4 w-28 rounded bg-[#2a2a2a] animate-pulse" />
                <div className="h-3 w-16 rounded bg-[#222222] animate-pulse" />
              </div>
              {/* Role */}
              <div className="pr-3">
                <div className="h-4 w-36 rounded bg-[#222222] animate-pulse" />
              </div>
              {/* Stage badge */}
              <div className="h-5 w-20 rounded-full bg-[#2a2a2a] animate-pulse" />
              {/* Outcome */}
              <div className="h-5 w-16 rounded-full bg-[#222222] animate-pulse" />
              {/* Date */}
              <div className="h-4 w-20 rounded bg-[#222222] animate-pulse" />
              {/* Actions */}
              <div className="flex justify-end gap-1">
                <div className="h-7 w-12 rounded-full bg-[#2a2a2a] animate-pulse" />
                <div className="h-7 w-10 rounded-full bg-[#2a2a2a] animate-pulse" />
                <div className="h-7 w-14 rounded-full bg-[#2a2a2a] animate-pulse" />
              </div>
            </div>
          ))}

          {/* Mobile card skeletons */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`m-${i}`} className="sm:hidden p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-[#2a2a2a] animate-pulse" />
                  <div className="h-3 w-24 rounded bg-[#222222] animate-pulse" />
                </div>
                <div className="h-5 w-20 rounded-full bg-[#2a2a2a] animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-14 rounded-full bg-[#2a2a2a] animate-pulse" />
                <div className="h-8 w-12 rounded-full bg-[#2a2a2a] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
