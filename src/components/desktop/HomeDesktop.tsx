import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, MapPin, Sparkles, ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EventCard } from "@/components/site/EventCard";
import { Stories } from "@/components/site/Stories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import hero from "@/assets/hero-event.jpg";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { getOrganizersRatings } from "@/api/feedback";
import { getGlobalFeedPosts } from "@/api/experience";
import { getPublicEvents } from "@/api/events";
import { getPublicMovieSchedules } from "@/api/cinemas";
import { mapDbEventToEvent, isWeekendEvent } from "@/lib/utils";
import { useUserAuth } from "@/contexts/UserAuthContext";

// Stubbed mock data
import { HeroSearch } from "@/components/desktop/HeroSearch";

const movies: any[] = [
  {
    id: "m1",
    title: "Deadpool & Wolverine",
    genre: "Action / Comedy",
    duration: "2h 7m",
    rating: "R",
    cover: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
    cinema: "Century Cinemax",
    price: 12,
    currency: "USD",
  },
  {
    id: "m2",
    title: "Inside Out 2",
    genre: "Animation / Family",
    duration: "1h 36m",
    rating: "PG",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg",
    cinema: "Silverbird Cinemas",
    price: 10,
    currency: "USD",
  },
  {
    id: "m3",
    title: "Dune: Part Two",
    genre: "Sci-Fi / Action",
    duration: "2h 46m",
    rating: "PG-13",
    cover: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_Part_Two_poster.jpg",
    cinema: "Ster-Kinekor",
    price: 15,
    currency: "USD",
  },
  {
    id: "m4",
    title: "Bad Boys: Ride or Die",
    genre: "Action / Comedy",
    duration: "1h 55m",
    rating: "R",
    cover: "https://upload.wikimedia.org/wikipedia/en/8/8b/Bad_Boys_Ride_or_Die_%282024%29_poster.jpg",
    cinema: "Canal Olympia",
    price: 10,
    currency: "USD",
  },
];

const movieStories: any[] = [
  {
    id: "cs1",
    name: "Century Cinemax",
    avatar: "https://ui-avatars.com/api/?name=Century+Cinemax&background=000&color=fff",
    items: [
      { id: "cs1i1", image: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
      { id: "cs1i2", image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
    ],
  },
  {
    id: "cs2",
    name: "Silverbird Cinemas",
    avatar: "https://ui-avatars.com/api/?name=Silverbird+Cinemas&background=1D4ED8&color=fff",
    items: [
      { id: "cs2i1", image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
      { id: "cs2i2", image: "https://upload.wikimedia.org/wikipedia/en/8/8b/Bad_Boys_Ride_or_Die_%282024%29_poster.jpg" },
    ],
  },
  {
    id: "cs3",
    name: "Ster-Kinekor",
    avatar: "https://ui-avatars.com/api/?name=Ster-Kinekor&background=E11D48&color=fff",
    items: [
      { id: "cs3i1", image: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_Part_Two_poster.jpg" },
      { id: "cs3i2", image: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
    ],
  },
  {
    id: "cs4",
    name: "Canal Olympia",
    avatar: "https://ui-avatars.com/api/?name=Canal+Olympia&background=047857&color=fff",
    items: [
      { id: "cs4i1", image: "https://upload.wikimedia.org/wikipedia/en/8/8b/Bad_Boys_Ride_or_Die_%282024%29_poster.jpg" },
      { id: "cs4i2", image: "https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_Part_Two_poster.jpg" },
    ],
  },
  {
    id: "cs5",
    name: "Nu Metro",
    avatar: "https://ui-avatars.com/api/?name=Nu+Metro&background=7C3AED&color=fff",
    items: [
      { id: "cs5i1", image: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
      { id: "cs5i2", image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
    ],
  },
];

const feedPosts: any[] = [];
const organizers: any[] = [];

export function HomeDesktop() {
  const { toggleFollow, isFollowing, followedIds } = useFollowedOrganizers();
  const { isLoggedIn } = useUserAuth();

  const { data: dbOrganizers } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: dbPosts = [] } = useQuery({
    queryKey: ["global-feed-posts"],
    queryFn: () => getGlobalFeedPosts(),
  });

  const { data: ratingsMap = {} } = useQuery({
    queryKey: ["organizers-ratings"],
    queryFn: () => getOrganizersRatings(),
  });

  const { data: dbEvents = [] } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["public_schedules_home_desktop"],
    queryFn: () =>
      getPublicMovieSchedules({ data: { date: new Date().toISOString().split("T")[0] } } as any),
  });

  const mappedEvents = useMemo(() => {
    const publicEvents = dbEvents.filter(
      (e: any) => e.allowed_public === true && e.deleted !== true,
    );
    return publicEvents.map(mapDbEventToEvent).filter(Boolean);
  }, [dbEvents]);

  const trending = useMemo(() => {
    return [...mappedEvents]
      .sort((a: any, b: any) => (b.attendees || 0) - (a.attendees || 0))
      .slice(0, 6);
  }, [mappedEvents]);

  const weekend = useMemo(() => {
    let filtered = mappedEvents.filter((e: any) => isWeekendEvent(e.date));
    if (filtered.length === 0) {
      filtered = mappedEvents;
    }
    return filtered.slice(0, 4);
  }, [mappedEvents]);

  const dynamicMovieStories = useMemo(() => {
    if (!schedules || schedules.length === 0) return movieStories;
    const cinemasMap = new Map<string, any>();
    schedules.forEach((s: any) => {
      const c = s.cinema;
      const m = s.movie;
      if (!c || !m) return;
      if (!cinemasMap.has(c.id)) {
        cinemasMap.set(c.id, {
          id: c.id,
          name: c.name,
          avatar: c.logo_url || c.cover_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`,
          items: [],
          _movieIds: new Set(),
        });
      }
      const cinemaObj = cinemasMap.get(c.id);
      if (!cinemaObj._movieIds.has(m.id)) {
        cinemaObj._movieIds.add(m.id);
        cinemaObj.items.push({
          id: `${c.id}-${m.id}`,
          image: m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800",
        });
      }
    });
    
    const result = Array.from(cinemasMap.values());
    
    // Fill the rest with mock data to make it look populated
    const mockToAdd = movieStories.filter(mock => !result.some(r => r.name === mock.name));
    return [...result, ...mockToAdd].slice(0, 6);
  }, [schedules]);

  const dynamicMovies = useMemo(() => {
    if (!schedules || schedules.length === 0) return movies;
    const moviesMap = new Map<string, any>();
    schedules.forEach((s: any) => {
      const m = s.movie;
      const c = s.cinema;
      if (!m || !c) return;
      const movieKey = `${m.id}-${c.id}`;
      if (!moviesMap.has(movieKey)) {
        moviesMap.set(movieKey, {
          id: m.id,
          title: m.title,
          genre: m.genre || "Drama",
          duration: m.duration ? `${m.duration}m` : "2h",
          rating: m.rating || "PG",
          cover: m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
          cinema: c.name,
        });
      }
    });
    const result = Array.from(moviesMap.values());
    
    // Fill the rest with mock data
    const mockToAdd = movies.filter(mock => !result.some(r => r.title === mock.title));
    return [...result, ...mockToAdd].slice(0, 4); // Grid shows 4
  }, [schedules]);

  const allOrganizers = dbOrganizers && dbOrganizers.length > 0 ? dbOrganizers : organizers;
  // On home, hide organizers the user is already following
  const list = allOrganizers.filter((org: any) => !isFollowing(org.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          <img
            src={hero}
            alt="Live event crowd"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Trending across Africa this week
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Live the moments that{" "}
              <span
                style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                move the culture.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
              Tickets, stories, and after-movies from Africa's best nightlife, festivals, sports and
              experiences — all in one place.
            </p>

            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Stories from recent events</h2>
            <p className="text-sm text-muted-foreground">
              Live moments from organizers you'll love.
            </p>
          </div>
          <Link to="/feed" className="text-sm text-primary hover:underline">
            Open feed →
          </Link>
        </div>
        <Stories />
      </section>

      {/* Cinema stories */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Now showing — cinemas near you</h2>
            <p className="text-sm text-muted-foreground">
              Movie theaters using Agatike to drop showtimes.
            </p>
          </div>
          <Link to="/movies" className="text-sm text-primary hover:underline">
            All movies →
          </Link>
        </div>
        <Stories items={dynamicMovieStories} />
      </section>

      {/* Trending */}
      <Section title="Trending events" subtitle="What everyone's talking about right now">
        <Grid>
          {trending.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </Grid>
      </Section>

      {/* Weekend */}
      <Section title="Upcoming this weekend" subtitle="Lock your plans in for the next 48 hours">
        <Grid cols={4}>
          {weekend.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </Grid>
      </Section>

      {/* Movies */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">At the movies this week</h2>
            <p className="text-sm text-muted-foreground">
              Reserved seats and IMAX, straight from your phone.
            </p>
          </div>
          <Link to="/movies" className="text-sm text-primary hover:underline">
            Browse showtimes →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {dynamicMovies.map((m: any) => (
            <Link key={m.id} to="/movies" className="group block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
                <img
                  src={m.cover}
                  alt={m.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                  {m.rating}
                </span>
              </div>
              <p className="mt-3 truncate font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">
                {m.genre} · {m.duration}
              </p>
              <p className="mt-1 text-xs text-primary">{m.cinema}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Organizers */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Popular organizers</h2>
            <p className="text-sm text-muted-foreground">Africa's most loved creators and venues</p>
          </div>
          <Link to="/organizers" className="text-sm text-primary hover:underline">
            See all →
          </Link>
        </div>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground border border-border/40 rounded-2xl bg-card">
            <Star className="h-8 w-8 text-primary" />
            <p className="font-medium text-sm">You're following all our top organizers!</p>
            <Link to="/organizers" className="text-xs font-bold text-primary hover:underline">
              Browse all organizers →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {list.slice(0, 4).map((org) => {
              const followerCount = org.followers ?? 0;
              const avatar = org.avatar || org.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=random`;
              return (
                <div
                  key={org.id}
                  className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 flex flex-col items-center text-center animate-in fade-in duration-300"
                >
                  <img
                    src={avatar}
                    alt={org.name}
                    className="h-16 w-16 rounded-full object-cover"
                    loading="lazy"
                  />
                  <p className="mt-4 font-semibold">{org.name}</p>
                  <p className="text-xs text-muted-foreground">@{org.handle}</p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {followerCount >= 1000
                      ? (followerCount / 1000).toFixed(1) + "k"
                      : followerCount}{" "}
                    {followerCount === 1 ? "follower" : "followers"}
                  </p>

                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-medium">
                      {ratingsMap[org.id]?.avg?.toFixed(1) || "4.5"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="mt-4 w-full rounded-full"
                    variant={isFollowing(org.id) ? "outline" : "default"}
                    onClick={() => toggleFollow(org.id)}
                  >
                    {isFollowing(org.id) ? "Following" : "Follow"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community feed teaser */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Moments from the community</h2>
            <p className="text-sm text-muted-foreground">
              Photos, videos and reviews from real attendees
            </p>
          </div>
          <Link to="/feed" className="text-sm text-primary hover:underline">
            See all →
          </Link>
        </div>
        {(() => {
          const filteredPosts = isLoggedIn
            ? dbPosts.filter((post) => isFollowing(post.organizerId))
            : dbPosts;

          if (filteredPosts.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border border-border/40">
                <p className="text-muted-foreground font-medium text-sm">
                  Follow organizers to see their community moments here.
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {filteredPosts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl"
                >
                  <img
                    src={p.image ?? undefined}
                    alt={p.caption || "Community moment"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <p className="font-semibold">@{p.handle}</p>
                    <p className="opacity-80 line-clamp-1">{p.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Create event CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/60 p-10 md:p-16"
          style={{ background: "var(--gradient-warm)" }}
        >
          <div className="relative max-w-2xl text-primary-foreground">
            <h3 className="text-3xl font-semibold md:text-4xl">
              Selling tickets? Agatike pays out the same week.
            </h3>
            <p className="mt-3 opacity-90">
              Build a branded event page, sell tickets and merch, scan attendees and pull analytics
              — all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button className="rounded-full bg-background text-foreground hover:bg-background/90">
                  Open organizer dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10"
              >
                See pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <a href="#" className="text-sm text-primary hover:underline">
          View all →
        </a>
      </div>
      {children}
    </section>
  );
}

function Grid({ children, cols = 3 }: { children: React.ReactNode; cols?: 3 | 4 }) {
  const c = cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${c}`}>{children}</div>;
}
