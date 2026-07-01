import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Film,
  MapPin,
  Ticket,
  TrendingUp,
  Users,
  Loader2,
  Tag,
  Calendar,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";
import { getCinemaStats, getCinemaBookings, getCinemaChartData } from "@/api/cinema_bookings";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/overview")({
  component: CinemaOverview,
});

function CinemaOverview() {
  const { cinemaId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();
  const workspaceCurrency = activeWorkspace?.currency || activeWorkspace?.wallet?.currency || "RWF";

  const [chartFilter, setChartFilter] = useState("This Week");
  const [showChartFilter, setShowChartFilter] = useState(false);

  const { data: cinema, isLoading } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } } as any),
    enabled: !!cinemaId,
  });

  const { data: stats } = useQuery({
    queryKey: ["cinema_stats", cinemaId],
    queryFn: () => getCinemaStats({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const { data: recentBookings = [] } = useQuery({
    queryKey: ["cinema_bookings", cinemaId, { limit: 5 }],
    queryFn: () => getCinemaBookings({ data: { cinema_id: cinemaId, limit: 5 } }),
    enabled: !!cinemaId,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["cinema_all_bookings", cinemaId],
    queryFn: () => getCinemaChartData({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  // Chart Logic
  const chartData = useMemo(() => {
    const dataMap = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let labels: string[] = [];
    if (chartFilter === "This Week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Using local string formats to avoid UTC shift bugs
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const label = d.toLocaleDateString(undefined, { weekday: "short" });
        labels.push(key);
        dataMap.set(key, { label, value: 0 });
      }
    } else if (chartFilter === "This Month") {
      for (let i = 3; i >= 0; i--) {
        const key = `Week ${4 - i}`;
        labels.push(key);
        dataMap.set(key, { label: key, value: 0 });
      }
    } else if (chartFilter === "This Year") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleDateString(undefined, { month: "short" });
        if (!labels.includes(key)) labels.push(key);
        dataMap.set(key, { label, value: 0 });
      }
    }

    allBookings.forEach((b: any) => {
      const d = new Date(b.created_at);
      let key = "";
      if (chartFilter === "This Week") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      } else if (chartFilter === "This Month") {
        const diffTime = Math.abs(today.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 28) {
          const weekOffset = 3 - Math.floor((diffDays - 1) / 7);
          key = `Week ${weekOffset + 1}`;
        }
      } else if (chartFilter === "This Year") {
        if (
          d.getFullYear() === today.getFullYear() ||
          (d.getFullYear() === today.getFullYear() - 1 && d.getMonth() > today.getMonth())
        ) {
          key = `${d.getFullYear()}-${d.getMonth()}`;
        }
      }

      if (key && dataMap.has(key)) {
        const existing = dataMap.get(key);
        existing.value += b.total_price || 0;
        dataMap.set(key, existing);
      }
    });

    return Array.from(dataMap.values());
  }, [allBookings, chartFilter]);

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-lg">Cinema not found.</p>
      </div>
    );
  }

  const now = new Date();

  // Calculate unique movies from schedules
  // "Now Showing" should strictly be movies playing RIGHT NOW.
  const activeSchedules = (cinema.schedules || []).filter((s: any) => {
    if (!s.start_time) return false;
    const showStart = new Date(`${s.show_date}T${s.start_time}`);
    // If end_time is missing, assume a 2.5 hour duration
    const showEnd = s.end_time
      ? new Date(`${s.show_date}T${s.end_time}`)
      : new Date(showStart.getTime() + 2.5 * 60 * 60 * 1000);

    // Movie is playing right now if the current time is between start and end
    return now >= showStart && now <= showEnd;
  });

  const upcomingSchedules = (cinema.schedules || [])
    .filter((s: any) => {
      if (!s.start_time) return false;
      const showStart = new Date(`${s.show_date}T${s.start_time}`);
      const isToday =
        showStart.getFullYear() === now.getFullYear() &&
        showStart.getMonth() === now.getMonth() &&
        showStart.getDate() === now.getDate();
      return showStart > now && isToday;
    })
    .sort((a: any, b: any) => {
      const aStart = new Date(`${a.show_date}T${a.start_time}`);
      const bStart = new Date(`${b.show_date}T${b.start_time}`);
      return aStart.getTime() - bStart.getTime();
    });

  const activeMoviesMap = new Map();
  (cinema.schedules || []).forEach((s: any) => {
    // For the overall stats "Active Movies", we count any future schedule
    const timeStr = s.end_time || s.start_time || "00:00:00";
    if (new Date(`${s.show_date}T${timeStr}`) >= now) {
      if (s.movie && !activeMoviesMap.has(s.movie.id)) {
        activeMoviesMap.set(s.movie.id, s.movie);
      }
    }
  });
  const activeMoviesCount = activeMoviesMap.size;

  // We will display schedules directly rather than deduping by movie
  // so we can show specific screens and times.
  const liveSchedules = activeSchedules.slice(0, 10);
  const nextSchedules = upcomingSchedules.slice(0, 10);

  const STATS = [
    {
      label: "Tickets Sold (Today)",
      value: Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
        stats?.today_quantity || 0,
      ),
      icon: Ticket,
      trend: "Live",
    },
    { label: "Active Movies", value: activeMoviesCount.toString(), icon: Film, trend: "Current" },
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.total_revenue || 0, workspaceCurrency, true),
      icon: TrendingUp,
      trend: "All time",
    },
    {
      label: "Attendees",
      value: Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
        stats?.total_quantity || 0,
      ),
      icon: Users,
      trend: "Total",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative w-full h-[250px] md:h-[300px] rounded-3xl overflow-hidden shadow-sm">
        <div className="absolute inset-0">
          <img
            src={
              cinema.cover_url ||
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600"
            }
            alt={cinema.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 text-white">
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold w-fit mb-3 backdrop-blur-md">
                <Film className="h-4 w-4" />
                Active Cinema
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-md">
                {cinema.name}
              </h1>
              <div className="flex items-center gap-4 font-medium text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{cinema.city}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="flex items-center gap-1.5">
                  <Film className="h-4 w-4" />
                  <span>{cinema.screens?.length || 0} screens</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Revenue Graph Card */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">
                Showing sales data for {chartFilter.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 px-4 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
              onClick={() => setShowChartFilter((p) => !p)}
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {chartFilter}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {showChartFilter && (
              <div className="absolute right-0 top-12 z-10 w-40 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden">
                {["This Week", "This Month", "This Year"].map((r) => (
                  <button
                    key={r}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                      r === chartFilter ? "font-semibold text-primary" : ""
                    }`}
                    onClick={() => {
                      setChartFilter(r);
                      setShowChartFilter(false);
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-end gap-2 sm:gap-4 h-48 md:h-56 mt-4">
          {chartData.map((d: any) => {
            const pct = (d.value / maxChartValue) * 100;
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-3 group">
                <div
                  className="w-full relative flex flex-col justify-end"
                  style={{ height: "100%" }}
                >
                  <div
                    className="w-full rounded-xl bg-primary/60 group-hover:bg-primary transition-all duration-500 relative"
                    style={{ height: `${pct || 2}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap z-10 shadow-lg pointer-events-none">
                      {formatCurrency(d.value, workspaceCurrency, true)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-medium truncate w-full text-center">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Now */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-4">Live Now</h3>
          {liveSchedules.length === 0 ? (
            <div className="flex-1 text-center py-8 bg-secondary/10 rounded-2xl border border-border/40 flex flex-col items-center justify-center">
              <Film className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">No movies are currently playing.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {liveSchedules.map((schedule: any) => (
                <div
                  key={schedule.id}
                  className="min-w-[140px] max-w-[140px] shrink-0 snap-start space-y-2"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-secondary border border-border/40 shadow-sm relative">
                    <img
                      src={
                        schedule.movie?.cover_url ||
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400"
                      }
                      alt={schedule.movie?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                      Playing
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg text-center truncate shadow-sm border border-white/10">
                      {schedule.screen?.name || "Screen 1"}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm truncate" title={schedule.movie?.title}>
                      {schedule.movie?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started {schedule.start_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Up Next */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-4">Coming Up Next</h3>
          {nextSchedules.length === 0 ? (
            <div className="flex-1 text-center py-8 bg-secondary/10 rounded-2xl border border-border/40 flex flex-col items-center justify-center">
              <Film className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">No upcoming schedules.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {nextSchedules.map((schedule: any) => (
                <div
                  key={schedule.id}
                  className="min-w-[140px] max-w-[140px] shrink-0 snap-start space-y-2 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-secondary border border-border/40 shadow-sm relative">
                    <img
                      src={
                        schedule.movie?.cover_url ||
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400"
                      }
                      alt={schedule.movie?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border border-border/60 shadow-sm">
                      {new Date(schedule.show_date).toLocaleDateString() ===
                      now.toLocaleDateString()
                        ? "Today"
                        : new Date(schedule.show_date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg text-center truncate shadow-sm border border-white/10">
                      {schedule.screen?.name || "Screen 1"}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm truncate" title={schedule.movie?.title}>
                      {schedule.movie?.title}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      {schedule.start_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Full Width */}
      <div className="grid grid-cols-1">
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
          {recentBookings.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-border/40 h-[calc(100%-3rem)] flex items-center justify-center">
              <p className="text-muted-foreground">
                Bookings will appear here once movies are live.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center font-bold">
                      <span className="text-sm">{b.quantity}x</span>
                    </div>
                    <div>
                      <p className="font-bold">{b.schedule?.movie?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {b.names || "Walk-in"} • {b.ticket_tier?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(b.total_price, b.currency || workspaceCurrency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
