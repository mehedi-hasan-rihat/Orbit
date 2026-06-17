import { getApplication } from "@/lib/actions/applications";
import { ActivityTimeline } from "@/components/activity-timeline";
import { StatusBadge } from "@/components/status-badge";
import { MobileNav } from "@/components/mobile-nav";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <>
      <div className="space-y-8 max-w-3xl">
        {/* Back link */}
        <Link
          href="/dashboard/applications"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to applications
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{application.company}</h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-lg text-muted-foreground">{application.role}</p>
          {application.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2">
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {application.appliedDate && (
            <div className="border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Applied Date</p>
              <p className="text-sm font-medium mt-1">
                {new Date(application.appliedDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {application.followUpDate && (
            <div className="border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Follow-up Date</p>
              <p className="text-sm font-medium mt-1">
                {new Date(application.followUpDate).toLocaleDateString()}
                {new Date(application.followUpDate) < new Date() && (
                  <span className="text-destructive ml-2">Overdue</span>
                )}
              </p>
            </div>
          )}
          {application.jobUrl && (
            <div className="border rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Job Posting</p>
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium mt-1 hover:underline block truncate"
              >
                {application.jobUrl} ↗
              </a>
            </div>
          )}
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-sm font-medium mt-1">
              {new Date(application.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Notes */}
        {application.notes && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Notes</h2>
            <div className="border rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Activity</h2>
          <ActivityTimeline
            activities={JSON.parse(JSON.stringify(application.activities))}
          />
        </div>
      </div>
      <MobileNav />
    </>
  );
}
