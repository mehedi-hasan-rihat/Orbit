"use server";

// Excel export server action for Orbit applications.
//
// Generates a proper .xlsx file using exceljs and returns it as a base64
// string so the client component can create a Blob and trigger a download.
//
// Column order is fixed to match the user's Google Sheet:
//   Company | Role | Stage | Outcome | Applied Date | Job URL
// Rows are ordered by createdAt DESC — newest first, oldest last.
//
// Every server action that touches user data calls requireUser() first and
// scopes the Prisma query by userId, matching the project convention.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveStage } from "@/lib/stage-display";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function exportApplicationsExcel(): Promise<{
  data: string; // base64-encoded xlsx
  filename: string;
}> {
  const session = await requireUser();

  // Same query pattern as exportApplicationsCsv, scoped to the user.
  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" }, // oldest first, latest last
    include: {
      stage: { select: { name: true, color: true } },
    },
  });

  // exceljs is imported dynamically so it stays server-only and doesn't get
  // pulled into any client bundle.
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Orbit";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Applications", {
    properties: { defaultColWidth: 24 },
  });

  // Fixed headers matching the user's Google Sheet column order.
  sheet.columns = [
    { header: "Company", key: "company", width: 36 },
    { header: "Role", key: "role", width: 36 },
    { header: "Stage", key: "stage", width: 20 },
    { header: "Outcome", key: "outcome", width: 16 },
    { header: "Applied Date", key: "appliedDate", width: 16 },
    { header: "Job URL", key: "jobUrl", width: 60 },
  ];

  // Style the header row so it's distinguishable from data.
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E1E1E" },
  };
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.commit();

  for (const app of applications) {
    const stageName = resolveStage(app).name;
    const outcome = app.stageOutcome
      ? app.stageOutcome.charAt(0) + app.stageOutcome.slice(1).toLowerCase()
      : "";

    sheet.addRow({
      company: app.company,
      role: app.role,
      stage: stageName,
      outcome,
      appliedDate: app.appliedDate
        ? app.appliedDate.toISOString().split("T")[0]
        : "",
      jobUrl: app.jobUrl || "",
    });
  }

  // Serialize to a buffer, then encode as base64 for transport over the
  // server action boundary.
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const dateStr = new Date().toISOString().split("T")[0];
  return {
    data: base64,
    filename: `orbit-applications-${dateStr}.xlsx`,
  };
}
