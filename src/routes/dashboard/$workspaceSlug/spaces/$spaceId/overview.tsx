import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import {
  Users, TrendingUp, CreditCard, Activity,
  RefreshCw, UserCheck, Eye, ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/overview")({
  component: SpaceOverviewPage,
});

// ─── Orange-first palette that stays visible in both themes ───
const ORANGE = "#f97316";
const AMBER  = "#f59e0b";
const EMERALD = "#10b981";
const ROSE   = "#f43f5e";

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
  const { spaceId } = useParams({ strict: false }) as any;

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading space overview...</div>;
  if (!space)
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;

  // ── KPI cards ──────────────────────────────────────────────────
  const stats = [
    { label: "Active Subscriptions", value: "142", icon: Users,       color: "text-orange-500",  bg: "bg-orange-500/10"  },
    { label: "Monthly Revenue",       value: `${space.currency || "RWF"} 1.2M`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Re-using Members",      value: "89",  icon: RefreshCw,  color: "text-amber-500",   bg: "bg-amber-500/10"   },
    { label: "Total Visitors (30d)",  value: "312", icon: Eye,        color: "text-rose-500",     bg: "bg-rose-500/10"    },
  ];

  // ── Subscription trend ─────────────────────────────────────────
  const subscriptionTrendData = [
    { name: "May", new: 24, returning: 55, expired: 10, visitors: 48 },
    { name: "Jun", new: 30, returning: 65, expired: 12, visitors: 62 },
    { name: "Jul", new: 45, returning: 78, expired: 8,  visitors: 91 },
    { name: "Aug", new: 35, returning: 92, expired: 15, visitors: 75 },
    { name: "Sep", new: 50, returning: 104, expired: 20, visitors: 120 },
    { name: "Oct", new: 65, returning: 112, expired: 18, visitors: 148 },
  ];

  // ── Membership status donut ────────────────────────────────────
  const membershipStatusData = [
    { name: "Active",   value: 142, color: ORANGE    },
    { name: "Expired",  value: 35,  color: ROSE      },
    { name: "Pending",  value: 12,  color: AMBER     },
    { name: "Re-using", value: 89,  color: EMERALD   },
  ];

  // ── Recent subscriptions ───────────────────────────────────────
  const recentSubscriptions = [
    { id: "sub-1", user: "Alice Johnson",       plan: "Monthly Hot Desk",  status: "Active",  date: "Oct 12, 2026", type: "returning" },
    { id: "sub-2", user: "Mark Smith",          plan: "Day Pass",          status: "Expired", date: "Oct 11, 2026", type: "new"       },
    { id: "sub-3", user: "Jane Doe",            plan: "Dedicated Desk",    status: "Active",  date: "Oct 10, 2026", type: "returning" },
    { id: "sub-4", user: "Kigali Tech Hub",     plan: "Private Office",    status: "Active",  date: "Oct 08, 2026", type: "returning" },
    { id: "sub-5", user: "AfriTech Solutions",  plan: "Private Office",    status: "Active",  date: "Oct 05, 2026", type: "new"       },
    { id: "sub-6", user: "Hinga Collective",    plan: "Dedicated Desk",    status: "Active",  date: "Oct 02, 2026", type: "new"       },
  ];

  const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Key metrics and real-time activity for <span className="text-foreground font-semibold">{space.name}</span>.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-orange-500/30 transition-colors">
            <div className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
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
                <p className="text-xs text-muted-foreground mt-0.5">New • Re-using • Expired</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: ORANGE }}></span>New</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: EMERALD }}></span>Re-using</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: ROSE }}></span>Expired</span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={subscriptionTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={ORANGE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gReturning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={EMERALD} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpired" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={ROSE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={ROSE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="returning" name="Re-using"  stackId="1" stroke={EMERALD} fill="url(#gReturning)" strokeWidth={2} />
                  <Area type="monotone" dataKey="new"       name="New"       stackId="1" stroke={ORANGE}  fill="url(#gNew)"       strokeWidth={2} />
                  <Area type="monotone" dataKey="expired"   name="Expired"   stroke={ROSE}   fill="url(#gExpired)"   strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart – Visitor Traffic */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">Visitor Traffic</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Guests brought in by members each month</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: AMBER }}></span>Visitors
              </span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar dataKey="visitors" name="Visitors" fill={AMBER} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <h3 className="font-bold text-lg">Recent Subscriptions</h3>
              <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">Latest 6</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Customer</th>
                    <th className="px-6 py-3 font-semibold">Plan</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-foreground">{sub.user}</td>
                      <td className="px-6 py-3.5 text-muted-foreground">{sub.plan}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          sub.type === "returning"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-orange-500/10 text-orange-500"
                        }`}>
                          {sub.type === "returning" ? <RefreshCw className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {sub.type === "returning" ? "Re-using" : "New"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground text-xs">{sub.date}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          sub.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <p className="text-xs text-muted-foreground">Individuals, companies &amp; orgs</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground">
                View all members, visitors, billing entities and employee counts across every space in one place.
              </p>
            </div>
          </Link>
        </div>

        {/* RIGHT column (1/3) */}
        <div className="space-y-6">
          {/* Membership Status Donut */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-1">Membership Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Active · Re-using · Expired · Pending</p>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipStatusData}
                    cx="50%" cy="50%"
                    innerRadius={54} outerRadius={76}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {membershipStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2.5">
              {membershipStatusData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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
              { label: "Individuals",   count: 3, pct: 50,  color: "bg-muted"           },
              { label: "Companies",     count: 2, pct: 33,  color: "bg-orange-500"       },
              { label: "Organizations", count: 1, pct: 17,  color: "bg-purple-500"       },
            ].map((row, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold">{row.count}</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
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
                  <div key={i} className="flex justify-between items-center text-sm p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
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
