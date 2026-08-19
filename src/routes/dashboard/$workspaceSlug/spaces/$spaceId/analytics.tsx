import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceAnalytics } from "@/api/spaces";
import { Activity, TrendingUp, Users, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/analytics")({
  component: SpaceAnalyticsPage,
});

const ORANGE = "#f97316";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--card)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    color: "inherit",
  },
  itemStyle: { fontSize: "12px" },
  labelStyle: { fontWeight: "bold", marginBottom: "4px" },
  cursor: { fill: "rgba(249,115,22,0.06)" },
};

function SpaceAnalyticsPage() {
  const { spaceId } = useParams({ strict: false }) as any;

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["space_analytics", spaceId],
    queryFn: () => getSpaceAnalytics({ data: { space_id: spaceId, days: 30 } }),
    enabled: !!spaceId,
  });

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  if (!analytics)
    return <div className="p-8 text-center text-red-500 font-semibold">Failed to load analytics</div>;

  // Process data for charts
  const { space_check_ins = [], invoices = [], space_subscriptions = [] } = analytics;

  // 1. Peak Hours (Check-ins by hour of day)
  const hourCounts = new Array(24).fill(0);
  space_check_ins.forEach((c: any) => {
    const d = new Date(c.check_in_time);
    hourCounts[d.getHours()]++;
  });
  const peakHoursData = hourCounts.map((count, i) => ({
    time: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i >= 12 ? 'PM' : 'AM'}`,
    checkins: count,
  }));

  // 2. Revenue Trend (last 30 days)
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
  
  const revenueByDay = invoices.reduce((acc: any, inv: any) => {
    if (inv.status !== "paid") return acc;
    const date = inv.created_at.split("T")[0];
    acc[date] = (acc[date] || 0) + parseFloat(inv.amount || 0);
    return acc;
  }, {});

  const revenueData = last30Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: revenueByDay[date] || 0
  }));

  // 3. Subscriptions Growth
  const subsByDay = space_subscriptions.reduce((acc: any, sub: any) => {
    const date = sub.created_at.split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  let cumulativeSubs = 0;
  const growthData = last30Days.map(date => {
    cumulativeSubs += (subsByDay[date] || 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: cumulativeSubs
    };
  });

  const totalRevenue = Object.values(revenueByDay).reduce((a: any, b: any) => a + b, 0) as number;
  const totalCheckins = space_check_ins.length;
  const newSubs = space_subscriptions.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your space's performance, revenue, and check-in trends over the last 30 days.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-[#a3a3a6]">30-Day Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalRevenue.toLocaleString()}
          </p>
        </div>
        
        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-[#a3a3a6]">Total Check-ins</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalCheckins.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-[#a3a3a6]">New Memberships</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {newSubs.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Hours Chart */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-[#f97316]" />
            Peak Hours (Check-ins by Hour)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dx={-10} />
                <RechartsTooltip {...tooltipStyle as any} />
                <Bar dataKey="checkins" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-[#f97316]" />
            Revenue Trend
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dx={-10} />
                <RechartsTooltip {...tooltipStyle as any} />
                <Area type="monotone" dataKey="revenue" stroke={ORANGE} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Growth */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252526] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-[#f97316]" />
            Membership Growth (Cumulative)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} dx={-10} />
                <RechartsTooltip {...tooltipStyle as any} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
