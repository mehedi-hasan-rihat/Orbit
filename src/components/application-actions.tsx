"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateApplicationStage,
  closeApplication,
  reopenApplication,
  archiveApplication,
  unarchiveApplication,
  deleteApplication,
} from "@/lib/actions/applications";
import { ApplicationForm } from "./application-form";
import type { StageOption } from "./quick-actions";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Props {
  applicationId: string;
  stageId: string | null;
  stages: StageOption[];
  closed: boolean;
  archived: boolean;
  // Everything the edit modal needs. The detail page could show a field but not
  // change it — company, role, URL and both dates were editable only from the
  // list, so opening a card to fix a typo meant navigating back.
  application: React.ComponentProps<typeof ApplicationForm>["application"];
  availableTags: Tag[];
}

const BUTTON = "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50";

export function ApplicationActions({
  applicationId,
  stageId,
  stages,
  closed,
  archived,
  application,
  availableTags,
}: Props) {
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();

  async function run(action: () => Promise<unknown>) {
    setPending(true);
    await action();
    setPending(false);
    router.refresh();
  }

  async function handleDelete() {
    setPending(true);
    const result = await deleteApplication(applicationId);
    if (result && "error" in result) {
      setPending(false);
      setConfirmingDelete(false);
      return;
    }
    // The row this page renders is gone, so refreshing in place would 404.
    // deleteApplication only revalidates /dashboard, so the list has to be
    // refreshed explicitly or the client router can serve it from cache with
    // the deleted application still in it.
    router.push("/dashboard/applications");
    router.refresh();
  }

  // Deleting takes the whole application, its rounds and its history with it,
  // so it asks in place rather than firing on a single click.
  if (confirmingDelete) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Delete this application and its history?
        </span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex h-8 items-center rounded-md bg-destructive px-3 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
        <button
          onClick={() => setConfirmingDelete(false)}
          disabled={pending}
          className={BUTTON}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
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

        <button onClick={() => setEditing(true)} disabled={pending} className={BUTTON}>
          Edit
        </button>

        {closed ? (
          <button
            onClick={() => run(() => reopenApplication(applicationId))}
            disabled={pending}
            className={BUTTON}
          >
            Reopen
          </button>
        ) : (
          <button
            onClick={() => run(() => closeApplication(applicationId))}
            disabled={pending}
            title="Ends the process. Stage, notes, tags and rounds are kept exactly as they are."
            className={BUTTON}
          >
            Close
          </button>
        )}

        {archived ? (
          <button
            onClick={() => run(() => unarchiveApplication(applicationId))}
            disabled={pending}
            className={BUTTON}
          >
            Unarchive
          </button>
        ) : (
          <button
            onClick={() => run(() => archiveApplication(applicationId))}
            disabled={pending}
            title="Hides it from the list. Everything else is left alone."
            className={BUTTON}
          >
            Archive
          </button>
        )}

        <button
          onClick={() => setConfirmingDelete(true)}
          disabled={pending}
          title="Permanently removes the application, its rounds and its activity."
          className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {/* These four read as interchangeable ways of "getting rid of" an
          application, and the tooltips explaining them never appear on touch.
          Closed by default so it doesn't shout at someone who already knows. */}
      <details>
        <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors list-none">
          What do these do?
        </summary>
        <dl className="mt-2 space-y-1.5 text-[11px] text-muted-foreground max-w-prose">
          <div>
            <dt className="inline font-medium text-foreground">Close — </dt>
            <dd className="inline">
              the process is over, however it ended. Stage, notes, tags and rounds
              are kept exactly as they are, so the record still shows how far it got.
              Reversible with Reopen.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">Archive — </dt>
            <dd className="inline">
              only hides it from the list. Nothing else changes. Reversible.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">Delete — </dt>
            <dd className="inline">
              removes the application, its rounds, follow-ups and activity for good.
              This one can&apos;t be undone.
            </dd>
          </div>
        </dl>
      </details>

      {editing && (
        <ApplicationForm
          application={application}
          availableTags={availableTags}
          stages={stages}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
