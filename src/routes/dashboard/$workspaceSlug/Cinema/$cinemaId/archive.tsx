import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Trash2, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const FINISHED_MOVIES = [
  {
    id: "m4",
    title: "Oppenheimer",
    genre: "Biography/Drama",
    duration: "3h 0m",
    cover:
      "https://images.unsplash.com/photo-1440407876336-62333a6f010f?auto=format&fit=crop&q=80&w=200",
    rating: "R",
    synopsis:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    last_shown: "2024-02-15",
    total_tickets: 12480,
    revenue: 124800000,
    currency: "RWF",
  },
  {
    id: "m5",
    title: "Barbie",
    genre: "Comedy/Fantasy",
    duration: "1h 54m",
    cover:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200",
    rating: "PG-13",
    synopsis:
      "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
    last_shown: "2024-01-20",
    total_tickets: 9810,
    revenue: 98100000,
    currency: "RWF",
  },
  {
    id: "m6",
    title: "The Batman",
    genre: "Action/Crime",
    duration: "2h 56m",
    cover:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=200",
    rating: "PG-13",
    synopsis:
      "When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate.",
    last_shown: "2023-11-12",
    total_tickets: 7240,
    revenue: 72400000,
    currency: "RWF",
  },
  {
    id: "m7",
    title: "Top Gun: Maverick",
    genre: "Action/Drama",
    duration: "2h 11m",
    cover:
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&q=80&w=200",
    rating: "PG-13",
    synopsis:
      "After more than thirty years of service, Pete 'Maverick' Mitchell is back where he belongs.",
    last_shown: "2023-09-05",
    total_tickets: 15600,
    revenue: 156000000,
    currency: "RWF",
  },
  {
    id: "m8",
    title: "Black Panther: Wakanda Forever",
    genre: "Action/Sci-Fi",
    duration: "2h 41m",
    cover:
      "https://images.unsplash.com/photo-1531259922701-8d5ededb1c56?auto=format&fit=crop&q=80&w=200",
    rating: "PG-13",
    synopsis:
      "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers.",
    last_shown: "2023-07-30",
    total_tickets: 11020,
    revenue: 110200000,
    currency: "RWF",
  },
];

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/archive")({
  component: CinemaArchive,
});

function CinemaArchive() {
  const [search, setSearch] = useState("");

  const filtered = FINISHED_MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Past & Finished</h2>
          <p className="text-muted-foreground mt-1">
            Archive of completed screenings. Re-premiere any movie to bring it back.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past movies..."
            className="pl-9 rounded-xl h-10"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl h-10">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Movies", value: FINISHED_MOVIES.length },
          {
            label: "Total Tickets Sold",
            value: FINISHED_MOVIES.reduce((a, m) => a + m.total_tickets, 0).toLocaleString(),
          },
          {
            label: "Total Revenue",
            value:
              "RWF " +
              (FINISHED_MOVIES.reduce((a, m) => a + m.revenue, 0) / 1_000_000).toFixed(1) +
              "M",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm text-center"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/40">
              <th className="text-left px-6 py-4 font-semibold text-muted-foreground">Movie</th>
              <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden md:table-cell">
                Genre
              </th>
              <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden md:table-cell">
                Rating
              </th>
              <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden lg:table-cell">
                Last Shown
              </th>
              <th className="text-right px-4 py-4 font-semibold text-muted-foreground hidden lg:table-cell">
                Tickets Sold
              </th>
              <th className="text-right px-4 py-4 font-semibold text-muted-foreground">Revenue</th>
              <th className="text-right px-6 py-4 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map((movie) => (
              <tr key={movie.id} className="hover:bg-secondary/20 transition-colors group">
                {/* Movie info cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-9 rounded-lg overflow-hidden shrink-0 border border-border/40">
                      <img
                        src={movie.cover}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{movie.title}</p>
                      <p className="text-xs text-muted-foreground">{movie.duration}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium border border-border/40">
                    {movie.genre}
                  </span>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="px-2 py-0.5 rounded border border-border/60 text-xs font-bold text-muted-foreground">
                    {movie.rating}
                  </span>
                </td>

                <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground">
                  {new Date(movie.last_shown).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-4 py-4 hidden lg:table-cell text-right font-medium">
                  {movie.total_tickets.toLocaleString()}
                </td>

                <td className="px-4 py-4 text-right font-bold">
                  {formatCurrency(movie.revenue, movie.currency)}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs rounded-lg gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Re-Premiere
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  No archived movies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
