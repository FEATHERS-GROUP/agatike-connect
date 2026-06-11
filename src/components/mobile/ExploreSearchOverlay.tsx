import React, { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ArrowLeft, MapPin, Star, Users, Calendar, Map as MapIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExploreSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  dbOrganizers: any[];
  dbEvents: any[];
  dbVenues: any[];
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string) => void;
}

export function ExploreSearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  dbOrganizers,
  dbEvents,
  dbVenues,
  isFollowing,
  toggleFollow,
}: ExploreSearchOverlayProps) {
  
  const query = searchQuery.toLowerCase().trim();

  // Filter Data
  const filteredOrganizers = useMemo(() => {
    if (!query) return [];
    return dbOrganizers.filter(
      (org) =>
        org.name?.toLowerCase().includes(query) ||
        org.handle?.toLowerCase().includes(query) ||
        org.bio?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [dbOrganizers, query]);

  const filteredEvents = useMemo(() => {
    if (!query) return [];
    return dbEvents.filter(
      (e) =>
        e.title?.toLowerCase().includes(query) ||
        e.category?.toLowerCase().includes(query) ||
        e.workspaces?.city?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [dbEvents, query]);

  const filteredVenues = useMemo(() => {
    if (!query) return [];
    return dbVenues.filter(
      (v) =>
        v.name?.toLowerCase().includes(query) ||
        v.city?.toLowerCase().includes(query) ||
        v.type?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [dbVenues, query]);

  const hasResults =
    filteredOrganizers.length > 0 || filteredEvents.length > 0 || filteredVenues.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background md:max-w-md md:mx-auto shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-200">
      {/* Header / Search Bar */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/40 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onClose} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, events, venues..."
              className="h-10 bg-secondary/50 border-transparent pl-9 rounded-xl text-sm focus-visible:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!query ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 mt-10">
            <Search className="h-12 w-12 mb-4" />
            <p className="font-medium text-sm">Type to start searching...</p>
          </div>
        ) : !hasResults ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60 mt-10">
            <p className="font-medium text-sm">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            
            {/* Organizers Section */}
            {filteredOrganizers.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Organizers
                </h3>
                <div className="space-y-3">
                  {filteredOrganizers.map((org) => {
                    const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;
                    const following = isFollowing(org.id);
                    return (
                      <Link
                        key={org.id}
                        to="/organizers"
                        className="flex items-center gap-3 group active:scale-95 transition-transform"
                      >
                        <img src={avatar} alt={org.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-border/40" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{org.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">@{org.handle}</p>
                        </div>
                        <Button
                          variant={following ? "outline" : "default"}
                          size="sm"
                          className={`h-7 rounded-full text-[10px] font-bold uppercase tracking-wider px-4 ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
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
            )}

            {/* Events Section */}
            {filteredEvents.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Events & Experiences
                </h3>
                <div className="space-y-3">
                  {filteredEvents.map((event) => {
                    const city = event.workspaces?.city || event.workspaces?.name || "Local";
                    const isExp = event.category?.toLowerCase() === "experience" || event.event_type?.toLowerCase() === "experience";
                    return (
                      <Link
                        key={event.id}
                        to="/events/$eventId"
                        params={{ eventId: event.id }}
                        className="flex items-center gap-3 group active:scale-95 transition-transform"
                      >
                        <img src={event.cover} alt={event.title} className="w-16 h-12 rounded-xl object-cover shrink-0 border border-border/40" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{event.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                            <span className="uppercase text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-sm">
                              {isExp ? "Experience" : event.category || "Event"}
                            </span>
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {city}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Venues Section */}
            {filteredVenues.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <MapIcon className="h-3.5 w-3.5" /> Venues
                </h3>
                <div className="space-y-3">
                  {filteredVenues.map((venue) => (
                    <Link
                      key={venue.id}
                      to="/venues/$venueId"
                      params={{ venueId: venue.id }}
                      className="flex items-center gap-3 group active:scale-95 transition-transform"
                    >
                      <img 
                        src={venue.cover_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"} 
                        alt={venue.name} 
                        className="w-16 h-12 rounded-xl object-cover shrink-0 border border-border/40" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{venue.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                          <span className="capitalize">{venue.type || "Venue"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {venue.city || "Local"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
