import { getApplications } from "@/lib/actions/applications";
import { ApplicationsList } from "@/components/applications-list";
import { MobileNav } from "@/components/mobile-nav";

interface Props {
  searchParams: Promise<{ search?: string; status?: string; sort?: string }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const applications = await getApplications({
    search: params.search,
    status: params.status,
    sort: params.sort || "createdAt",
  });

  return (
    <>
      <ApplicationsList
        applications={JSON.parse(JSON.stringify(applications))}
        search={params.search || ""}
        status={params.status || "ALL"}
        sort={params.sort || "createdAt"}
      />
      <MobileNav />
    </>
  );
}
