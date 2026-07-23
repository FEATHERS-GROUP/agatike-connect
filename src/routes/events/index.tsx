import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Users,
  User,
  X,
  Ticket,
  MessageCircle,
  Activity,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";
import { Button } from "@/components/ui/button";
import { getPublicEvents } from "@/api/events";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "All events — Agatike" },
      {
        name: "description",
        content: "Browse nightlife, music, sports, conferences and festivals across Africa.",
      },
      { property: "og:title", content: "All events — Agatike" },
      {
        property: "og:description",
        content: "Browse nightlife, music, sports, conferences and festivals across Africa.",
      },
    ],
  }),
  component: EventsBrowse,
});

function EventCard({ event }: { event: any }) {
  // Support both DB and mock data shapes
  const isMock = !!event.organizer || !!event.host || !!event.cinema;

  const getVal = (key: string) => {
    if (isMock) return event[key];
    if (Array.isArray(event.tour_stops)) return event.tour_stops[0]?.[key];
    if (event.tour_stops && typeof event.tour_stops === "object") return event.tour_stops[key];
    return "";
  };

  const isUpcoming = getVal("is_upcoming") === true;
  const timerDate = getVal("timer_date");
  const dateStr = getVal("date") || event.event_requency?.date || "TBD";
  const date = isUpcoming
    ? timerDate
      ? `Drops ${new Date(timerDate).toLocaleDateString("en-US")}`
      : "Coming Soon"
    : dateStr;
  const time = isMock ? event.time || event.duration : getVal("time");
  const venue = getVal("venue") || getVal("venueName") || "";
  const city = getVal("city") || "";

  const tourStopsCount = isMock
    ? 1
    : Array.isArray(event.tour_stops)
      ? event.tour_stops.length
      : event.tour_stops?.itinerary?.length
        ? event.tour_stops.itinerary.length
        : 1;
  const organizerName = isMock
    ? event.organizer || event.host || event.cinema
    : event.workspaces?.organizer?.name || event.workspaces?.name || "Organizer";

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group relative block overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {event.cover ? (
          <img
            src={event.cover}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary" />
        )}
        <div className="absolute inset-0" style={{ background: "var(--gradient-dark)" }} />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            {event.category}
          </span>
        </div>
        {tourStopsCount > 1 && !isUpcoming && (
          <div className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            {tourStopsCount} stops
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-3 right-3 rounded-full bg-blue-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur shadow-sm">
            Upcoming
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs uppercase tracking-wider opacity-80 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date || "TBD"} {time ? `· ${time}` : ""}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight line-clamp-2">{event.title}</h3>
          {(venue || city) && (
            <div className="mt-2 flex flex-col gap-1 text-xs opacity-90">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {venue ? `${venue}, ` : ""}
                {city}
              </span>
              {!isUpcoming && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> People going ·{" "}
                  {(
                    event.event_attendees_aggregate?.aggregate?.count ??
                    event.attendees ??
                    0
                  ).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="text-xs text-muted-foreground">
          by <span className="text-foreground font-medium">{organizerName}</span>
        </div>
      </div>
    </Link>
  );
}

function EventsBrowse() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { isLoggedIn } = useUserAuth();

  const { data: dbEvents = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const allEvents = useMemo(() => {
    return [...dbEvents];
  }, [dbEvents]);

  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    allEvents.forEach((e: any) => {
      if (e.category) {
        cats.add(e.category);
      }
    });
    return Array.from(cats).sort();
  }, [allEvents]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allEvents.filter((e: any) => {
      const isMock = !!e.organizer || !!e.host || !!e.cinema;
      const getVal = (key: string) => {
        if (isMock) return e[key];
        if (Array.isArray(e.tour_stops)) return e.tour_stops[0]?.[key];
        if (e.tour_stops && typeof e.tour_stops === "object") return e.tour_stops[key];
        return "";
      };

      const city = isMock ? e.city : Array.isArray(e.tour_stops) ? e.tour_stops[0]?.city : "";
      const organizerName = isMock
        ? e.organizer || e.host || e.cinema
        : e.workspaces?.organizer?.name || e.workspaces?.name || "";
      const matchesQ =
        !q || `${e.title} ${organizerName} ${city}`.toLowerCase().includes(q.toLowerCase());
      const matchesCat = !cat || e.category === cat;

      const dateStr = getVal("date") || e.event_requency?.date;
      let isPastLimit = false;
      if (dateStr && dateStr !== "TBD") {
        const eventDate = new Date(dateStr);
        if (!isNaN(eventDate.getTime())) {
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          if (eventDate < oneMonthAgo) {
            isPastLimit = true;
          }
        }
      }

      return matchesQ && matchesCat && !isPastLimit;
    });
  }, [q, cat, allEvents]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center justify-between gap-3">
        {isMobileSearchOpen ? (
          <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-right-5 duration-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, cities..."
                className="pl-9 pr-8 rounded-full bg-secondary/60 border-transparent text-sm h-9 w-full"
                autoFocus
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setQ("");
              }}
              className="text-sm font-semibold text-primary px-1 shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full relative">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.history.back()}
                  className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="font-bold text-lg tracking-tight">All Events</h1>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <Link 
                    to="/signin"
                    className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground" 
                    aria-label="Messages"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </div>
                
                <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
                  <img src={agatikeIcon} alt="Agatike" className="h-7 w-auto object-contain" />
                </Link>
              </>
            )}
            <div className="flex items-center gap-1">
              <Link to="/activity" className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground" aria-label="Activity">
                <Activity className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors text-foreground"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <section className="hidden md:block relative border-b border-border/40 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]"></div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20 lg:py-24">
          <div className="max-w-2xl text-left">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground">
              Discover amazing events.
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg font-medium">
              Get tickets to nightlife, music, sports, conferences and festivals across Africa. Skip
              the line and enjoy your time.
            </p>
          </div>

          <div className="mt-10 mb-12 rounded-3xl border border-border/40 bg-card/60 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150 max-w-[800px]">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 flex w-full bg-background rounded-2xl shadow-sm border border-border/40 p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex-1 flex items-center group">
                  <Search className="absolute left-4 h-5 w-5 text-primary" aria-hidden="true" />
                  <input
                    className="flex rounded-xl border-input px-4 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-primary/10 hover:border-border/80 md:text-sm w-full pl-12 h-14 bg-transparent border-0 shadow-none text-[15px] font-medium focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    placeholder="Search for events..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex w-full md:w-[250px] shrink-0 bg-background rounded-2xl shadow-sm border border-border/40 p-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                <div className="relative flex-1 flex items-center group">
                  <Ticket className="absolute left-4 h-4 w-4 text-primary" aria-hidden="true" />
                  <select
                    className="w-full pl-11 pr-8 h-14 bg-transparent border-0 text-[14px] font-medium focus:outline-none appearance-none"
                    value={cat || "All"}
                    onChange={(e) => setCat(e.target.value === "All" ? null : e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {dynamicCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md py-2 h-[64px] px-8 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 shrink-0 w-full md:w-auto active:scale-[0.98] transition-transform"
                style={{ background: "var(--gradient-primary)" }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
        {isLoading ? (
          <div className="mt-24 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg font-semibold">
                  Start hosting events and Experiences create your account
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  The dashboard is accessible on computer only for easy use.
                </p>
                <Link to="/dashboard">
                  <Button size="lg" className="mt-2 rounded-full font-semibold">
                    Become a host
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-lg font-semibold">No events match your search</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different city or category.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((e: any) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
