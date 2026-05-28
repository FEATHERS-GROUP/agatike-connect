import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, MapPin, Film, Ticket } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { cinemas, movies } from "@/lib/mock-data";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Movies — Agatike" },
      { name: "description", content: "Showtimes, reserved seats and IMAX from cinemas across Africa." },
      { property: "og:title", content: "Movies on Agatike" },
      { property: "og:description", content: "Africa's cinemas, all in one app." },
    ],
  }),
  component: Movies,
});

function Movies() {
  const [active, setActive] = useState(movies[0].id);
  const movie = movies.find((m) => m.id === active)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/60">
        <img src={movie.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[260px_1fr] md:py-16">
          <img src={movie.cover} alt={movie.title} className="aspect-[2/3] w-full rounded-2xl object-cover shadow-[var(--shadow-card)]" />
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur"><Film className="h-3.5 w-3.5 text-primary" /> Now playing</span>
            <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{movie.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{movie.genre} · {movie.duration} · {movie.rating}</p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">{movie.synopsis}</p>
            <div className="mt-6 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /> {movie.cinema}, {movie.city}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> Today</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {movie.showtimes.map((t) => (
                <button key={t} className="rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium hover:border-primary hover:bg-accent transition">
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                <Link to="/book/$eventId" params={{ eventId: movie.id }}>
                  <Ticket className="mr-2 h-4 w-4" /> Reserve seat — {movie.currency || '$'}{movie.price}
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full">Watch trailer</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-xl font-semibold">All movies showing this week</h2>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          {movies.map((m) => (
            <button key={m.id} onClick={() => setActive(m.id)} className={`text-left ${active === m.id ? "opacity-100" : "opacity-90 hover:opacity-100"}`}>
              <div className={`relative aspect-[2/3] overflow-hidden rounded-2xl border ${active === m.id ? "border-primary ring-2 ring-primary/30" : "border-transparent"}`}>
                <img src={m.cover} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur">{m.rating}</span>
              </div>
              <p className="mt-3 truncate font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.cinema}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Cinemas on Agatike</h2>
            <p className="text-sm text-muted-foreground">Theater partners selling seats through our platform.</p>
          </div>
          <Button variant="outline" className="rounded-full">List your cinema</Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cinemas.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <img src={c.image} alt={c.name} className="aspect-video w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.city} · {c.screens} screens</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}