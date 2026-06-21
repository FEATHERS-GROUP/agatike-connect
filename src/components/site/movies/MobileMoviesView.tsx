import { Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock, MapPin, Film, Ticket, ArrowLeft, Play, Star, Calendar, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { formatCurrency } from "@/lib/currency";

export function MobileMoviesView({ movies, cinemas, activeId, setActive }: { movies: any[]; cinemas: any[]; activeId?: string; setActive?: (id: string) => void; }) {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<(typeof movies)[0] | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMovie) {
      const uniqueDates = Array.from(new Set(selectedMovie.showtimes.map((st: any) => st.date))).sort() as string[];
      setSelectedDate(uniqueDates[0]);
    }
  }, [selectedMovie]);

  const uniqueDates = selectedMovie ? (Array.from(new Set(selectedMovie.showtimes.map((st: any) => st.date))).sort() as string[]) : [];
  const currentDate = selectedDate && uniqueDates.includes(selectedDate) ? selectedDate : uniqueDates[0];

  // Calculate starting price for selected movie
  const startingPrice = selectedMovie ? Math.min(
    ...selectedMovie.showtimes.flatMap((st: any) => 
      st.tiers?.length > 0 
        ? st.tiers.map((t: any) => t.price_override || t.ticket_tier.price)
        : [st.basePrice || 10]
    )
  ) : 10;

  const featuredMovie = movies[0];

  if (!featuredMovie) return null;

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
        <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
          Featured Premiere
        </h2>
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
            <Link
              key={c.id}
              to="/cinemas/$cinemaId"
              params={{ cinemaId: c.id }}
              className="w-[260px] shrink-0 rounded-3xl border border-border/40 bg-card shadow-sm overflow-hidden"
            >
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
        <DrawerContent
          className="max-h-[90vh] p-0 border-border/60"
          aria-describedby="movie-description"
        >
          {selectedMovie && (
            <div className="overflow-y-auto hide-scrollbar pb-safe">
              <DrawerHeader className="sr-only">
                <DrawerTitle>{selectedMovie.title}</DrawerTitle>
                <DrawerDescription id="movie-description">
                  {selectedMovie.synopsis}
                </DrawerDescription>
              </DrawerHeader>
              <div className="relative aspect-video w-full">
                <img
                  src={selectedMovie.cover}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
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
                  <span>{selectedMovie.genre}</span> • <span>{selectedMovie.duration}</span> •{" "}
                  <span className="border border-border/60 px-1 rounded">
                    {selectedMovie.rating}
                  </span>
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
                    <p className="text-xs font-semibold mb-2">Select Date</p>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-3">
                      {uniqueDates.map((d: string) => {
                        const isSelected = d === currentDate;
                        const dateObj = new Date(d);
                        const today = new Date();
                        const isToday = dateObj.toDateString() === today.toDateString();
                        const label = isToday ? "Today" : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        
                        return (
                          <button
                            key={d}
                            onClick={() => setSelectedDate(d)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border ${isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border/60"}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/book-movie/$movieId" params={{ movieId: selectedMovie.id }} search={{ date: currentDate }}>
                    <Ticket className="mr-2 h-5 w-5" /> Book Ticket —{" "}
                    Starting at {formatCurrency(startingPrice, selectedMovie.showtimes[0]?.currency || "RWF")}
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
