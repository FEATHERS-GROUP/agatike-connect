import { createFileRoute } from "@tanstack/react-router";
import { getTelemetryStats } from "@/api/telemetry";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, Users, Timer, Globe, PieChart as PieChartIcon, Map } from "lucide-react";
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
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];

export const Route = createFileRoute("/internal/control/admin/moderation")({
  component: TelemetryDashboard,
});

function TelemetryDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["telemetry_stats"],
    queryFn: () => getTelemetryStats(),
    refetchInterval: 10000, // refresh every 10 seconds
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const chartData = stats?.chart || [];
  const userTypes = stats?.userTypes || [];
  const topPaths = stats?.topPaths || [];
  const recentSessions = stats?.recentSessions || [];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-[#333333] pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Moderation
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#cccccc] mt-1">
            Real-time platform telemetry and active user sessions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Activity className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Active Now (5m)"
              value={stats?.activeNow || 0}
              icon={Activity}
              trend="Live heartbeat"
              isPositive={true}
            />
            <StatCard title="Total Sessions Today" value={stats?.totalToday || 0} icon={Users} />
            <StatCard
              title="Avg Session Duration"
              value={formatDuration(stats?.avgDurationSeconds || 0)}
              icon={Timer}
            />
          </div>

          {/* Chart & Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Hourly Active Users
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{
                        backgroundColor: "#1e1e1e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="users" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Types Pie Chart */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-6 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-green-500" />
                User Breakdown
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e1e1e",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Pie
                      data={userTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userTypes.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Paths Leaderboard */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5 flex flex-col h-[330px]">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 flex items-center gap-2">
                <Map className="h-4 w-4 text-indigo-500" />
                Top Pages Visited
              </h3>
              <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
                {topPaths.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No page data yet.</p>
                ) : (
                  topPaths.map((item: any, index: number) => {
                    const maxVisits = Math.max(...topPaths.map((p: any) => p.visits));
                    const percentage = Math.round((item.visits / maxVisits) * 100);

                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-4">
                            {item.path}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#333333] px-2 py-0.5 rounded-full">
                            {item.visits}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Sessions Table */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-lg p-5 overflow-hidden flex flex-col h-[400px]">
              <h3 className="text-[13px] font-semibold text-gray-700 dark:text-[#cccccc] mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                Live Sessions
              </h3>
              <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                {recentSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No recent sessions found.
                  </p>
                ) : (
                  recentSessions.map((session: any) => (
                    <div
                      key={session.sessionId}
                      className="p-3 bg-gray-50 dark:bg-[#252526] rounded-md border border-gray-100 dark:border-transparent flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-gray-500 truncate max-w-[120px]">
                          {session.sessionId}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            Date.now() - new Date(session.lastActive).getTime() < 5 * 60 * 1000
                              ? "bg-green-500/20 text-green-500"
                              : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {formatDuration(session.durationSeconds || 0)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        Path: {session.path?.replace(/^https?:\/\/[^\/]+/, "") || "/"}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {session.userType === "anonymous"
                          ? "Anonymous User"
                          : `User ID: ${session.userId.substring(0, 8)}...`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
