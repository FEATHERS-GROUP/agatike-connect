import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getMovies, createMovie, updateMovie, deleteMovie } from "@/api/cinema_management";
import {
  Plus,
  Search,
  MoreVertical,
  Film,
  Loader2,
  Trash2,
  Edit2,
  CalendarDays,
  Clock,
  PlayCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/movies")({
  component: GlobalMoviesCatalog,
});

const EMPTY_FORM = {
  title: "",
  synopsis: "",
  genre: "",
  duration_minutes: 120,
  release_date: new Date().toISOString().split("T")[0],
  cover_url: "",
  trailer_url: "",
  rating: "PG-13",
  language: "English",
  director: "",
  distributor: "",
  is_3d: false,
  is_imax: false,
  status: "coming_soon",
};

const RATING_COLORS: Record<string, string> = {
  G: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  PG: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  "PG-13": "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  R: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  "NC-17": "bg-red-500/15 text-red-600 border-red-500/30",
};

function GlobalMoviesCatalog() {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["cinema_movies", activeWorkspace?.id],
    queryFn: () => getMovies({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const filteredMovies = movies.filter((m: any) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenEdit = (movie: any) => {
    setEditingId(movie.id);
    setForm({ ...movie });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await updateMovie({ data: { id: editingId, ...form } });
      toast.success("Movie updated");
      await queryClient.invalidateQueries({ queryKey: ["cinema_movies"] });
      setSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update movie");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete ${title}? This will also delete all schedules.`))
      return;
    try {
      await deleteMovie({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["cinema_movies"] });
      toast.success(`${title} deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Film Library</h1>
            <p className="text-muted-foreground">
              Master catalog of all movies available across your cinemas.
            </p>
          </div>
          <Link
            to="/dashboard/$workspaceSlug/Cinema/create-movie"
            params={{ workspaceSlug: activeWorkspace?.slug || "" }}
          >
            <Button
              className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-5 w-5" /> Add Movie
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
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

        {/* Empty state */}
        {!isLoading && movies.length === 0 && (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Movies Found</h3>
            <p className="text-muted-foreground mb-6">
              Your catalog is empty. Add movies here to schedule them in your cinemas.
            </p>
            <Link
              to="/dashboard/$workspaceSlug/Cinema/create-movie"
              params={{ workspaceSlug: activeWorkspace?.slug || "" }}
            >
              <Button className="gap-2 rounded-xl h-11 px-6 font-bold">
                <Plus className="h-5 w-5" /> Add First Movie
              </Button>
            </Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredMovies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie: any) => (
              <div
                key={movie.id}
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

                  {/* Tags */}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[80%]">
                    {movie.is_imax && (
                      <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-black uppercase shadow-sm">
                        IMAX
                      </span>
                    )}
                    {movie.is_3d && (
                      <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-[10px] font-black uppercase shadow-sm">
                        3D
                      </span>
                    )}
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(movie)} className="gap-2">
                          <Edit2 className="h-3.5 w-3.5" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive gap-2"
                          onClick={() => handleDelete(movie.id, movie.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Movie
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
      </div>

      {/* ── Form Sheet ────────────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">Edit Movie</SheetTitle>
            <SheetDescription>Update movie details for all your cinemas.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Inception"
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Synopsis</Label>
                <Textarea
                  value={form.synopsis}
                  onChange={(e) => set("synopsis", e.target.value)}
                  placeholder="Brief description of the movie..."
                  className="rounded-xl min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Genre</Label>
                <Input
                  value={form.genre}
                  onChange={(e) => set("genre", e.target.value)}
                  placeholder="Action, Sci-Fi..."
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => set("duration_minutes", parseInt(e.target.value))}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Release Date</Label>
                <Input
                  type="date"
                  value={form.release_date}
                  onChange={(e) => set("release_date", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <select
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="G">G - General Audiences</option>
                  <option value="PG">PG - Parental Guidance</option>
                  <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                  <option value="R">R - Restricted</option>
                  <option value="NC-17">NC-17 - Adults Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Input
                  value={form.language}
                  onChange={(e) => set("language", e.target.value)}
                  placeholder="English, French..."
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Director</Label>
                <Input
                  value={form.director}
                  onChange={(e) => set("director", e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Distributor</Label>
                <Input
                  value={form.distributor}
                  onChange={(e) => set("distributor", e.target.value)}
                  placeholder="e.g. Warner Bros."
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Poster/Cover Image URL</Label>
                <Input
                  value={form.cover_url}
                  onChange={(e) => set("cover_url", e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Trailer URL (YouTube)</Label>
                <Input
                  value={form.trailer_url}
                  onChange={(e) => set("trailer_url", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="rounded-xl h-11"
                />
              </div>

              {/* Formats */}
              <div className="col-span-2 pt-4 border-t border-border/40">
                <Label className="mb-3 block">Available Formats</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.is_3d}
                      onChange={(e) => set("is_3d", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Available in 3D</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.is_imax}
                      onChange={(e) => set("is_imax", e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Available in IMAX</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-border/40">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setSheetOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl h-11 gap-2 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
