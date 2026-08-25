"use client";

import { useState, useEffect } from "react";
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

interface StageCount {
  id: string;
  name: string;
  color: string;
  category: string;
  value: number;
}

interface StatsProps {
  stats: {
    total: number;
    // One entry per stage in the user's pipeline, in their own order.
    stageCounts: StageCount[];
    interviewing: number;
    offers: number;
    interviewRate: number;
    offerRate: number;
    thisWeek: number;
  };
}

export function AnalyticsCharts({ stats }: StatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stages with nothing in them are dropped from the bar chart too — with a
  // fully custom pipeline the axis would otherwise fill with empty columns.
  const barData = stats.stageCounts
    .filter((s) => s.value > 0)
    .map((s) => ({ name: s.name, value: s.value, fill: s.color }));

  const pieData = barData;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Interviews</p>
          <p className="text-2xl font-bold">{stats.interviewing}</p>
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
      {stats.total > 0 && mounted ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">Applications by Stage</h3>
            <div className="h-64 min-h-[16rem] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
            <h3 className="text-sm font-medium">Stage Distribution</h3>
            <div className="h-64 min-h-[16rem] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
