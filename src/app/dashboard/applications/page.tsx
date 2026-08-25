import { getApplications } from "@/lib/actions/applications";
import { getTags } from "@/lib/actions/tags";
import { getStageTypes } from "@/lib/actions/pipeline";
import { ApplicationsList } from "@/components/applications-list";

interface Props {
  searchParams: Promise<{ search?: string; stage?: string; sort?: string; tag?: string; archived?: string }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const showArchived = params.archived === "true";

  const [applications, tags, stages] = await Promise.all([
    getApplications({
      search: params.search,
      stageId: params.stage,
      sort: params.sort || "createdAt",
      tag: params.tag,
      archived: showArchived,
    }),
    getTags(),
    getStageTypes(),
  ]);

  return (
    <ApplicationsList
      applications={JSON.parse(JSON.stringify(applications))}
      availableTags={JSON.parse(JSON.stringify(tags))}
      stages={JSON.parse(JSON.stringify(stages))}
      search={params.search || ""}
      stageId={params.stage || "ALL"}
      sort={params.sort || "createdAt"}
      showArchived={showArchived}
    />
  );
}
