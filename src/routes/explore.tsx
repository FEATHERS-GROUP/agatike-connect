import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/currency";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";
import {
  Search,
  Map as MapIcon,
  MapPin,
  Users,
  MessageCircle,
  Activity,
  Calendar,
} from "lucide-react";
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
import { useUserAuth } from "@/contexts/UserAuthContext";
import { isWeekendEvent } from "@/lib/utils";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { OrganizerCard } from "@/components/site/OrganizerCard";
import { useIsMobile } from "@/hooks/use-mobile";

const mockSubscriptionPlans: any[] = [];
const mockBusTickets: any[] = [];
const movies: any[] = [];

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  const search: any = Route.useSearch();
  const { user } = useUserAuth();
  const { toggleFollow, isFollowing } = useFollowedOrganizers();
  const [isSearchOpen, setIsSearchOpen] = useState(!!search?.q);
  const [searchQuery, setSearchQuery] = useState(search?.q || "");
  const isMobile = useIsMobile();
  const router = useRouter();

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

  // Filtering Logic
  const query = searchQuery.toLowerCase().trim();
  const cityQuery = search?.city?.toLowerCase() || "";

  const filteredOrganizers = useMemo(() => {
    if (!query) return [];
    return dbOrganizers.filter((org: any) => {
      if (cityQuery && cityQuery !== "all" && !org.country?.toLowerCase().includes(cityQuery)) return false;
      return org.name?.toLowerCase().includes(query) || org.handle?.toLowerCase().includes(query) || org.bio?.toLowerCase().includes(query);
    });
  }, [dbOrganizers, query, cityQuery]);

  const filteredEvents = useMemo(() => {
    if (!query) return [];
    return dbEvents.filter((e: any) => {
      if (cityQuery && cityQuery !== "all" && !e.workspaces?.city?.toLowerCase().includes(cityQuery) && !e.workspaces?.country?.toLowerCase().includes(cityQuery)) return false;
      const text = [
        e.title,
        e.category,
        e.description,
        e.workspaces?.name,
        e.workspaces?.city,
        typeof e.tour_stops === 'string' ? e.tour_stops : JSON.stringify(e.tour_stops || {})
      ].join(" ").toLowerCase();
      return text.includes(query);
    });
  }, [dbEvents, query, cityQuery]);

  const filteredVenues = useMemo(() => {
    if (!query) return [];
    return dbVenues.filter((v: any) => {
      if (cityQuery && cityQuery !== "all" && !v.city?.toLowerCase().includes(cityQuery) && !v.country?.toLowerCase().includes(cityQuery)) return false;
      const text = [
        v.name,
        v.city,
        v.type,
        v.description,
        ...(Array.isArray(v.amenities) ? v.amenities : []),
        typeof v.facilities_data === 'string' ? v.facilities_data : JSON.stringify(v.facilities_data || {})
      ].join(" ").toLowerCase();
      return text.includes(query);
    });
  }, [dbVenues, query, cityQuery]);

  const renderEventCard = (event: any) => {
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
        className="group shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform hover:shadow-md h-full flex flex-col"
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={event.cover}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
            {price > 0 ? formatCurrency(price, currency) : "Free"}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="font-semibold text-sm leading-tight line-clamp-2">
            {event.title}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{new Date(date).toLocaleDateString()}</span>
            <span>•</span>
            <span className="truncate">{city}</span>
          </div>
          <div className="mt-auto pt-3 text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Users className="h-3 w-3" /> People going ·{" "}
            {(
              event.event_attendees_aggregate?.aggregate?.count ?? 0
            ).toLocaleString()}
          </div>
        </div>
      </Link>
    );
  };

  const renderVenueCard = (venue: any) => (
    <Link
      key={venue.id}
      to="/"
      className="group shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform hover:shadow-md h-full flex flex-col"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={
            venue.cover_url ||
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
          }
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shadow-sm">
          {venue.type || "Venue"}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm line-clamp-1">{venue.name}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground mt-auto">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{venue.city || "Local"}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 flex flex-col w-full">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Sticky Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 pt-safe-top bg-background/90 backdrop-blur border-b border-border/40">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between w-full relative">
            <div className="flex items-center gap-1">
              <Link
                to={user?.id ? "/$userId/message" : "/signin"}
                params={user?.id ? { userId: user.id } : {}}
                className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <img src={agatikeIcon} alt="Agatike" className="h-7 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-1">
              <Link
                to="/activity"
                className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
              >
                <Activity className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors text-foreground"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Desktop Header / Search Bar */}
        <header className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Explore</h1>
            <p className="mt-1 text-sm text-muted-foreground">Discover events, venues, and experiences.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search people, events, venues..."
              className="pl-9 h-12 rounded-xl bg-secondary/50 border-border/40 text-sm focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length === 0) {
                   setIsSearchOpen(false);
                }
              }}
            />
          </div>
        </header>

        {query ? (
          <div className="space-y-12">
            {/* SEARCH RESULTS VIEW */}
            
            {filteredOrganizers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Organizers</h2>
                <div className="flex flex-col gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-4">
                  {filteredOrganizers.map(org => (
                    <OrganizerCard 
                      key={org.id} 
                      org={org} 
                      following={isFollowing(org.id)} 
                      onFollowToggle={() => toggleFollow(org.id)} 
                      isLoggedIn={!!user} 
                      onClick={() => router.navigate({ to: "/organizers/$organizerId", params: { organizerId: org.id } })}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredEvents.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> Events & Experiences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredEvents.map(renderEventCard)}
                </div>
              </section>
            )}

            {filteredVenues.length > 0 && (
              <section>
                <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2"><MapIcon className="h-5 w-5" /> Venues</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredVenues.map(renderVenueCard)}
                </div>
              </section>
            )}

            {filteredOrganizers.length === 0 && filteredEvents.length === 0 && filteredVenues.length === 0 && (
               <div className="py-20 text-center text-muted-foreground border border-dashed border-border/60 rounded-3xl bg-secondary/20">
                 <p className="text-base font-medium">No results found for "{query}".</p>
                 <p className="text-sm mt-1">Try adjusting your search or location.</p>
               </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
             {/* DEFAULT EXPLORE VIEW */}
             <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Trending Nearby</h2>
                  <Link to="/" className="text-sm text-primary font-medium hover:underline">See all</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {isLoadingEvents
                    ? [1, 2, 3, 4].map((i) => (
                        <Skeleton
                          key={i}
                          className={`rounded-3xl w-full ${i % 2 !== 0 ? "aspect-[3/4]" : "aspect-[4/5]"}`}
                        />
                      ))
                    : trendingEvents.map((e, i) => {
                        const city = e.workspaces?.city || e.workspaces?.name || "Local";
                        return (
                          <Link
                            key={e.id}
                            to="/events/$eventId"
                            params={{ eventId: e.id }}
                            className={`group relative rounded-3xl overflow-hidden bg-card shadow-sm border border-border/40 block w-full ${i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"}`}
                          >
                            <img
                              src={e.cover}
                              alt={e.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="text-[10px] font-bold text-primary mb-1.5 uppercase tracking-wider">
                                {e.category}
                              </div>
                              <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                                {e.title}
                              </h3>
                              <div className="text-white/80 text-xs mt-2 flex flex-col gap-1.5">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" /> {city}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" /> {(e.event_attendees_aggregate?.aggregate?.count ?? 0).toLocaleString()} going
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                </div>
             </section>

             <section>
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl md:text-2xl font-bold tracking-tight">Popular Organizers</h2>
                 <Link to="/organizers" className="text-sm text-primary font-medium hover:underline">See all</Link>
               </div>
               {/* Mobile horizontal scroll, Desktop grid */}
               <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {isLoadingOrganizers
                   ? [1, 2, 3, 4, 5].map((i) => (
                       <div key={i} className="w-36 md:w-auto shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center">
                         <Skeleton className="w-16 h-16 rounded-full mb-3" />
                         <Skeleton className="h-4 w-24 mb-1" />
                         <Skeleton className="h-7 w-full rounded-full mt-3" />
                       </div>
                     ))
                   : dbOrganizers.slice(0, 5).map((org) => (
                       <div key={org.id} className="w-36 md:w-auto shrink-0 block">
                         <OrganizerCard 
                           org={org} 
                           following={isFollowing(org.id)} 
                           onFollowToggle={() => toggleFollow(org.id)} 
                           isLoggedIn={!!user} 
                           onClick={() => router.navigate({ to: "/organizers/$organizerId", params: { organizerId: org.id } })}
                         />
                       </div>
                     ))}
               </div>
             </section>

             <section>
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl md:text-2xl font-bold tracking-tight">Upcoming Events</h2>
               </div>
               <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {isLoadingEvents
                   ? [1, 2, 3, 4].map((i) => (
                       <div key={i} className="w-60 md:w-auto shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block">
                         <Skeleton className="aspect-[4/3] w-full" />
                       </div>
                     ))
                   : upcomingEvents.map((event) => (
                       <div key={event.id} className="w-60 md:w-auto shrink-0 block">
                          {renderEventCard(event)}
                       </div>
                     ))}
               </div>
             </section>

             <section>
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl md:text-2xl font-bold tracking-tight">Top Venues</h2>
               </div>
               <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {dbVenues.slice(0, 8).map((venue) => (
                   <div key={venue.id} className="w-56 md:w-auto shrink-0 block">
                     {renderVenueCard(venue)}
                   </div>
                 ))}
                 {dbVenues.length === 0 && (
                   <div className="w-full col-span-full text-center py-6 text-sm text-muted-foreground">
                     No venues available right now.
                   </div>
                 )}
               </div>
             </section>
          </div>
        )}
      </main>

      <div className="hidden md:block mt-auto">
        <Footer />
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

      {/* Mobile only search overlay */}
      {isMobile && (
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
      )}
    </div>
  );
}
