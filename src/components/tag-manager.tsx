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
    <div className="space-y-6">
      {/* Create tag section */}
      <div className="border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Your Tags</h3>
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-colors"
            >
              + New Tag
            </button>
          )}
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="border rounded-md p-4 space-y-4 bg-muted/30">
            <div className="space-y-2">
              <label htmlFor="tag-name" className="text-sm font-medium">
                Tag Name
              </label>
              <input
                id="tag-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Remote, Referral, High Priority"
                required
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-foreground scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {name.trim() && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Preview</label>
                <div>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: color }}
                  >
                    {name.trim()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating..." : "Create Tag"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                  setColor(presetColors[0]);
                }}
                className="h-8 px-4 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tags list */}
        {tags.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No tags created yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Create tags to categorize and filter your applications
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group relative inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground/80 text-background flex items-center justify-center text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete ${tag.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
