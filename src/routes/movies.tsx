import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, MapPin, Film, Ticket, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { cinemas, movies } from "@/lib/mock-data";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Movies — Agatike" },
      {
        name: "description",
        content: "Showtimes, reserved seats and IMAX from cinemas across Africa.",
      },
      { property: "og:title", content: "Movies on Agatike" },
      { property: "og:description", content: "Africa's cinemas, all in one app." },
    ],
  }),
  component: Movies,
});

function Movies() {
  const [active, setActive] = useState(movies[0].id);
  const activeMovie = movies.find((m) => m.id === active)!;
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 md:max-w-md md:mx-auto md:border-x md:border-border/40 lg:max-w-none lg:border-x-0 lg:mx-0 shadow-xl lg:shadow-none">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border/40 pt-safe-top flex items-center gap-3">
        <button
          onClick={() => router.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg tracking-tight">Movies & Cinemas</h1>
      </div>

      <section className="relative overflow-hidden border-b border-border/60">
        <img
          src={activeMovie.cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 md:px-6 py-6 md:gap-8 md:py-16 md:grid-cols-[260px_1fr]">
          <img
            src={activeMovie.cover}
            alt={activeMovie.title}
            className="aspect-[2/3] w-[180px] md:w-full rounded-2xl object-cover shadow-[var(--shadow-card)] mx-auto md:mx-0"
          />
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs backdrop-blur">
              <Film className="h-3.5 w-3.5 text-primary" /> Now playing
            </span>
            <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{activeMovie.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeMovie.genre} · {activeMovie.duration} · {activeMovie.rating}
            </p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground mx-auto md:mx-0">
              {activeMovie.synopsis}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {activeMovie.cinema}, {activeMovie.city}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" /> Today
              </span>
            </div>
            <div className="mt-5 flex overflow-x-auto hide-scrollbar gap-2 pb-2 justify-center md:justify-start">
              {activeMovie.showtimes.map((t) => (
                <button
                  key={t}
                  className="rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium hover:border-primary hover:bg-accent transition shrink-0"
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
              <Button
                asChild
                className="rounded-full shadow-[var(--shadow-glow)] w-full md:w-auto"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Link to="/book/$eventId" params={{ eventId: activeMovie.id }}>
                  <Ticket className="mr-2 h-4 w-4" /> Reserve seat — {formatCurrency(activeMovie.price || 8, activeMovie.currency)}
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full w-full md:w-auto mt-2 md:mt-0">
                Watch trailer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <h2 className="text-lg md:text-xl font-semibold">All movies showing this week</h2>
        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-4 md:gap-5 md:grid-cols-4">
          {movies.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`text-left ${active === m.id ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
            >
              <div
                className={`relative aspect-[2/3] overflow-hidden rounded-2xl border ${active === m.id ? "border-primary ring-2 ring-primary/30" : "border-transparent"}`}
              >
                <img
                  src={m.cover}
                  alt={m.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                  {m.rating}
                </span>
              </div>
              <p className="mt-3 truncate font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.cinema}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Cinemas on Agatike</h2>
            <p className="text-sm text-muted-foreground">
              Theater partners selling seats through our platform.
            </p>
          </div>
          <Button variant="outline" className="rounded-full w-full md:w-auto">
            List your cinema
          </Button>
        </div>
        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          {cinemas.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <img
                src={c.image}
                alt={c.name}
                className="aspect-video w-full object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.city} · {c.screens} screens
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
