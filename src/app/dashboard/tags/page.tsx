import { getTags } from "@/lib/actions/tags";
import { TagManager } from "@/components/tag-manager";
import { MobileNav } from "@/components/mobile-nav";

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize and filter your applications with custom labels
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Tag manager — takes main space */}
          <div className="lg:col-span-3">
            <TagManager tags={JSON.parse(JSON.stringify(tags))} />
          </div>

          {/* Use cases — sidebar */}
          <div className="lg:col-span-2">
            <div className="border rounded-xl p-5 space-y-5 lg:sticky lg:top-6">
              <div>
                <h3 className="text-sm font-semibold">How to use tags</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Create tags once, apply them to any application, filter instantly.
                </p>
              </div>

              <div className="space-y-4">
                {useCases.map((uc) => (
                  <div key={uc.title} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{uc.icon}</span>
                      <p className="text-xs font-semibold">{uc.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {uc.examples.map((ex) => (
                        <span
                          key={ex}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Tag applications as{" "}
                  <em>Referral</em> to track if referred applications convert at a higher rate than cold applies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
}

const useCases = [
  {
    icon: "🌍",
    title: "Work Style",
    examples: ["Remote", "Onsite", "Hybrid"],
  },
  {
    icon: "🔗",
    title: "Source",
    examples: ["Referral", "LinkedIn", "Company Site", "Job Board"],
  },
  {
    icon: "⭐",
    title: "Priority",
    examples: ["High Priority", "Dream Company", "Backup"],
  },
  {
    icon: "🏢",
    title: "Company Type",
    examples: ["Startup", "Enterprise", "FAANG", "Agency"],
  },
  {
    icon: "💼",
    title: "Job Type",
    examples: ["Full-time", "Contract", "Internship", "Part-time"],
  },
];
