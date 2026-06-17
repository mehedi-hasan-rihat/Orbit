"use client";

import { useState } from "react";
import { createTag, deleteTag } from "@/lib/actions/tags";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
  color: string;
}

const presetColors = [
  "#6b7280", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#22c55e", "#ef4444", "#06b6d4",
];

export function TagManager({ tags }: { tags: Tag[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(presetColors[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("color", color);
    await createTag(formData);
    setName("");
    setColor(presetColors[0]);
    setShowCreate(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tag? It will be removed from all applications.")) return;
    await deleteTag(id);
    router.refresh();
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <div>
          <h3 className="text-sm font-semibold">Your Tags</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tags.length === 0 ? "No tags yet" : `${tags.length} tag${tags.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            + New Tag
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="px-5 py-4 border-b bg-muted/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="tag-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tag Name
              </label>
              <input
                id="tag-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Remote, Referral, High Priority"
                required
                autoFocus
                className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Color
              </label>
              <div className="flex items-center gap-2 h-9">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {name.trim() && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {name.trim()}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Creating..." : "Create Tag"}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setName(""); setColor(presetColors[0]); }}
              className="h-8 px-4 rounded-lg border text-xs font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tags grid */}
      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-5">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg mb-3">
            🏷️
          </div>
          <p className="text-sm font-medium">No tags created yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first tag to start organizing applications
          </p>
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 h-8 px-4 rounded-lg border text-xs font-medium hover:bg-accent transition-colors"
            >
              + Create Tag
            </button>
          )}
        </div>
      ) : (
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="text-sm font-medium">{tag.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  aria-label={`Delete ${tag.name}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
