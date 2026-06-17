"use client";

import { useState } from "react";
import { exportApplicationsCsv } from "@/lib/actions/applications";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const csv = await exportApplicationsCsv();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orbit-applications-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
    >
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
}
