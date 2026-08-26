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
                  Your stages are the columns on the board — drag a card between them
                  to move an application. The same stages file your interview rounds,
                  each with a <strong>round number</strong> and an <strong>outcome</strong>.
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

              <div className="space-y-3 border-t pt-4">
                <p className="text-xs font-semibold">Categories</p>
                <p className="text-xs text-muted-foreground">
                  A stage&rsquo;s category is what the numbers are built on:{" "}
                  <strong className="text-foreground">In process</strong> and{" "}
                  <strong className="text-foreground">Offer</strong> drive your interview
                  and offer rates, and <strong className="text-foreground">Closed</strong>{" "}
                  stages stop chasing follow-ups.
                </p>
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-semibold">Default stages</p>
                <p className="text-xs text-muted-foreground">
                  Wishlist, Applied, Screening, Interview, Offer and Rejected are
                  always part of your pipeline. You can recolour them, but their name
                  and category are fixed and they can&rsquo;t be hidden or deleted —
                  everything else on the list is yours to change.
                </p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-semibold">Hide vs. delete</p>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Hide</strong> takes a stage off the
                  board but leaves everything filed under it untouched — the safe way to
                  retire a stage you no longer use.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Delete</strong> is refused while
                  applications still sit in the stage. Move them first, or hide it instead.
                  Both apply to your own stages only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
