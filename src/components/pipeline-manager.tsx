"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStageType,
  renameStageType,
  setStageTypeEnabled,
  deleteStageType,
} from "@/lib/actions/pipeline";
import clsx from "clsx";

interface StageType {
  id: string;
  name: string;
  order: number;
  enabled: boolean;
  usageCount: number;
}

export function PipelineManager({ stageTypes }: { stageTypes: StageType[] }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const router = useRouter();

  function readError(result: { error?: unknown }) {
    if (typeof result.error === "string") return result.error;
    if (result.error && typeof result.error === "object") {
      const first = Object.values(result.error as Record<string, string[]>).flat()[0];
      if (first) return first;
    }
    return null;
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending("new");

    const formData = new FormData();
    formData.set("name", name);
    const result = await createStageType(formData);

    const message = readError(result);
    if (message) setError(message);
    else {
      setName("");
      router.refresh();
    }
    setPending(null);
  }

  async function handleRename(id: string) {
    setError(null);
    setPending(id);

    const formData = new FormData();
    formData.set("name", editingName);
    const result = await renameStageType(id, formData);

    const message = readError(result);
    if (message) setError(message);
    else {
      setEditingId(null);
      router.refresh();
    }
    setPending(null);
  }

  async function handleToggle(id: string, enabled: boolean) {
    setError(null);
    setPending(id);
    const result = await setStageTypeEnabled(id, enabled);
    const message = readError(result);
    if (message) setError(message);
    else router.refresh();
    setPending(null);
  }

  async function handleDelete(type: StageType) {
    const warning =
      type.usageCount > 0
        ? `Delete "${type.name}"? ${type.usageCount} interview round${type.usageCount === 1 ? "" : "s"} using it will keep the name as a plain label.`
        : `Delete "${type.name}"?`;
    if (!confirm(warning)) return;

    setError(null);
    setPending(type.id);
    const result = await deleteStageType(type.id);
    const message = readError(result);
    if (message) setError(message);
    else router.refresh();
    setPending(null);
  }

  return (
    <div className="border rounded-xl p-5 space-y-5">
      <div>
        <h2 className="text-sm font-semibold">Stage types</h2>
        <p className="text-xs text-muted-foreground mt-1">
          The types you can pick when adding an interview round. Renaming one updates
          every round already using it.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a stage type…"
          maxLength={100}
          required
          className="flex h-9 flex-1 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={pending === "new"}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {pending === "new" ? "Adding…" : "Add"}
        </button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="divide-y border-t">
        {stageTypes.map((type) => (
          <div key={type.id} className="flex items-center gap-3 py-3">
            {editingId === type.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  maxLength={100}
                  autoFocus
                  className="flex h-8 flex-1 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => handleRename(type.id)}
                  disabled={pending === type.id}
                  className="text-xs font-medium hover:text-foreground disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      "text-sm font-medium truncate",
                      !type.enabled && "text-muted-foreground line-through",
                    )}
                  >
                    {type.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type.usageCount === 0
                      ? "Not used yet"
                      : `Used by ${type.usageCount} round${type.usageCount === 1 ? "" : "s"}`}
                    {type.enabled ? "" : " · disabled"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(type.id);
                    setEditingName(type.name);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleToggle(type.id, !type.enabled)}
                  disabled={pending === type.id}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {type.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleDelete(type)}
                  disabled={pending === type.id}
                  className="text-xs text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {stageTypes.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No stage types yet — add your first one above.
        </p>
      )}
    </div>
  );
}
