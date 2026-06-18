"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { ApplicationForm } from "./application-form";
import { deleteApplication } from "@/lib/actions/applications";
import { ExportButton } from "./export-button";
import { QuickActions } from "./quick-actions";
import { useRouter } from "next/navigation";
import clsx from "clsx";

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
  status: string;
  appliedDate: Date | null;
  followUpDate: Date | null;
  notes: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: { tag: Tag }[];
}

interface ApplicationsListProps {
  applications: Application[];
  availableTags: Tag[];
  search: string;
  status: string;
  sort: string;
  showArchived?: boolean;
}

export function ApplicationsList({
  applications,
  availableTags,
  search,
  status,
  sort,
  showArchived,
}: ApplicationsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const [statusFilter, setStatusFilter] = useState(status);
  const [sortBy, setSortBy] = useState(sort);
  const router = useRouter();

  function applyFilters(newSearch?: string, newStatus?: string, newSort?: string) {
    const s = newSearch ?? searchInput;
    const st = newStatus ?? statusFilter;
    const so = newSort ?? sortBy;
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (st && st !== "ALL") params.set("status", st);
    if (so) params.set("sort", so);
    if (showArchived) params.set("archived", "true");
    router.push(`/dashboard/applications?${params.toString()}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    await deleteApplication(id);
    router.refresh();
  }

  const isOverdue = (date: Date | null) =>
    date ? new Date(date) < new Date() : false;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {showArchived ? "Archived" : "Applications"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </p>
        </div>
        {!showArchived && (
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

      {/* Tabs + Filters row */}
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex gap-0 border-b">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (searchInput) params.set("search", searchInput);
              if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
              if (sortBy) params.set("sort", sortBy);
              router.push(`/dashboard/applications?${params.toString()}`);
            }}
            className={clsx(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              !showArchived
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Active
          </button>
          <button
            onClick={() => router.push("/dashboard/applications?archived=true")}
            className={clsx(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              showArchived
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Archived
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
              onBlur={() => applyFilters()}
              className="flex h-8 w-full rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); applyFilters(undefined, e.target.value); }}
            className="flex h-8 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Statuses</option>
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
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
            <option value="followUpDate">Follow-up date</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl mb-4">
            {showArchived ? "📦" : "📋"}
          </div>
          <p className="font-medium">
            {showArchived ? "No archived applications" : "No applications yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search || (status && status !== "ALL")
              ? "No results match your filters. Try adjusting them."
              : showArchived
              ? "Applications you archive will appear here."
              : "Track your first job application to get started."}
          </p>
          {!search && (!status || status === "ALL") && !showArchived && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + New Application
            </button>
          )}
        </div>
      ) : (
        /* Table */
        <div className="border rounded-xl overflow-hidden">
          {/* Table header — matches row columns exactly */}
          <div className="hidden sm:grid items-center px-4 py-2.5 bg-muted/40 border-b"
            style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 130px 180px" }}
          >
            <span className="text-xs font-medium text-muted-foreground">Company</span>
            <span className="text-xs font-medium text-muted-foreground">Role</span>
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <span className="text-xs font-medium text-muted-foreground">Applied</span>
            <span className="text-xs font-medium text-muted-foreground text-right">Actions</span>
          </div>

          <div className="divide-y">
            {applications.map((app) => (
              <div
                key={app.id}
                className="group hidden sm:grid items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,2fr) 120px 130px 180px" }}
              >
                {/* Company */}
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2 truncate"
                    >
                      {app.company}
                    </Link>
                    {app.followUpDate && isOverdue(app.followUpDate) && (
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-0.5 text-[10px] font-medium shrink-0">
                        Overdue
                      </span>
                    )}
                  </div>
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
                      View posting ↗
                    </a>
                  )}
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={app.status} />
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {app.appliedDate
                      ? new Date(app.appliedDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </p>
                  {app.followUpDate && (
                    <p className={clsx("text-[10px] mt-0.5", isOverdue(app.followUpDate) ? "text-destructive" : "text-muted-foreground")}>
                      ↻ {new Date(app.followUpDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>

                {/* Actions — always visible, vertically centered */}
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
                  {!showArchived && (
                    <QuickActions
                      applicationId={app.id}
                      currentStatus={app.status}
                      company={app.company}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Mobile cards */}
            {applications.map((app) => (
              <div
                key={`m-${app.id}`}
                className="sm:hidden p-4 space-y-2 hover:bg-muted/30 transition-colors"
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
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="h-7 px-2.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => setEditingApp(app)}
                    className="h-7 px-2.5 rounded-md text-xs font-medium border hover:bg-accent transition-colors"
                  >
                    Edit
                  </button>
                  {!showArchived && (
                    <QuickActions
                      applicationId={app.id}
                      currentStatus={app.status}
                      company={app.company}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ApplicationForm availableTags={availableTags} onClose={() => setShowForm(false)} />
      )}
      {editingApp && (
        <ApplicationForm
          application={editingApp}
          availableTags={availableTags}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  );
}
