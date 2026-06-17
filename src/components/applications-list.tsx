"use client";

import { useState } from "react";
import { StatusBadge } from "./status-badge";
import { ApplicationForm } from "./application-form";
import { deleteApplication } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  status: string;
  appliedDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicationsListProps {
  applications: Application[];
  search: string;
  status: string;
  sort: string;
}

export function ApplicationsList({
  applications,
  search,
  status,
  sort,
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
    router.push(`/dashboard/applications?${params.toString()}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    await deleteApplication(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
        >
          + New Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search company or role..."
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
        </select>
      </div>

      {/* List */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || (status && status !== "ALL")
              ? "Try changing your filters"
              : "Add your first job application to get started"}
          </p>
          {!search && (!status || status === "ALL") && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
            >
              + New Application
            </button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium">{app.company}</div>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          View posting ↗
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {app.role}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                      {app.appliedDate
                        ? new Date(app.appliedDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingApp(app)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-xs text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
      {editingApp && (
        <ApplicationForm
          application={editingApp}
          onClose={() => setEditingApp(null)}
        />
      )}
    </div>
  );
}
