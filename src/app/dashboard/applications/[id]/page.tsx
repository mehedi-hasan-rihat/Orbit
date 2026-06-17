import { getApplication } from "@/lib/actions/applications";
import { getInterviews } from "@/lib/actions/interviews";
import { ActivityTimeline } from "@/components/activity-timeline";
import { InterviewTracker } from "@/components/interview-tracker";
import { StatusBadge } from "@/components/status-badge";
import { MobileNav } from "@/components/mobile-nav";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;

  const [application, interviews] = await Promise.all([
    getApplication(id),
    getInterviews(id),
  ]);

  if (!application) notFound();

  const isOverdue =
    application.followUpDate &&
    new Date(application.followUpDate) < new Date();

  const passedRounds = interviews.filter((i) => i.outcome === "PASSED").length;
  const pendingRounds = interviews.filter((i) => i.outcome === "PENDING").length;

  return (
    <>
      <div className="max-w-4xl space-y-6">

        {/* Back nav */}
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Applications
        </Link>

        {/* Hero card */}
        <div className="border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{application.company}</h1>
                <StatusBadge status={application.status} />
                {isOverdue && (
                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-0.5 text-xs font-medium">
                    Follow-up overdue
                  </span>
                )}
              </div>
              <p className="text-base text-muted-foreground">{application.role}</p>
            </div>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-accent transition-colors shrink-0"
              >
                Job Posting ↗
              </a>
            )}
          </div>

          {/* Tags */}
          {application.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {application.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Applied</p>
              <p className="text-sm font-semibold mt-0.5">
                {application.appliedDate
                  ? new Date(application.appliedDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Follow-up</p>
              <p className={`text-sm font-semibold mt-0.5 ${isOverdue ? "text-destructive" : ""}`}>
                {application.followUpDate
                  ? new Date(application.followUpDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interviews</p>
              <p className="text-sm font-semibold mt-0.5">
                {interviews.length > 0
                  ? `${interviews.length} round${interviews.length !== 1 ? "s" : ""} · ${passedRounds} passed`
                  : "None yet"}
                {pendingRounds > 0 && (
                  <span className="text-muted-foreground"> · {pendingRounds} pending</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="text-sm font-semibold mt-0.5">
                {new Date(application.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — main content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Notes */}
            <div className="border rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold">Notes</h2>
              {application.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {application.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
              )}
            </div>

            {/* Interview Tracker */}
            <div id="interviews" className="border rounded-xl p-5">
              <InterviewTracker
                applicationId={application.id}
                interviews={JSON.parse(JSON.stringify(interviews))}
              />
            </div>
          </div>

          {/* Right — activity */}
          <div className="lg:col-span-2">
            <div className="border rounded-xl p-5 space-y-4 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold">Activity</h2>
              <ActivityTimeline
                activities={JSON.parse(JSON.stringify(application.activities))}
              />
            </div>
          </div>

        </div>
      </div>
      <MobileNav />
    </>
  );
}
