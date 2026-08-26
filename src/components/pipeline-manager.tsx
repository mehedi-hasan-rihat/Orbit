"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStageType,
  updateStageType,
  setStageTypeEnabled,
  deleteStageType,
} from "@/lib/actions/pipeline";
import { STAGE_CATEGORIES, CATEGORY_LABELS, type StageCategoryValue } from "@/lib/validations";
import clsx from "clsx";

interface StageType {
  id: string;
  name: string;
  color: string;
  category: StageCategoryValue;
  order: number;
  enabled: boolean;
  isSystem: boolean;
  usageCount: number;
  applicationCount: number;
}

const DEFAULT_NEW_COLOR = "#6b7280";

export function PipelineManager({ stageTypes }: { stageTypes: StageType[] }) {
  const [name, setName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_NEW_COLOR);
  const [newCategory, setNewCategory] = useState<StageCategoryValue>("INTERVIEWING");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState(DEFAULT_NEW_COLOR);
  const [editingCategory, setEditingCategory] = useState<StageCategoryValue>("INTERVIEWING");
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
    formData.set("color", newColor);
    formData.set("category", newCategory);
    const result = await createStageType(formData);

    const message = readError(result);
    if (message) setError(message);
    else {
      setName("");
      setNewColor(DEFAULT_NEW_COLOR);
      setNewCategory("INTERVIEWING");
      router.refresh();
    }
    setPending(null);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    setPending(id);

    const formData = new FormData();
    formData.set("name", editingName);
    formData.set("color", editingColor);
    formData.set("category", editingCategory);
    const result = await updateStageType(id, formData);

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
    if (type.isSystem) {
      setError(`${type.name} is a default stage and cannot be deleted.`);
      return;
    }

    if (type.applicationCount > 0) {
      setError(
        `${type.name} still holds ${type.applicationCount} application${type.applicationCount === 1 ? "" : "s"}. Move them to another stage, or disable this one instead.`,
      );
      return;
    }

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
          every round already using it. The stages marked <strong>Default</strong> are
          fixed — you can recolour them, but not rename, hide or delete them.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          aria-label="Stage colour"
          className="h-9 w-10 shrink-0 rounded-md border bg-background p-1 cursor-pointer"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a stage…"
          maxLength={100}
          required
          className="flex h-9 flex-1 min-w-[8rem] rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as StageCategoryValue)}
          aria-label="Stage category"
          className="h-9 shrink-0 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STAGE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending === "new"}
          className="h-9 px-4 shrink-0 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
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
                  type="color"
                  value={editingColor}
                  onChange={(e) => setEditingColor(e.target.value)}
                  aria-label="Stage colour"
                  className="h-8 w-9 shrink-0 rounded-md border bg-background p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  maxLength={100}
                  autoFocus={!type.isSystem}
                  disabled={type.isSystem}
                  title={type.isSystem ? "Default stages keep their name" : undefined}
                  className="flex h-8 flex-1 min-w-0 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <select
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value as StageCategoryValue)}
                  aria-label="Stage category"
                  disabled={type.isSystem}
                  title={type.isSystem ? "Default stages keep their category" : undefined}
                  className="h-8 shrink-0 rounded-md border bg-background px-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {STAGE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveEdit(type.id)}
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
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: type.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <span
                      className={clsx(
                        "truncate",
                        !type.enabled && "text-muted-foreground line-through",
                      )}
                    >
                      {type.name}
                    </span>
                    {type.isSystem && (
                      <span
                        title="Default stage — name, category and visibility are fixed"
                        className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[type.category]}
                    {` · ${type.applicationCount} application${type.applicationCount === 1 ? "" : "s"}`}
                    {type.usageCount > 0 && ` · ${type.usageCount} round${type.usageCount === 1 ? "" : "s"}`}
                    {type.enabled ? "" : " · hidden from board"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(type.id);
                    setEditingName(type.name);
                    setEditingColor(type.color);
                    setEditingCategory(type.category);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {type.isSystem ? "Colour" : "Edit"}
                </button>
                {!type.isSystem && (
                  <>
                    <button
                      onClick={() => handleToggle(type.id, !type.enabled)}
                      disabled={pending === type.id}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {type.enabled ? "Hide" : "Show"}
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
