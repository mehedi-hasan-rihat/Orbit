import { resolveStage, type StageSource } from "@/lib/stage-display";

// Renders whatever stage an application sits in, using the colour the user
// chose for it. Pre-pipeline rows fall back to their legacy enum value.
export function StatusBadge({ application }: { application: StageSource }) {
  const stage = resolveStage(application);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${stage.color}1f`,
        color: stage.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: stage.color }}
      />
      {stage.name}
    </span>
  );
}
