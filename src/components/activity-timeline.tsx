"use client";

interface Activity {
  id: string;
  type: string;
  description: string;
  metadata: string | null;
  createdAt: Date;
}

const typeIcons: Record<string, string> = {
  CREATED: "🆕",
  STATUS_CHANGED: "🔄",
  NOTE_ADDED: "📝",
  FOLLOW_UP_SET: "📅",
  RESUME_UPLOADED: "📎",
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="text-sm">{typeIcons[activity.type] || "•"}</span>
            {index < activities.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
