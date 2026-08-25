"use client";

import { useState } from "react";
import { createInterview, updateInterview, deleteInterview } from "@/lib/actions/interviews";
import { createStageType } from "@/lib/actions/pipeline";
import { INTERVIEW_OUTCOMES } from "@/lib/validations";
import { outcomeDisplay } from "@/lib/outcome-display";
import { resolveStageLabel } from "@/lib/stage-label";
import { DatePicker } from "./date-picker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export interface StageTypeOption {
  id: string;
  name: string;
  enabled: boolean;
}

interface Interview {
  id: string;
  stageTypeId: string | null;
  stageType: StageTypeOption | null;
  customType: string | null;
  type: string | null;
  round: number;
  scheduledAt: Date | null;
  notes: string | null;
  outcome: string | null;
}

const NEW_TYPE = "__new__";

interface InterviewFormProps {
  applicationId: string;
  stageTypes: StageTypeOption[];
  interview?: Interview;
  onClose: () => void;
}

function InterviewForm({ applicationId, stageTypes, interview, onClose }: InterviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  // A disabled type stays selectable while it is the one this stage already
  // uses — editing the notes on an old round should not silently retype it.
  const options = stageTypes.filter((t) => t.enabled || t.id === interview?.stageTypeId);

  const [selectedType, setSelectedType] = useState(
    interview?.stageTypeId ?? options[0]?.id ?? NEW_TYPE,
  );
  const [newTypeName, setNewTypeName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    // Creating a type inline: make it first, then point the stage at it.
    if (selectedType === NEW_TYPE) {
      const typeForm = new FormData();
      typeForm.set("name", newTypeName);
      const created = await createStageType(typeForm);

      if ("error" in created) {
        setErrors(created.error as Record<string, string[]>);
        setLoading(false);
        return;
      }
      formData.set("stageTypeId", created.id);
    }

    const result = interview
      ? await updateInterview(interview.id, applicationId, formData)
      : await createInterview(applicationId, formData);

    if (result.error && typeof result.error === "object") {
      setErrors(result.error as Record<string, string[]>);
    } else if (typeof result.error === "string") {
      setFormError(result.error);
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
                name="stageTypeId"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {options.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.enabled ? "" : " (disabled)"}
                  </option>
                ))}
                <option value={NEW_TYPE}>+ New type…</option>
              </select>
              {selectedType === NEW_TYPE && (
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Name your stage type…"
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
                {INTERVIEW_OUTCOMES.map((o) => (
                  <option key={o} value={o}>{outcomeDisplay(o).label}</option>
                ))}
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

          {formError && <p className="text-xs text-destructive">{formError}</p>}
          {Object.keys(errors).length > 0 && (
            <p className="text-xs text-destructive">
              {Object.values(errors).flat()[0] ?? "Please fill in required fields correctly."}
            </p>
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
  stageTypes,
}: {
  applicationId: string;
  interviews: Interview[];
  stageTypes: StageTypeOption[];
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
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/pipeline"
            className="h-8 px-3 inline-flex items-center rounded-md border text-xs font-medium hover:bg-accent transition-colors"
          >
            Manage pipeline
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-colors"
          >
            + Add Round
          </button>
        </div>
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
          {interviews.map((interview) => {
            const outcome = outcomeDisplay(interview.outcome);
            return (
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
                      <p className="text-sm font-medium">{resolveStageLabel(interview)}</p>
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
                        outcome.className
                      )}
                    >
                      {outcome.label}
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
            );
          })}
        </div>
      )}

      {showForm && (
        <InterviewForm
          applicationId={applicationId}
          stageTypes={stageTypes}
          onClose={() => setShowForm(false)}
        />
      )}
      {editingInterview && (
        <InterviewForm
          applicationId={applicationId}
          stageTypes={stageTypes}
          interview={editingInterview}
          onClose={() => setEditingInterview(null)}
        />
      )}
    </div>
  );
}
