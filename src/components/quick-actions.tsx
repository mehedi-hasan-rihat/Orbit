"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { updateApplicationStatus, archiveApplication, addQuickNote } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";

const STAGES = [
  { value: "WISHLIST", label: "Wishlist" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

interface QuickActionsProps {
  applicationId: string;
  currentStatus: string;
  company: string;
}

export function QuickActions({ applicationId, currentStatus, company }: QuickActionsProps) {
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

    function handleScroll() {
      setOpen(false);
      setShowNoteInput(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePosition]);

  async function handleStageChange(status: string) {
    setLoading(true);
    await updateApplicationStatus(applicationId, status);
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function handleArchive() {
    setLoading(true);
    await archiveApplication(applicationId);
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
              {STAGES.filter((s) => s.value !== currentStatus).map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => handleStageChange(stage.value)}
                  disabled={loading}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  <span className="text-xs text-muted-foreground">→</span>
                  {stage.label}
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
                <span>📝</span> Add Note
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
              <span>🗓️</span> Schedule Interview
            </Link>

            <div className="border-t my-1" />

            {/* Archive */}
            <button
              onClick={handleArchive}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <span>📦</span> Archive
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
