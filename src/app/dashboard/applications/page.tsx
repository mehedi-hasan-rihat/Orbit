import { getApplications } from "@/lib/actions/applications";
import { getTags } from "@/lib/actions/tags";
import { ApplicationsList } from "@/components/applications-list";
import { MobileNav } from "@/components/mobile-nav";

interface Props {
  searchParams: Promise<{ search?: string; status?: string; sort?: string; tag?: string; archived?: string }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const showArchived = params.archived === "true";

  const [applications, tags] = await Promise.all([
    getApplications({
      search: params.search,
      status: params.status,
      sort: params.sort || "createdAt",
      tag: params.tag,
      archived: showArchived,
    }),
    getTags(),
  ]);

  return (
    <>
      <ApplicationsList
        applications={JSON.parse(JSON.stringify(applications))}
        availableTags={JSON.parse(JSON.stringify(tags))}
        search={params.search || ""}
        status={params.status || "ALL"}
        sort={params.sort || "createdAt"}
        showArchived={showArchived}
      />
      <MobileNav />
    </>
  );
}
