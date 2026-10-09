"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { ApplicationForm } from "./application-form";
import { deleteApplication } from "@/lib/actions/applications";
import { ExportButton } from "./export-button";
import { QuickActions, type StageOption } from "./quick-actions";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { resolveStage } from "@/lib/stage-display";

const OUTCOME_DISPLAY: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", color: "#3b82f6" },
  COMPLETED: { label: "Completed", color: "#a855f7" },
  PASSED:    { label: "Passed",    color: "#22c55e" },
  FAILED:    { label: "Failed",    color: "#ef4444" },
  CANCELLED: { label: "Cancelled", color: "#f97316" },
};

function resolveStageStatus(app: Application): { label: string; color: string } | null {
  if (app.stageOutcome) return OUTCOME_DISPLAY[app.stageOutcome] ?? { label: app.stageOutcome, color: "#6b7280" };
  return null;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = typeof PAGE_SIZE_OPTIONS[number];

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Application {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  stageId: string | null;
  status: string | null;
  stage: { name: string; color: string; category: string } | null;
  appliedDate: Date | null;
  stageOutcome: string | null;
  stageDueAt: Date | null;
  notes: string | null;
  archived: boolean;
  closed: boolean;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { tag: Tag }[];
}

interface ApplicationsListProps {
  applications: Application[];
  availableTags: Tag[];
  stages: StageOption[];
  search: string;
  stageId: string;
  sort: string;
  showArchived?: boolean;
  showClosed?: boolean;
}

export function ApplicationsList({
  applications,
  availableTags,
  stages,
  search,
  stageId,
  sort,
  showArchived,
  showClosed,
}: ApplicationsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const [stageFilter, setStageFilter] = useState(stageId);
  const [sortBy, setSortBy] = useState(sort);
  const [isPending, startTransition] = useTransition();
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);
  // Track the last-seen applications length and pageSize to reset page when either changes
  const prevListKey = useRef(`${applications.length}-${pageSize}`);
  const listKey = `${applications.length}-${pageSize}`;
  if (prevListKey.current !== listKey) {
    prevListKey.current = listKey;
    if (currentPage !== 1) setCurrentPage(1);
  }

  // Fire search 500ms after typing — skip on first mount
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      applyFilters(searchInput);
    }, 500);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const DEFAULT_SORT = "createdAt";

  function applyFilters(newSearch?: string, newStage?: string, newSort?: string) {
    const s = newSearch ?? searchInput;
    const st = newStage ?? stageFilter;
    const so = newSort ?? sortBy;
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (st && st !== "ALL") params.set("stage", st);
    if (so && so !== DEFAULT_SORT) params.set("sort", so);
    if (showArchived) params.set("archived", "true");
    if (showClosed) params.set("closed", "true");
    startTransition(() => {
      router.push(`/dashboard/applications?${params.toString()}`);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    await deleteApplication(id);
  }

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(applications.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, applications.length);
  const visibleApps = applications.slice(pageStart, pageEnd);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  // Build a compact page number list: always show first, last, current ±1, with ellipsis
  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [];
    const around = new Set([1, totalPages, safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1].filter(p => p >= 1 && p <= totalPages));
    let prev = 0;
    for (const p of [...around].sort((a, b) => a - b)) {
      if (p - prev > 1) pages.push("…");
      pages.push(p);
      prev = p;
    }
    return pages;
  }

  const activeTab = showArchived ? "archived" : showClosed ? "closed" : "active";

  const tabs = [
    {
      key: "active",
      label: "Active",
      onClick: () => {
        const params = new URLSearchParams();
        if (searchInput) params.set("search", searchInput);
        if (stageFilter && stageFilter !== "ALL") params.set("stage", stageFilter);
        if (sortBy && sortBy !== DEFAULT_SORT) params.set("sort", sortBy);
        startTransition(() => router.push(`/dashboard/applications?${params.toString()}`));
      },
    },
    {
      key: "closed",
      label: "Closed",
      onClick: () => startTransition(() => router.push("/dashboard/applications?closed=true")),
    },
    {
      key: "archived",
      label: "Archived",
      onClick: () => startTransition(() => router.push("/dashboard/applications?archived=true")),
    },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {showArchived ? "Archived" : showClosed ? "Closed" : "Applications"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}
            {totalPages > 1 && (
              <span className="text-muted-foreground/60">
                {" "}· page {safeCurrentPage} of {totalPages}
              </span>
            )}
          </p>
        </div>
        {!showArchived && !showClosed && (
          <div className="flex items-center gap-2">
            <ExportButton />
            <button
              onClick={() => setShowForm(true)}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              + New
            </button>
          </div>
        )}
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col gap-3">
        {/* Tabs — pill style with filled active state */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 w-fit">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={tab.onClick}
                disabled={isPending}
                className={clsx(
                  "relative px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 select-none",
                  isActive
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex h-8 w-full rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => { setStageFilter(e.target.value); applyFilters(undefined, e.target.value); }}
            className="flex h-8 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Stages</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); applyFilters(undefined, undefined, e.target.value); }}
            className="flex h-8 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="createdAt">Newest first</option>
            <option value="updatedAt">Recently updated</option>
            <option value="company">Company A–Z</option>
            <option value="appliedDate">Applied date</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isPending ? (
        <div className="border rounded-xl overflow-hidden">
          <div
            className="hidden sm:grid items-center px-4 py-2.5 bg-muted/40 border-b"
            style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
          >
            {["Company", "Role", "Stage", "Outcome", "Applied", "Actions"].map((h) => (
              <span key={h} className="text-xs font-medium text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="divide-y">
            {Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
              <div
                key={i}
                className="hidden sm:grid items-center px-4 py-3"
                style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
              >
                <div className="space-y-1.5 pr-3">
                  <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                </div>
                <div className="pr-3"><div className="h-4 w-36 rounded bg-muted animate-pulse" /></div>
                <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="flex justify-end gap-1">
                  <div className="h-7 w-12 rounded-md bg-muted animate-pulse" />
                  <div className="h-7 w-10 rounded-md bg-muted animate-pulse" />
                  <div className="h-7 w-14 rounded-md bg-muted animate-pulse" />
                </div>
              </div>
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
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
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl mb-4">
            {showArchived ? "📦" : showClosed ? "🚪" : "📋"}
          </div>
          <p className="font-medium">
            {showArchived
              ? "No archived applications"
              : showClosed
              ? "No closed applications"
              : "No applications yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search || (stageId && stageId !== "ALL")
              ? "No results match your filters. Try adjusting them."
              : showArchived
              ? "Applications you archive will appear here."
              : showClosed
              ? "Applications you close land here with their stage and history intact."
              : "Track your first job application to get started."}
          </p>
          {!search && (!stageId || stageId === "ALL") && !showArchived && !showClosed && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + New Application
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border rounded-xl overflow-hidden">
            {/* Header */}
            <div
              className="hidden sm:grid items-center px-4 py-2.5 bg-muted/40 border-b"
              style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
            >
              <span className="text-xs font-medium text-muted-foreground">Company</span>
              <span className="text-xs font-medium text-muted-foreground">Role</span>
              <span className="text-xs font-medium text-muted-foreground">Stage</span>
              <span className="text-xs font-medium text-muted-foreground">Outcome</span>
              <span className="text-xs font-medium text-muted-foreground">Applied</span>
              <span className="text-xs font-medium text-muted-foreground text-right">Actions</span>
            </div>

            <div className="divide-y">
              {visibleApps.map((app) => (
                <div
                  key={app.id}
                  className="group hidden sm:grid items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                  style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 110px 130px 180px" }}
                >
                  {/* Company */}
                  <div className="min-w-0 pr-3">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2 truncate block"
                    >
                      {app.company}
                    </Link>
                    {app.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {app.tags.map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  <div className="min-w-0 pr-3">
                    <p className="text-sm text-muted-foreground truncate">{app.role}</p>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-muted-foreground hover:underline"
                      >
                        View Description ↗
                      </a>
                    )}
                  </div>

                  {/* Stage */}
                  <div>
                    {(() => {
                      const stage = resolveStage(app);
                      return (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${stage.color}1f`, color: stage.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                          {stage.name}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Outcome */}
                  <div>
                    {(() => {
                      const s = resolveStageStatus(app);
                      if (!s) return <span className="text-xs text-muted-foreground">—</span>;
                      return (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${s.color}1f`, color: s.color }}
                        >
                          {s.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {app.appliedDate
                        ? new Date(app.appliedDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                    {app.closed && app.closedAt && (
                      <p className="text-[10px] mt-0.5 text-muted-foreground">
                        🚪 {new Date(app.closedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="inline-flex h-7 items-center px-2.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors whitespace-nowrap"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setEditingApp(app)}
                      className="inline-flex h-7 items-center px-2.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="inline-flex h-7 items-center px-2.5 rounded-md text-xs font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                    <QuickActions
                      applicationId={app.id}
                      currentStageId={app.stageId}
                      stages={stages}
                      company={app.company}
                      closed={app.closed}
                      archived={app.archived}
                    />
                  </div>
                </div>
              ))}

              {/* Mobile cards */}
              {visibleApps.map((app) => (
                <div
                  key={`m-${app.id}`}
                  className="sm:hidden p-4 space-y-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/applications/${app.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {app.company}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.role}</p>
                      {app.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {app.tags.map(({ tag }) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {(() => {
                        const stage = resolveStage(app);
                        return (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: `${stage.color}1f`, color: stage.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                            {stage.name}
                          </span>
                        );
                      })()}
                      {(() => {
                        const s = resolveStageStatus(app);
                        if (!s) return null;
                        return (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: `${s.color}1f`, color: s.color }}
                          >
                            {s.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="inline-flex h-8 items-center px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setEditingApp(app)}
                      className="inline-flex h-8 items-center px-3 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
                    >
                      Edit
                    </button>
                    <QuickActions
                      applicationId={app.id}
                      currentStageId={app.stageId}
                      stages={stages}
                      company={app.company}
                      closed={app.closed}
                      archived={app.archived}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Left: rows per page + count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <div className="flex items-center gap-1">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={clsx(
                      "h-7 min-w-[2.25rem] px-2 rounded-md text-xs font-medium transition-colors",
                      pageSize === size
                        ? "bg-primary text-primary-foreground"
                        : "border hover:bg-accent text-muted-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span>
                {pageStart + 1}–{pageEnd} of {applications.length}
              </span>
            </div>

            {/* Right: page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="h-7 w-7 inline-flex items-center justify-center text-xs text-muted-foreground select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={clsx(
                        "h-7 min-w-[1.75rem] px-1.5 inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                        p === safeCurrentPage
                          ? "bg-primary text-primary-foreground"
                          : "border hover:bg-accent text-muted-foreground"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md border text-xs hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showForm && (
        <ApplicationForm availableTags={availableTags} stages={stages} onClose={() => setShowForm(false)} />
      )}
      {editingApp && (
        <ApplicationForm
          key={editingApp.id}
          application={editingApp}
          availableTags={availableTags}
          stages={stages}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  );
}
