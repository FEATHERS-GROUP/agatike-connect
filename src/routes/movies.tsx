import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock, MapPin, Film, Ticket, ArrowLeft, Play, Star, Calendar } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { cinemas, movies } from "@/lib/mock-data";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Movies — Agatike Connect" },
      {
        name: "description",
        content: "Showtimes, reserved seats and premium cinemas.",
      },
      { property: "og:title", content: "Movies on Agatike" },
      { property: "og:description", content: "The best cinemas, all in one app." },
    ],
  }),
  component: Movies,
});

function Movies() {
  const [active, setActive] = useState(movies[0].id);
  const activeMovie = movies.find((m) => m.id === active)!;
  const router = useRouter();

  // Scroll to top when active movie changes on mobile to show the hero
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Back Button - Glassmorphic floating */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 pt-safe-top flex items-center justify-between pointer-events-none">
        <button
          onClick={() => router.history.back()}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative w-full transition-all duration-700 ease-in-out">
        {/* Desktop Blurred Background */}
        <div className="hidden md:block absolute inset-0 overflow-hidden">
          <img
            src={activeMovie.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 blur-2xl scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-0 md:px-6 md:py-16">
          <div className="flex flex-col md:flex-row gap-0 md:gap-10 items-end md:items-start">
            
            {/* Mobile Hero Image */}
            <div className="w-full md:w-[320px] shrink-0 relative aspect-[4/5] md:aspect-[2/3] md:rounded-3xl overflow-hidden shadow-2xl">
              <img
                key={activeMovie.id}
                src={activeMovie.cover}
                alt={activeMovie.title}
                className="absolute inset-0 h-full w-full object-cover animate-in fade-in zoom-in-95 duration-500"
              />
              {/* Mobile Gradient Overlay to blend into background */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>

            {/* Content Details */}
            <div className="w-full px-5 md:px-0 -mt-20 md:mt-0 relative z-10 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                  <Film className="h-3.5 w-3.5" /> Now Playing
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> 4.8
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-md">
                {activeMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 font-medium mb-5">
                <span>{activeMovie.genre}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span>{activeMovie.duration}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="px-1.5 py-0.5 rounded border border-white/30 text-xs">{activeMovie.rating}</span>
              </div>

              <p className="text-white/70 text-sm md:text-base max-w-2xl leading-relaxed mb-8 drop-shadow-sm line-clamp-3 md:line-clamp-none">
                {activeMovie.synopsis}
              </p>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 text-sm mb-8 bg-card/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-4 md:p-0 rounded-2xl border border-border/40 md:border-transparent">
                <div className="flex items-center gap-2 text-muted-foreground md:text-white/80">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{activeMovie.cinema}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground md:text-white/80">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Today</span>
                </div>
              </div>

              {/* Showtimes */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3 text-foreground md:text-white/90">Select Showtime</h3>
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-5 px-5 md:mx-0 md:px-0">
                  {activeMovie.showtimes.map((t, i) => (
                    <button
                      key={t}
                      className={`shrink-0 rounded-xl px-6 py-3 text-sm font-bold border transition-all ${
                        i === 0 
                          ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)]" 
                          : "bg-card md:bg-white/5 border-border md:border-white/10 hover:border-primary/50 text-foreground md:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  asChild
                  className="w-full sm:w-auto h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold px-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/book/$eventId" params={{ eventId: activeMovie.id }}>
                    <Ticket className="mr-2 h-5 w-5" /> Book Ticket —{" "}
                    {formatCurrency(activeMovie.price || 8, activeMovie.currency)}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-14 rounded-2xl text-base font-bold px-8 bg-card/50 md:bg-white/5 backdrop-blur-md border-border/60 md:border-white/20 hover:bg-card md:hover:bg-white/10 md:text-white"
                >
                  <Play className="mr-2 h-5 w-5" /> Watch Trailer
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Movies Carousel */}
      <section className="mx-auto max-w-7xl py-12">
        <div className="px-5 md:px-6 mb-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Now Showing</h2>
        </div>
        
        {/* Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 px-5 md:px-6 md:grid md:grid-cols-4 lg:grid-cols-5 md:snap-none md:overflow-visible pb-8">
          {movies.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`snap-start shrink-0 w-[140px] sm:w-[160px] md:w-auto text-left group transition-all duration-300 ${
                active === m.id ? "scale-100 opacity-100" : "scale-95 opacity-60 hover:opacity-100 hover:scale-100"
              }`}
            >
              <div
                className={`relative aspect-[2/3] overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
                  active === m.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
                }`}
              >
                <img
                  src={m.cover}
                  alt={m.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white border border-white/10">
                  {m.rating}
                </span>
              </div>
              <h3 className="mt-4 truncate font-bold text-sm md:text-base">{m.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{m.cinema}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Cinemas */}
      <section className="mx-auto max-w-7xl px-5 md:px-6 pb-24">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Premium Cinemas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find theaters selling reserved seating on Agatike.
            </p>
          </div>
          <Button variant="outline" className="rounded-full w-full md:w-auto border-primary/20 text-primary hover:bg-primary/10">
            View All Cinemas
          </Button>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 pb-6 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:snap-none md:overflow-visible">
          {cinemas.map((c) => (
            <div key={c.id} className="snap-start shrink-0 w-[260px] md:w-auto group cursor-pointer">
              <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 group-hover:shadow-[var(--shadow-card)] group-hover:border-primary/30">
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-sm">{c.city}</p>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <p className="font-bold text-base truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Film className="h-3.5 w-3.5" />
                    <span>{c.screens} premium screens</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Floating Action Button (Sticky Bottom) for Booking */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe">
        <Button
          asChild
          className="w-full h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Link to="/book/$eventId" params={{ eventId: activeMovie.id }}>
            <Ticket className="mr-2 h-5 w-5" /> Book Ticket —{" "}
            {formatCurrency(activeMovie.price || 8, activeMovie.currency)}
          </Link>
        </Button>
      </div>
    </div>
  );
}
