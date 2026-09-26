import { getApplication } from "@/lib/actions/applications";
import { getStageTypes } from "@/lib/actions/pipeline";
import { getFollowUpsFor } from "@/lib/actions/follow-ups";
import { getTags } from "@/lib/actions/tags";
import { relativeDay, renderTimestamp } from "@/lib/relative-time";
import { ActivityTimeline } from "@/components/activity-timeline";
import { ApplicationSchedule } from "@/components/application-schedule";
import { StatusBadge } from "@/components/status-badge";
import { ApplicationActions } from "@/components/application-actions";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// One shell for every section on the page. The interview tracker used to render
// its own text-lg heading, which made its card read as a different weight of
// thing from the Notes and Activity cards beside it.
function Card({
  title,
  children,
  id,
}: {
  title?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="border rounded-xl p-5 space-y-3">
      {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "danger" | "primary";
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p
        className={
          tone === "danger"
            ? "text-sm font-semibold text-destructive"
            : tone === "primary"
              ? "text-sm font-semibold text-primary"
              : "text-sm font-semibold"
        }
      >
        {value}
      </p>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;

  const [application, stageTypes, tags, followUps] = await Promise.all([
    getApplication(id),
    getStageTypes(),
    getTags(),
    getFollowUpsFor(id),
  ]);

  if (!application) notFound();

  const now = renderTimestamp();

  const isOverdue =
    !application.closed &&
    application.followUpDate &&
    new Date(application.followUpDate) < new Date(now);

  const enabledStages = JSON.parse(JSON.stringify(stageTypes.filter((s) => s.enabled)));

  return (
    <div className="max-w-5xl space-y-6 pb-16 md:pb-0">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/applications" className="hover:text-foreground transition-colors">
          Applications
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{application.company}</span>
      </div>

      {/* Closed banner — the only place a closed application can be reopened,
          so it doesn't become a dead end once it leaves the Active tab. */}
      {application.closed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">This application is closed.</span>{" "}
            Its stage, notes, tags and interview rounds are kept exactly as they were
            {application.closedAt && <> — closed {formatDate(application.closedAt)}</>}.
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{application.company}</h1>
              <StatusBadge application={application} />
              {application.closed && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Closed
                </span>
              )}
              {application.archived && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Archived
                </span>
              )}
              {isOverdue && (
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-0.5 text-xs font-medium">
                  Reminder overdue
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
          <div className="flex flex-wrap gap-2 shrink-0">
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-accent transition-colors"
              >
                Job Description ↗
              </a>
            )}
            <ApplicationActions
              applicationId={application.id}
              stageId={application.stageId}
              stages={enabledStages}
              closed={application.closed}
              archived={application.archived}
              application={JSON.parse(JSON.stringify({
                ...application,
                stageScheduledAt: application.stageScheduledAt ?? null,
              }))}
              availableTags={JSON.parse(JSON.stringify(tags))}
            />
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t">
          <Stat
            label="Applied"
            value={application.appliedDate ? formatDate(application.appliedDate) : "—"}
            hint={application.appliedDate ? relativeDay(application.appliedDate, now) : undefined}
          />

          <Stat
            label="Stage"
            value={application.stage?.name ?? "—"}
            hint={application.stageOutcome
              ? application.stageOutcome.charAt(0) + application.stageOutcome.slice(1).toLowerCase()
              : undefined}
          />

          <Stat
            label="Scheduled"
            value={
              application.stageScheduledAt
                ? new Date(application.stageScheduledAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
            hint={
              application.stageScheduledAt
                ? (() => {
                    const d = new Date(application.stageScheduledAt);
                    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
                    return hasTime
                      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                          " · " +
                          relativeDay(application.stageScheduledAt, now)
                      : relativeDay(application.stageScheduledAt, now);
                  })()
                : undefined
            }
            tone={
              application.stageScheduledAt &&
              new Date(application.stageScheduledAt).getTime() > now
                ? "primary"
                : undefined
            }
          />

          <Stat label="Updated" value={formatDate(application.updatedAt)} />
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left col — one section: the follow-up, everything else with a date
            on it, and the notes that go with them. */}
        <div className="lg:col-span-3">
          <Card id="interviews">
            <ApplicationSchedule
              applicationId={application.id}
              followUps={JSON.parse(JSON.stringify(followUps))}
              notes={JSON.parse(JSON.stringify(application.notes_list))}
              now={now}
            />
          </Card>
        </div>

        {/* Right col — activity */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <Card title="Activity">
              <ActivityTimeline
                activities={JSON.parse(JSON.stringify(application.activities))}
              />
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
