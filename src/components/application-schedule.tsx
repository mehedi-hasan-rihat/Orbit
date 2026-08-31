"use client";

import { useState } from "react";
import { createInterview, updateInterview, deleteInterview } from "@/lib/actions/interviews";
import { addQuickNote } from "@/lib/actions/applications";
import {
  createFollowUp,
  updateFollowUp,
  setFollowUpDone,
  deleteFollowUp,
} from "@/lib/actions/follow-ups";
import { INTERVIEW_OUTCOMES, ROUND_CATEGORIES, MAX_ACTIVE_FOLLOW_UPS, SCHEDULING_STAGE_NAMES } from "@/lib/validations";
import { outcomeDisplay } from "@/lib/outcome-display";
import { resolveStageLabel } from "@/lib/stage-label";
import { roundBucket } from "@/lib/interview-summary";
import { relativeDay } from "@/lib/relative-time";
import { DatePicker } from "./date-picker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export interface StageTypeOption {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
}

export interface ScheduleEntry {
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

const MAX_ROUND = 20;

// ─── Entry form ──────────────────────────────────────────────────────────────

interface EntryFormProps {
  applicationId: string;
  stageTypes: StageTypeOption[];
  entry?: ScheduleEntry;
  /** Position for a new entry, derived rather than asked for. */
  nextRound: number;
  onClose: () => void;
}

function EntryForm({ applicationId, stageTypes, entry, nextRound, onClose }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  // Only the three scheduling stage types: Screening, Assessment, Interview.
  // Get Offer and Hired are outcomes, not things you sit in. A stage that is
  // already attached to this entry stays selectable so editing notes doesn't
  // silently retype it.
  const options = stageTypes.filter(
    (t) =>
      SCHEDULING_STAGE_NAMES.includes(t.name) ||
      t.id === entry?.stageTypeId,
  );

  const [selectedType, setSelectedType] = useState(
    entry?.stageTypeId ?? options[0]?.id ?? "",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    // The date is the handle now, so the position in the sequence is derived
    // instead of typed. It still has to satisfy the 1–20 the schema enforces.
    formData.set("round", String(entry?.round ?? Math.min(nextRound, MAX_ROUND)));

    const result = entry
      ? await updateInterview(entry.id, applicationId, formData)
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
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">{entry ? "Edit entry" : "Add entry"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* The date leads — it is what the list is keyed and ordered on. */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date &amp; time</label>
            <DatePicker
              name="scheduledAt"
              placeholder="Pick date & time"
              includeTime
              value={
                entry?.scheduledAt
                  ? new Date(entry.scheduledAt).toISOString().slice(0, 16)
                  : ""
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Reminder emails go out two days before and again the day before.
              Leave the date empty for something you know is coming but haven&apos;t booked yet.
            </p>
          </div>

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
              </select>
              <p className="text-[11px] text-muted-foreground">
                Need a different type?{" "}
                <Link href="/dashboard/pipeline" className="underline hover:text-foreground">
                  Manage pipeline
                </Link>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <select
                name="outcome"
                defaultValue={entry?.outcome || "PENDING"}
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
              defaultValue={entry?.notes || ""}
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
              {loading ? "Saving..." : entry ? "Update" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Follow-ups ──────────────────────────────────────────────────────────────

export interface FollowUpItem {
  id: string;
  title: string;
  details: string | null;
  dueAt: Date;
  done: boolean;
}

function FollowUpForm({
  applicationId,
  followUp,
  onClose,
}: {
  applicationId: string;
  followUp?: FollowUpItem;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const result = followUp
      ? await updateFollowUp(followUp.id, applicationId, formData)
      : await createFollowUp(applicationId, formData);

    if (typeof result.error === "string") {
      setFormError(result.error);
    } else if (result.error) {
      setErrors(result.error as Record<string, string[]>);
    } else if (result.success) {
      router.refresh();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">{followUp ? "Edit follow-up" : "New follow-up"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <input
              name="title"
              type="text"
              defaultValue={followUp?.title ?? ""}
              placeholder="Chase the recruiter about the offer letter"
              required
              maxLength={120}
              className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due *</label>
            <DatePicker
              name="dueAt"
              placeholder="Pick a date"
              required
              value={followUp ? new Date(followUp.dueAt).toISOString().slice(0, 10) : ""}
            />
            <p className="text-[11px] text-muted-foreground">
              A reminder email goes out on this date, with the title and details above.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Details</label>
            <textarea
              name="details"
              rows={3}
              defaultValue={followUp?.details ?? ""}
              placeholder="What exactly you need to ask, who to contact..."
              maxLength={2000}
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
              {loading ? "Saving..." : followUp ? "Update" : "Add follow-up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FollowUpPanel({
  applicationId,
  followUps,
  now,
}: {
  applicationId: string;
  followUps: FollowUpItem[];
  now: number;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<FollowUpItem | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const router = useRouter();

  const open = followUps.filter((f) => !f.done);
  const done = followUps.filter((f) => f.done);
  const atLimit = open.length >= MAX_ACTIVE_FOLLOW_UPS;

  async function run(id: string, action: () => Promise<{ error?: unknown }>) {
    setPending(id);
    setLimitError(null);
    const result = await action();
    if (typeof result?.error === "string") setLimitError(result.error);
    setPending(null);
    router.refresh();
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Follow-ups</p>
          <p className="text-[11px] text-muted-foreground">
            {open.length} of {MAX_ACTIVE_FOLLOW_UPS} open · emailed to you on the day each one is due
          </p>
        </div>
        <button
          onClick={() => { setLimitError(null); setCreating(true); }}
          disabled={atLimit}
          title={atLimit ? `Complete one first — ${MAX_ACTIVE_FOLLOW_UPS} open at a time.` : undefined}
          className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add follow-up
        </button>
      </div>

      {limitError && <p className="text-xs text-destructive">{limitError}</p>}

      {atLimit && !limitError && (
        <p className="text-[11px] text-muted-foreground">
          That&apos;s the limit. Mark one done to free a slot — finished follow-ups
          stay on the record and stop being chased.
        </p>
      )}

      {open.length === 0 && done.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Nothing scheduled</p>
      ) : (
        <div className="space-y-2">
          {[...open, ...done].map((followUp) => {
            const overdue = !followUp.done && new Date(followUp.dueAt).getTime() < now;
            return (
              <div
                key={followUp.id}
                className={clsx(
                  "rounded-md border bg-background p-3 space-y-1.5",
                  overdue && "border-destructive/40",
                  followUp.done && "opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className={clsx("text-sm font-medium", followUp.done && "line-through")}>
                      {followUp.title}
                    </p>
                    <p className={clsx("text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
                      {new Date(followUp.dueAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="mx-1.5">·</span>
                      {relativeDay(followUp.dueAt, now)}
                      {overdue && " · overdue"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        run(followUp.id, () =>
                          setFollowUpDone(followUp.id, applicationId, !followUp.done),
                        )
                      }
                      disabled={pending === followUp.id}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {followUp.done ? "Reopen" : "Done"}
                    </button>
                    {!followUp.done && (
                      <button
                        onClick={() => setEditing(followUp)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => run(followUp.id, () => deleteFollowUp(followUp.id, applicationId))}
                      disabled={pending === followUp.id}
                      className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {followUp.details && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {followUp.details}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <FollowUpForm applicationId={applicationId} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <FollowUpForm
          applicationId={applicationId}
          followUp={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function ApplicationSchedule({
  applicationId,
  followUps,
  notes,
  entries,
  stageTypes,
  now,
}: {
  applicationId: string;
  followUps: FollowUpItem[];
  notes: string | null;
  entries: ScheduleEntry[];
  stageTypes: StageTypeOption[];
  // Passed down rather than read here: this component hydrates, and a Date.now()
  // on the client would not match the timestamp the server rendered with.
  now: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [addingNote, setAddingNote] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const router = useRouter();

  // Dated entries first, soonest to latest; undated ones trail behind because
  // there is nothing to sort them by.
  const sorted = [...entries].sort((a, b) => {
    if (!a.scheduledAt && !b.scheduledAt) return a.round - b.round;
    if (!a.scheduledAt) return 1;
    if (!b.scheduledAt) return -1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  const nextUp = sorted.find(
    (e) =>
      roundBucket(e.outcome) === "open" &&
      e.scheduledAt !== null &&
      new Date(e.scheduledAt).getTime() >= now,
  );

  const nextRound = entries.reduce((max, e) => Math.max(max, e.round), 0) + 1;

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await deleteInterview(id, applicationId);
    router.refresh();
  }

  async function handleSaveNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    await addQuickNote(applicationId, note.trim());
    setNote("");
    setAddingNote(false);
    setSavingNote(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold tracking-tight">Schedule &amp; Notes</h2>
          <p className="text-xs text-muted-foreground max-w-prose">
            Everything with a date on it, soonest first, plus what you wrote down.
            Interviews email you two days and one day ahead; follow-ups email you
            on the day. Marking an entry passed moves the application into your
            first interviewing stage if it hasn&apos;t got there yet.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            + Add entry
          </button>
        </div>
      </div>

      <FollowUpPanel applicationId={applicationId} followUps={followUps} now={now} />

      {sorted.length === 0 ? (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <p className="text-sm font-medium">Nothing scheduled yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
          >
            + Add first entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => {
            const outcome = outcomeDisplay(entry.outcome);
            const bucket = roundBucket(entry.outcome);
            const isNext = nextUp?.id === entry.id;
            const date = entry.scheduledAt ? new Date(entry.scheduledAt) : null;

            return (
              <div
                key={entry.id}
                className={clsx(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  isNext ? "border-primary/50 bg-primary/[0.03]" : "bg-background",
                  bucket === "other" && "opacity-70",
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* The date is the handle, so it leads the row where a
                        round number used to. */}
                    <div
                      className={clsx(
                        "flex flex-col items-center justify-center w-11 h-11 rounded-lg shrink-0 leading-none",
                        isNext ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {date ? (
                        <>
                          <span className="text-[10px] uppercase tracking-wide opacity-70">
                            {date.toLocaleDateString([], { month: "short" })}
                          </span>
                          <span className="text-sm font-bold">
                            {date.toLocaleDateString([], { day: "numeric" })}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg opacity-50">—</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
                        {resolveStageLabel(entry)}
                        {isNext && (
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-primary">
                            Next up
                          </span>
                        )}
                      </p>
                      {date ? (
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleString([], {
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span className="mx-1.5">·</span>
                          {relativeDay(date, now)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No date set</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        outcome.className
                      )}
                    >
                      {outcome.label}
                    </span>
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-destructive hover:text-destructive/80"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {entry.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-3 whitespace-pre-wrap">
                    {entry.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes — the old standalone card, folded in below the dated entries. */}
      <div className="border-t pt-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Notes
        </h3>

        {notes ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {notes}
          </p>
        ) : (
          !addingNote && <p className="text-sm text-muted-foreground italic">No notes yet.</p>
        )}

        {addingNote ? (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
              rows={3}
              placeholder="Add a note..."
              className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNote}
                disabled={savingNote || !note.trim()}
                className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {savingNote ? "Saving..." : "Save note"}
              </button>
              <button
                onClick={() => { setAddingNote(false); setNote(""); }}
                className="h-7 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingNote(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + Add note
          </button>
        )}
      </div>

      {showForm && (
        <EntryForm
          applicationId={applicationId}
          stageTypes={stageTypes}
          nextRound={nextRound}
          onClose={() => setShowForm(false)}
        />
      )}
      {editingEntry && (
        <EntryForm
          applicationId={applicationId}
          stageTypes={stageTypes}
          entry={editingEntry}
          nextRound={nextRound}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}
