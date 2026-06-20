import { createFileRoute } from "@tanstack/react-router";
import { Film, MapPin, Ticket, TrendingUp, Users, Loader2, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";

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

  // Extract ticket tiers and map them to their movies
  const ticketTiersMap = new Map();
  (cinema.schedules || []).forEach((schedule: any) => {
    if (!schedule.movie || !schedule.ticket_tiers) return;
    schedule.ticket_tiers.forEach((tt: any) => {
      if (!tt.ticket_tier) return;
      const tierId = tt.ticket_tier.id;
      if (!ticketTiersMap.has(tierId)) {
        ticketTiersMap.set(tierId, {
          tier: tt.ticket_tier,
          movies: new Map(),
        });
      }
      ticketTiersMap.get(tierId).movies.set(schedule.movie.id, schedule.movie);
    });
  });

  const connectedTiers = Array.from(ticketTiersMap.values()).map((x: any) => ({
    ...x.tier,
    movies: Array.from(x.movies.values()),
  }));

  const STATS = [
    { label: "Tickets Sold (Today)", value: "0", icon: Ticket, trend: "0%" },
    { label: "Active Movies", value: activeMoviesCount.toString(), icon: Film, trend: "0%" },
    { label: "Total Revenue", value: "RWF 0", icon: TrendingUp, trend: "0%" },
    { label: "Attendees", value: "0", icon: Users, trend: "0%" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connected Ticket Tiers */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Connected Ticket Tiers</h3>
          </div>
          
          {connectedTiers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-12">
              <p className="text-muted-foreground">No ticket tiers are currently linked to this cinema's schedules.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {connectedTiers.map((tier: any) => (
                <div key={tier.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{tier.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{tier.type} Tier</p>
                    </div>
                    <span className="font-bold text-sm bg-background px-2 py-1 rounded-md border border-border/40">
                      {tier.currency} {tier.price}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Linked Movies:</p>
                    <div className="flex flex-wrap gap-2">
                      {tier.movies.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-1.5 bg-background border border-border/40 rounded-full px-2 py-1">
                          {m.cover_url ? (
                            <img src={m.cover_url} alt={m.title} className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <Film className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className="text-xs font-medium truncate max-w-[120px]">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity placeholder */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
          <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-border/40 h-[calc(100%-3rem)] flex items-center justify-center">
            <p className="text-muted-foreground">Bookings will appear here once movies are live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
