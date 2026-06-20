import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getMovies,
  getCinemaMovies,
  linkMovieToCinema,
  unlinkMovieFromCinema,
} from "@/api/cinema_management";
import { Plus, Search, MoreVertical, Film, Loader2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/movies")({
  component: CinemaSpecificMoviesPage,
});

const RATING_COLORS: Record<string, string> = {
  G: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  PG: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "PG-13": "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  R: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  "NC-17": "bg-red-500/15 text-red-600 border-red-500/30",
};

function CinemaSpecificMoviesPage() {
  const { cinemaId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: cinemaMoviesRaw = [], isLoading } = useQuery({
    queryKey: ["cinema_movie_cinemas", cinemaId],
    queryFn: () => getCinemaMovies({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const { data: globalMovies = [], isLoading: globalLoading } = useQuery({
    queryKey: ["cinema_movies", activeWorkspace?.id],
    queryFn: () => getMovies({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id && sheetOpen,
  });

  const cinemaMovies = cinemaMoviesRaw.map((cm: any) => ({
    ...cm.movie,
    link_id: cm.id,
    link_status: cm.status,
  }));

  const filteredMovies = cinemaMovies.filter((m: any) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  const cinemaMovieIds = new Set(cinemaMovies.map((m: any) => m.id));
  const availableGlobalMovies = globalMovies.filter(
    (m: any) =>
      !cinemaMovieIds.has(m.id) && m.title.toLowerCase().includes(globalSearch.toLowerCase()),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLink = async (movie: any) => {
    setSavingId(movie.id);
    try {
      await linkMovieToCinema({
        data: { cinema_id: cinemaId, movie_id: movie.id, status: "now_showing" },
      });
      await queryClient.invalidateQueries({ queryKey: ["cinema_movie_cinemas"] });
      toast.success(`${movie.title} added to this cinema`);
    } catch (err: any) {
      toast.error(err.message || "Failed to add movie");
    } finally {
      setSavingId(null);
    }
  };

  const handleUnlink = async (movie: any) => {
    if (!confirm(`Remove ${movie.title} from this cinema?`)) return;
    try {
      await unlinkMovieFromCinema({
        data: { cinema_id: cinemaId, movie_id: movie.id },
      });
      await queryClient.invalidateQueries({ queryKey: ["cinema_movie_cinemas"] });
      toast.success(`${movie.title} removed`);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove movie");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Movies</h1>
            <p className="text-muted-foreground">
              Movies currently playing or coming soon to this specific cinema.
            </p>
          </div>
          <Button
            onClick={() => setSheetOpen(true)}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" /> Import from Library
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active movies..."
              className="pl-10 h-11 rounded-xl bg-card border-border/60 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && cinemaMovies.length === 0 && (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Movies Playing</h3>
            <p className="text-muted-foreground mb-6">
              Import movies from your global Film Library to start showing them in this cinema.
            </p>
            <Button
              onClick={() => setSheetOpen(true)}
              className="gap-2 rounded-xl h-11 px-6 font-bold"
            >
              <Plus className="h-5 w-5" /> Import Movies
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredMovies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie: any) => (
              <div
                key={movie.link_id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full bg-secondary">
                  {movie.cover_url ? (
                    <img
                      src={movie.cover_url}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Film className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Status Tag */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm">
                      {movie.link_status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-black/70"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive gap-2"
                          onClick={() => handleUnlink(movie)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove from Cinema
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col gap-2">
                  <div>
                    <h3
                      className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors"
                      title={movie.title}
                    >
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold border ${RATING_COLORS[movie.rating] || RATING_COLORS["PG-13"]}`}
                      >
                        {movie.rating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {movie.duration_minutes}m
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {movie.genre || "Uncategorized"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Import Sheet ────────────────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl">Import from Film Library</SheetTitle>
              <SheetDescription>
                Select movies from your global catalog to show in this cinema.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search library..."
                  className="pl-10 h-11 rounded-xl bg-secondary/50 border-border/60"
                />
              </div>

              {globalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : availableGlobalMovies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-2xl border border-border/40">
                  <p>No new movies available to import.</p>
                  <p className="text-sm mt-1">Check your global Film Library.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableGlobalMovies.map((movie: any) => (
                    <div
                      key={movie.id}
                      className="flex gap-4 p-3 rounded-2xl bg-secondary/30 border border-border/40 hover:bg-secondary/60 transition-colors"
                    >
                      <div className="h-20 w-14 rounded-lg bg-secondary shrink-0 overflow-hidden">
                        {movie.cover_url ? (
                          <img
                            src={movie.cover_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="h-6 w-6 m-auto mt-7 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-sm truncate">{movie.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{movie.genre}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {movie.rating} • {movie.duration_minutes}m
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-lg font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleLink(movie)}
                          disabled={savingId === movie.id}
                        >
                          {savingId === movie.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Import"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
