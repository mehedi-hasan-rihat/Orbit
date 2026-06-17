import { getTags } from "@/lib/actions/tags";
import { TagManager } from "@/components/tag-manager";
import { MobileNav } from "@/components/mobile-nav";

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-sm text-muted-foreground">
            Organize your applications with custom labels
          </p>
        </div>

        <TagManager tags={JSON.parse(JSON.stringify(tags))} />

        {/* Use cases */}
        <div className="space-y-4 border rounded-lg p-5">
          <h2 className="text-sm font-semibold">How to use tags</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Work Style</p>
              <p className="text-muted-foreground">Remote, Onsite, Hybrid</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Source</p>
              <p className="text-muted-foreground">Referral, LinkedIn, Company Site</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Priority</p>
              <p className="text-muted-foreground">High Priority, Dream Company, Backup</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Company Type</p>
              <p className="text-muted-foreground">Startup, Enterprise, FAANG, Agency</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Job Type</p>
              <p className="text-muted-foreground">Full-time, Contract, Internship</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Track Patterns</p>
              <p className="text-muted-foreground">Compare referral vs cold apply success rates</p>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
