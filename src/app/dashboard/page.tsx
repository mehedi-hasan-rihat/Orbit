import { getApplications, getApplicationStats, getKanbanData, getDueItems } from "@/lib/actions/applications";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { KanbanBoard } from "@/components/kanban-board";
import { getStageTypes } from "@/lib/actions/pipeline";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

export default async function DashboardPage() {
  const [kanbanData, recentApps, stats, stages, dueItems] = await Promise.all([
    getKanbanData(),
    getApplications(),
    getApplicationStats(),
    getStageTypes(),
    getDueItems(),
  ]);

  const boardStages = stages
    .filter((s) => s.enabled)
    .map((s) => ({ id: s.id, name: s.name, color: s.color }));

  const recentApplications = recentApps.slice(0, 5);
  const totalOnBoard = kanbanData.reduce((sum, col) => sum + col.count, 0);
  const hasDueItems = dueItems.scheduled.length > 0 || dueItems.reminders.length > 0;

  return (
    <>
      <div className="space-y-10">
        {/* Analytics */}
        <section>
          <div className="mb-4">
            <h1 className="text-2xl">Dashboard</h1>
            <p className="text-[13px] text-muted-foreground">
              Overview of your job search progress
              {stats.thisWeek > 0 && <span> · {stats.thisWeek} added this week</span>}
            </p>
          </div>
          <AnalyticsCharts stats={stats} />
        </section>

        {/* Due today — scheduled stages + overdue/today reminders only */}
        {hasDueItems && (
          <section>
            <div className="mb-3">
              <h2 className="text-xl">Due today</h2>
              <p className="text-[13px] text-muted-foreground">
                Stages and follow-ups that need your attention
              </p>
            </div>
            <div className="space-y-2">
              {dueItems.scheduled.map((item) => {
                const isPast = new Date(item.date) < new Date();
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/applications/${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 hover:bg-control transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.stageColor }} />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{item.company} — {item.role}</p>
                        <p className="text-[13px] text-muted-foreground">{item.stageName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[13px] ${isPast ? "text-destructive" : "text-foreground"}`}>
                        {new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        {new Date(item.date).getHours() !== 0 && (
                          <span className="ml-1">
                            {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{isPast ? "overdue" : "today"}</p>
                    </div>
                  </Link>
                );
              })}
              {dueItems.reminders.map((item) => {
                const isPast = new Date(item.date) < new Date();
                return (
                  <Link
                    key={item.reminderId}
                    href={`/dashboard/applications/${item.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-status-pending-bg)] bg-[var(--color-status-pending-bg)] px-4 py-3 hover:bg-[var(--color-status-pending-bg)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-[var(--color-status-pending)]" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{item.company} — {item.role}</p>
                        <p className="text-[13px] text-muted-foreground truncate">{item.title}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[13px] ${isPast ? "text-destructive" : "text-[var(--color-status-pending)]"}`}>
                        {new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{isPast ? "overdue" : "today"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Pipeline */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl">Pipeline</h2>
              <p className="text-[13px] text-muted-foreground">Drag and drop to update application status</p>
            </div>
            {totalOnBoard > 0 && (
              <Link href="/dashboard/applications" className="text-[13px] hover:underline">
                View all →
              </Link>
            )}
          </div>
          <KanbanBoard columns={JSON.parse(JSON.stringify(kanbanData))} stages={boardStages} />
        </section>

        {/* Recent Applications */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl">Recent Applications</h2>
              <p className="text-[13px] text-muted-foreground">
                Your latest {recentApplications.length} applications
              </p>
            </div>
            <Link href="/dashboard/applications" className="text-[13px] hover:underline">
              View all →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-28 border border-border rounded-xl">
              <p className="text-[15px]">No applications yet</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Add your first job application to get started
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-[13px] text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 text-[13px] text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-[13px] text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-[13px] text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-right py-3 px-4 text-[13px] text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#ffffff08] transition-colors cursor-pointer">
                      <td className="py-3 px-4">
                        <Link href={`/dashboard/applications/${app.id}`} className="hover:underline">
                          {app.company}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{app.role}</td>
                      <td className="py-3 px-4">
                        <StatusBadge application={app} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/applications/${app.id}`}
                          className="text-[13px] text-muted-foreground hover:text-foreground"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
