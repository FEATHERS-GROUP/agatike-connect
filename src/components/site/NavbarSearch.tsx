import { useState, useMemo } from "react";
import { Search, Ticket, Repeat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { getPublicEvents } from "@/api/events";
import { getPublicVenues } from "@/api/venues";
import { getPublicMovieSchedules } from "@/api/cinemas";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { getUserAllTickets } from "@/api/user_tickets";
import { getUserSubscriptions } from "@/api/space_subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useUserAuth();

  const isHomePage = location.pathname === "/";

  const { data: dbEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
    enabled: !isHomePage && isFocused,
  });

  const { data: dbVenues = [], isLoading: isLoadingVenues } = useQuery({
    queryKey: ["public-venues"],
    queryFn: () => getPublicVenues(),
    enabled: !isHomePage && isFocused,
  });

  const { data: dbOrganizers = [], isLoading: isLoadingOrganizers } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
    enabled: !isHomePage && isFocused,
  });

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["public_schedules_home_desktop"],
    queryFn: () =>
      getPublicMovieSchedules({ data: { date: new Date().toISOString().split("T")[0] } } as any),
    enabled: !isHomePage && isFocused,
  });

  const { data: userTickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ["user-tickets-search"],
    queryFn: () => getUserAllTickets(),
    enabled: !isHomePage && isFocused && isLoggedIn,
  });

  const { data: userSubs = [], isLoading: isLoadingSubs } = useQuery({
    queryKey: ["user-subs-search"],
    queryFn: () => getUserSubscriptions({ data: { user_id: user?.id } } as any),
    enabled: !isHomePage && isFocused && isLoggedIn && !!user?.id,
  });

  const isSearching =
    isLoadingEvents ||
    isLoadingVenues ||
    isLoadingOrganizers ||
    isLoadingSchedules ||
    (isLoggedIn && isLoadingTickets) ||
    (isLoggedIn && isLoadingSubs);

  const filteredResults = useMemo(() => {
    if (!query || query.length < 2) return { events: [], venues: [], movies: [], organizers: [], tickets: [], subscriptions: [] };
    const lowerQuery = query.toLowerCase();

    const events = dbEvents
      .filter((e: any) => {
        const text = [e.title, e.category, e.description].join(" ").toLowerCase();
        return text.includes(lowerQuery);
      })
      .slice(0, 3);
      
    const venues = dbVenues
      .filter((v: any) => {
        const text = [
          v.name,
          v.type,
          v.description,
          ...(Array.isArray(v.amenities) ? v.amenities : []),
          typeof v.facilities_data === 'string' ? v.facilities_data : JSON.stringify(v.facilities_data || {})
        ].join(" ").toLowerCase();
        return text.includes(lowerQuery);
      })
      .slice(0, 3);

    const movieMap = new Map();
    schedules.forEach((s: any) => {
      const text = [s.movie?.title, s.movie?.genre, s.movie?.synopsis].join(" ").toLowerCase();
      if (text.includes(lowerQuery)) {
        movieMap.set(s.movie.id, s.movie);
      }
    });
    const movies = Array.from(movieMap.values()).slice(0, 3);

    const organizers = dbOrganizers
      .filter((o: any) => {
        return o.name?.toLowerCase().includes(lowerQuery) || o.handle?.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 3);

    const tickets = userTickets.filter((t: any) => {
      const text = [t.id, t.qrcode_number, t.title].join(" ").toLowerCase();
      return text.includes(lowerQuery);
    }).slice(0, 3);

    const subscriptions = userSubs.filter((s: any) => {
      const text = JSON.stringify(s).toLowerCase();
      return text.includes(lowerQuery);
    }).slice(0, 3);

    return { events, venues, movies, organizers, tickets, subscriptions };
  }, [query, dbEvents, dbVenues, schedules, dbOrganizers, userTickets, userSubs]);

  const hasResults =
    filteredResults.events.length > 0 ||
    filteredResults.venues.length > 0 ||
    filteredResults.movies.length > 0 ||
    filteredResults.organizers.length > 0 ||
    filteredResults.tickets.length > 0 ||
    filteredResults.subscriptions.length > 0;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query) {
      navigate({
        to: "/explore",
        search: { q: query, city: "" } as any,
      });
      setIsFocused(false);
    }
  };

  if (isHomePage) {
    return null;
  }

  return (
    <div className="hidden flex-1 max-w-sm md:block relative z-[100]">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, organizers..."
          className="pl-9 rounded-full bg-secondary/60 border-transparent focus-visible:bg-background"
        />
        {isFocused && query.length >= 2 && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-[400px] bg-background border border-border/60 rounded-xl shadow-[var(--shadow-dropdown)] overflow-hidden max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ) : hasResults ? (
              <>
                {filteredResults.tickets.length > 0 && (
                  <div className="p-2 border-b border-border/40">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                      Your Tickets
                    </div>
                    {filteredResults.tickets.map((t: any) => (
                      <Link
                        key={t.id}
                        to="/ticket/$ticketId"
                        params={{ ticketId: t.id }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Ticket className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{t.title}</p>
                          <p className="text-xs text-muted-foreground">ID: {t.id.split("-")[0]}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredResults.subscriptions.length > 0 && (
                  <div className="p-2 border-b border-border/40">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                      Your Subscriptions
                    </div>
                    {filteredResults.subscriptions.map((s: any) => (
                      <Link
                        key={s.id}
                        to="/subscriptions"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Repeat className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {s.plan_name || "Subscription"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Status: {s.status}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredResults.organizers.length > 0 && (
                  <div className="p-2 border-b border-border/40">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                      Organizers
                    </div>
                    {filteredResults.organizers.map((o: any) => (
                      <Link
                        key={o.id}
                        to="/organizers/$organizerId"
                        params={{ organizerId: o.id }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <img
                          src={o.image || o.avatar || `https://i.pravatar.cc/150?u=${o.id}`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{o.name}</p>
                          <p className="text-xs text-muted-foreground">@{o.handle}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredResults.events.length > 0 && (
                  <div className="p-2 border-b border-border/40">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                      Events
                    </div>
                    {filteredResults.events.map((e: any) => (
                      <Link
                        key={e.id}
                        to="/events/$eventId"
                        params={{ eventId: e.id }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <img src={e.cover} alt="" className="w-8 h-8 rounded-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{e.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{e.category}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredResults.venues.length > 0 && (
                  <div className="p-2 border-b border-border/40">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                      Venues
                    </div>
                    {filteredResults.venues.map((v: any) => (
                      <Link
                        key={v.id}
                        to="/"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <img
                          src={
                            v.cover_url ||
                            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000"
                          }
                          alt=""
                          className="w-8 h-8 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{v.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {v.type || "Venue"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredResults.movies.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                      Movies
                    </div>
                    {filteredResults.movies.map((m: any) => (
                      <Link
                        key={m.id}
                        to="/movies"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <img
                          src={m.cover_url || m.cover}
                          alt=""
                          className="w-8 h-8 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.genre}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
