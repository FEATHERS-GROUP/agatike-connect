import { createFileRoute } from "@tanstack/react-router";
import { Film, MapPin, Ticket, TrendingUp, Users, Loader2, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";
import { getCinemaStats, getCinemaBookings } from "@/api/cinema_bookings";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/overview")({
  component: CinemaOverview,
});

function CinemaOverview() {
  const { cinemaId } = Route.useParams();

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

  // Calculate unique movies from schedules
  const activeMoviesCount = new Set(
    (cinema.schedules || []).map((s: any) => s.movie?.id).filter(Boolean),
  ).size;



  const STATS = [
    { label: "Tickets Sold (Today)", value: stats?.today_quantity?.toString() || "0", icon: Ticket, trend: "Live" },
    { label: "Active Movies", value: activeMoviesCount.toString(), icon: Film, trend: "Current" },
    { label: "Total Revenue", value: formatCurrency(stats?.total_revenue || 0, "RWF"), icon: TrendingUp, trend: "All time" },
    { label: "Attendees", value: stats?.total_quantity?.toString() || "0", icon: Users, trend: "Total" },
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
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
          {recentBookings.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-border/40 h-[calc(100%-3rem)] flex items-center justify-center">
              <p className="text-muted-foreground">Bookings will appear here once movies are live.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center font-bold">
                      <span className="text-sm">{b.quantity}x</span>
                    </div>
                    <div>
                      <p className="font-bold">{b.schedule?.movie?.title}</p>
                      <p className="text-sm text-muted-foreground">{b.names || "Walk-in"} • {b.ticket_tier?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(b.total_price, b.currency)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
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
