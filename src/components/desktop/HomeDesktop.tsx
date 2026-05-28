import { Link } from "@tanstack/react-router";
import { Search, MapPin, Sparkles, ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EventCard } from "@/components/site/EventCard";
import { Stories } from "@/components/site/Stories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, events, feedPosts, movies, movieStories, experiences } from "@/lib/mock-data";
import hero from "@/assets/hero-event.jpg";

export function HomeDesktop() {
  const trending = events.slice(0, 6);
  const weekend = events.slice(1, 5);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          <img src={hero} alt="Live event crowd" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Trending across Africa this week
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Live the moments that <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", color: "transparent" }}>move the culture.</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
              Tickets, stories, and after-movies from Africa's best nightlife, festivals, sports and experiences — all in one place.
            </p>

            <div className="mt-8 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Events, organizers, artists…" className="h-12 border-transparent bg-secondary/60 pl-9" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="City" className="h-12 border-transparent bg-secondary/60 pl-9" />
                </div>
                <Button className="h-12 rounded-xl px-6" style={{ background: "var(--gradient-primary)" }}>Search</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 px-1">
                {categories.map((c) => (
                  <button key={c} className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground">
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
            <p className="text-sm text-muted-foreground">Live moments from organizers you'll love.</p>
          </div>
          <Link to="/feed" className="text-sm text-primary hover:underline">Open feed →</Link>
        </div>
        <Stories />
      </section>

      {/* Cinema stories */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Now showing — cinemas near you</h2>
            <p className="text-sm text-muted-foreground">Movie theaters using Agatike to drop showtimes.</p>
          </div>
          <Link to="/movies" className="text-sm text-primary hover:underline">All movies →</Link>
        </div>
        <Stories items={movieStories} />
      </section>

      {/* Trending */}
      <Section title="Trending events" subtitle="What everyone's talking about right now">
        <Grid>{trending.map((e) => <EventCard key={e.id} event={e} />)}</Grid>
      </Section>

      {/* Weekend */}
      <Section title="Upcoming this weekend" subtitle="Lock your plans in for the next 48 hours">
        <Grid cols={4}>{weekend.map((e) => <EventCard key={e.id} event={e} />)}</Grid>
      </Section>

      {/* Movies */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">At the movies this week</h2>
            <p className="text-sm text-muted-foreground">Reserved seats and IMAX, straight from your phone.</p>
          </div>
          <Link to="/movies" className="text-sm text-primary hover:underline">Browse showtimes →</Link>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {movies.map((m) => (
            <Link key={m.id} to="/movies" className="group block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
                <img src={m.cover} alt={m.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur">{m.rating}</span>
              </div>
              <p className="mt-3 truncate font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.genre} · {m.duration}</p>
              <p className="mt-1 text-xs text-primary">{m.cinema}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Experiences — hike, run, surf</h2>
            <p className="text-sm text-muted-foreground">Outdoor adventures and clubs you can join this week.</p>
          </div>
          <Link to="/experiences" className="text-sm text-primary hover:underline">Explore all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {experiences.slice(0, 3).map((x) => (
            <Link key={x.id} to="/experiences" className="group overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={x.cover} alt={x.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs">{x.category}</span>
              </div>
              <div className="p-4">
                <p className="font-semibold">{x.title}</p>
                <p className="text-xs text-muted-foreground">{x.host} · {x.city}</p>
                <p className="mt-2 text-sm">{x.price === 0 ? "Free" : `From $${x.price}`} · {x.duration}</p>
              </div>
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
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {events.slice(0, 4).map((e) => (
            <div key={e.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1">
              <img src={e.cover} alt={e.organizer} className="h-16 w-16 rounded-full object-cover" loading="lazy" />
              <p className="mt-4 font-semibold">{e.organizer}</p>
              <p className="text-xs text-muted-foreground">@{e.organizerHandle} · {e.city}</p>
              <div className="mt-3 flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-primary text-primary" /> {e.rating} · {(e.attendees * 12).toLocaleString()} followers</div>
              <Button variant="outline" className="mt-4 w-full rounded-full">Follow</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Community feed teaser */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Moments from the community</h2>
            <p className="text-sm text-muted-foreground">Photos, videos and reviews from real attendees</p>
          </div>
          <Link to="/feed" className="text-sm text-primary hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {feedPosts.slice(0, 4).map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-2xl">
              <img src={p.image} alt={p.eventTitle} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                <p className="font-semibold">@{p.handle}</p>
                <p className="opacity-80 line-clamp-1">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create event CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 p-10 md:p-16" style={{ background: "var(--gradient-warm)" }}>
          <div className="relative max-w-2xl text-primary-foreground">
            <h3 className="text-3xl font-semibold md:text-4xl">Selling tickets? Agatike pays out the same week.</h3>
            <p className="mt-3 opacity-90">Build a branded event page, sell tickets and merch, scan attendees and pull analytics — all in one place.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/dashboard"><Button className="rounded-full bg-background text-foreground hover:bg-background/90">Open organizer dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Button variant="outline" className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10">See pricing</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <a href="#" className="text-sm text-primary hover:underline">View all →</a>
      </div>
      {children}
    </section>
  );
}

function Grid({ children, cols = 3 }: { children: React.ReactNode; cols?: 3 | 4 }) {
  const c = cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${c}`}>{children}</div>;
}
