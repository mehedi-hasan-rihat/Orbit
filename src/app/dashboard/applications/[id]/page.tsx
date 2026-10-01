import { getApplication } from "@/lib/actions/applications";
import { getStageTypes } from "@/lib/actions/pipeline";
import { getRemindersFor } from "@/lib/actions/reminders";
import { getTags } from "@/lib/actions/tags";
import { relativeDay, renderTimestamp } from "@/lib/relative-time";
import { ActivityTimeline } from "@/components/activity-timeline";
import { ApplicationSchedule } from "@/components/application-schedule";
import { StatusBadge } from "@/components/status-badge";
import { ApplicationActions } from "@/components/application-actions";
import { outcomeDisplay } from "@/lib/outcome-display";
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

  const [application, stageTypes, tags, reminders] = await Promise.all([
    getApplication(id),
    getStageTypes(),
    getTags(),
    getRemindersFor(id),
  ]);

  if (!application) notFound();

  const now = renderTimestamp();

  // Highlight when the stage is scheduled today or is overdue.
  const scheduledDate = application.stageScheduledAt ? new Date(application.stageScheduledAt) : null;
  const isScheduledOpen = scheduledDate &&
    !application.closed &&
    (application.stageOutcome === null || application.stageOutcome === "SCHEDULED" || application.stageOutcome === "ASSIGNED");
  const scheduledIsToday = isScheduledOpen &&
    scheduledDate.getTime() <= now + 24 * 60 * 60 * 1000 &&
    scheduledDate.getTime() > now;
  const scheduledIsOverdue = isScheduledOpen && scheduledDate.getTime() < now;

  const enabledStages = JSON.parse(JSON.stringify(stageTypes.filter((s) => s.enabled)));

  const outcome = outcomeDisplay(application.stageOutcome);
  const hasOutcomeAccent = !!application.stageOutcome && !application.closed;
  const accentColor = hasOutcomeAccent ? outcome?.color : null;

  // Derived label for the date column in the stats strip.
  const dateStatLabel =
    !application.stageOutcome || application.stageOutcome === "SCHEDULED" || application.stageOutcome === "ASSIGNED"
      ? "Scheduled"
      : "Stage Date";

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

      {/* Closed banner */}
      {application.closed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">This application is closed.</span>{" "}
            Its stage, notes, tags and interview rounds are kept exactly as they were
            {application.closedAt && <> — closed {formatDate(application.closedAt)}</>}.
          </p>
        </div>
      )}

      {/* Scheduled today banner */}
      {scheduledIsToday && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <p className="text-sm">
            <span className="font-medium">{application.stage?.name} today</span>
            {scheduledDate && (
              <span className="text-muted-foreground ml-1.5">
                at {scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Scheduled overdue banner */}
      {scheduledIsOverdue && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
          <p className="text-sm">
            <span className="font-medium text-destructive">{application.stage?.name} overdue</span>
            <span className="text-muted-foreground ml-1.5">
              was scheduled for {scheduledDate && formatDate(scheduledDate)}
            </span>
          </p>
        </div>
      )}

      {/* Hero */}
      <div
        className="border rounded-xl p-6"
        style={accentColor ? {
          borderColor: `${accentColor}40`,
          background: `linear-gradient(to bottom right, ${accentColor}08, transparent)`,
        } : undefined}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{application.company}</h1>
              <StatusBadge application={application} />
              {/* Stage outcome badge — shows when a scheduling stage has a set outcome */}
              {application.stageOutcome && !application.closed && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${outcome.className}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: outcome.color }}
                  />
                  {outcome.label}
                </span>
              )}
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
              ? <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${outcome.className}`}
                >
                  {outcome.label}
                </span>
              : undefined}
          />

          <Stat
            label={dateStatLabel}
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
              // Future scheduled dates get primary accent; past outcome dates are neutral
              application.stageScheduledAt &&
              (!application.stageOutcome || application.stageOutcome === "SCHEDULED") &&
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
              followUps={JSON.parse(JSON.stringify(reminders))}
              notes={JSON.parse(JSON.stringify(application.notes))}
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
