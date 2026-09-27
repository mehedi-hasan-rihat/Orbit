import { resolveStage, type StageSource } from "@/lib/stage-display";

// Renders where an application stands using the stage's colour.
// Closed applications show a "Closed" badge but preserve the stage name after it,
// so a card that died at "Technical Interview" still shows that context.
export interface BadgeSource extends StageSource {
  closed?: boolean;
}

const CLOSED = { name: "Closed", color: "#6b7280" };

export function StatusBadge({ application }: { application: BadgeSource }) {
  const stage = resolveStage(application);
  const lead = application.closed ? CLOSED : stage;

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: `${lead.color}1f`, color: lead.color }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: lead.color }}
        />
        {lead.name}
      </span>

      {application.closed && (
        <span className="text-xs text-muted-foreground">at {stage.name}</span>
      )}
    </span>
  );
}
