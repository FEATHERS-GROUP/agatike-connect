import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  DollarSign,
  Film,
  BarChart3,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/analytics")({
  component: CinemaAnalyticsPage,
});

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CINEMA_STATS = [
  {
    id: "c1",
    name: "Century Cinema",
    city: "Kigali",
    revenue: 48_600_000,
    tickets: 4860,
    attendance_rate: 78,
    movies_showing: 5,
    currency: "RWF",
    trend: +12,
  },
  {
    id: "c2",
    name: "Canal Olympia",
    city: "Kigali",
    revenue: 22_400_000,
    tickets: 2240,
    attendance_rate: 61,
    movies_showing: 3,
    currency: "RWF",
    trend: +4,
  },
];

const MONTHLY_DATA = [
  { month: "Jan", revenue: 8_200_000, tickets: 820 },
  { month: "Feb", revenue: 9_100_000, tickets: 910 },
  { month: "Mar", revenue: 11_500_000, tickets: 1150 },
  { month: "Apr", revenue: 10_800_000, tickets: 1080 },
  { month: "May", revenue: 13_200_000, tickets: 1320 },
  { month: "Jun", revenue: 18_300_000, tickets: 1830 },
];

const TOP_MOVIES = [
  {
    title: "Oppenheimer",
    cinema: "Century Cinema",
    tickets: 1820,
    revenue: 18_200_000,
    currency: "RWF",
  },
  { title: "Barbie", cinema: "Canal Olympia", tickets: 1240, revenue: 12_400_000, currency: "RWF" },
  {
    title: "Top Gun: Maverick",
    cinema: "Century Cinema",
    tickets: 980,
    revenue: 9_800_000,
    currency: "RWF",
  },
  {
    title: "The Batman",
    cinema: "Century Cinema",
    tickets: 860,
    revenue: 8_600_000,
    currency: "RWF",
  },
  {
    title: "Black Panther",
    cinema: "Canal Olympia",
    tickets: 720,
    revenue: 7_200_000,
    currency: "RWF",
  },
];

const TOTAL_REVENUE = CINEMA_STATS.reduce((a, c) => a + c.revenue, 0);
const TOTAL_TICKETS = CINEMA_STATS.reduce((a, c) => a + c.tickets, 0);
const AVG_ATTENDANCE = Math.round(
  CINEMA_STATS.reduce((a, c) => a + c.attendance_rate, 0) / CINEMA_STATS.length,
);

const BAR_MAX = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

const RANGES = ["Last 7 days", "Last 30 days", "Last 6 months", "This year"];

// ─── Component ────────────────────────────────────────────────────────────────

function CinemaAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("This Month");
  const { activeWorkspace } = useWorkspace();
  const workspaceCurrency = activeWorkspace?.currency || activeWorkspace?.wallet?.currency || "RWF";
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  const TOTAL_REVENUE = CINEMA_STATS.reduce((acc, c) => acc + c.revenue, 0);
  const TOTAL_TICKETS = CINEMA_STATS.reduce((a, c) => a + c.tickets, 0);

  const summaryCards = [
    {
      label: "Total Revenue",
      value: `${workspaceCurrency} ` + (TOTAL_REVENUE / 1_000_000).toFixed(1) + "M",
      sub: "Across all cinemas",
      icon: DollarSign,
      trend: "+9%",
      up: true,
      color: "from-violet-500/20 to-purple-500/5",
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
    },
    {
      label: "Total Tickets Sold",
      value: TOTAL_TICKETS.toLocaleString(),
      sub: "All venues combined",
      icon: Ticket,
      trend: "+7%",
      up: true,
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Avg. Attendance Rate",
      value: AVG_ATTENDANCE + "%",
      sub: "Seat fill rate",
      icon: Users,
      trend: "+3%",
      up: true,
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Active Movies",
      value: CINEMA_STATS.reduce((a, c) => a + c.movies_showing, 0).toString(),
      sub: "Currently showing",
      icon: Film,
      trend: "-1",
      up: false,
      color: "from-orange-500/20 to-orange-500/5",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground mt-1">
              Revenue and attendance overview across all cinemas.
            </p>
          </div>

          {/* Date range picker */}
          <div className="relative">
            <Button
              variant="outline"
              className="gap-2 rounded-xl h-10 px-4"
              onClick={() => setShowRangeMenu((p) => !p)}
            >
              <Calendar className="h-4 w-4" />
              {range}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {showRangeMenu && (
              <div className="absolute right-0 top-12 z-10 w-48 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                      r === range ? "font-semibold text-primary" : ""
                    }`}
                    onClick={() => {
                      setRange(r);
                      setShowRangeMenu(false);
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`relative bg-gradient-to-br ${card.color} border border-border/50 rounded-2xl p-5 overflow-hidden`}
            >
              <div className={`inline-flex p-2 rounded-xl ${card.iconBg} mb-3`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              <div className="flex items-center gap-1 mt-2">
                {card.up ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                )}
                <span
                  className={`text-xs font-semibold ${card.up ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {card.trend}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Monthly Revenue</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              All cinemas combined · {workspaceCurrency}
            </span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {MONTHLY_DATA.map((d) => {
              const pct = (d.revenue / BAR_MAX) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    className="w-full relative flex flex-col justify-end"
                    style={{ height: "160px" }}
                  >
                    <div
                      className="w-full rounded-xl bg-primary/80 group-hover:bg-primary transition-all duration-300 relative"
                      style={{ height: `${pct}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                        {(d.revenue / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Per-Cinema Breakdown */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-5">Per Cinema Breakdown</h3>
            <div className="space-y-5">
              {CINEMA_STATS.map((cinema) => {
                const revPct = (cinema.revenue / TOTAL_REVENUE) * 100;
                return (
                  <div key={cinema.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="font-semibold text-sm">{cinema.name}</p>
                        <p className="text-xs text-muted-foreground">{cinema.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {workspaceCurrency} {(cinema.revenue / 1_000_000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cinema.tickets.toLocaleString()} tickets
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${revPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {revPct.toFixed(0)}% of total revenue
                      </span>
                      <span
                        className={`text-xs font-semibold ${cinema.trend > 0 ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {cinema.trend > 0 ? "+" : ""}
                        {cinema.trend}% MoM
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Movies */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-5">Top Movies by Revenue</h3>
            <div className="space-y-3">
              {TOP_MOVIES.map((movie, i) => (
                <div
                  key={movie.title}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition-colors"
                >
                  <span className="text-lg font-black text-muted-foreground/40 w-6 text-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{movie.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{movie.cinema}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">
                      {formatCurrency(movie.revenue, movie.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {movie.tickets.toLocaleString()} tickets
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Rate Cards */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-5">Attendance Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CINEMA_STATS.map((cinema) => (
              <div
                key={cinema.id}
                className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/40"
              >
                <div className="relative h-16 w-16 shrink-0">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-secondary"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeDasharray={`${(cinema.attendance_rate / 100) * 87.96} 87.96`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {cinema.attendance_rate}%
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{cinema.name}</p>
                  <p className="text-xs text-muted-foreground">{cinema.city}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cinema.movies_showing} movies · {cinema.tickets.toLocaleString()} tickets sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
