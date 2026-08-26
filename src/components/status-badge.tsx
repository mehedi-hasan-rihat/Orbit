import { resolveStage, type StageSource } from "@/lib/stage-display";

// Renders where an application stands, using the colour the user chose for the
// stage. Pre-pipeline rows fall back to their legacy enum value.
//
// Getting offered and closing are outcomes, not stages — they live as flags on
// the application. When one is set it leads the badge, because "Got offered" is
// the answer to "how is this going", and the stage it reached is shown after it
// rather than replaced: closing deliberately keeps stageId so a card that died
// at "Technical Interview" still says so.
export interface BadgeSource extends StageSource {
  offered?: boolean;
  closed?: boolean;
}

const OFFERED = { name: "Got offered", color: "#22c55e" };
const CLOSED = { name: "Closed", color: "#6b7280" };

export function StatusBadge({ application }: { application: BadgeSource }) {
  const stage = resolveStage(application);
  const outcome = application.offered ? OFFERED : application.closed ? CLOSED : null;
  const lead = outcome ?? stage;

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

      {outcome && (
        <span className="text-xs text-muted-foreground">at {stage.name}</span>
      )}
    </span>
  );
}
