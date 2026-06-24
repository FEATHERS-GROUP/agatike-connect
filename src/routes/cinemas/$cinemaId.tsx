import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { MapPin, Film, Ticket, ArrowLeft, Calendar, Info, Clock, Play } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

import { useQuery } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";
import { MOCK_MOVIES } from "@/lib/mock-movies";

const MOCK_CINEMAS = [
  {
    id: "mc1",
    name: "Palace Cinema",
    city: "Sydney",
    screens: 4,
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
    isClosed: true,
  },
  {
    id: "mc2",
    name: "Kinepolis",
    city: "Brussels",
    screens: 12,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    isClosed: true,
  },
  {
    id: "mc3",
    name: "Zoo Palast",
    city: "Berlin",
    screens: 6,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    isClosed: true,
  },
  {
    id: "mc4",
    name: "Zawya Cinema",
    city: "Cairo",
    screens: 2,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    isClosed: true,
  },
  {
    id: "mc5",
    name: "Novo Cinemas",
    city: "Doha",
    screens: 8,
    image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800",
    isClosed: true,
  },
];

export const Route = createFileRoute("/cinemas/$cinemaId")({
  component: CinemaDetail,
});

function CinemaDetail() {
  const { cinemaId } = Route.useParams();
  const router = useRouter();

  const isMock = cinemaId.startsWith("m");

  const { data: dbCinema, isLoading } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } }),
    enabled: !isMock,
  });

  const { cinema, cinemaMovies } = useMemo(() => {
    if (isMock) {
      const mockCinema = MOCK_CINEMAS.find((c) => c.id === cinemaId);
      return { cinema: mockCinema, cinemaMovies: [] };
    }

    if (!dbCinema) return { cinema: null, cinemaMovies: [] };

    const formattedCinema = {
      id: dbCinema.id,
      name: dbCinema.name,
      city: dbCinema.city,
      screens: dbCinema.screens?.length || 1,
      image:
        dbCinema.cover_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    };

    const moviesMap = new Map();
    (dbCinema.schedules || []).forEach((s: any) => {
      const m = s.movie;
      if (!m) return;
      if (!moviesMap.has(m.id)) {
        moviesMap.set(m.id, {
          id: m.id,
          title: m.title,
          cover:
            m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
          rating: m.rating || "PG",
          genre: m.genre || "Drama",
          duration: `${m.duration_minutes || 120}m`,
          price: s.ticket_tiers?.[0]?.price_override || 3000,
          currency: s.ticket_tiers?.[0]?.currency || "RWF",
          synopsis: m.synopsis || "No synopsis available.",
          showtimes: [],
        });
      }
      const timeStr = s.start_time ? s.start_time.substring(0, 5) : "12:00";
      const movieEntry = moviesMap.get(m.id);
      if (!movieEntry.showtimes.includes(timeStr)) {
        movieEntry.showtimes.push(timeStr);
      }
    });

    return { cinema: formattedCinema, cinemaMovies: Array.from(moviesMap.values()) };
  }, [dbCinema, cinemaId, isMock]);

  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
    );
  }

  if (!cinema) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cinema not found</h1>
          <Button onClick={() => router.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 pt-safe-top flex items-center justify-between pointer-events-none">
        <button
          onClick={() => router.history.back()}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[350px] md:h-[450px]">
        <div className="absolute inset-0">
          <img src={cinema.image} alt={cinema.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end mx-auto max-w-7xl px-5 md:px-6 pb-8 md:pb-16 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold w-fit mb-4 backdrop-blur-md">
            <Film className="h-4 w-4" />
            Premium Cinema
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 drop-shadow-md">
            {cinema.name}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground md:text-foreground/80 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{cinema.city}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <Film className="h-4 w-4" />
              <span>{cinema.screens} screens</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-5 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Now Showing</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Select a movie to view schedules and book tickets.
          </p>
        </div>

        {cinemaMovies.length === 0 ? (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40">
            <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No movies currently showing</h3>
            <p className="text-muted-foreground">Please check back later for updated schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {cinemaMovies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer flex flex-col h-full bg-card/40 hover:bg-card border border-transparent hover:border-border/60 rounded-3xl p-3 transition-all duration-300"
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-[var(--shadow-card)] transition-all duration-300 mb-4">
                  <img
                    src={movie.cover}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                  <span className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-bold text-white border border-white/10">
                    {movie.rating}
                  </span>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-base md:text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {movie.genre} • {movie.duration}
                  </p>

                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.showtimes.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="px-2 py-1 bg-secondary text-[10px] font-semibold rounded-md border border-border/60"
                        >
                          {t}
                        </span>
                      ))}
                      {movie.showtimes.length > 3 && (
                        <span className="px-2 py-1 bg-secondary text-[10px] font-semibold rounded-md border border-border/60 text-muted-foreground">
                          +{movie.showtimes.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/40">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(movie.price || 8, movie.currency)}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Movie Details Drawer (Used for both Desktop and Mobile interactions on this page) */}
      <Drawer open={!!selectedMovie} onOpenChange={(open) => !open && setSelectedMovie(null)}>
        <DrawerContent
          className="max-h-[90vh] p-0 border-border/60 mx-auto md:max-w-2xl"
          aria-describedby="cinema-movie-desc"
        >
          {selectedMovie && (
            <div className="overflow-y-auto hide-scrollbar pb-safe">
              <DrawerHeader className="sr-only">
                <DrawerTitle>{selectedMovie.title}</DrawerTitle>
                <DrawerDescription id="cinema-movie-desc">
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
              </div>

              <div className="px-5 -mt-8 relative z-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">{selectedMovie.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium mb-4">
                  <span>{selectedMovie.genre}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{selectedMovie.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="border border-border/60 px-1.5 py-0.5 rounded">
                    {selectedMovie.rating}
                  </span>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed mb-6">
                  {selectedMovie.synopsis}
                </p>

                <div className="bg-secondary/40 rounded-2xl p-4 mb-6 border border-border/40">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-sm">Today's Schedule</p>
                      <p className="text-xs text-muted-foreground">{cinema.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedMovie.showtimes.map((t: string, i: number) => (
                      <button
                        key={t}
                        className={`py-3 rounded-xl text-sm font-bold border transition-colors ${
                          i === 0
                            ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                            : "bg-background border-border/60 hover:border-primary/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    asChild
                    className="flex-1 h-14 rounded-2xl shadow-[var(--shadow-glow)] text-base font-bold"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Link
                      to="/book-movie/$movieId"
                      params={{ movieId: selectedMovie.id }}
                      search={{ date: new Date().toISOString().split("T")[0] }}
                    >
                      <Ticket className="mr-2 h-5 w-5" /> Book Ticket —{" "}
                      {formatCurrency(selectedMovie.price || 3000, selectedMovie.currency)}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border-border/60 bg-secondary/50"
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
