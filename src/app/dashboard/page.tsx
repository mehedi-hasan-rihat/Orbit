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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
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
              <h2 className="text-xl font-bold">Due today</h2>
              <p className="text-sm text-muted-foreground">
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
                    className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.stageColor }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.company} — {item.role}</p>
                        <p className="text-xs text-muted-foreground">{item.stageName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-medium ${isPast ? "text-destructive" : "text-primary"}`}>
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
                    className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-amber-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.company} — {item.role}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-medium ${isPast ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`}>
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
              <h2 className="text-xl font-bold">Pipeline</h2>
              <p className="text-sm text-muted-foreground">Drag and drop to update application status</p>
            </div>
            {totalOnBoard > 0 && (
              <Link href="/dashboard/applications" className="text-sm font-medium hover:underline">
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
              <h2 className="text-xl font-bold">Recent Applications</h2>
              <p className="text-sm text-muted-foreground">
                Your latest {recentApplications.length} applications
              </p>
            </div>
            <Link href="/dashboard/applications" className="text-sm font-medium hover:underline">
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
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-right py-3 px-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="py-3 px-4 font-medium">
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
                          className="text-xs text-muted-foreground hover:text-foreground"
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
