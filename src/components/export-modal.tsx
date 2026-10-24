"use client";

import { useState } from "react";
import { exportApplicationsData, type ExportRow } from "@/lib/actions/applications";

// ─── Tiny XLSX builder — no dependency needed ─────────────────────────────
// Generates a minimal .xlsx (Office Open XML) from a 2-D string array.
// Only handles text cells; sufficient for this export.

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildXlsx(headers: string[], rows: string[][]): Blob {
  const allRows = [headers, ...rows];

  // shared strings table
  const stringMap = new Map<string, number>();
  const strings: string[] = [];
  function si(val: string): number {
    if (!stringMap.has(val)) {
      stringMap.set(val, strings.length);
      strings.push(val);
    }
    return stringMap.get(val)!;
  }

  // Build cell refs A1, B1, … AA1 etc.
  function colLetter(i: number): string {
    let s = "";
    i++;
    while (i > 0) {
      const rem = (i - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  }

  // Build sheet XML
  const sheetRows = allRows
    .map((row, ri) =>
      `<row r="${ri + 1}">${row
        .map((cell, ci) => {
          const ref = `${colLetter(ci)}${ri + 1}`;
          const idx = si(String(cell ?? ""));
          return `<c r="${ref}" t="s"><v>${idx}</v></c>`;
        })
        .join("")}</row>`
    )
    .join("");

  const sheetXml = `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${sheetRows}</sheetData>
</worksheet>`;

  const sst = `<?xml version="1.0" encoding="UTF-8"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${strings.map((s) => `<si><t>${escapeXml(s)}</t></si>`).join("")}
</sst>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Applications" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`;

  const pkgRels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // Pack into a zip (XLSX is a zip file). Using a minimal zip builder.
  function uint32LE(n: number): number[] {
    return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
  }
  function uint16LE(n: number): number[] {
    return [n & 0xff, (n >> 8) & 0xff];
  }

  function crc32(data: Uint8Array): number {
    const table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[i] = c;
      }
      return t;
    })();
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function strToBytes(s: string): Uint8Array {
    return new TextEncoder().encode(s);
  }

  interface ZipEntry { name: string; data: Uint8Array; offset: number; crc: number }

  const enc = new TextEncoder();
  const files: { name: string; content: string }[] = [
    { name: "[Content_Types].xml", content: contentTypes },
    { name: "_rels/.rels", content: pkgRels },
    { name: "xl/workbook.xml", content: workbook },
    { name: "xl/_rels/workbook.xml.rels", content: wbRels },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml },
    { name: "xl/sharedStrings.xml", content: sst },
  ];

  const entries: ZipEntry[] = [];
  const localHeaders: number[] = [];

  for (const file of files) {
    const nameBytes = enc.encode(file.name);
    const dataBytes = strToBytes(file.content);
    const crc = crc32(dataBytes);
    const offset = localHeaders.length;

    entries.push({ name: file.name, data: dataBytes, offset, crc });

    localHeaders.push(
      0x50, 0x4b, 0x03, 0x04,       // local file header sig
      ...uint16LE(20),               // version needed
      ...uint16LE(0),                // flags
      ...uint16LE(0),                // compression: stored
      ...uint16LE(0), ...uint16LE(0),// mod time/date
      ...uint32LE(crc),
      ...uint32LE(dataBytes.length),
      ...uint32LE(dataBytes.length),
      ...uint16LE(nameBytes.length),
      ...uint16LE(0),
      ...Array.from(nameBytes),
      ...Array.from(dataBytes),
    );
  }

  const centralDir: number[] = [];
  let entryOffset = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const nameBytes = enc.encode(e.name);
    // Recompute local header size to find actual offset
    const lhSize = 30 + nameBytes.length + e.data.length;
    centralDir.push(
      0x50, 0x4b, 0x01, 0x02,
      ...uint16LE(20), ...uint16LE(20),
      ...uint16LE(0), ...uint16LE(0),
      ...uint16LE(0), ...uint16LE(0), ...uint16LE(0),
      ...uint32LE(e.crc),
      ...uint32LE(e.data.length),
      ...uint32LE(e.data.length),
      ...uint16LE(nameBytes.length),
      ...uint16LE(0), ...uint16LE(0),
      ...uint16LE(0), ...uint16LE(0),
      ...uint32LE(0),
      ...uint32LE(entryOffset),
      ...Array.from(nameBytes),
    );
    entryOffset += lhSize;
  }

  const cdOffset = localHeaders.length;
  const cdSize = centralDir.length;

  const eocd = [
    0x50, 0x4b, 0x05, 0x06,
    ...uint16LE(0), ...uint16LE(0),
    ...uint16LE(entries.length), ...uint16LE(entries.length),
    ...uint32LE(cdSize),
    ...uint32LE(cdOffset),
    ...uint16LE(0),
  ];

  const all = new Uint8Array([...localHeaders, ...centralDir, ...eocd]);
  return new Blob([all], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ─── CSV helper ───────────────────────────────────────────────────────────

function rowsToCsv(headers: string[], rows: string[][]): string {
  return [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
}

// ─── Main component ───────────────────────────────────────────────────────

const HEADERS = ["Company", "Role", "Status", "Outcome", "Applied Date", "Job URL", "Added On"];

function toRow(r: ExportRow): string[] {
  return [r.company, r.role, r.status, r.outcome, r.appliedDate, r.jobUrl, r.addedOn];
}

export function ExportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 px-4 rounded-full border border-border text-sm hover:bg-control transition-colors"
      >
        Export
      </button>

      {open && <ExportModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ExportModal({ onClose }: { onClose: () => void }) {
  const [include, setInclude] = useState<"active" | "closed" | "both">("active");
  const [sortBy, setSortBy] = useState<"appliedDate" | "createdAt">("appliedDate");
  const [loading, setLoading] = useState<"csv" | "xlsx" | null>(null);

  async function fetchData() {
    return exportApplicationsData({ include, sortBy });
  }

  async function handleCsv() {
    setLoading("csv");
    try {
      const rows = await fetchData();
      const csv = rowsToCsv(HEADERS, rows.map(toRow));
      const blob = new Blob([csv], { type: "text/csv" });
      trigger(blob, `orbit-applications-${today()}.csv`);
      onClose();
    } finally {
      setLoading(null);
    }
  }

  async function handleXlsx() {
    setLoading("xlsx");
    try {
      const rows = await fetchData();
      const blob = buildXlsx(HEADERS, rows.map(toRow));
      trigger(blob, `orbit-applications-${today()}.xlsx`);
      onClose();
    } finally {
      setLoading(null);
    }
  }

  function trigger(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  const busy = loading !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080] backdrop-blur-[8px]">
      <div className="w-full max-w-sm mx-4 rounded-[32px] border border-border bg-[var(--color-floating)] backdrop-blur-[var(--blur-floating)] p-8 shadow-[0_8px_32px_#00000040]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg">Export Applications</h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Include */}
          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">Include</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["active", "closed", "both"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setInclude(opt)}
                  className={`h-8 rounded-full text-[13px] border transition-colors ${
                    include === opt
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {opt === "active" ? "Active" : opt === "closed" ? "Closed" : "Both"}
                </button>
              ))}
            </div>
          </div>

          {/* Sort by */}
          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">Sort by</p>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { value: "appliedDate", label: "Applied on" },
                { value: "createdAt",   label: "Added on" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`h-8 rounded-full text-[13px] border transition-colors ${
                    sortBy === opt.value
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Columns preview */}
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-[13px] text-muted-foreground mb-2">Columns</p>
            <div className="flex flex-wrap gap-1.5">
              {HEADERS.map((h) => (
                <span key={h} className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleCsv}
            disabled={busy}
            className="flex-1 h-9 rounded-full border border-border text-[13px] hover:bg-control transition-colors disabled:opacity-50"
          >
            {loading === "csv" ? "Exporting…" : "CSV"}
          </button>
          <button
            onClick={handleXlsx}
            disabled={busy}
            className="flex-1 h-9 rounded-full bg-foreground text-background text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading === "xlsx" ? "Exporting…" : "Excel (.xlsx)"}
          </button>
        </div>
      </div>
    </div>
  );
}
