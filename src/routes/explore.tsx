import { createFileRoute, Link } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/currency";
import { Search, Map as MapIcon, SlidersHorizontal, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { getPublicEvents } from "@/api/events";
import { getPublicVenues } from "@/api/venues";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { ExploreSearchOverlay } from "@/components/mobile/ExploreSearchOverlay";
import { useState, useMemo, useEffect } from "react";
import { isWeekendEvent } from "@/lib/utils";
const mockSubscriptionPlans: any[] = [];
const mockBusTickets: any[] = [];

// Stubbed mock data
const categories: any[] = [];
const movies: any[] = [];

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  const search: any = Route.useSearch();
  const { toggleFollow, isFollowing } = useFollowedOrganizers();
  const [isSearchOpen, setIsSearchOpen] = useState(!!search?.q);
  const [searchQuery, setSearchQuery] = useState(search?.q || "");

  useEffect(() => {
    if (search?.q) {
      setSearchQuery(search.q);
      setIsSearchOpen(true);
    }
  }, [search?.q]);

  const { data: dbOrganizers = [], isLoading: isLoadingOrganizers } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: dbEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const { data: dbVenues = [], isLoading: isLoadingVenues } = useQuery({
    queryKey: ["public-venues"],
    queryFn: () => getPublicVenues(),
  });

  const publicEvents = useMemo(() => {
    return dbEvents.filter((e: any) => e.allowed_public === true && e.deleted !== true);
  }, [dbEvents]);

  const trendingEvents = useMemo(() => {
    const getUniqueAttendees = (e: any) => e.event_attendees_aggregate?.aggregate?.count ?? 0;
    return [...publicEvents]
      .sort((a, b) => getUniqueAttendees(b) - getUniqueAttendees(a))
      .slice(0, 4);
  }, [publicEvents]);

  const upcomingEvents = useMemo(() => {
    let filtered = publicEvents.filter((e: any) => {
      const dateStr = e.tour_stops?.[0]?.date || e.created_at;
      return isWeekendEvent(dateStr);
    });
    if (filtered.length === 0) {
      filtered = publicEvents;
    }
    return filtered.slice(0, 8);
  }, [publicEvents]);

  const dbExperiences = useMemo(() => {
    return publicEvents.filter(
      (e: any) =>
        e.category?.toLowerCase() === "experience" || e.event_type?.toLowerCase() === "experience",
    );
  }, [publicEvents]);

  return (
    <div className="min-h-screen bg-background pb-20 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] md:pb-8 shadow-xl">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-30 pt-safe-top">
        <div className="px-4 py-2">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 group" onClick={() => setIsSearchOpen(true)}>
              <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors z-10" />
              <Input
                readOnly
                placeholder="Search events, venues, buses..."
                className="h-11 bg-background hover:bg-secondary/60 border border-border/30 hover:border-border/60 pl-11 rounded-2xl text-[15px] shadow-md transition-all cursor-pointer placeholder:text-muted-foreground/80 focus-visible:ring-primary/20 relative z-0"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl shrink-0 border-border/30 bg-background hover:bg-secondary/60 shadow-md transition-all"
            >
              <SlidersHorizontal className="h-5 w-5 text-foreground/80" />
            </Button>
          </div>

          {/* Categories Pill Scroll */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-1 hide-scrollbar -mx-4 px-4">
            {categories.map((c, i) => (
              <button
                key={c}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${i === 0 ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted/50 text-foreground hover:bg-muted border border-transparent hover:border-border/50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">

        {/* Trending Section (Pinterest style masonry-ish) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Trending Nearby</h2>
            <Link to="/" className="text-sm text-primary font-medium">
              See all
            </Link>
          </div>
          <div className="columns-2 gap-3 space-y-3">
            {isLoadingEvents
              ? [1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className={`rounded-3xl w-full break-inside-avoid ${i % 2 !== 0 ? "aspect-[3/4]" : "aspect-[4/5]"}`}
                  />
                ))
              : trendingEvents.map((e, i) => {
                  const city = e.workspaces?.city || e.workspaces?.name || "Local";
                  return (
                    <Link
                      key={e.id}
                      to="/events/$eventId"
                      params={{ eventId: e.id }}
                      className={`group relative rounded-3xl overflow-hidden bg-card shadow-sm border border-border/40 block w-full break-inside-avoid ${i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"}`}
                    >
                      <img
                        src={e.cover}
                        alt={e.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
                          {e.category}
                        </div>
                        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                          {e.title}
                        </h3>
                        <div className="text-white/80 text-[10px] mt-1 flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> People going ·{" "}
                            {(e.event_attendees_aggregate?.aggregate?.count ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>

        {/* Popular Organizers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Popular Organizers</h2>
            <Link to="/organizers" className="text-sm font-bold text-primary">
              See all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
            {isLoadingOrganizers
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center"
                  >
                    <Skeleton className="w-16 h-16 rounded-full mb-3" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16 mb-3" />
                    <Skeleton className="h-7 w-full rounded-full" />
                  </div>
                ))
              : dbOrganizers.slice(0, 8).map((org) => {
                  const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;
                  const following = isFollowing(org.id);
                  return (
                    <Link
                      key={org.id}
                      to="/organizers"
                      className="w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center transition-transform active:scale-95 block"
                    >
                      <img
                        src={avatar}
                        alt={org.name}
                        className="w-16 h-16 rounded-full object-cover mb-3"
                      />
                      <p className="font-semibold text-sm leading-tight line-clamp-1">{org.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                        @{org.handle}
                      </p>
                      <Button
                        size="sm"
                        variant={following ? "outline" : "default"}
                        className={`mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
                        style={following ? undefined : { background: "var(--gradient-primary)" }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFollow(org.id);
                        }}
                      >
                        {following ? "Following" : "Follow"}
                      </Button>
                    </Link>
                  );
                })}
          </div>
        </section>

        {/* Upcoming Events Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Upcoming Events</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
            {isLoadingEvents
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block"
                  >
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : upcomingEvents.map((event) => {
                  const cheapestTicket = event.event_tickets?.reduce(
                    (min: number, t: any) => Math.min(min, t.cost),
                    Infinity,
                  );
                  const price = cheapestTicket && cheapestTicket !== Infinity ? cheapestTicket : 0;
                  const currency = event.workspaces?.currency || "RWF";
                  const date = event.tour_stops?.[0]?.date || event.created_at;
                  const city = event.workspaces?.city || event.workspaces?.name || "Local";

                  return (
                    <Link
                      key={event.id}
                      to="/events/$eventId"
                      params={{ eventId: event.id }}
                      className="w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95"
                    >
                      <div className="aspect-[4/3] relative">
                        <img
                          src={event.cover}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                          {price > 0 ? formatCurrency(price, currency) : "Free"}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm leading-tight line-clamp-2">
                          {event.title}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="truncate">{new Date(date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="truncate">{city}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" /> People going ·{" "}
                          {(
                            event.event_attendees_aggregate?.aggregate?.count ?? 0
                          ).toLocaleString()}
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>

        {/* Experiences Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Unique Experiences</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
            {dbExperiences.map((x) => {
              const cheapestTicket = x.event_tickets?.reduce(
                (min: number, t: any) => Math.min(min, t.cost),
                Infinity,
              );
              const price = cheapestTicket && cheapestTicket !== Infinity ? cheapestTicket : 0;
              const currency = x.workspaces?.currency || "RWF";
              const host = x.workspaces?.organizer?.name || x.workspaces?.name || "Host";

              return (
                <Link
                  key={x.id}
                  to="/events/$eventId"
                  params={{ eventId: x.id }}
                  className="w-64 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95"
                >
                  <div className="aspect-video relative">
                    <img src={x.cover} alt={x.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-medium">
                      {price > 0 ? formatCurrency(price, currency) : "Free"}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-1">{x.title}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{host}</p>
                  </div>
                </Link>
              );
            })}

            {dbExperiences.length === 0 && (
              <div className="w-full text-center py-6 text-sm text-muted-foreground">
                No unique experiences available right now.
              </div>
            )}
          </div>
        </section>

        {/* Venues Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Top Venues</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
            {dbVenues.map((venue) => (
              <Link
                key={venue.id}
                to="/"
                className="w-56 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={
                      venue.cover_url ||
                      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
                    }
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shadow-sm">
                    {venue.type || "Venue"}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1">{venue.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{venue.city || "Local"}</span>
                  </div>
                </div>
              </Link>
            ))}

            {dbVenues.length === 0 && (
              <div className="w-full text-center py-6 text-sm text-muted-foreground">
                No venues available right now.
              </div>
            )}
          </div>
        </section>

        {/* Movies Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Now Showing</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
            {movies.map((m) => (
              <Link
                key={m.id}
                to="/movies"
                className="w-32 shrink-0 block transition-transform active:scale-95"
              >
                <div className="aspect-[2/3] relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2">
                  <img src={m.cover} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                    {m.rating}
                  </div>
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">{m.title}</h3>
                <p className="text-muted-foreground text-[10px] mt-0.5">{m.genre}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <ExploreSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dbOrganizers={dbOrganizers}
        dbEvents={publicEvents}
        dbVenues={dbVenues}
        dbSubscriptions={mockSubscriptionPlans}
        dbBusTickets={mockBusTickets}
        isFollowing={isFollowing}
        toggleFollow={toggleFollow}
      />
    </div>
  );
}
