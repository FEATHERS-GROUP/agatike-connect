import {
  Search,
  MapPin,
  Music,
  Ticket,
  Trophy,
  Palette,
  Pizza,
  Mic,
  Film,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getOrganizerCountries, getOrganizers } from "@/api/organizers";
import { getPublicEvents } from "@/api/events";
import { getPublicVenues } from "@/api/venues";
import { getPublicMovieSchedules } from "@/api/cinemas";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { name: "Events", icon: Ticket },
  { name: "Movies", icon: Film },
  { name: "Experiences", icon: Globe },
  { name: "Music", icon: Music },
  { name: "Sports", icon: Trophy },
  { name: "Comedy", icon: Mic },
];

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [city, setCity] = useState("");
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const { data: countries = [] } = useQuery({
    queryKey: ["organizer-countries"],
    queryFn: () => getOrganizerCountries(),
  });

  const { data: dbEvents = [] } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const { data: dbVenues = [] } = useQuery({
    queryKey: ["public-venues"],
    queryFn: () => getPublicVenues(),
  });

  const { data: dbOrganizers = [] } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["public_schedules_home_desktop"],
    queryFn: () =>
      getPublicMovieSchedules({ data: { date: new Date().toISOString().split("T")[0] } } as any),
  });

  const filteredResults = useMemo(() => {
    if (!query || query.length < 2) return { events: [], venues: [], movies: [], organizers: [] };
    const lowerQuery = query.toLowerCase();
    const finalCity = city === "all" ? "" : city?.toLowerCase();

    const events = dbEvents
      .filter((e: any) => {
        if (finalCity && !e.workspaces?.city?.toLowerCase().includes(finalCity) && !e.workspaces?.country?.toLowerCase().includes(finalCity)) return false;
        const text = [e.title, e.category, e.description].join(" ").toLowerCase();
        return text.includes(lowerQuery);
      })
      .slice(0, 3);
      
    const venues = dbVenues
      .filter((v: any) => {
        if (finalCity && !v.city?.toLowerCase().includes(finalCity) && !v.country?.toLowerCase().includes(finalCity)) return false;
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
      if (finalCity && !s.cinema?.city?.toLowerCase().includes(finalCity) && !s.cinema?.country?.toLowerCase().includes(finalCity)) return;
      const text = [s.movie?.title, s.movie?.genre, s.movie?.synopsis].join(" ").toLowerCase();
      if (text.includes(lowerQuery)) {
        movieMap.set(s.movie.id, s.movie);
      }
    });
    const movies = Array.from(movieMap.values()).slice(0, 3);

    const organizers = dbOrganizers
      .filter((o: any) => {
        if (finalCity && !o.country?.toLowerCase().includes(finalCity)) return false;
        return o.name?.toLowerCase().includes(lowerQuery) || o.handle?.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 3);

    return { events, venues, movies, organizers };
  }, [query, dbEvents, dbVenues, schedules, dbOrganizers, city]);

  const hasResults =
    filteredResults.events.length > 0 ||
    filteredResults.venues.length > 0 ||
    filteredResults.movies.length > 0 ||
    filteredResults.organizers.length > 0;

  useEffect(() => {
    if (user?.country && !city) {
      setCity(user.country);
    }
  }, [user?.country]);

  const handleSearch = (e?: React.FormEvent, category?: string) => {
    e?.preventDefault();
    const q = category || query;
    const finalCity = city === "all" ? "" : city;

    // Navigate to explore page with search params
    navigate({
      to: "/explore",
      search: { q, city: finalCity } as any,
    });
  };

  return (
    <div className="relative z-50 mt-8 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_auto]"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Events, organizers, artists…"
            className="h-12 border-transparent bg-secondary/60 pl-9"
          />
          {isFocused && query.length >= 2 && hasResults && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-[400px] bg-background border border-border/60 rounded-xl shadow-[var(--shadow-dropdown)] z-[999] overflow-hidden max-h-[400px] overflow-y-auto">
              {filteredResults.organizers.length > 0 && (
                <div className="p-2 border-t border-border/40">
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
                      <img src={o.image || o.avatar || `https://i.pravatar.cc/150?u=${o.id}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{o.name}</p>
                        <p className="text-xs text-muted-foreground">@{o.handle}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {filteredResults.events.length > 0 && (
                <div className="p-2">
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
                      <img src={e.cover} alt="" className="w-10 h-10 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{e.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{e.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {filteredResults.venues.length > 0 && (
                <div className="p-2 border-t border-border/40">
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                    Venues
                  </div>
                  {filteredResults.venues.map((v: any) => (
                    <Link
                      key={v.id}
                      to="/"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <img src={v.cover_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000"} alt="" className="w-10 h-10 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{v.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{v.type || "Venue"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {filteredResults.movies.length > 0 && (
                <div className="p-2 border-t border-border/40">
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
                    Movies
                  </div>
                  {filteredResults.movies.map((m: any) => (
                    <Link
                      key={m.id}
                      to="/movies"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <img src={m.cover_url || m.cover} alt="" className="w-10 h-10 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.genre}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 border-transparent bg-secondary/60 pl-9 pr-4 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none border-0 ring-offset-transparent">
              <SelectValue placeholder="Select Country/City" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Locations</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          className="h-12 rounded-xl px-6"
          style={{ background: "var(--gradient-primary)" }}
        >
          Search
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 px-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => handleSearch(undefined, c.name)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
