import { getApplications, getApplicationStats, getFollowUps } from "@/lib/actions/applications";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { KanbanBoard } from "@/components/kanban-board";
import { FollowUps } from "@/components/follow-ups";
import { StatusBadge } from "@/components/status-badge";
import { MobileNav } from "@/components/mobile-nav";
import Link from "next/link";

export default async function DashboardPage() {
  const [applications, stats, followUps] = await Promise.all([
    getApplications(),
    getApplicationStats(),
    getFollowUps(),
  ]);

  const recentApplications = applications.slice(0, 5);

  return (
    <>
      <div className="space-y-10">
        {/* Analytics Section */}
        <section>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your job search progress
              {stats.thisWeek > 0 && (
                <span> · {stats.thisWeek} added this week</span>
              )}
            </p>
          </div>
          <AnalyticsCharts stats={stats} />
        </section>

        {/* Follow-ups Section */}
        {followUps.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Follow-ups</h2>
              <p className="text-sm text-muted-foreground">
                Upcoming and overdue follow-ups
              </p>
            </div>
            <FollowUps applications={JSON.parse(JSON.stringify(followUps))} />
          </section>
        )}

        {/* Kanban Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              Drag and drop to update application status
            </p>
          </div>
          <KanbanBoard applications={JSON.parse(JSON.stringify(applications))} />
        </section>

        {/* Recent Applications Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Recent Applications</h2>
              <p className="text-sm text-muted-foreground">
                Your latest {recentApplications.length} applications
              </p>
            </div>
            <Link
              href="/dashboard/applications"
              className="text-sm font-medium hover:underline"
            >
              View all →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-lg font-medium">No applications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first job application to get started
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Company</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{app.company}</td>
                      <td className="py-3 px-4 text-muted-foreground">{app.role}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {app.appliedDate
                          ? new Date(app.appliedDate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <MobileNav />
    </>
  );
}
