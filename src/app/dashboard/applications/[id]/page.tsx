import { getApplication } from "@/lib/actions/applications";
import { getInterviews } from "@/lib/actions/interviews";
import { ActivityTimeline } from "@/components/activity-timeline";
import { InterviewTracker } from "@/components/interview-tracker";
import { StatusBadge } from "@/components/status-badge";
import { InlineNoteEditor } from "@/components/inline-note-editor";
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
      <div className="max-w-5xl space-y-6 pb-16 md:pb-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/applications" className="hover:text-foreground transition-colors">
            Applications
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{application.company}</span>
        </div>

        {/* Hero */}
        <div className="border rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{application.company}</h1>
                <StatusBadge status={application.status} />
                {isOverdue && (
                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-0.5 text-xs font-medium">
                    Follow-up overdue
                  </span>
                )}
              </div>
              <p className="text-lg text-muted-foreground font-normal">{application.role}</p>
              {application.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap pt-1">
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
            </div>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-accent transition-colors shrink-0"
              >
                Job Posting ↗
              </a>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Applied</p>
              <p className="text-sm font-semibold">
                {application.appliedDate
                  ? new Date(application.appliedDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up</p>
              <p className={`text-sm font-semibold ${isOverdue ? "text-destructive" : ""}`}>
                {application.followUpDate
                  ? new Date(application.followUpDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Interviews</p>
              <p className="text-sm font-semibold">
                {interviews.length === 0
                  ? "None yet"
                  : `${interviews.length} round${interviews.length !== 1 ? "s" : ""}`}
                {passedRounds > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-normal text-xs ml-1">
                    · {passedRounds} passed
                  </span>
                )}
                {pendingRounds > 0 && (
                  <span className="text-muted-foreground font-normal text-xs ml-1">
                    · {pendingRounds} pending
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Updated</p>
              <p className="text-sm font-semibold">
                {new Date(application.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left col */}
          <div className="lg:col-span-3 space-y-5">

            {/* Notes */}
            <div className="border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Notes</h2>
              </div>
              <InlineNoteEditor
                applicationId={application.id}
                currentNotes={application.notes}
              />
            </div>

            {/* Interviews */}
            <div id="interviews" className="border rounded-xl p-5">
              <InterviewTracker
                applicationId={application.id}
                interviews={JSON.parse(JSON.stringify(interviews))}
              />
            </div>
          </div>

          {/* Right col — activity */}
          <div className="lg:col-span-2">
            <div className="border rounded-xl p-5 space-y-4 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold tracking-tight">Activity</h2>
              <ActivityTimeline
                activities={JSON.parse(JSON.stringify(application.activities))}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
