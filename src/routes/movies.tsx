import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  MapPin,
  Film,
  Ticket,
  ArrowLeft,
  Play,
  Star,
  Calendar,
  X,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useQuery } from "@tanstack/react-query";
import { getPublicMovieSchedules } from "@/api/cinemas";
import { DesktopMoviesView } from "@/components/site/movies/DesktopMoviesView";
import { MobileMoviesView } from "@/components/site/movies/MobileMoviesView";
import { MoviesSkeleton } from "@/components/site/movies/MoviesSkeleton";

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
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["public_schedules"],
    queryFn: () => getPublicMovieSchedules({ data: { date: new Date().toISOString().split("T")[0] } } as any),
  });

  const { movies, cinemas } = useMemo(() => {
    const moviesMap = new Map<string, any>();
    const cinemasMap = new Map<string, any>();

    schedules.forEach((s: any) => {
      const c = s.cinema;
      if (c && !cinemasMap.has(c.id)) {
        cinemasMap.set(c.id, {
          id: c.id,
          name: c.name,
          city: c.city,
          screens: 1,
          image: c.cover_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
        });
      }

      const m = s.movie;
      if (!m || !c) return;

      const movieKey = `${m.id}-${c.id}`;
      const timeStr = s.start_time.substring(0, 5); // HH:MM

      if (!moviesMap.has(movieKey)) {
        moviesMap.set(movieKey, {
          id: movieKey,
          scheduleId: s.id,
          title: m.title,
          genre: m.genre || "Drama",
          duration: `${m.duration_minutes || 120}m`,
          rating: m.rating || "PG",
          cover: m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
          cinema: c.name,
          city: c.city,
          showtimes: [timeStr],
          synopsis: m.synopsis || "No synopsis available.",
          price: s.base_price || 10,
          currency: s.currency || "RWF",
        });
      } else {
        if (!moviesMap.get(movieKey).showtimes.includes(timeStr)) {
          moviesMap.get(movieKey).showtimes.push(timeStr);
        }
      }
    });

    return {
      movies: Array.from(moviesMap.values()),
      cinemas: Array.from(cinemasMap.values()),
    };
  }, [schedules]);

  const [active, setActive] = useState("");

  useEffect(() => {
    if (movies.length > 0 && (!active || !movies.find(m => m.id === active))) {
      setActive(movies[0].id);
    }
  }, [movies, active]);

  if (isLoading) {
    return <MoviesSkeleton />;
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Film className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Movies Currently Showing</h2>
          <p className="text-muted-foreground max-w-md">
            Check back later for new premieres and schedules.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const activeId = active || (movies.length > 0 ? movies[0].id : "");

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <div className="hidden md:block">
        <Navbar />
        <DesktopMoviesView active={activeId} setActive={setActive} movies={movies} cinemas={cinemas} />
        <Footer />
      </div>
      <div className="md:hidden">
        <MobileMoviesView movies={movies} cinemas={cinemas} activeId={activeId} setActive={setActive} />
      </div>
    </div>
  );
}
