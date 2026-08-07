import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getOrganizerPublicData } from "@/api/organizers";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Users, 
  Instagram, 
  Twitter, 
  Globe, 
  Film, 
  Ticket,
  ChevronLeft
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/organizers/$organizerId")({
  component: OrganizerProfilePage,
});

function OrganizerProfilePage() {
  const { organizerId } = Route.useParams();
  const { isLoggedIn } = useUserAuth();
  const { toggleFollow, isFollowing } = useFollowedOrganizers();
  const [activeTab, setActiveTab] = useState<"events" | "venues" | "movies">("events");
  const [eventSubTab, setEventSubTab] = useState<"upcoming" | "past">("upcoming");

  const { data: org, isLoading } = useQuery({
    queryKey: ["organizer", organizerId],
    queryFn: () => getOrganizerPublicData({ data: { organizerId } } as any),
  });

  const following = isFollowing(organizerId);

  // Extract all workspaces data
  const workspaces = org?.workspaces || [];
  
  const allEvents = useMemo(() => {
    return workspaces.flatMap((w: any) => 
      (w.events || []).map((e: any) => ({ ...e, currency: w.currency }))
    ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [workspaces]);

  const allVenues = useMemo(() => {
    return workspaces.flatMap((w: any) => w.rentable_venues || []);
  }, [workspaces]);

  const allMovies = useMemo(() => {
    return workspaces.flatMap((w: any) => w.cinemas || []);
  }, [workspaces]);

  // Separate events into upcoming and past
  const upcomingEvents = useMemo(() => {
    const now = new Date().getTime();
    return allEvents.filter((e: any) => {
      // Simplistic upcoming check: start_date > now or no schedule so assume upcoming if recent
      if (e.schedules && e.schedules.length > 0) {
        return new Date(e.schedules[0].start_date).getTime() >= now;
      }
      // fallback if no schedules: if it was created in the last 60 days, treat as upcoming for display
      return new Date(e.created_at).getTime() > now - 60 * 24 * 60 * 60 * 1000;
    });
  }, [allEvents]);

  const pastEvents = useMemo(() => {
    return allEvents.filter((e: any) => !upcomingEvents.includes(e));
  }, [allEvents, upcomingEvents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center pt-20">
          <Skeleton className="w-32 h-32 rounded-full mb-4" />
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-2">Organizer Not Found</h1>
          <p className="text-muted-foreground mb-6">The organizer you are looking for does not exist.</p>
          <Button asChild>
            <Link to="/organizers">Back to Organizers</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const avatar = org.image || org.avatar || `https://i.pravatar.cc/150?u=${org.id}`;
  const twitterUrl = org.socials?.twitter || `https://twitter.com/${org.handle}`;
  const instagramUrl = org.socials?.instagram || `https://instagram.com/${org.handle}`;
  const followerCount = org.followers ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none flex flex-col">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Header Back Button Mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-2">
        <Link to="/organizers" className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <span className="font-semibold text-sm">Organizer Profile</span>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full">
        {/* Profile Header */}
        <section className="px-4 py-8 md:py-12 flex flex-col items-center border-b border-border/40">
          <div className="h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden border-2 border-border/60 shadow-lg mb-5 relative">
            <img src={avatar} alt={org.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{org.name}</h1>
            <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-primary fill-primary/20" />
          </div>
          <p className="text-base md:text-lg font-medium text-muted-foreground mb-4">
            @{org.handle} · {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount} followers
          </p>
          
          <p className="text-center text-sm md:text-base mb-6 max-w-xl text-muted-foreground">
            {org.bio || "No bio available for this organizer."}
          </p>

          <div className="flex gap-4 w-full justify-center mb-8">
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <Button
            onClick={() => toggleFollow(org.id)}
            variant={following ? "outline" : "default"}
            size="lg"
            className={`w-full max-w-[280px] rounded-full font-bold text-base h-12 ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
            style={following ? undefined : { background: "var(--gradient-primary)" }}
          >
            {following ? "Following" : "Follow"}
          </Button>
        </section>

        {/* Content Tabs */}
        <section className="py-6 px-4">
          <div className="flex gap-6 border-b border-border/40 mb-6 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("events")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase whitespace-nowrap transition-colors border-b-2 ${activeTab === "events" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Events & Experiences
            </button>
            <button
              onClick={() => setActiveTab("venues")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase whitespace-nowrap transition-colors border-b-2 ${activeTab === "venues" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Spaces / Venues
            </button>
            <button
              onClick={() => setActiveTab("movies")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase whitespace-nowrap transition-colors border-b-2 ${activeTab === "movies" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Cinemas
            </button>
          </div>

          {/* Events Tab Content */}
          {activeTab === "events" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-3 mb-6 bg-secondary/30 p-1.5 rounded-full inline-flex">
                <button
                  onClick={() => setEventSubTab("upcoming")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${eventSubTab === "upcoming" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setEventSubTab("past")}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${eventSubTab === "past" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Past ({pastEvents.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {(eventSubTab === "upcoming" ? upcomingEvents : pastEvents).map((event: any) => {
                  const cheapestTicket = event.event_tickets?.reduce(
                    (min: number, t: any) => Math.min(min, t.cost),
                    Infinity,
                  );
                  const price = cheapestTicket && cheapestTicket !== Infinity ? cheapestTicket : 0;
                  const date = event.schedules?.[0]?.start_date || event.created_at;

                  return (
                    <Link
                      key={event.id}
                      to="/events/$eventId"
                      params={{ eventId: event.id }}
                      className="group rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm transition-transform active:scale-95 block"
                    >
                      <div className="aspect-[4/3] relative">
                        <img
                          src={event.cover}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm">
                          {price > 0 ? formatCurrency(price, event.currency || "RWF") : "Free"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {event.category || "Event"}
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {(eventSubTab === "upcoming" ? upcomingEvents : pastEvents).length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border/40">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-sm">No {eventSubTab} events available.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Venues Tab Content */}
          {activeTab === "venues" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allVenues.map((venue: any) => (
                  <Link
                    key={venue.id}
                    to="/"
                    className="group rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm transition-transform active:scale-95 block"
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={venue.cover_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000"}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm uppercase tracking-wider">
                        {venue.type || "Venue"}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {venue.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{venue.city || "Local"}</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {allVenues.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border/40">
                    <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-sm">No spaces or venues published by this organizer.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Movies Tab Content */}
          {activeTab === "movies" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allMovies.map((movie: any) => (
                  <Link
                    key={movie.id}
                    to="/movies"
                    className="group rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm transition-transform active:scale-95 block flex items-center p-3 gap-4"
                  >
                    <img
                      src={movie.cover_url || movie.logo_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000"}
                      alt={movie.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {movie.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{movie.city || "Local"}</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {allMovies.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed border-border/40">
                    <Film className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-sm">No cinemas or movies available.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
