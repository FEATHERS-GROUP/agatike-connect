import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock, MapPin, Film, Ticket, ArrowLeft, Play, Star, Calendar, X, Search } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cinemas, movies } from "@/lib/mock-data";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

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

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <div className="hidden md:block">
        <Navbar />
        <DesktopMoviesView active={active} setActive={setActive} />
        <Footer />
      </div>
      <div className="md:hidden">
        <MobileMoviesView />
      </div>
    </div>
  );
}

// --------------------------------------------------------
// DESKTOP VIEW
// --------------------------------------------------------
function DesktopMoviesView({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  const activeMovie = movies.find((m) => m.id === active)!;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  return (
    <>
      <section className="relative w-full transition-all duration-700 ease-in-out">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={activeMovie.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20 blur-2xl scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="flex gap-10 items-start">
            <div className="w-[320px] shrink-0 relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                key={activeMovie.id}
                src={activeMovie.cover}
                alt={activeMovie.title}
                className="absolute inset-0 h-full w-full object-cover animate-in fade-in zoom-in-95 duration-500"
              />
            </div>

            <div className="w-full relative z-10 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                  <Film className="h-3.5 w-3.5" /> Now Playing
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> 4.8
                </span>
              </div>

              <h1 className="text-6xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-md">
                {activeMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80 font-medium mb-5">
                <span>{activeMovie.genre}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span>{activeMovie.duration}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="px-1.5 py-0.5 rounded border border-white/30 text-xs">{activeMovie.rating}</span>
              </div>

              <p className="text-white/70 text-base max-w-2xl leading-relaxed mb-8 drop-shadow-sm">
                {activeMovie.synopsis}
              </p>

              <div className="flex items-center gap-4 text-sm mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{activeMovie.cinema}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Today</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3 text-white/90">Select Showtime</h3>
                <div className="flex gap-3">
                  {activeMovie.showtimes.map((t, i) => (
                    <button
                      key={t}
                      className={`shrink-0 rounded-xl px-6 py-3 text-sm font-bold border transition-all ${
                        i === 0 
                          ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)]" 
                          : "bg-white/5 border-white/10 hover:border-primary/50 text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  asChild
                  className="h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold px-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/book/$eventId" params={{ eventId: activeMovie.id }}>
                    <Ticket className="mr-2 h-5 w-5" /> Book Ticket —{" "}
                    {formatCurrency(activeMovie.price || 8, activeMovie.currency)}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 rounded-2xl text-base font-bold px-8 bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 hover:text-white text-white"
                >
                  <Play className="mr-2 h-5 w-5" /> Watch Trailer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-12">
        <div className="px-6 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Now Showing</h2>
        </div>
        <div className="grid grid-cols-5 gap-4 px-6 pb-8">
          {movies.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`text-left group transition-all duration-300 ${
                active === m.id ? "scale-100 opacity-100" : "scale-95 opacity-60 hover:opacity-100 hover:scale-100"
              }`}
            >
              <div
                className={`relative aspect-[2/3] overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
                  active === m.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
                }`}
              >
                <img src={m.cover} alt={m.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white border border-white/10">
                  {m.rating}
                </span>
              </div>
              <h3 className="mt-4 truncate font-bold text-base">{m.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{m.cinema}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Premium Cinemas</h2>
            <p className="text-sm text-muted-foreground mt-1">Find theaters selling reserved seating on Agatike.</p>
          </div>
          <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/10">
            View All Cinemas
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4 pb-6">
          {cinemas.map((c) => (
            <Link key={c.id} to="/cinemas/$cinemaId" params={{ cinemaId: c.id }} className="group cursor-pointer">
              <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm transition-all duration-300 group-hover:shadow-[var(--shadow-card)] group-hover:border-primary/30">
                <div className="relative aspect-video w-full overflow-hidden">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-sm">{c.city}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-bold text-base truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Film className="h-3.5 w-3.5" />
                    <span>{c.screens} premium screens</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// --------------------------------------------------------
// MOBILE VIEW
// --------------------------------------------------------
function MobileMoviesView() {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<typeof movies[0] | null>(null);

  const featuredMovie = movies[0]; // Display the biggest blockbuster at the top

  return (
    <div className="pb-safe">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 px-4 py-3 pt-safe-top flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border/40">
        <button
          onClick={() => router.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg tracking-tight">Movies & Cinemas</h1>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search movies, cinemas, or genres..." 
            className="pl-9 h-10 rounded-xl bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all" 
          />
        </div>
      </div>

      {/* Featured Header */}
      <div className="px-4 py-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Featured Premiere</h2>
        <div 
          className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group active:scale-[0.98] transition-transform"
          onClick={() => setSelectedMovie(featuredMovie)}
        >
          <img 
            src={featuredMovie.cover} 
            alt={featuredMovie.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/20 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> Top Rated
            </span>
            <h3 className="text-3xl font-black leading-tight mb-2">{featuredMovie.title}</h3>
            <p className="text-sm text-white/80 line-clamp-2">{featuredMovie.synopsis}</p>
          </div>
        </div>
      </div>

      {/* Now Showing Horizontal List */}
      <div className="py-4">
        <div className="px-5 flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Now Showing</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-4 px-5 pb-6">
          {movies.slice(1).map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMovie(m)}
              className="w-[140px] shrink-0 text-left active:scale-[0.98] transition-transform"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-md border border-border/40">
                <img src={m.cover} alt={m.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {m.rating}
                </span>
              </div>
              <h4 className="font-bold text-sm mt-3 truncate">{m.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{m.cinema}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Cinemas */}
      <div className="py-4 pb-20">
        <div className="px-5 mb-4">
          <h2 className="text-xl font-bold tracking-tight">Cinemas</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-4 px-5 pb-6">
          {cinemas.map((c) => (
            <Link key={c.id} to="/cinemas/$cinemaId" params={{ cinemaId: c.id }} className="w-[260px] shrink-0 rounded-3xl border border-border/40 bg-card shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h4 className="font-bold truncate">{c.name}</h4>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{c.city}</span>
                  <span>{c.screens} screens</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Movie Details Drawer */}
      <Drawer open={!!selectedMovie} onOpenChange={(open) => !open && setSelectedMovie(null)}>
        <DrawerContent className="max-h-[90vh] p-0 border-border/60" aria-describedby="movie-description">
          {selectedMovie && (
            <div className="overflow-y-auto hide-scrollbar pb-safe">
              <DrawerHeader className="sr-only">
                <DrawerTitle>{selectedMovie.title}</DrawerTitle>
                <DrawerDescription id="movie-description">{selectedMovie.synopsis}</DrawerDescription>
              </DrawerHeader>
              <div className="relative aspect-video w-full">
                <img src={selectedMovie.cover} alt={selectedMovie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <button 
                  onClick={() => setSelectedMovie(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="px-5 -mt-6 relative z-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">{selectedMovie.title}</h2>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-medium mb-4">
                  <span>{selectedMovie.genre}</span> • <span>{selectedMovie.duration}</span> • <span className="border border-border/60 px-1 rounded">{selectedMovie.rating}</span>
                </div>
                
                <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                  {selectedMovie.synopsis}
                </p>

                <div className="bg-secondary/40 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-sm">{selectedMovie.cinema}</p>
                      <p className="text-xs text-muted-foreground">{selectedMovie.city}</p>
                    </div>
                  </div>
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-xs font-semibold mb-2">Today's Showtimes</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                      {selectedMovie.showtimes.map((t, i) => (
                        <button key={t} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border ${i === 0 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border/60"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/book/$eventId" params={{ eventId: selectedMovie.id }}>
                    <Ticket className="mr-2 h-5 w-5" /> Book Ticket — {formatCurrency(selectedMovie.price || 8, selectedMovie.currency)}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

    </div>
  );
}
