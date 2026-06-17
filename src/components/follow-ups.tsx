"use client";

import { StatusBadge } from "./status-badge";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  followUpDate: Date | null;
}

export function FollowUps({ applications }: { applications: Application[] }) {
  const now = new Date();

  const overdue = applications.filter(
    (app) => app.followUpDate && new Date(app.followUpDate) < now
  );
  const upcoming = applications.filter(
    (app) => app.followUpDate && new Date(app.followUpDate) >= now
  );

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          No follow-ups scheduled. Add follow-up dates to your applications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {overdue.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-destructive">
            Overdue ({overdue.length})
          </h4>
          <div className="space-y-2">
            {overdue.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 border border-destructive/30 rounded-lg bg-destructive/5"
              >
                <div>
                  <p className="text-sm font-medium">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={app.status} />
                  <p className="text-xs text-destructive mt-1">
                    {app.followUpDate && new Date(app.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Upcoming ({upcoming.length})</h4>
          <div className="space-y-2">
            {upcoming.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={app.status} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {app.followUpDate && new Date(app.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
