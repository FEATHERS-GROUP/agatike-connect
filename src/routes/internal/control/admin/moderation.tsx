import { createFileRoute } from "@tanstack/react-router";
import { getTelemetryStats } from "@/api/telemetry";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  Users,
  Timer,
  Globe,
  Map,
  TrendingUp,
  TrendingDown,
  Minus,
  UserCheck,
  Building2,
  Ghost,
  Zap,
  BarChart3,
  RefreshCw,
  Eye,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#eab308"];

export const Route = createFileRoute("/internal/control/admin/moderation")({
  component: TelemetryDashboard,
});

function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

function TrendBadge({
  current,
  previous,
  label,
}: {
  current: number;
  previous: number;
  label?: string;
}) {
  if (previous === 0 && current === 0)
    return <span className="text-xs text-gray-400">No data</span>;
  const pct = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const isUp = pct > 0;
  const isFlat = pct === 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
        isFlat
          ? "bg-gray-100 dark:bg-[#2a2a2a] text-gray-500"
          : isUp
            ? "bg-green-500/10 text-green-500"
            : "bg-red-500/10 text-red-500"
      }`}
    >
      {isFlat ? (
        <Minus className="h-2.5 w-2.5" />
      ) : isUp ? (
        <TrendingUp className="h-2.5 w-2.5" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5" />
      )}
      {isFlat ? "Flat" : `${isUp ? "+" : ""}${pct}%`}
      {label && <span className="ml-0.5 opacity-70">{label}</span>}
    </span>
  );
}

const CustomTooltipStyle = {
  backgroundColor: "#1e1e1e",
  border: "1px solid #333",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#ccc",
};

function TelemetryDashboard() {
  const {
    data: stats,
    isLoading,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["telemetry_stats"],
    queryFn: () => getTelemetryStats(),
    refetchInterval: 30000,
  });

  const hourlyComparison = stats?.hourlyComparison || [];
  const dailyComparison = stats?.dailyComparison || [];
  const userTypes = stats?.userTypes || [];
  const topPaths = stats?.topPaths || [];
  const recentSessions = stats?.recentSessions || [];
  const userBreakdown = stats?.userBreakdown || { users: 0, organizers: 0, anonymous: 0 };

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "—";

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-[#333333] pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Moderation &amp; Telemetry
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#cccccc] mt-1">
            Real-time platform analytics — all users, organizers &amp; anonymous visitors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-[#333333] hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Activity className="h-10 w-10 animate-spin text-[#f97316]" />
          <p className="text-sm text-gray-500">Loading telemetry data…</p>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Active Now */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 col-span-2 md:col-span-1 flex flex-col gap-1 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Live Now</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.activeNow ?? 0}
              </span>
              <span className="text-[11px] text-gray-400">Active in last 5 min</span>
            </div>

            {/* Sessions Today */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Sessions Today</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.totalToday ?? 0}
              </span>
              <TrendBadge
                current={stats?.totalToday ?? 0}
                previous={stats?.totalYesterday ?? 0}
                label="vs yesterday"
              />
            </div>

            {/* Unique Visitors */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Unique Visitors
              </span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.uniqueVisitorsToday ?? 0}
              </span>
              <TrendBadge
                current={stats?.uniqueVisitorsToday ?? 0}
                previous={stats?.uniqueVisitorsYesterday ?? 0}
                label="vs yesterday"
              />
            </div>

            {/* Avg Duration */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Avg Duration</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatDuration(stats?.avgDurationSeconds ?? 0)}
              </span>
              <span className="text-[11px] text-gray-400">per session today</span>
            </div>

            {/* Users */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Users</span>
              <span className="text-3xl font-bold text-[#3b82f6] mt-1">{userBreakdown.users}</span>
              <span className="text-[11px] text-gray-400">registered users today</span>
            </div>

            {/* Organizers */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Organizers</span>
              <span className="text-3xl font-bold text-[#f97316] mt-1">
                {userBreakdown.organizers}
              </span>
              <span className="text-[11px] text-gray-400">organizer sessions today</span>
            </div>
          </div>

          {/* Secondary stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex items-center gap-3">
              <Ghost className="h-8 w-8 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Anonymous</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {userBreakdown.anonymous}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Bounce Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats?.bounceRate ?? 0}%
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Yesterday Sessions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalYesterday ?? 0}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-4 flex items-center gap-3">
              <Eye className="h-8 w-8 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Yesterday Visitors</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats?.uniqueVisitorsYesterday ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* ── 7-Day Trend (stacked area) ── */}
          <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#f97316]" />
              7-Day Session Trend — Users vs Organizers vs Anonymous
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyComparison}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOrgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAnon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={CustomTooltipStyle}
                    cursor={{ stroke: "#555", strokeWidth: 1 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="#3b82f6"
                    fill="url(#gradUsers)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="organizers"
                    name="Organizers"
                    stroke="#f97316"
                    fill="url(#gradOrgs)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="anonymous"
                    name="Anonymous"
                    stroke="#8b5cf6"
                    fill="url(#gradAnon)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Today vs Yesterday Hourly + User Donut ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today vs Yesterday Hourly */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Hourly Visitors — Today vs Yesterday
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyComparison}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      stroke="#888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={3}
                    />
                    <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={CustomTooltipStyle}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    />
                    <Bar
                      dataKey="today"
                      name="Today"
                      fill="#f97316"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={14}
                    />
                    <Bar
                      dataKey="yesterday"
                      name="Yesterday"
                      fill="#374151"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Type Donut */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Session Breakdown
              </h3>
              {userTypes.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-sm text-gray-400">
                  No data yet
                </div>
              ) : (
                <>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip contentStyle={CustomTooltipStyle} />
                        <Pie
                          data={userTypes}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {userTypes.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2">
                    {userTypes.map((t: any, i: number) => (
                      <div key={t.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-gray-600 dark:text-gray-300">{t.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {t.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── 7-Day Sessions Total LineChart + Top Pages ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total sessions line */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-6 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                Total Daily Sessions — Last 7 Days
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyComparison}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Total Sessions"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#10b981" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5 flex flex-col">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 flex items-center gap-2">
                <Map className="h-4 w-4 text-indigo-500" />
                Top Pages Today
              </h3>
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {topPaths.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No page data yet.</p>
                ) : (
                  topPaths.map((item: any, index: number) => {
                    const maxVisits = Math.max(...topPaths.map((p: any) => p.visits));
                    const pct = Math.round((item.visits / maxVisits) * 100);
                    return (
                      <div key={index} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span
                            className="font-medium text-gray-700 dark:text-gray-300 truncate pr-3 max-w-[160px]"
                            title={item.path}
                          >
                            {item.path}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white shrink-0">
                            {item.visits}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Live Sessions Table ── */}
          <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Live &amp; Recent Sessions
              <span className="ml-auto text-[11px] font-normal text-gray-400">
                {recentSessions.length} sessions shown
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#333]">
                    {["Session ID", "Type", "Path", "Duration", "Last Active", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="pb-2 pr-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#252526]">
                  {recentSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No sessions found.
                      </td>
                    </tr>
                  ) : (
                    recentSessions.map((session: any) => {
                      const isActive =
                        Date.now() - new Date(session.lastActive).getTime() < 5 * 60 * 1000;
                      const cleanPath = session.path?.replace(/^https?:\/\/[^/]+/, "") || "/";
                      const typeColor =
                        session.userType === "organizer"
                          ? "bg-[#f97316]/10 text-[#f97316]"
                          : session.userType === "anonymous"
                            ? "bg-gray-100 dark:bg-[#2a2a2a] text-gray-500"
                            : "bg-blue-500/10 text-blue-500";

                      return (
                        <tr
                          key={session.sessionId}
                          className="hover:bg-gray-50 dark:hover:bg-[#252526] transition-colors"
                        >
                          <td className="py-2.5 pr-4 font-mono text-gray-500 truncate max-w-[100px]">
                            {session.sessionId}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor}`}
                            >
                              {session.userType === "organizer"
                                ? "Organizer"
                                : session.userType === "anonymous"
                                  ? "Anonymous"
                                  : "User"}
                            </span>
                          </td>
                          <td
                            className="py-2.5 pr-4 text-gray-600 dark:text-gray-300 truncate max-w-[200px]"
                            title={cleanPath}
                          >
                            {cleanPath}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {formatDuration(session.durationSeconds || 0)}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-400 whitespace-nowrap">
                            {new Date(session.lastActive).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                isActive
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-400"
                              }`}
                            >
                              {isActive ? "● Active" : "Idle"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
