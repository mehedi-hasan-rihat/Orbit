"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { ApplicationForm } from "./application-form";
import { deleteApplication, archiveApplication, updateApplicationStatus } from "@/lib/actions/applications";
import { ExportButton } from "./export-button";
import { useRouter } from "next/navigation";

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
    if (!confirm("Are you sure you want to delete this application?")) return;
    await deleteApplication(id);
    router.refresh();
  }

  async function handleArchive(id: string) {
    await archiveApplication(id);
    router.refresh();
  }

  async function handleQuickStatus(id: string, newStatus: string) {
    await updateApplicationStatus(id, newStatus);
    router.refresh();
  }

  const isOverdue = (date: Date | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (searchInput) params.set("search", searchInput);
            if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
            if (sortBy) params.set("sort", sortBy);
            router.push(`/dashboard/applications?${params.toString()}`);
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            !showArchived
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => router.push("/dashboard/applications?archived=true")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            showArchived
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Archived
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {showArchived ? "Archived" : "Applications"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!showArchived && (
          <div className="flex gap-2">
            <ExportButton />
            <button
              onClick={() => setShowForm(true)}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
            >
              + New Application
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search company, role..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters();
          }}
          onBlur={() => applyFilters()}
          className="flex h-9 w-full sm:w-64 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            applyFilters(undefined, e.target.value);
          }}
          className="flex h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
          onChange={(e) => {
            setSortBy(e.target.value);
            applyFilters(undefined, undefined, e.target.value);
          }}
          className="flex h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="createdAt">Newest</option>
          <option value="updatedAt">Recently Updated</option>
          <option value="company">Company A-Z</option>
          <option value="appliedDate">Applied Date</option>
          <option value="followUpDate">Follow-up Date</option>
        </select>
      </div>

      {/* List */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">
            {showArchived ? "No archived applications" : "No applications yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || (status && status !== "ALL")
              ? "Try changing your filters"
              : showArchived
              ? "Archived applications will appear here"
              : "Add your first job application to get started"}
          </p>
          {!search && (!status || status === "ALL") && !showArchived && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
            >
              + New Application
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {app.company}
                    </Link>
                    <StatusBadge status={app.status} />
                    {app.followUpDate && isOverdue(app.followUpDate) && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{app.role}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {app.appliedDate && (
                      <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                    )}
                    {app.followUpDate && (
                      <span className={isOverdue(app.followUpDate) ? "text-destructive" : ""}>
                        Follow-up {new Date(app.followUpDate).toLocaleDateString()}
                      </span>
                    )}
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        View posting ↗
                      </a>
                    )}
                  </div>
                  {app.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {app.tags.map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!showArchived && app.status !== "INTERVIEW" && app.status !== "OFFER" && (
                    <button
                      onClick={() => handleQuickStatus(app.id, "INTERVIEW")}
                      title="Mark as Interview"
                      className="h-7 px-2 rounded text-xs border hover:bg-accent transition-colors"
                    >
                      → Interview
                    </button>
                  )}
                  {!showArchived && app.status === "INTERVIEW" && (
                    <button
                      onClick={() => handleQuickStatus(app.id, "OFFER")}
                      title="Mark as Offer"
                      className="h-7 px-2 rounded text-xs border hover:bg-accent transition-colors"
                    >
                      → Offer
                    </button>
                  )}
                  <button
                    onClick={() => setEditingApp(app)}
                    className="h-7 px-2 rounded text-xs border hover:bg-accent transition-colors"
                  >
                    Edit
                  </button>
                  {!showArchived && (
                    <button
                      onClick={() => handleArchive(app.id)}
                      className="h-7 px-2 rounded text-xs border hover:bg-accent transition-colors"
                      title="Archive"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="h-7 px-2 rounded text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
