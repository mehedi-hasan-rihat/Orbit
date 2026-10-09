"use client";

import { useState, useRef } from "react";
import { createApplication, updateApplication, checkDuplicate, moveToRejectedStage } from "@/lib/actions/applications";
import { DatePicker } from "./date-picker";
import { SCHEDULING_STAGE_NAMES, OUTCOME_STAGE_NAMES, INTERVIEW_OUTCOMES, type InterviewOutcome } from "@/lib/validations";
import { outcomeDisplay } from "@/lib/outcome-display";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface ApplicationFormProps {
  application?: {
    id: string;
    company: string;
    role: string;
    jobUrl: string | null;
    stageId: string | null;
    appliedDate: Date | null;
    stageOutcome: string | null;
    stageDueAt: Date | null;
    tags?: { tag: Tag }[];
  };
  availableTags: Tag[];
  stages: { id: string; name: string; color: string; category: string }[];
  onClose: () => void;
}

// ASSIGNED is only relevant for Assessment (you get assigned a task/test).
// SCHEDULED is only relevant for Screening and Interview (a booking with a time).
// Assessment uses a deadline instead — date+time always required.
function statusOptionsForStage(stageName: string | undefined): InterviewOutcome[] {
  if (stageName === "Assessment") return INTERVIEW_OUTCOMES.filter((o) => o !== "SCHEDULED");
  return INTERVIEW_OUTCOMES.filter((o) => o !== "ASSIGNED");
}

// Label for the date field changes with the outcome and stage.
function dateFieldLabel(outcome: string | null | undefined, stageName: string | undefined): string {
  if (stageName === "Assessment") return "Assessment Deadline";
  switch (outcome) {
    case "COMPLETED": return `${stageName ?? "Stage"} Completion Date`;
    case "PASSED":    return `${stageName ?? "Stage"} Date (Passed)`;
    case "FAILED":    return `${stageName ?? "Stage"} Date (Failed)`;
    case "CANCELLED": return `${stageName ?? "Stage"} Cancellation Date`;
    default:          return "Scheduled Date";
  }
}

function dateFieldHint(outcome: string | null | undefined, stageName: string | undefined): string | null {
  if (stageName === "Assessment") return null; // deadline, not a calendar appointment
  if (!outcome || outcome === "SCHEDULED") return "You'll get a reminder email 2 days and 1 day before.";
  return null;
}

export function ApplicationForm({ application, availableTags, stages, onClose }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [duplicate, setDuplicate] = useState<{
    id: string;
    company: string;
    role: string;
    stage: { name: string; color: string } | null;
  } | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    application?.tags?.map((t) => t.tag.id) || []
  );
  const [selectedStageId, setSelectedStageId] = useState(
    application?.stageId ?? stages[0]?.id ?? ""
  );
  const [selectedOutcome, setSelectedOutcome] = useState<string>(
    application?.stageOutcome ?? ""
  );
  const [suggestRejected, setSuggestRejected] = useState(false);
  const [markRejected, setMarkRejected] = useState(false);
  const duplicateCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedStage = stages.find((s) => s.id === selectedStageId);
  const isWishlist = selectedStage?.name === "Wishlist";
  const showStatus = selectedStage ? SCHEDULING_STAGE_NAMES.includes(selectedStage.name) : false;
  const showOutcomeDate = selectedStage ? OUTCOME_STAGE_NAMES.includes(selectedStage.name) : false;

  // Debounced duplicate check
  function handleFieldChange(company: string, role: string) {
    if (application) return; // skip on edit
    if (!company.trim() || !role.trim()) {
      setDuplicate(null);
      return;
    }
    if (duplicateCheckTimer.current) clearTimeout(duplicateCheckTimer.current);
    duplicateCheckTimer.current = setTimeout(async () => {
      const result = await checkDuplicate(company.trim(), role.trim());
      setDuplicate(result as typeof duplicate);
    }, 500);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("tags", selectedTags.join(","));
    // Clear stageOutcome and stageDueAt when the selected stage doesn't support them.
    if (!showStatus) {
      formData.set("stageOutcome", "");
    }
    if (!showStatus && !showOutcomeDate) {
      formData.set("stageDueAt", "");
    }

    try {
      let result;
      if (application) {
        result = await updateApplication(application.id, formData);
      } else {
        result = await createApplication(formData);
      }

      if (result.error) {
        setErrors(result.error as Record<string, string[]>);
      } else {
        if (markRejected && application) {
          await moveToRejectedStage(application.id);
        }
        onClose();
      }
    } catch {
      setErrors({ _form: ["Something went wrong"] });
    } finally {
      setLoading(false);
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {application ? "Update Application" : "New Application"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Duplicate warning */}
        {duplicate && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">Possible duplicate</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              You already have an application for <strong>{duplicate.company}</strong> — <strong>{duplicate.role}</strong> at stage <strong>{duplicate.stage?.name ?? "Unassigned"}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setDuplicate(null)}
              className="text-xs text-amber-600 dark:text-amber-400 underline mt-1"
            >
              Continue anyway
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors._form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {(errors._form as string[]).join(", ")}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">Company *</label>
              <input
                id="company"
                name="company"
                type="text"
                defaultValue={application?.company || ""}
                required
                onChange={(e) => {
                  const role = (document.getElementById("role") as HTMLInputElement)?.value || "";
                  handleFieldChange(e.target.value, role);
                }}
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.company && <p className="text-xs text-destructive">{errors.company[0]}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">Role *</label>
              <input
                id="role"
                name="role"
                type="text"
                defaultValue={application?.role || ""}
                required
                onChange={(e) => {
                  const company = (document.getElementById("company") as HTMLInputElement)?.value || "";
                  handleFieldChange(company, e.target.value);
                }}
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.role && <p className="text-xs text-destructive">{errors.role[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="jobUrl" className="text-sm font-medium">Job Description URL</label>
            <input
              id="jobUrl"
              name="jobUrl"
              type="url"
              defaultValue={application?.jobUrl || ""}
              placeholder="https://..."
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.jobUrl && <p className="text-xs text-destructive">{errors.jobUrl[0]}</p>}
          </div>

          {/* Stage + Applied Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="stageId" className="text-sm font-medium">Stage *</label>
              <select
                id="stageId"
                name="stageId"
                value={selectedStageId}
                onChange={(e) => {
                  const newStageId = e.target.value;
                  const newStage = stages.find((s) => s.id === newStageId);
                  setSelectedStageId(newStageId);
                  // ASSIGNED is only valid for Assessment — clear it if switching away
                  if (selectedOutcome === "ASSIGNED" && newStage?.name !== "Assessment") {
                    setSelectedOutcome("");
                  }
                }}
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              {errors.stageId && <p className="text-xs text-destructive">{errors.stageId[0]}</p>}
            </div>

            {/* Applied Date: hidden for Wishlist, required for everything else */}
            {!isWishlist && (
              <div className="space-y-2">
                <label htmlFor="appliedDate" className="text-sm font-medium">
                  Applied Date {!isWishlist && <span className="text-destructive">*</span>}
                </label>
                <DatePicker
                  id="appliedDate"
                  name="appliedDate"
                  placeholder="Pick applied date"
                  required
                  value={application?.appliedDate ? new Date(application.appliedDate).toISOString().split("T")[0] : ""}
                />
                {errors.appliedDate && <p className="text-xs text-destructive">{errors.appliedDate[0]}</p>}
              </div>
            )}
          </div>

          {/* Status + schedule: only for Screening / Assessment / Interview */}
          {showStatus && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="stageOutcome" className="text-sm font-medium">
                  {selectedStage?.name} Status *
                </label>
                <select
                  id="stageOutcome"
                  name="stageOutcome"
                  value={selectedOutcome}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedOutcome(val);
                    if (application && (val === "FAILED")) {
                      setSuggestRejected(true);
                    } else {
                      setSuggestRejected(false);
                      setMarkRejected(false);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select status…</option>
                  {statusOptionsForStage(selectedStage?.name).map((o) => (
                    <option key={o} value={o}>
                      {outcomeDisplay(o)?.label}
                    </option>
                  ))}
                </select>
                {errors.stageOutcome && <p className="text-xs text-destructive">{errors.stageOutcome[0]}</p>}
              </div>

              {/* Close suggestion — appears when outcome is Failed or Cancelled on an existing application */}
              {suggestRejected && (
                <label className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-3 py-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={markRejected}
                    onChange={(e) => setMarkRejected(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                  />
                  <span className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    <span className="font-medium">Also move this application to Rejected.</span>{" "}
                    Since the stage {selectedOutcome === "FAILED" ? "failed" : "was cancelled"}, the application is likely over.
                  </span>
                </label>
              )}

              {/* Assigned Date field removed — stageDueAt serves as the deadline */}

              <div className="space-y-2">
                <label htmlFor="stageDueAt" className="text-sm font-medium">
                  {dateFieldLabel(selectedOutcome, selectedStage?.name)}{" "}
                  {selectedStage?.name === "Assessment" ? (
                    <span className="text-destructive">*</span>
                  ) : (selectedOutcome === "SCHEDULED") ? (
                    <><span className="text-destructive">*</span>{" "}
                    <span className="text-muted-foreground font-normal">(time optional)</span></>
                  ) : (
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  )}
                </label>
                <DatePicker
                  id="stageDueAt"
                  name="stageDueAt"
                  includeTime
                  placeholder={selectedStage?.name === "Assessment" ? "Pick deadline (date and time)" : "Pick date (and time)"}
                  required={selectedStage?.name === "Assessment" || selectedOutcome === "SCHEDULED"}
                  value={
                    application?.stageDueAt
                      ? new Date(application.stageDueAt).toISOString().slice(0, 16)
                      : ""
                  }
                />
                {dateFieldHint(selectedOutcome, selectedStage?.name) && (
                  <p className="text-xs text-muted-foreground">{dateFieldHint(selectedOutcome, selectedStage?.name)}</p>
                )}
                {errors.stageDueAt && <p className="text-xs text-destructive">{errors.stageDueAt[0]}</p>}
              </div>
            </div>
          )}

          {/* Outcome date: required for Get Offer / Hired / Rejected */}
          {showOutcomeDate && (
            <div className="space-y-2">
              <label htmlFor="stageDueAt" className="text-sm font-medium">
                {selectedStage?.name} Date *
              </label>
              <DatePicker
                id="stageDueAt"
                name="stageDueAt"
                placeholder="Pick date"
                required
                value={
                  application?.stageDueAt
                    ? new Date(application.stageDueAt).toISOString().slice(0, 10)
                    : ""
                }
              />
              {errors.stageDueAt && <p className="text-xs text-destructive">{errors.stageDueAt[0]}</p>}
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-2 transition-all ${
                        isSelected
                          ? "text-white shadow-sm"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: tag.color, borderColor: tag.color }
                          : { borderColor: tag.color }
                      }
                    >
                      {/* Color dot when unselected, checkmark icon when selected */}
                      {isSelected ? (
                        <svg
                          className="w-3 h-3 shrink-0"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : application ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
