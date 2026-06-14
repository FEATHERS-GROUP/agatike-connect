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
import { mapDbEventToEvent, isWeekendEvent } from "@/lib/utils";
import { useUserAuth } from "@/contexts/UserAuthContext";

// Stubbed mock data
const categories: any[] = [
  "🎵 Music", "🎭 Theatre", "🏀 Sports", "🎨 Art", "🍔 Food", "🎤 Comedy", "🎬 Film", "🌍 Culture",
];


const movies: any[] = [
  {
    id: "m1",
    title: "Black Panther: Wakanda Forever",
    genre: "Action / Sci-Fi",
    duration: "2h 41m",
    rating: "PG-13",
    cover: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
    cinema: "IMAX Nairobi",
    price: 12,
    currency: "USD",
  },
  {
    id: "m2",
    title: "The Woman King",
    genre: "Drama / History",
    duration: "2h 15m",
    rating: "PG-13",
    cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600",
    cinema: "Silverbird Lagos",
    price: 10,
    currency: "USD",
  },
  {
    id: "m3",
    title: "Lionheart",
    genre: "Comedy / Drama",
    duration: "1h 35m",
    rating: "PG",
    cover: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600",
    cinema: "Nu Metro Accra",
    price: 9,
    currency: "USD",
  },
  {
    id: "m4",
    title: "Atlantics",
    genre: "Drama / Fantasy",
    duration: "1h 46m",
    rating: "NR",
    cover: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600",
    cinema: "IMAX Nairobi",
    price: 10,
    currency: "USD",
  },
];

const movieStories: any[] = [
  {
    id: "cs1",
    name: "IMAX Nairobi",
    avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&h=150&fit=crop",
    items: [
      { id: "cs1i1", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800" },
      { id: "cs1i2", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800" },
    ],
  },
  {
    id: "cs2",
    name: "Silverbird Lagos",
    avatar: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150&h=150&fit=crop",
    items: [
      { id: "cs2i1", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800" },
    ],
  },
  {
    id: "cs3",
    name: "Ster-Kinekor CPT",
    avatar: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=150&h=150&fit=crop",
    items: [
      { id: "cs3i1", image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800" },
      { id: "cs3i2", image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800" },
    ],
  },
  {
    id: "cs4",
    name: "Nu Metro Accra",
    avatar: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=150&h=150&fit=crop",
    items: [
      { id: "cs4i1", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800" },
    ],
  },
  {
    id: "cs5",
    name: "CineVis Kigali",
    avatar: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=150&h=150&fit=crop",
    items: [
      { id: "cs5i1", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800" },
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

  const mappedEvents = useMemo(() => {
    const publicEvents = dbEvents.filter((e: any) => e.allowed_public === true && e.deleted !== true);
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

            <div className="mt-8 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Events, organizers, artists…"
                    className="h-12 border-transparent bg-secondary/60 pl-9"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="City"
                    className="h-12 border-transparent bg-secondary/60 pl-9"
                  />
                </div>
                <Button
                  className="h-12 rounded-xl px-6"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Search
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 px-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
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
        <Stories items={movieStories} />
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
          {movies.map((m) => (
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
              const avatar = org.avatar || org.image || `https://i.pravatar.cc/150?u=${org.id}`;
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
