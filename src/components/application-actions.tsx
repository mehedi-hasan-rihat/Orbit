"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateApplicationStage,
  closeApplication,
  reopenApplication,
  archiveApplication,
  unarchiveApplication,
} from "@/lib/actions/applications";
import type { StageOption } from "./quick-actions";

interface Props {
  applicationId: string;
  stageId: string | null;
  stages: StageOption[];
  closed: boolean;
  archived: boolean;
}

// The detail page had no way to move, close or archive an application — those
// actions lived only in the list's ··· menu, so opening a card was a dead end.
export function ApplicationActions({ applicationId, stageId, stages, closed, archived }: Props) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function run(action: () => Promise<unknown>) {
    setPending(true);
    await action();
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={stageId ?? ""}
        onChange={(e) => run(() => updateApplicationStage(applicationId, e.target.value))}
        disabled={pending}
        aria-label="Stage"
        className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {!stageId && <option value="">Unassigned</option>}
        {stages.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {closed ? (
        <button
          onClick={() => run(() => reopenApplication(applicationId))}
          disabled={pending}
          className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          Reopen
        </button>
      ) : (
        <button
          onClick={() => run(() => closeApplication(applicationId))}
          disabled={pending}
          title="Ends the process. Stage, notes, tags and rounds are kept exactly as they are."
          className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          🚪 Close
        </button>
      )}

      {archived ? (
        <button
          onClick={() => run(() => unarchiveApplication(applicationId))}
          disabled={pending}
          className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          Unarchive
        </button>
      ) : (
        <button
          onClick={() => run(() => archiveApplication(applicationId))}
          disabled={pending}
          title="Hides it from the list. Everything else is left alone."
          className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          📦 Archive
        </button>
      )}
    </div>
  );
}
