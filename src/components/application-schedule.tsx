"use client";

import { useState } from "react";
import {
  createFollowUp,
  updateFollowUp,
  setFollowUpDone,
  deleteFollowUp,
} from "@/lib/actions/follow-ups";
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes";
import { MAX_ACTIVE_FOLLOW_UPS } from "@/lib/validations";
import { relativeDay } from "@/lib/relative-time";
import { DatePicker } from "./date-picker";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FollowUpItem {
  id: string;
  title: string;
  details: string | null;
  dueAt: Date;
  done: boolean;
}

export interface NoteItem {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Follow-up form modal ────────────────────────────────────────────────────

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
          <h3 className="font-semibold">{followUp ? "Edit reminder" : "New reminder"}</h3>
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
            {errors.title && <p className="text-xs text-destructive">{errors.title[0]}</p>}
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
            {errors.dueAt && <p className="text-xs text-destructive">{errors.dueAt[0]}</p>}
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
          {Object.keys(errors).length > 0 && !formError && (
            <p className="text-xs text-destructive">
              {Object.values(errors).flat()[0] ?? "Please fill in required fields correctly."}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : followUp ? "Update" : "Add reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Note form (inline, not a modal) ─────────────────────────────────────────

function NoteForm({
  applicationId,
  note,
  onClose,
}: {
  applicationId: string;
  note?: NoteItem;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = note
      ? await updateNote(note.id, applicationId, formData)
      : await createNote(applicationId, formData);

    if (result.error) {
      const msg = typeof result.error === "string"
        ? result.error
        : (Object.values(result.error).flat()[0] as string) ?? "Something went wrong";
      setError(msg);
    } else {
      router.refresh();
      onClose();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        name="content"
        defaultValue={note?.content ?? ""}
        autoFocus
        rows={3}
        placeholder="Write a note…"
        maxLength={5000}
        className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Saving…" : note ? "Update" : "Save note"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-7 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ApplicationSchedule({
  applicationId,
  followUps,
  notes,
  now,
}: {
  applicationId: string;
  followUps: FollowUpItem[];
  notes: NoteItem[];
  now: number;
}) {
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpItem | null>(null);
  const [followUpPending, setFollowUpPending] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [deletingNote, setDeletingNote] = useState<string | null>(null);

  const router = useRouter();

  const open = followUps.filter((f) => !f.done);
  const done = followUps.filter((f) => f.done);
  const atLimit = open.length >= MAX_ACTIVE_FOLLOW_UPS;

  async function runFollowUp(id: string, action: () => Promise<{ error?: unknown }>) {
    setFollowUpPending(id);
    setLimitError(null);
    const result = await action();
    if (typeof result?.error === "string") setLimitError(result.error);
    setFollowUpPending(null);
    router.refresh();
  }

  async function handleDeleteNote(noteId: string) {
    setDeletingNote(noteId);
    await deleteNote(noteId, applicationId);
    setDeletingNote(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">

      {/* ── Reminders ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Reminders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {open.length} of {MAX_ACTIVE_FOLLOW_UPS} open · emailed to you on the day each one is due
          </p>
        </div>
        <button
          onClick={() => { setLimitError(null); setCreatingFollowUp(true); }}
          disabled={atLimit}
          title={atLimit ? `Complete one first — ${MAX_ACTIVE_FOLLOW_UPS} open at a time.` : undefined}
          className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add reminder
        </button>
      </div>

      {limitError && <p className="text-xs text-destructive">{limitError}</p>}
      {atLimit && !limitError && (
        <p className="text-[11px] text-muted-foreground">
          That&apos;s the limit. Mark one done to free a slot — finished reminders stay on the record.
        </p>
      )}

      {open.length === 0 && done.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No reminders set</p>
      ) : (
        <div className="space-y-2">
          {[...open, ...done].map((followUp) => {
            const overdue = !followUp.done && new Date(followUp.dueAt).getTime() < now;
            return (
              <div
                key={followUp.id}
                className={clsx(
                  "rounded-md border bg-muted/30 p-3 space-y-1.5",
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
                      {new Date(followUp.dueAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      <span className="mx-1.5">·</span>
                      {relativeDay(followUp.dueAt, now)}
                      {overdue && " · overdue"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => runFollowUp(followUp.id, () => setFollowUpDone(followUp.id, applicationId, !followUp.done))}
                      disabled={followUpPending === followUp.id}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {followUp.done ? "Reopen" : "Done"}
                    </button>
                    {!followUp.done && (
                      <button onClick={() => setEditingFollowUp(followUp)} className="text-xs text-muted-foreground hover:text-foreground">
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => runFollowUp(followUp.id, () => deleteFollowUp(followUp.id, applicationId))}
                      disabled={followUpPending === followUp.id}
                      className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {followUp.details && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{followUp.details}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Notes ───────────────────────────────────────────────────────── */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes
          </h3>
          {!addingNote && (
            <button
              onClick={() => { setEditingNote(null); setAddingNote(true); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              + Add note
            </button>
          )}
        </div>

        {addingNote && (
          <NoteForm
            applicationId={applicationId}
            onClose={() => setAddingNote(false)}
          />
        )}

        {notes.length === 0 && !addingNote ? (
          <p className="text-sm text-muted-foreground italic">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="space-y-1">
                {editingNote?.id === n.id ? (
                  <NoteForm
                    applicationId={applicationId}
                    note={n}
                    onClose={() => setEditingNote(null)}
                  />
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.content}</p>
                    <div className="flex items-center gap-3">
                      <time className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        {n.updatedAt > n.createdAt && (
                          <span className="ml-1 opacity-60">(edited)</span>
                        )}
                      </time>
                      <button
                        onClick={() => { setAddingNote(false); setEditingNote(n); }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        disabled={deletingNote === n.id}
                        className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
                {/* divider between notes, not after the last one */}
                {notes.indexOf(n) < notes.length - 1 && (
                  <div className="border-t mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {creatingFollowUp && (
        <FollowUpForm applicationId={applicationId} onClose={() => setCreatingFollowUp(false)} />
      )}
      {editingFollowUp && (
        <FollowUpForm
          applicationId={applicationId}
          followUp={editingFollowUp}
          onClose={() => setEditingFollowUp(null)}
        />
      )}
    </div>
  );
}
