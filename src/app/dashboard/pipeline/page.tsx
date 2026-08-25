import { getStageTypesWithUsage } from "@/lib/actions/pipeline";
import { PipelineManager } from "@/components/pipeline-manager";
import { INTERVIEW_OUTCOMES } from "@/lib/validations";
import { outcomeDisplay } from "@/lib/outcome-display";

export default async function PipelinePage() {
  const stageTypes = await getStageTypesWithUsage();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Shape the interview process you actually go through
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PipelineManager stageTypes={JSON.parse(JSON.stringify(stageTypes))} />
          </div>

          <div className="lg:col-span-2">
            <div className="border rounded-xl p-5 space-y-5 lg:sticky lg:top-6">
              <div>
                <h3 className="text-sm font-semibold">How the pipeline works</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Every interview round is a stage: a <strong>type</strong>, a{" "}
                  <strong>round number</strong>, and an <strong>outcome</strong>. You
                  own the type list; rounds and outcomes are fixed.
                </p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <p className="text-xs font-semibold">Outcomes</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTERVIEW_OUTCOMES.map((o) => {
                    const d = outcomeDisplay(o);
                    return (
                      <span
                        key={o}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${d.className}`}
                      >
                        {d.label}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rounds left <em>Pending</em> or <em>Scheduled</em> are the ones Orbit
                  sends you reminders for.
                </p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-semibold">Disable vs. delete</p>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Disable</strong> takes a type out of
                  the picker but leaves past rounds untouched — the safe way to retire a
                  stage you no longer use.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Delete</strong> removes it for good.
                  Rounds that used it keep the name as a plain label, but they stop
                  following future renames.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
