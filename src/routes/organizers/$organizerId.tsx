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
  ChevronLeft,
  Mail,
  Phone,
  BadgeCheck,
  Facebook,
  Linkedin,
  ExternalLink,
  Tag
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

  const allCustomPages = useMemo(() => {
    return workspaces.flatMap((w: any) => w.workspace_pages || []);
  }, [workspaces]);

  // Separate events into upcoming and past
  const upcomingEvents = useMemo(() => {
    const now = new Date().getTime();
    return allEvents.filter((e: any) => {
      const dateStr = e.schedules?.[0]?.start_date || e.tour_stops?.[0]?.date;
      if (dateStr) {
        return new Date(dateStr).getTime() >= now;
      }
      // If we only have created_at, it's difficult to know if it's upcoming, but usually if it lacks a schedule/tour stop, it's incomplete or a draft. We'll default to past unless explicitly scheduled.
      return false;
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
  const followerCount = org.followers ?? 0;
  
  // Extract socials
  const socials = org.socials || {};
  const twitterUrl = socials.twitter || (org.handle ? `https://twitter.com/${org.handle}` : null);
  const instagramUrl = socials.instagram || (org.handle ? `https://instagram.com/${org.handle}` : null);
  const facebookUrl = socials.facebook;
  const linkedinUrl = socials.linkedin;
  const websiteUrl = socials.website;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 flex flex-col">
      <div className="hidden md:block">
        <Navbar />
      </div>

      <main className="flex-1 w-full relative">
        {/* Cover Banner */}
        <div className="w-full h-40 md:h-64 lg:h-80 bg-gradient-to-r from-primary/80 via-primary/60 to-purple-500 relative">
          {/* Desktop Back Button */}
          <div className="hidden md:flex absolute top-6 left-6 z-10">
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-md border-border/40 hover:bg-background rounded-full font-medium" asChild>
              <Link to="/organizers" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Organizers
              </Link>
            </Button>
          </div>
          {/* Mobile Back Button */}
          <div className="md:hidden absolute top-safe-top left-4 z-10 mt-4">
            <Button variant="secondary" size="icon" className="bg-background/80 backdrop-blur-md rounded-full shadow-sm" asChild>
              <Link to="/organizers">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile Content Wrapper */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 md:-mt-24 lg:-mt-32 relative z-20 mb-8">
          <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="p-6 md:p-8 lg:p-10 flex flex-col md:flex-row gap-6 md:gap-10">
              
              {/* Left Column: Avatar & Actions */}
              <div className="flex flex-col items-center md:items-start shrink-0">
                <div className="h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 rounded-full overflow-hidden border-4 border-background shadow-2xl bg-muted mb-4 md:mb-6">
                  <img src={avatar} alt={org.name} className="w-full h-full object-cover" />
                </div>
                
                <Button
                  onClick={() => toggleFollow(org.id)}
                  variant={following ? "outline" : "default"}
                  size="lg"
                  className={`w-full max-w-xs rounded-full font-bold text-base h-12 mb-4 ${following ? "" : "shadow-[var(--shadow-glow)]"}`}
                  style={following ? undefined : { background: "var(--gradient-primary)" }}
                >
                  {following ? "Following" : "Follow"}
                </Button>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full max-w-xs">
                  {twitterUrl && (
                    <Button variant="outline" size="icon" className="rounded-full bg-background hover:bg-secondary/50" asChild>
                      <a href={twitterUrl} target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /></a>
                    </Button>
                  )}
                  {instagramUrl && (
                    <Button variant="outline" size="icon" className="rounded-full bg-background hover:bg-secondary/50" asChild>
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /></a>
                    </Button>
                  )}
                  {facebookUrl && (
                    <Button variant="outline" size="icon" className="rounded-full bg-background hover:bg-secondary/50" asChild>
                      <a href={facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /></a>
                    </Button>
                  )}
                  {linkedinUrl && (
                    <Button variant="outline" size="icon" className="rounded-full bg-background hover:bg-secondary/50" asChild>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /></a>
                    </Button>
                  )}
                  {websiteUrl && (
                    <Button variant="outline" size="icon" className="rounded-full bg-background hover:bg-secondary/50" asChild>
                      <a href={websiteUrl} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" /></a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="flex-1 flex flex-col text-center md:text-left mt-2 md:mt-16 lg:mt-24">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{org.name}</h1>
                  {org.business && (
                    <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mx-auto md:mx-0">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified Business
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm md:text-base font-medium text-muted-foreground mb-6">
                  <span className="text-foreground">@{org.handle}</span>
                  <span className="hidden md:inline text-border">•</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount} followers</span>
                  {org.country && (
                    <>
                      <span className="hidden md:inline text-border">•</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {org.country}</span>
                    </>
                  )}
                  {org.field && (
                    <>
                      <span className="hidden md:inline text-border">•</span>
                      <span className="text-muted-foreground">{org.field}</span>
                    </>
                  )}
                </div>

                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-2xl mb-4 text-muted-foreground mx-auto md:mx-0">
                  <p>{org.bio || "This organizer hasn't added a bio yet."}</p>
                </div>

                {/* Speciality Tags */}
                {org.speciality?.tags && org.speciality.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    {org.speciality.tags.map((tag: string, i: number) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                        <Tag className="w-3 h-3 mr-1 opacity-50" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom Pages (if available) */}
                {allCustomPages.length > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2 justify-center md:justify-start">
                    {allCustomPages.map((page: any) => (
                      <Button key={page.id} variant="outline" size="sm" className="rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-medium" asChild>
                        <Link to="/p/$" params={{ _splat: page.slug }}>
                          <ExternalLink className="mr-2 h-3.5 w-3.5" /> {page.title || page.slug}
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Contact Info (if available) */}
                {(org.email || org.phone) && (
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-auto">
                    {org.email && (
                      <Button variant="secondary" size="sm" className="rounded-full font-medium" asChild>
                        <a href={`mailto:${org.email}`}>
                          <Mail className="mr-2 h-4 w-4" /> Email Organizer
                        </a>
                      </Button>
                    )}
                    {org.phone && (
                      <Button variant="secondary" size="sm" className="rounded-full font-medium" asChild>
                        <a href={`tel:${org.phone}`}>
                          <Phone className="mr-2 h-4 w-4" /> Call Organizer
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <section className="py-6 px-4 max-w-5xl mx-auto w-full">
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
                  const date = event.schedules?.[0]?.start_date || event.tour_stops?.[0]?.date || event.created_at;

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
