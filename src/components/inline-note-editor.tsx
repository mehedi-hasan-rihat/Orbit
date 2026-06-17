"use client";

import { useState } from "react";
import { addQuickNote } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";

export function InlineNoteEditor({
  applicationId,
  currentNotes,
}: {
  applicationId: string;
  currentNotes: string | null;
}) {
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    if (!note.trim()) return;
    setLoading(true);
    await addQuickNote(applicationId, note.trim());
    setNote("");
    setAdding(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {currentNotes ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {currentNotes}
        </p>
      ) : (
        !adding && (
          <p className="text-sm text-muted-foreground italic">No notes yet.</p>
        )
      )}

      {adding ? (
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
              onClick={handleSave}
              disabled={loading || !note.trim()}
              className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Saving..." : "Save Note"}
            </button>
            <button
              onClick={() => { setAdding(false); setNote(""); }}
              className="h-7 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + Add note
        </button>
      )}
    </div>
  );
}
