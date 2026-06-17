"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatsProps {
  stats: {
    total: number;
    statusCounts: {
      WISHLIST: number;
      APPLIED: number;
      INTERVIEW: number;
      OFFER: number;
      REJECTED: number;
    };
    interviewRate: number;
    offerRate: number;
  };
}

const COLORS = {
  WISHLIST: "#6b7280",
  APPLIED: "#3b82f6",
  INTERVIEW: "#f59e0b",
  OFFER: "#22c55e",
  REJECTED: "#ef4444",
};

export function AnalyticsCharts({ stats }: StatsProps) {
  const barData = [
    { name: "Wishlist", value: stats.statusCounts.WISHLIST, fill: COLORS.WISHLIST },
    { name: "Applied", value: stats.statusCounts.APPLIED, fill: COLORS.APPLIED },
    { name: "Interview", value: stats.statusCounts.INTERVIEW, fill: COLORS.INTERVIEW },
    { name: "Offer", value: stats.statusCounts.OFFER, fill: COLORS.OFFER },
    { name: "Rejected", value: stats.statusCounts.REJECTED, fill: COLORS.REJECTED },
  ];

  const pieData = barData.filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Interviews</p>
          <p className="text-2xl font-bold">{stats.statusCounts.INTERVIEW}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Interview Rate</p>
          <p className="text-2xl font-bold">{stats.interviewRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Offer Rate</p>
          <p className="text-2xl font-bold">{stats.offerRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts */}
      {stats.total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">Applications by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg font-medium">No data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add some applications to see your analytics
          </p>
        </div>
      )}
    </div>
  );
}
