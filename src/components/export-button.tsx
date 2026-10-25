"use client";

import { useState } from "react";
import { exportApplicationsCsv } from "@/lib/actions/applications";
import { exportApplicationsExcel } from "@/lib/excel-export";

export function ExportButton() {
  const [loading, setLoading] = useState<null | "csv" | "excel">(null);

  async function handleExportCsv() {
    setLoading("csv");
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
      setLoading(null);
    }
  }

  async function handleExportExcel() {
    setLoading("excel");
    try {
      const { data, filename } = await exportApplicationsExcel();
      // Decode base64 into a binary blob for download.
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportExcel}
        disabled={loading !== null}
        className="h-9 px-4 rounded-full border border-border text-sm hover:bg-control transition-colors disabled:opacity-50"
      >
        {loading === "excel" ? "Exporting..." : "Export Excel"}
      </button>
      <button
        onClick={handleExportCsv}
        disabled={loading !== null}
        className="h-9 px-4 rounded-full border border-border text-sm hover:bg-control transition-colors disabled:opacity-50"
      >
        {loading === "csv" ? "Exporting..." : "Export CSV"}
      </button>
    </div>
  );
}
