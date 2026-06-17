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
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Tags</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showCreate ? "Cancel" : "+ Add Tag"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="flex items-end gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            required
            className="flex h-8 w-32 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 ${
                  color === c ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium"
          >
            Add
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tags created yet.</p>
        ) : (
          tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                onClick={() => handleDelete(tag.id)}
                className="hover:opacity-70"
                aria-label={`Delete ${tag.name}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
