"use client";

import { useState } from "react";
import { createApplication, updateApplication } from "@/lib/actions/applications";
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface ApplicationFormProps {
  application?: {
    id: string;
    company: string;
    role: string;
    jobUrl: string | null;
    status: string;
    appliedDate: Date | null;
    followUpDate: Date | null;
    notes: string | null;
    tags?: { tag: Tag }[];
  };
  availableTags: Tag[];
  onClose: () => void;
}

const statuses = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export function ApplicationForm({ application, availableTags, onClose }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>(
    application?.tags?.map((t) => t.tag.id) || []
  );
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("tags", selectedTags.join(","));

    try {
      let result;
      if (application) {
        result = await updateApplication(application.id, formData);
      } else {
        result = await createApplication(formData);
      }

      if (result.error) {
        setErrors(result.error as Record<string, string[]>);
      } else {
        router.refresh();
        onClose();
      }
    } catch {
      setErrors({ _form: ["Something went wrong"] });
    } finally {
      setLoading(false);
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {application ? "Edit Application" : "New Application"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors._form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors._form.join(", ")}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company *
              </label>
              <input
                id="company"
                name="company"
                type="text"
                defaultValue={application?.company || ""}
                required
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role *
              </label>
              <input
                id="role"
                name="role"
                type="text"
                defaultValue={application?.role || ""}
                required
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="jobUrl" className="text-sm font-medium">
              Job URL
            </label>
            <input
              id="jobUrl"
              name="jobUrl"
              type="url"
              defaultValue={application?.jobUrl || ""}
              placeholder="https://..."
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.jobUrl && (
              <p className="text-xs text-destructive">{errors.jobUrl[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={application?.status || "WISHLIST"}
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="appliedDate" className="text-sm font-medium">
                Applied Date
              </label>
              <input
                id="appliedDate"
                name="appliedDate"
                type="date"
                defaultValue={
                  application?.appliedDate
                    ? new Date(application.appliedDate).toISOString().split("T")[0]
                    : ""
                }
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="followUpDate" className="text-sm font-medium">
                Follow-up Date
              </label>
              <input
                id="followUpDate"
                name="followUpDate"
                type="date"
                defaultValue={
                  application?.followUpDate
                    ? new Date(application.followUpDate).toISOString().split("T")[0]
                    : ""
                }
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground hover:border-foreground"
                    }`}
                    style={
                      selectedTags.includes(tag.id)
                        ? { backgroundColor: tag.color }
                        : undefined
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={application?.notes || ""}
              placeholder="Add any notes about this application..."
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : application ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
