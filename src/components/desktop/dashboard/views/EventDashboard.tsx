import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DesktopHeader } from "@/components/desktop/dashboard/DesktopHeader";
import { getWorkspaceEvents } from "@/api/events";
import { getWorkspaceWallet } from "@/api/wallet";
import { getWorkspaceRecentOrders } from "@/api/products";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { formatCurrency } from "@/lib/currency";
import { format, subMonths } from "date-fns";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Ticket,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

// ── helpers ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent,
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down";
  trendLabel?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        {trend && trendLabel && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trendLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function EventDashboard() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id;
  const [activeTopTab, setActiveTopTab] = useState<"top" | "category">("top");

  const { data: rawEvents = [] } = useQuery({
    queryKey: ["workspace-events", workspaceId],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  const { data: wallet } = useQuery({
    queryKey: ["workspace-wallet", workspaceId],
    queryFn: () => getWorkspaceWallet({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["workspace-recent-orders", workspaceId],
    queryFn: () => getWorkspaceRecentOrders({ data: { workspace_id: workspaceId! } } as any),
    enabled: !!workspaceId,
  });

  // ── Derived stats ──
  const stats = useMemo(() => {
    const now = new Date();
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    const topEventsList = rawEvents.map((e: any) => {
      let sold = 0;
      let rev = 0;
      (e.event_tickets || []).forEach((t: any) => {
        sold += Number(t.sold || 0);
        rev += Number(t.sold || 0) * Number(t.cost || 0);
      });
      totalTicketsSold += sold;
      totalRevenue += rev;

      const stops = Array.isArray(e.tour_stops) ? e.tour_stops : [];
      const lastStop = stops[stops.length - 1];
      const isUpcoming = !lastStop?.date || new Date(lastStop.date) >= now;
      if (isUpcoming) upcomingCount++;
      else completedCount++;

      const avgRating = e.event_feedback_aggregate?.aggregate?.avg?.rating || 0;
      const firstStop = stops[0];
      return {
        id: e.id,
        title: e.title,
        cover: e.cover,
        location: firstStop?.location || "—",
        date: firstStop?.date,
        sold,
        rev,
        avgRating,
      };
    });

    topEventsList.sort((a, b) => b.sold - a.sold || b.avgRating - a.avgRating);
    const topEvents = topEventsList.slice(0, 5);
    const maxSold = topEvents[0]?.sold || 1;

    // Revenue by month (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      monthlyRevenue[format(d, "MMM")] = 0;
    }
    rawEvents.forEach((e: any) => {
      (e.event_tickets || []).forEach((t: any) => {
        const sold = Number(t.sold || 0);
        const cost = Number(t.cost || 0);
        if (sold > 0 && t.updated_at) {
          const m = format(new Date(t.updated_at), "MMM");
          if (monthlyRevenue[m] !== undefined) {
            monthlyRevenue[m] += sold * cost;
          }
        }
      });
    });
    // Also include orders revenue
    (orders as any[]).forEach((o: any) => {
      const m = format(new Date(o.created_at), "MMM");
      if (monthlyRevenue[m] !== undefined) {
        monthlyRevenue[m] += Number(o.amount_paid || 0);
      }
    });

    const revenueChartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // Ticket type breakdown across all events
    const typeMap: Record<string, { sold: number; rev: number }> = {};
    rawEvents.forEach((e: any) => {
      (e.event_tickets || []).forEach((t: any) => {
        const key = t.ticket_type || "Standard";
        if (!typeMap[key]) typeMap[key] = { sold: 0, rev: 0 };
        typeMap[key].sold += Number(t.sold || 0);
        typeMap[key].rev += Number(t.sold || 0) * Number(t.cost || 0);
      });
    });
    const ticketTypeData = Object.entries(typeMap)
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);

    // Recent activity from orders
    const recentActivity = (orders as any[]).slice(0, 6).map((o: any) => ({
      id: o.id,
      name: o.user?.username || o.guest_name || o.buyer_id || "Guest",
      phone: o.phone,
      product: o.product?.name,
      amount: o.amount_paid,
      event: o.product?.event?.title,
      date: o.created_at,
    }));

    return {
      totalEvents: rawEvents.length,
      upcomingCount,
      completedCount,
      totalTicketsSold,
      totalRevenue,
      topEvents,
      maxSold,
      revenueChartData,
      ticketTypeData,
      recentActivity,
    };
  }, [rawEvents, orders]);

  const accentColors = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#6366f1"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <DesktopHeader />

      {/* ── Row 1: Stat Cards ────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={stats.totalEvents}
          icon={CalendarDays}
          trend="up"
          trendLabel="vs last month"
          accent="hsl(var(--primary))"
        />
        <StatCard
          label="Tickets Sold"
          value={stats.totalTicketsSold.toLocaleString()}
          icon={Ticket}
          trend="up"
          trendLabel="vs last month"
          accent="#10b981"
        />
        <StatCard
          label="Upcoming Events"
          value={stats.upcomingCount}
          icon={Clock}
          trend="down"
          trendLabel="vs last month"
          accent="#f59e0b"
        />
        <StatCard
          label="Wallet Balance"
          value={formatCurrency(wallet?.amount || 0, activeWorkspace?.currency)}
          icon={Wallet}
          accent="#6366f1"
        />
      </section>

      {/* ── Row 2: Revenue Chart + Activity + Top Events ─────── */}
      <section className="grid lg:grid-cols-12 gap-4">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base">Revenue Breakdown</h3>
            <Link
              to="/dashboard/$workspaceSlug/planning"
              params={{ workspaceSlug: activeWorkspace?.slug as string }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              See details <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.revenueChartData} barSize={28}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v: any) => [formatCurrency(v, activeWorkspace?.currency), "Revenue"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Revenue Summary Row */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/40">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Total Revenue
              </p>
              <p className="font-bold text-sm">
                {formatCurrency(stats.totalRevenue, activeWorkspace?.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Completed Events
              </p>
              <p className="font-bold text-sm">{stats.completedCount}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base">Recent Activity</h3>
            <Link
              to="/dashboard/$workspaceSlug/products&add-ons"
              params={{ workspaceSlug: activeWorkspace?.slug as string }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              See All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentActivity.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No recent orders yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {stats.recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {(a.name || "G").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.product || "Order"}
                      {a.event ? ` · ${a.event}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">
                      {formatCurrency(a.amount || 0, activeWorkspace?.currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(a.date), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Sales Summary */}
        <div className="lg:col-span-3 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base">Ticket Summary</h3>
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {stats.totalTicketsSold.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mb-4">Tickets Sold Total</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(["top", "category"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTopTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTopTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {tab === "top" ? "Top Event" : "By Type"}
              </button>
            ))}
          </div>

          {activeTopTab === "top" ? (
            <div className="flex flex-col gap-3 flex-1">
              {stats.topEvents.slice(0, 3).map((ev, idx) => {
                const pct = stats.maxSold > 0 ? Math.round((ev.sold / stats.maxSold) * 100) : 0;
                return (
                  <div key={ev.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {ev.cover ? (
                          <img
                            src={ev.cover}
                            alt={ev.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-primary">
                            {ev.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{ev.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ev.sold.toLocaleString()} sold
                        </p>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: accentColors[idx % accentColors.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {stats.ticketTypeData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center mt-4">No ticket data</p>
              ) : (
                stats.ticketTypeData.map((t, idx) => (
                  <div key={t.type} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.sold.toLocaleString()}</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${stats.totalTicketsSold > 0 ? Math.round((t.sold / stats.totalTicketsSold) * 100) : 0}%`,
                          background: accentColors[idx % accentColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-bold">
                {formatCurrency(stats.totalRevenue, activeWorkspace?.currency)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Row 3: Upcoming Events + Overtime Chart ─────────── */}
      <section className="grid lg:grid-cols-12 gap-4">
        {/* Upcoming Events List */}
        <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base">Upcoming Events</h3>
            <Link
              to="/dashboard/$workspaceSlug/events"
              params={{ workspaceSlug: activeWorkspace?.slug as string }}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              + Create Event <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {rawEvents.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm border border-dashed border-border/60 rounded-xl">
              No events yet. Create one to get started.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rawEvents.slice(0, 4).map((e: any) => {
                const firstStop = (e.tour_stops || [])[0];
                const ticketsSold = (e.event_tickets || []).reduce(
                  (s: number, t: any) => s + Number(t.sold || 0),
                  0,
                );
                const revenue = (e.event_tickets || []).reduce(
                  (s: number, t: any) => s + Number(t.sold || 0) * Number(t.cost || 0),
                  0,
                );
                const lowestPrice = Math.min(
                  ...(e.event_tickets || []).map((t: any) => Number(t.cost || 0)),
                );
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-secondary/20 transition-all cursor-pointer group"
                  >
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {e.cover ? (
                        <img src={e.cover} alt={e.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                          {e.title?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {e.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        {firstStop?.date && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {format(new Date(firstStop.date), "MMM d")}
                          </span>
                        )}
                        {firstStop?.location && (
                          <span className="flex items-center gap-1 truncate max-w-[100px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {firstStop.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold">
                        {lowestPrice > 0
                          ? formatCurrency(lowestPrice, activeWorkspace?.currency)
                          : "Free"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ticketsSold} sold</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ticket Sales Over Time */}
        <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base">Ticket Sales Overtime</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Revenue trend over the last 6 months</p>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.revenueChartData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                formatter={(v: any) => [formatCurrency(v, activeWorkspace?.currency), "Revenue"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Legend row */}
          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Total Tickets Sold</span>
              </div>
              <p className="font-bold text-sm pl-3.5">{stats.totalTicketsSold.toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Total Revenue</span>
              </div>
              <p className="font-bold text-sm pl-3.5">
                {formatCurrency(stats.totalRevenue, activeWorkspace?.currency)}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Avg per Event</span>
              </div>
              <p className="font-bold text-sm pl-3.5">
                {formatCurrency(
                  stats.totalEvents > 0 ? stats.totalRevenue / stats.totalEvents : 0,
                  activeWorkspace?.currency,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
