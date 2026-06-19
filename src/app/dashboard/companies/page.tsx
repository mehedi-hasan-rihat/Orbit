import { getCompanyStats } from "@/lib/actions/applications";

export default async function CompaniesPage() {
  const companies = await getCompanyStats();

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-sm text-muted-foreground">
            {companies.length} companies tracked
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <p className="text-lg font-medium">No companies yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add applications to see company stats
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">Applications</th>
                  <th className="text-left py-3 px-4 font-medium">Interviews</th>
                  <th className="text-left py-3 px-4 font-medium">Offers</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                    Interview Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {companies.map((company) => (
                  <tr key={company.company} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{company.company}</td>
                    <td className="py-3 px-4 text-muted-foreground">{company.total}</td>
                    <td className="py-3 px-4 text-muted-foreground">{company.interviews}</td>
                    <td className="py-3 px-4 text-muted-foreground">{company.offers}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                      {company.total > 0
                        ? `${((company.interviews / company.total) * 100).toFixed(0)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
