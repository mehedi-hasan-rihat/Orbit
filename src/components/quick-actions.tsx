"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  updateApplicationStage,
  archiveApplication,
  unarchiveApplication,
  closeApplication,
  reopenApplication,
  addQuickNote,
  markOffered,
  unmarkOffered,
} from "@/lib/actions/applications";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";

export interface StageOption {
  id: string;
  name: string;
  color: string;
  category: string;
  // Present on the pipeline rows this is fed from. Hidden stages stay
  // assignable via the form but are kept out of the quick move list, matching
  // the board and the detail-page picker.
  enabled?: boolean;
}

interface QuickActionsProps {
  applicationId: string;
  currentStageId: string | null;
  stages: StageOption[];
  company: string;
  closed?: boolean;
  archived?: boolean;
  offered?: boolean;
}

export function QuickActions({
  applicationId,
  currentStageId,
  stages,
  company,
  closed = false,
  archived = false,
  offered = false,
}: QuickActionsProps) {
  const [open, setOpen] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; openUp: boolean }>({ top: 0, left: 0, openUp: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const DROPDOWN_HEIGHT = 400;

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT;

    setPosition({
      top: openUp ? rect.top : rect.bottom + 4,
      left: rect.right - 208, // 208 = w-52 (13rem)
      openUp,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowNoteInput(false);
      }
    }

    // Capture-phase, so this also fires for the menu's own scroll container.
    // The menu is position:fixed and anchored to the button by a one-off
    // measurement, so page scroll has to re-anchor it — but scrolling *within*
    // the menu must not move or close it.
    function handleScroll(e: Event) {
      if (dropdownRef.current?.contains(e.target as Node)) return;

      // Once the trigger has scrolled out of view there is nothing to anchor
      // to, so close rather than leave the menu floating.
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        setShowNoteInput(false);
        return;
      }

      updatePosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  async function handleStageChange(stageId: string) {
    await run(() => updateApplicationStage(applicationId, stageId));
  }

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    await action();
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setLoading(true);
    await addQuickNote(applicationId, note.trim());
    setNote("");
    setShowNoteInput(false);
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="h-7 w-7 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Quick actions"
      >
        ···
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[100] w-52 rounded-lg border bg-background shadow-lg overflow-hidden"
          style={{
            top: position.openUp ? undefined : `${position.top}px`,
            bottom: position.openUp ? `${window.innerHeight - position.top + 4}px` : undefined,
            left: `${Math.max(8, position.left)}px`,
          }}
        >
          <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: `min(${DROPDOWN_HEIGHT}px, calc(100vh - 40px))` }}>
            {/* Move Stage */}
            <div className="px-2 pt-2 pb-1">
              <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Move to stage</p>
              {stages
                .filter((s) => s.id !== currentStageId && s.enabled !== false)
                .map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  disabled={loading}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.name}
                </button>
              ))}
            </div>

            <div className="border-t my-1" />

            {/* Add Note */}
            {!showNoteInput ? (
              <button
                onClick={() => setShowNoteInput(true)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                Add Note
              </button>
            ) : (
              <form onSubmit={handleNoteSubmit} className="px-3 py-2 space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={`Note for ${company}...`}
                  rows={2}
                  autoFocus
                  className="flex w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    disabled={loading || !note.trim()}
                    className="h-7 flex-1 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNoteInput(false); setNote(""); }}
                    className="h-7 px-2 rounded-md border text-xs"
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}

            {/* Schedule Interview */}
            <Link
              href={`/dashboard/applications/${applicationId}#interviews`}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
                Schedule Interview
            </Link>

            <div className="border-t my-1" />

            {/* Got offered — an outcome flag, not a stage move and not an
                ending, so it sits above Close rather than replacing it. */}
            {offered ? (
              <button
                onClick={() => run(() => unmarkOffered(applicationId))}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Remove offer
              </button>
            ) : (
              <button
                onClick={() => run(() => markOffered(applicationId))}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Records that you got an offer. Doesn't close the application."
              >
                Got offered
              </button>
            )}

            {/* Close — ends the process but keeps the stage and history as-is */}
            {closed ? (
              <button
                onClick={() => run(() => reopenApplication(applicationId))}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Reopen
              </button>
            ) : (
              <button
                onClick={() => run(() => closeApplication(applicationId))}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Ends the process. Stage, notes and rounds are kept exactly as they are."
              >
                Close
              </button>
            )}

            {/* Archive */}
            {archived ? (
              <button
                onClick={() => run(() => unarchiveApplication(applicationId))}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Unarchive
              </button>
            ) : (
              <button
                onClick={() => run(() => archiveApplication(applicationId))}
                disabled={loading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Hides it from the list. Everything else is left alone."
              >
                Archive
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
