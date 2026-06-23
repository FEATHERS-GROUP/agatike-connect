const fs = require('fs');

let content = fs.readFileSync('src/routes/cinemas/$cinemaId.tsx', 'utf8');

const importReplacement = `import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { MapPin, Film, Ticket, ArrowLeft, Calendar, Info, Clock, Play } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCinemaById } from "@/api/cinemas";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";`;

content = content.replace(/import { createFileRoute.*?from "@/components\/ui\/drawer";/s, importReplacement);

// Remove stubbed data
content = content.replace(/\/\/ Stubbed mock data\nconst cinemas: any\[\] = \[\];\nconst movies: any\[\] = \[\];/g, '');

const metaReplacement = `export const Route = createFileRoute("/cinemas/$cinemaId")({
  component: CinemaDetail,
});`;
content = content.replace(/export const Route = createFileRoute.*?\}\);/s, metaReplacement);

const componentReplacement = `function CinemaDetail() {
  const { cinemaId } = Route.useParams();
  const router = useRouter();
  
  const { data: dbCinema, isLoading } = useQuery({
    queryKey: ["cinema", cinemaId],
    queryFn: () => getCinemaById({ data: { id: cinemaId } }),
  });

  const { cinema, cinemaMovies } = useMemo(() => {
    if (!dbCinema) return { cinema: null, cinemaMovies: [] };
    
    const formattedCinema = {
      id: dbCinema.id,
      name: dbCinema.name,
      city: dbCinema.city,
      screens: dbCinema.screens?.length || 1,
      image: dbCinema.cover_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"
    };

    const moviesMap = new Map();
    (dbCinema.schedules || []).forEach((s) => {
      const m = s.movie;
      if (!m) return;
      if (!moviesMap.has(m.id)) {
        moviesMap.set(m.id, {
          id: m.id,
          title: m.title,
          cover: m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
          rating: m.rating || "PG",
          genre: m.genre || "Drama",
          duration: \`\${m.duration_minutes || 120}m\`,
          price: s.ticket_tiers?.[0]?.price_override || 3000,
          currency: s.ticket_tiers?.[0]?.currency || "RWF",
          synopsis: m.synopsis || "No synopsis available.",
          showtimes: []
        });
      }
      const timeStr = s.start_time ? s.start_time.substring(0, 5) : "12:00";
      const movieEntry = moviesMap.get(m.id);
      if (!movieEntry.showtimes.includes(timeStr)) {
        movieEntry.showtimes.push(timeStr);
      }
    });

    return { cinema: formattedCinema, cinemaMovies: Array.from(moviesMap.values()) };
  }, [dbCinema]);

  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  if (isLoading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>;
  }

  if (!cinema) {`;

content = content.replace(/function CinemaDetail\(\) \{[\s\S]*?if \(\!cinema\) \{/s, componentReplacement);

// Fix the book button link params to use /book-movie
content = content.replace(/to="\/book\/\$eventId" params=\{\{ eventId: selectedMovie\.id \}\}/g, 'to="/book-movie/$movieId" params={{ movieId: selectedMovie.id }}');

// Update selected movie state
content = content.replace(/const cinemaMovies = movies\.filter[^\n]*\n/, '');

fs.writeFileSync('src/routes/cinemas/$cinemaId.tsx', content);
