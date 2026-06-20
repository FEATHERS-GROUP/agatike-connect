import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RotateCcw, Trash2, Search, Filter, Loader2, CalendarDays } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchedules } from "@/api/cinema_management";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/archive")({
  component: CinemaArchive,
});

function CinemaArchive() {
  const { workspaceSlug, cinemaId } = Route.useParams() as any;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["cinema_schedules", cinemaId],
    queryFn: () => getSchedules({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  // Filter for past schedules
  const now = new Date();
  const pastSchedules = schedules.filter((s: any) => {
    const timeStr = s.end_time || s.start_time || "00:00:00";
    const endTime = new Date(`${s.show_date}T${timeStr}`);
    return endTime < now;
  });

  // Group by movie
  const movieStats = new Map();
  pastSchedules.forEach((s: any) => {
    if (!s.movie) return;
    const movieId = s.movie.id;
    if (!movieStats.has(movieId)) {
      movieStats.set(movieId, {
        id: movieId,
        title: s.movie.title,
        cover: s.movie.cover_url,
        duration: `${s.movie.duration_minutes}m`,
        genre: s.movie.genre || "N/A",
        rating: s.movie.rating || "N/A",
        last_shown: s.show_date,
        total_tickets: 0,
        revenue: 0,
        currency: s.currency || "RWF",
      });
    }
    const stat = movieStats.get(movieId);
    if (new Date(s.show_date) > new Date(stat.last_shown)) {
      stat.last_shown = s.show_date;
    }
    const tickets = s.booked_seats || 0;
    stat.total_tickets += tickets;
    stat.revenue += tickets * (s.base_price || 0);
  });

  const archivedMovies = Array.from(movieStats.values());

  const filtered = archivedMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase())
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

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Movies", value: archivedMovies.length },
              {
                label: "Total Tickets Sold",
                value: archivedMovies.reduce((a, m) => a + m.total_tickets, 0).toLocaleString(),
              },
              {
                label: "Total Revenue",
                value:
                  archivedMovies.length > 0 ? (
                    archivedMovies[0].currency + " " +
                    (archivedMovies.reduce((a, m) => a + m.revenue, 0) / 1_000_000).toFixed(1) + "M"
                  ) : "0",
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
                        <div className="h-12 w-9 rounded-lg overflow-hidden shrink-0 border border-border/40 bg-secondary">
                          {movie.cover ? (
                            <img
                              src={movie.cover}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[10px] text-muted-foreground font-bold">N/A</span>
                            </div>
                          )}
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
                      {new Date(movie.last_shown).toLocaleDateString(undefined, {
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
                          onClick={() => navigate({ to: "/dashboard/$workspaceSlug/Cinema/$cinemaId/create-schedule", params: { workspaceSlug, cinemaId }, search: { movieId: movie.id } })}
                          className="h-8 text-xs rounded-lg gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Re-Premiere
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                      <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      No archived movies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
