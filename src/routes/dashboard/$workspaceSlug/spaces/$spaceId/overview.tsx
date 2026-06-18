import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { getSpaceSubscriptionsBySpaceId } from "@/api/space_subscriptions";
import {
  Users,
  TrendingUp,
  CreditCard,
  Activity,
  RefreshCw,
  UserCheck,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/overview")({
  component: SpaceOverviewPage,
});

// ─── Orange-first palette that stays visible in both themes ───
const ORANGE = "#f97316";
const AMBER = "#f59e0b";
const EMERALD = "#10b981";
const ROSE = "#f43f5e";

// Recharts can't read Tailwind CSS vars directly inside SVG, so we
// resolve them at runtime from the document root.
function cssVar(name: string, fallback = "#888") {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
}

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

function SpaceOverviewPage() {
  const { spaceId, workspaceSlug } = useParams({ strict: false }) as any;

  const { data: space, isLoading: spaceLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["workspace_subscriptions", spaceId],
    queryFn: () => getSpaceSubscriptionsBySpaceId({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  if (spaceLoading || subsLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading space overview...</div>;
  if (!space)
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;

  // ── KPI calculations ──────────────────────────────────────────────────
  const activeSubs = subscriptions.filter(
    (s: any) => s.status === "active" && s.booking_type !== "visitor",
  );
  const activeSubsCount = activeSubs.length;

  const monthlyRevenue = activeSubs.reduce((acc: number, s: any) => {
    const p = parseFloat((s.price || "0").toString().replace(/[^0-9.]/g, ""));
    return acc + (isNaN(p) ? 0 : p);
  }, 0);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const membersCount = subscriptions.reduce((acc: number, s: any) => {
    if (s.booking_type === "visitor") return acc;
    if (s.booking_type === "company" || s.team_members?.length > 0) {
      return acc + (s.team_members?.length || 0);
    }
    return acc + 1;
  }, 0);

  const visitorsCount = subscriptions.filter((s: any) => s.booking_type === "visitor").length;

  // ── KPI cards ──────────────────────────────────────────────────
  const stats = [
    {
      label: "Active Subscriptions",
      value: activeSubsCount.toString(),
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Est. Monthly Revenue",
      value: `${space.currency || "RWF"} ${formatCurrency(monthlyRevenue)}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Members",
      value: membersCount.toString(),
      icon: UserCheck,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Total Visitors",
      value: visitorsCount.toString(),
      icon: Eye,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  // ── Subscription trend ─────────────────────────────────────────
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString("default", { month: "short" });
  });

  const subscriptionTrendData = months.map((m) => ({
    name: m,
    new: 0,
    expired: 0,
    visitors: 0,
  }));

  subscriptions.forEach((s: any) => {
    const d = new Date(s.start_date || s.created_at);
    const mStr = d.toLocaleString("default", { month: "short" });
    const mIdx = months.indexOf(mStr);
    if (mIdx !== -1) {
      if (s.booking_type === "visitor") subscriptionTrendData[mIdx].visitors++;
      else if (s.status === "expired" || s.status === "cancelled")
        subscriptionTrendData[mIdx].expired++;
      else subscriptionTrendData[mIdx].new++;
    }
  });

  // ── Membership status donut ────────────────────────────────────
  let statusCounts = { Active: 0, Expired: 0, Pending: 0, Cancelled: 0, OnHold: 0 };
  subscriptions.forEach((s: any) => {
    if (s.booking_type === "visitor") return;
    if (s.status === "active") statusCounts.Active++;
    else if (s.status === "expired") statusCounts.Expired++;
    else if (s.status === "pending") statusCounts.Pending++;
    else if (s.status === "cancelled") statusCounts.Cancelled++;
    else if (s.status === "on_hold") statusCounts.OnHold++;
  });

  const membershipStatusData = [
    { name: "Active", value: statusCounts.Active, color: ORANGE },
    { name: "Expired", value: statusCounts.Expired, color: ROSE },
    { name: "Pending", value: statusCounts.Pending, color: AMBER },
    { name: "Cancelled", value: statusCounts.Cancelled, color: "#64748b" },
    { name: "On Hold", value: statusCounts.OnHold, color: "#f59e0b" }, // Using a different amber/orange shade
  ].filter((d) => d.value > 0);

  if (membershipStatusData.length === 0) {
    membershipStatusData.push({ name: "No Data", value: 1, color: "#cbd5e1" });
  }

  // ── Recent subscriptions summary ───────────────────────────────
  const planCounts: Record<string, number> = {};
  subscriptions.forEach((s: any) => {
    if (s.booking_type === "visitor") return;
    const plan = s.plan_name || "Unknown Plan";
    planCounts[plan] = (planCounts[plan] || 0) + 1;
  });
  const recentPlansData = Object.entries(planCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, subscriptions: count }));

  // ── Member Types ───────────────────────────────────────────────
  let individuals = 0;
  let companies = 0;
  subscriptions.forEach((s: any) => {
    if (s.booking_type === "visitor") return;
    if (s.booking_type === "company" || s.team_members?.length > 0) companies++;
    else individuals++;
  });
  const totalMemberTypes = individuals + companies;
  const memberTypes = [
    {
      label: "Individuals",
      count: individuals,
      pct: totalMemberTypes ? Math.round((individuals / totalMemberTypes) * 100) : 0,
      color: "bg-muted",
    },
    {
      label: "Companies/Groups",
      count: companies,
      pct: totalMemberTypes ? Math.round((companies / totalMemberTypes) * 100) : 0,
      color: "bg-orange-500",
    },
  ].filter((d) => d.count > 0);

  const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Key metrics and real-time activity for{" "}
          <span className="text-foreground font-semibold">{space.name}</span>.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-orange-500/30 transition-colors"
          >
            <div
              className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {s.label}
              </p>
              <h4 className="text-2xl font-bold mt-0.5">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Area Chart – Subscription Trends */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">Subscription Trends</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  New • Expired (Last 6 Months)
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: ORANGE }}
                  ></span>
                  New/Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: ROSE }}
                  ></span>
                  Expired
                </span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={subscriptionTrendData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ORANGE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gReturning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={EMERALD} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpired" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ROSE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={ROSE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="new"
                    name="New/Active"
                    stackId="1"
                    stroke={ORANGE}
                    fill="url(#gNew)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expired"
                    name="Expired"
                    stroke={ROSE}
                    fill="url(#gExpired)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart – Visitor Traffic */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">Visitor Traffic</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Guests brought in by members each month
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ background: AMBER }}
                ></span>
                Visitors
              </span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subscriptionTrendData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  barSize={28}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar dataKey="visitors" name="Visitors" fill={AMBER} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Subscriptions Chart */}
          <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Recent Subscriptions</h3>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                  Latest 6
                </span>
              </div>
              <Link
                to="/dashboard/$workspaceSlug/spaces/$spaceId/subscriptions"
                params={{ workspaceSlug, spaceId }}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recentPlansData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={tickStyle} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ ...tickStyle, fontSize: 12, fill: "hsl(var(--foreground))" }}
                  />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar
                    dataKey="subscriptions"
                    name="Subscriptions"
                    fill={EMERALD}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Members CTA → links to the workspace Memberships page */}
          <Link
            to="/dashboard/$workspaceSlug/memberships"
            params={{ workspaceSlug }}
            className="block group"
          >
            <div className="bg-card border border-border/60 hover:border-orange-500/40 rounded-3xl p-6 shadow-sm transition-all hover:shadow-[var(--shadow-glow)] cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Members &amp; Entities</h3>
                    <p className="text-xs text-muted-foreground">
                      Individuals, companies &amp; orgs
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground">
                View all members, visitors, billing entities and employee counts across every space
                in one place.
              </p>
            </div>
          </Link>
        </div>

        {/* RIGHT column (1/3) */}
        <div className="space-y-6">
          {/* Membership Status Donut */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-1">Membership Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Current breakdown by status</p>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {membershipStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2.5">
              {membershipStatusData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Type Breakdown */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Member Types</h3>
            {[
              { label: "Individuals", count: 3, pct: 50, color: "bg-muted" },
              { label: "Companies", count: 2, pct: 33, color: "bg-orange-500" },
              { label: "Organizations", count: 1, pct: 17, color: "bg-purple-500" },
            ].map((row, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold">{row.count}</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Active Plans Breakdown */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Active Plans</h3>
            {(space.plans || []).length > 0 ? (
              <div className="space-y-3">
                {space.plans.map((plan: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="font-medium truncate">{plan.name}</span>
                    <span className="text-orange-500 font-bold shrink-0 ml-2">
                      {space.currency} {Number(plan.price || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No plans configured.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
