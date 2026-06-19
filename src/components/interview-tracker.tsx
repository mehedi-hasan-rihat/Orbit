"use client";

import { useState } from "react";
import { createInterview, updateInterview, deleteInterview } from "@/lib/actions/interviews";
import { DatePicker } from "./date-picker";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface Interview {
  id: string;
  type: string;
  customType: string | null;
  round: number;
  scheduledAt: Date | null;
  notes: string | null;
  outcome: string | null;
}

const typeLabels: Record<string, string> = {
  PHONE_SCREEN: "Phone Screen",
  ONSITE: "Onsite",
  PANEL: "Panel",
  ASSESSMENT: "Assessment",
  TASK: "Task/Assignment",
  FINAL: "Final Round",
  OTHER: "Other",
};

const outcomeConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  PASSED: { label: "Passed ✓", className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

interface InterviewFormProps {
  applicationId: string;
  interview?: Interview;
  onClose: () => void;
}

function InterviewForm({ applicationId, interview, onClose }: InterviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [selectedType, setSelectedType] = useState(interview?.type || "PHONE_SCREEN");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = interview
      ? await updateInterview(interview.id, applicationId, formData)
      : await createInterview(applicationId, formData);

    if (result.error && typeof result.error === "object") {
      setErrors(result.error as Record<string, string[]>);
    } else if (result.success) {
      router.refresh();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">
            {interview ? "Edit Interview" : "Add Interview Round"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type *</label>
              <select
                name="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {selectedType === "OTHER" && (
                <input
                  name="customType"
                  type="text"
                  defaultValue={interview?.customType || ""}
                  placeholder="Enter interview type..."
                  required
                  className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Round *</label>
              <input
                name="round"
                type="number"
                min={1}
                max={20}
                defaultValue={interview?.round || 1}
                required
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date & Time</label>
              <DatePicker
                name="scheduledAt"
                placeholder="Pick date & time"
                includeTime
                value={
                  interview?.scheduledAt
                    ? new Date(interview.scheduledAt).toISOString().slice(0, 16)
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <select
                name="outcome"
                defaultValue={interview?.outcome || "PENDING"}
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="PENDING">Pending</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={interview?.notes || ""}
              placeholder="Topics covered, questions asked, feedback received..."
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {Object.keys(errors).length > 0 && (
            <p className="text-xs text-destructive">Please fill in required fields correctly.</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : interview ? "Update" : "Add Round"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InterviewTracker({
  applicationId,
  interviews,
}: {
  applicationId: string;
  interviews: Interview[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this interview round?")) return;
    await deleteInterview(id, applicationId);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Interview Rounds</h2>
        <button
          onClick={() => setShowForm(true)}
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-colors"
        >
          + Add Round
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-sm font-medium">No interview rounds yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Track each round as you progress through the interview process
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
          >
            + Add First Round
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold">
                    {interview.round}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {interview.type === "OTHER" && interview.customType
                        ? interview.customType
                        : typeLabels[interview.type]}
                    </p>
                    {interview.scheduledAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(interview.scheduledAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      outcomeConfig[interview.outcome || "PENDING"]?.className
                    )}
                  >
                    {outcomeConfig[interview.outcome || "PENDING"]?.label}
                  </span>
                  <button
                    onClick={() => setEditingInterview(interview)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(interview.id)}
                    className="text-xs text-destructive hover:text-destructive/80"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {interview.notes && (
                <p className="text-xs text-muted-foreground border-t pt-3 whitespace-pre-wrap">
                  {interview.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <InterviewForm
          applicationId={applicationId}
          onClose={() => setShowForm(false)}
        />
      )}
      {editingInterview && (
        <InterviewForm
          applicationId={applicationId}
          interview={editingInterview}
          onClose={() => setEditingInterview(null)}
        />
      )}
    </div>
  );
}
