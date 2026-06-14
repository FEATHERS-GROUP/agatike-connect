import React, { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ArrowLeft, MapPin, Star, Users, Calendar, Map as MapIcon, Bus, Repeat } from "lucide-react";
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
  dbSubscriptions?: any[];
  dbBusTickets?: any[];
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
  dbSubscriptions = [],
  dbBusTickets = [],
  isFollowing,
  toggleFollow,
}: ExploreSearchOverlayProps) {
  const query = searchQuery.toLowerCase().trim();

  // Filter Data
  const filteredOrganizers = useMemo(() => {
    if (!query) return [];
    return dbOrganizers
      .filter(
        (org) =>
          org.name?.toLowerCase().includes(query) ||
          org.handle?.toLowerCase().includes(query) ||
          org.bio?.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [dbOrganizers, query]);

  const filteredEvents = useMemo(() => {
    if (!query) return [];
    return dbEvents
      .filter(
        (e) =>
          e.title?.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query) ||
          e.workspaces?.name?.toLowerCase().includes(query) ||
          e.workspaces?.city?.toLowerCase().includes(query) ||
          e.tour_stops?.some((stop: any) => stop.city?.toLowerCase().includes(query)),
      )
      .slice(0, 5);
  }, [dbEvents, query]);

  const filteredVenues = useMemo(() => {
    if (!query) return [];
    return dbVenues
      .filter(
        (v) =>
          v.name?.toLowerCase().includes(query) ||
          v.city?.toLowerCase().includes(query) ||
          v.type?.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [dbVenues, query]);

  const filteredSubscriptions = useMemo(() => {
    if (!query) return [];
    return dbSubscriptions
      .filter(
        (s) =>
          s.title?.toLowerCase().includes(query) ||
          s.venue?.toLowerCase().includes(query) ||
          s.category?.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [dbSubscriptions, query]);

  const filteredBusTickets = useMemo(() => {
    if (!query) return [];
    return dbBusTickets
      .filter(
        (b) =>
          b.title?.toLowerCase().includes(query) ||
          b.operator?.toLowerCase().includes(query) ||
          b.category?.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [dbBusTickets, query]);

  const [recentSearches, setRecentSearches] = React.useState<{ type: string; data: any }[]>(() => {
    try {
      const item = window.localStorage.getItem("recent_searches");
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  });

  const addRecentSearch = (type: string, data: any) => {
    const newItem = { type, data };
    const filtered = recentSearches.filter((r) => r.data.id !== data.id);
    const updated = [newItem, ...filtered].slice(0, 10);
    setRecentSearches(updated);
    window.localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recentSearches.filter((r) => r.data.id !== id);
    setRecentSearches(updated);
    window.localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    window.localStorage.removeItem("recent_searches");
  };

  const renderItem = (type: string, data: any, isRecent = false) => {
    if (type === "organizer") {
      const avatar = data.avatar || data.image || `https://i.pravatar.cc/150?u=${data.id}`;
      const following = isFollowing(data.id);
      return (
        <Link
          key={`recent-${data.id}`}
          to="/organizers"
          onClick={() => !isRecent && addRecentSearch("organizer", data)}
          className="flex items-center gap-3 group active:scale-95 transition-transform"
        >
          <img
            src={avatar}
            alt={data.name}
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-border/40"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {data.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">@{data.handle}</p>
          </div>
          {isRecent ? (
            <button
              onClick={(e) => removeRecentSearch(e, data.id)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          ) : (
            <Button
              variant={following ? "outline" : "default"}
              size="sm"
              className={`h-7 rounded-full text-[10px] font-bold uppercase tracking-wider px-4 ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
              style={following ? undefined : { background: "var(--gradient-primary)" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFollow(data.id);
              }}
            >
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </Link>
      );
    }

    if (type === "event") {
      const city = data.workspaces?.city || data.workspaces?.name || "Local";
      const isExp =
        data.category?.toLowerCase() === "experience" ||
        data.event_type?.toLowerCase() === "experience";
      return (
        <Link
          key={`recent-${data.id}`}
          to="/events/$eventId"
          params={{ eventId: data.id }}
          onClick={() => !isRecent && addRecentSearch("event", data)}
          className="flex items-center gap-3 group active:scale-95 transition-transform"
        >
          <img
            src={data.cover}
            alt={data.title}
            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-border/40"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {data.title}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
              <span className="uppercase text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-sm">
                {isExp ? "Experience" : data.category || "Event"}
              </span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {city}
              </span>
            </div>
          </div>
          {isRecent && (
            <button
              onClick={(e) => removeRecentSearch(e, data.id)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </Link>
      );
    }

    if (type === "venue") {
      return (
        <Link
          key={`recent-${data.id}`}
          to="/venues/$venueId"
          params={{ venueId: data.id }}
          onClick={() => !isRecent && addRecentSearch("venue", data)}
          className="flex items-center gap-3 group active:scale-95 transition-transform"
        >
          <img
            src={
              data.cover_url ||
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
            }
            alt={data.name}
            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-border/40"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {data.name}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
              <span className="capitalize">{data.type || "Venue"}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {data.city || "Local"}
              </span>
            </div>
          </div>
          {isRecent && (
            <button
              onClick={(e) => removeRecentSearch(e, data.id)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </Link>
      );
    }

    if (type === "subscription") {
      return (
        <Link
          key={`recent-${data.id}`}
          to="/subscriptions"
          onClick={() => !isRecent && addRecentSearch("subscription", data)}
          className="flex items-center gap-3 group active:scale-95 transition-transform"
        >
          <img
            src={data.cover}
            alt={data.title}
            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-border/40"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {data.title}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
              <span className="capitalize text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-sm">{data.category || "Subscription"}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> {data.venue}
              </span>
            </div>
          </div>
          {isRecent && (
            <button
              onClick={(e) => removeRecentSearch(e, data.id)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </Link>
      );
    }

    if (type === "bus") {
      return (
        <Link
          key={`recent-${data.id}`}
          to="/buses/mobile"
          onClick={() => !isRecent && addRecentSearch("bus", data)}
          className="flex items-center gap-3 group active:scale-95 transition-transform"
        >
          <img
            src={data.cover}
            alt={data.title}
            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-border/40"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {data.title}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
              <span className="capitalize text-blue-500 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-sm">Bus Route</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                {data.operator}
              </span>
            </div>
          </div>
          {isRecent && (
            <button
              onClick={(e) => removeRecentSearch(e, data.id)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </Link>
      );
    }

    return null;
  };

  const hasResults =
    filteredOrganizers.length > 0 || 
    filteredEvents.length > 0 || 
    filteredVenues.length > 0 || 
    filteredSubscriptions.length > 0 || 
    filteredBusTickets.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background md:max-w-md md:mx-auto shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-200">
      {/* Header / Search Bar */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/40 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onClose}
            className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
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
          recentSearches.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight">Recent</h3>
                <button
                  onClick={clearAllRecent}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-3 pb-20">
                {recentSearches.map((r) => renderItem(r.type, r.data, true))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 mt-10">
              <Search className="h-12 w-12 mb-4" />
              <p className="font-medium text-sm">Type to start searching...</p>
            </div>
          )
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
                  {filteredOrganizers.map((org) => renderItem("organizer", org))}
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
                  {filteredEvents.map((event) => renderItem("event", event))}
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
                  {filteredVenues.map((venue) => renderItem("venue", venue))}
                </div>
              </section>
            )}

            {/* Subscriptions Section */}
            {filteredSubscriptions.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Repeat className="h-3.5 w-3.5" /> Subscriptions & Memberships
                </h3>
                <div className="space-y-3">
                  {filteredSubscriptions.map((sub) => renderItem("subscription", sub))}
                </div>
              </section>
            )}

            {/* Bus Tickets Section */}
            {filteredBusTickets.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Bus className="h-3.5 w-3.5" /> Bus Routes
                </h3>
                <div className="space-y-3">
                  {filteredBusTickets.map((bus) => renderItem("bus", bus))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
