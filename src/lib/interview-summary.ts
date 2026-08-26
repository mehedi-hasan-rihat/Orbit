// Summarising an application's interview rounds.
//
// The detail page used to show "N rounds · X passed · Y pending", which leaves
// FAILED / REJECTED / CANCELLED / WITHDRAWN / COMPLETED rounds counted in the
// total but shown nowhere — so the numbers visibly failed to add up against the
// list underneath. Every round lands in exactly one bucket here, and the buckets
// are guaranteed to sum to `total`.

import { OPEN_OUTCOMES, type InterviewOutcome } from "@/lib/validations";

export type RoundBucket = "passed" | "failed" | "open" | "other";

export interface RoundSource {
  scheduledAt: Date | string | null;
  outcome: string | null;
}

// Outcome is a plain string column, so an unrecognised value still has to land
// somewhere — "other" is the catch-all, same as outcomeDisplay's fallback. That
// includes the retired REJECTED/WITHDRAWN values if a pre-dedup backup is ever
// restored; REJECTED is called out so it still reads as a failure.
export function roundBucket(outcome: string | null | undefined): RoundBucket {
  const value = (outcome ?? "PENDING") as InterviewOutcome;
  if (value === "PASSED") return "passed";
  if (value === "FAILED" || (value as string) === "REJECTED") return "failed";
  if (OPEN_OUTCOMES.includes(value)) return "open";
  return "other";
}

export const BUCKET_LABELS: Record<RoundBucket, string> = {
  passed: "passed",
  failed: "did not pass",
  open: "upcoming",
  other: "closed out",
};

export const BUCKET_DOT: Record<RoundBucket, string> = {
  passed: "bg-green-500",
  failed: "bg-red-500",
  open: "bg-blue-500",
  other: "bg-muted-foreground/50",
};

export interface RoundSummary<T extends RoundSource> {
  total: number;
  passed: number;
  failed: number;
  open: number;
  other: number;
  /** Buckets in display order, with the empty ones dropped. */
  breakdown: { bucket: RoundBucket; count: number }[];
  /** Earliest not-yet-happened round that still has a date on it. */
  next: T | null;
  /** Open rounds with no date — they can't be "next", but they aren't done either. */
  unscheduled: number;
}

const ORDER: RoundBucket[] = ["open", "passed", "failed", "other"];

export function summariseRounds<T extends RoundSource>(
  interviews: T[],
  now: Date | number,
): RoundSummary<T> {
  const counts: Record<RoundBucket, number> = { passed: 0, failed: 0, open: 0, other: 0 };
  for (const interview of interviews) counts[roundBucket(interview.outcome)] += 1;

  const cutoff = new Date(now).getTime();
  const upcoming = interviews
    .filter(
      (i) =>
        roundBucket(i.outcome) === "open" &&
        i.scheduledAt !== null &&
        new Date(i.scheduledAt).getTime() >= cutoff,
    )
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

  const unscheduled = interviews.filter(
    (i) => roundBucket(i.outcome) === "open" && i.scheduledAt === null,
  ).length;

  return {
    total: interviews.length,
    ...counts,
    breakdown: ORDER.map((bucket) => ({ bucket, count: counts[bucket] })).filter((b) => b.count > 0),
    next: upcoming[0] ?? null,
    unscheduled,
  };
}
