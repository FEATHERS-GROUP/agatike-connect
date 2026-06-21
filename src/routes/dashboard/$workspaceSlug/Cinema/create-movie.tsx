import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createMovie } from "@/api/cinema_management";
import {
  ArrowLeft,
  ArrowRight,
  Film,
  Save,
  Loader2,
  ImageIcon,
  Search,
  CheckCircle2,
  Globe,
  MonitorPlay,
  Type,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/create-movie")({
  component: CreateMovieWizard,
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

function CreateMovieWizard() {
  const { workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // OMDb Search State
  const [searchMode, setSearchMode] = useState<"cards" | "search">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSelected, setSearchSelected] = useState<string | null>(null);

  const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || "24b0877f";

  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  // Helper to parse OMDb runtime "148 min" -> 148
  const parseRuntime = (rt: string) => {
    if (!rt) return 120;
    const num = parseInt(rt.replace(/[^\d]/g, ""));
    return isNaN(num) ? 120 : num;
  };

  const parseDate = (d: string) => {
    if (!d || d === "N/A") return new Date().toISOString().split("T")[0];
    const date = new Date(d);
    return isNaN(date.getTime())
      ? new Date().toISOString().split("T")[0]
      : date.toISOString().split("T")[0];
  };

  const handleSearchOMDb = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&type=movie&apikey=${OMDB_API_KEY}`,
      );
      const data = await res.json();
      if (data.Response === "True") {
        setSearchResults(data.Search || []);
      } else {
        setSearchResults([]);
        toast.error(data.Error || "No results found");
      }
    } catch (err) {
      toast.error("Failed to search OMDB");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectOMDb = async (imdbID: string) => {
    setSearchSelected(imdbID);
    setIsSearching(true);
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
      const data = await res.json();
      if (data.Response === "True") {
        setForm((p: any) => ({
          ...p,
          title: data.Title || "",
          synopsis: data.Plot && data.Plot !== "N/A" ? data.Plot : "",
          genre: data.Genre && data.Genre !== "N/A" ? data.Genre : "",
          duration_minutes: parseRuntime(data.Runtime),
          release_date: parseDate(data.Released),
          cover_url: data.Poster && data.Poster !== "N/A" ? data.Poster : "",
          rating: data.Rated && data.Rated !== "N/A" ? data.Rated : "PG-13",
          director: data.Director && data.Director !== "N/A" ? data.Director : "",
          distributor: data.Production && data.Production !== "N/A" ? data.Production : "",
          language:
            data.Language && data.Language !== "N/A" ? data.Language.split(",")[0] : "English",
        }));
        toast.success("Movie details imported successfully!");
        setStep(1); // Move to Basic Details automatically
      } else {
        toast.error("Could not fetch details.");
      }
    } catch (err) {
      toast.error("Failed to fetch full details.");
    } finally {
      setIsSearching(false);
      setSearchSelected(null);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await createMovie({ data: { ...form, workspace_id: activeWorkspace?.id } });
      toast.success("Movie added to catalog!");
      await queryClient.invalidateQueries({ queryKey: ["cinema_movies"] });
      navigate({ to: "/dashboard/$workspaceSlug/Cinema/movies", params: { workspaceSlug } });
    } catch (err: any) {
      toast.error(err.message || "Failed to add movie");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: "Source", desc: "Global search" },
    { label: "Basic Details", desc: "Title & Plot" },
    { label: "Media & Cast", desc: "Posters & Directors" },
    { label: "Formats", desc: "3D & IMAX" },
    { label: "Review", desc: "Confirm & Save" },
  ];

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Left Sidebar - Sticky Progress */}
      <div className="hidden lg:flex w-80 flex-col border-r border-border/60 bg-secondary/10 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full shrink-0">
        <button
          onClick={() =>
            navigate({ to: "/dashboard/$workspaceSlug/Cinema/movies", params: { workspaceSlug } })
          }
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group w-fit"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Library</span>
        </button>

        <h3 className="font-bold text-lg mb-6">Add Movie Wizard</h3>
        <div className="space-y-5 flex-1">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 relative">
              {i !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[11px] top-8 bottom-[-16px] w-[2px]",
                    step > i ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-[11px] transition-colors shadow-sm",
                  step > i
                    ? "bg-primary text-primary-foreground"
                    : step === i
                      ? "bg-background border-2 border-primary text-primary"
                      : "bg-secondary text-muted-foreground border border-border",
                )}
              >
                {step > i ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <div className="-mt-1">
                <p className={cn("font-semibold text-sm", step === i ? "text-primary" : "")}>
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 p-4 lg:p-10 relative">
        <div className="max-w-5xl w-full mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-4 mb-8">
            <button
              onClick={() =>
                navigate({
                  to: "/dashboard/$workspaceSlug/Cinema/movies",
                  params: { workspaceSlug },
                })
              }
              className="p-2 rounded-full bg-secondary text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-medium text-primary mb-1">
                Step {step + 1} of {steps.length}
              </p>
              <h1 className="text-xl font-bold">{steps[step].label}</h1>
            </div>
          </div>

          {/* ── STEP 0: OMDb Search Cards ──────────────────────────────────── */}
          {step === 0 && searchMode === "cards" && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] animate-in fade-in zoom-in-95 duration-500 w-full max-w-4xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12 mt-[-4rem]">
                <h2 className="text-4xl font-black mb-4">How do you want to add this movie?</h2>
                <p className="text-muted-foreground text-lg">
                  You can search the global movie database to automatically fill in details, or
                  build it manually from scratch.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
                <button
                  onClick={() => setSearchMode("search")}
                  className="flex flex-col items-center text-center p-8 rounded-3xl border border-border/60 hover:border-primary hover:bg-primary/5 transition-all group bg-card shadow-sm hover:shadow-md"
                >
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Global Search</h3>
                  <p className="text-muted-foreground text-sm">
                    Search OMDb and instantly import the poster, synopsis, duration, genres, and
                    ratings.
                  </p>
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="flex flex-col items-center text-center p-8 rounded-3xl border border-border/60 hover:border-foreground/30 hover:bg-secondary/50 transition-all group bg-card shadow-sm hover:shadow-md"
                >
                  <div className="h-20 w-20 rounded-2xl bg-secondary border border-border/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <PenTool className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Add Manually</h3>
                  <p className="text-muted-foreground text-sm">
                    Start with a blank form and manually type in all the details and upload your own
                    poster.
                  </p>
                </button>
              </div>
            </div>
          )}

          {!(step === 0 && searchMode === "cards") && (
            <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm animate-in slide-in-from-bottom-4 duration-500 fade-in">
              {step === 0 && searchMode === "search" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Globe className="h-6 w-6 text-primary" />
                      Global Search
                    </h2>
                    <p className="text-muted-foreground">
                      Search the global database to automatically fill in the movie's poster, plot,
                      rating, and details.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by movie title (e.g. The Matrix)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchOMDb()}
                      className="h-12 rounded-xl text-lg flex-1"
                    />
                    <Button
                      onClick={handleSearchOMDb}
                      disabled={isSearching || !searchQuery.trim()}
                      className="h-12 rounded-xl px-6 gap-2"
                    >
                      {isSearching && !searchSelected ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Search
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-h-[50vh] overflow-y-auto pr-2">
                      {searchResults.map((res: any) => (
                        <button
                          key={res.imdbID}
                          onClick={() => handleSelectOMDb(res.imdbID)}
                          disabled={isSearching}
                          className="flex items-start gap-4 p-3 rounded-2xl border border-border/60 hover:bg-secondary/50 hover:border-primary/50 text-left transition-all group disabled:opacity-50"
                        >
                          <div className="w-16 h-24 shrink-0 rounded-lg bg-secondary overflow-hidden">
                            {res.Poster !== "N/A" ? (
                              <img
                                src={res.Poster}
                                alt={res.Title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 py-1">
                            <h4 className="font-bold text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                              {res.Title}
                            </h4>
                            <p className="text-xs text-muted-foreground">{res.Year}</p>
                            <div className="mt-3">
                              {searchSelected === res.imdbID ? (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching...
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-primary">Select →</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative py-4 mt-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/60" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-4 text-xs font-medium text-muted-foreground">
                        OR
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-xl h-11"
                    >
                      Skip & Add Manually
                    </Button>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Basic Details ──────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Type className="h-6 w-6 text-primary" />
                      Basic Details
                    </h2>
                    <p className="text-muted-foreground">The core information about the movie.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        autoFocus
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="e.g. Inception"
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Synopsis</Label>
                      <Textarea
                        value={form.synopsis}
                        onChange={(e) => set("synopsis", e.target.value)}
                        placeholder="Brief description..."
                        className="rounded-xl min-h-[120px] resize-none"
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
                      <Label>Language</Label>
                      <Input
                        value={form.language}
                        onChange={(e) => set("language", e.target.value)}
                        placeholder="English"
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Rating</Label>
                      <Input
                        value={form.rating}
                        onChange={(e) => set("rating", e.target.value)}
                        placeholder="PG-13, R, etc."
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Media & Cast ───────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <ImageIcon className="h-6 w-6 text-primary" />
                      Media & Credits
                    </h2>
                    <p className="text-muted-foreground">
                      Posters, trailers, and production details.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">Poster / Cover Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={form.cover_url}
                        onChange={(e) => set("cover_url", e.target.value)}
                        placeholder="https://... or upload"
                        className="rounded-xl h-11 flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            setIsUploadingCover(true);
                            try {
                              const url = await uploadFileToStorage(
                                e.target.files[0],
                                "movies/covers",
                              );
                              set("cover_url", url);
                              toast.success("Cover uploaded!");
                            } catch (err) {
                              toast.error("Failed to upload cover");
                            } finally {
                              setIsUploadingCover(false);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-xl px-4"
                          disabled={isUploadingCover}
                        >
                          {isUploadingCover ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Upload"
                          )}
                        </Button>
                      </div>
                    </div>
                    {form.cover_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-border/60 aspect-[2/3] w-48 bg-secondary relative">
                        <img
                          src={form.cover_url}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Trailer URL (YouTube)</Label>
                    <Input
                      value={form.trailer_url}
                      onChange={(e) => set("trailer_url", e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label>Director</Label>
                      <Input
                        value={form.director}
                        onChange={(e) => set("director", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Distributor (Production)</Label>
                      <Input
                        value={form.distributor}
                        onChange={(e) => set("distributor", e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Formats ────────────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <MonitorPlay className="h-6 w-6 text-primary" />
                      Available Formats
                    </h2>
                    <p className="text-muted-foreground">
                      What premium formats does this movie support?
                    </p>
                  </div>

                  <div className="flex gap-4 flex-wrap pt-4">
                    <label className="flex items-center gap-3 cursor-pointer p-5 border border-border/60 rounded-2xl hover:bg-secondary/50 flex-1 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.is_3d}
                        onChange={(e) => set("is_3d", e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-5 w-5"
                      />
                      <div>
                        <span className="block font-bold">3D Format</span>
                        <span className="block text-xs text-muted-foreground">
                          Stereoscopic 3D rendering
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-5 border border-border/60 rounded-2xl hover:bg-secondary/50 flex-1 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.is_imax}
                        onChange={(e) => set("is_imax", e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-5 w-5"
                      />
                      <div>
                        <span className="block font-bold">IMAX Format</span>
                        <span className="block text-xs text-muted-foreground">
                          High resolution, larger aspect ratio
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Review ─────────────────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      Review & Save
                    </h2>
                    <p className="text-muted-foreground">
                      Final check before adding this movie to your global catalog.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-secondary/30 border border-border/40">
                    <div className="w-32 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-secondary border border-border/40">
                      {form.cover_url ? (
                        <img
                          src={form.cover_url}
                          alt={form.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black leading-tight mb-2">
                        {form.title || "Untitled Movie"}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4 font-medium">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {form.rating}
                        </span>
                        <span>•</span>
                        <span>{form.duration_minutes} min</span>
                        <span>•</span>
                        <span>{form.genre}</span>
                      </div>
                      <p className="text-sm line-clamp-3 text-muted-foreground mb-4">
                        {form.synopsis}
                      </p>
                      <div className="flex gap-2">
                        {form.is_3d && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-black">
                            3D
                          </span>
                        )}
                        {form.is_imax && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-black">
                            IMAX
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions Fixed */}
          {!(step === 0 && searchMode === "cards") && (
            <div className="fixed bottom-0 left-0 right-0 lg:left-80 p-4 bg-background/80 backdrop-blur-md border-t border-border/60 z-10">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <Button
                  variant="outline"
                  className="rounded-xl h-11 px-6"
                  onClick={() => {
                    if (step === 0) {
                      if (searchMode === "search") setSearchMode("cards");
                      else
                        navigate({
                          to: "/dashboard/$workspaceSlug/Cinema/movies",
                          params: { workspaceSlug },
                        });
                    } else {
                      setStep(step - 1);
                    }
                  }}
                >
                  {step === 0 && searchMode === "cards" ? "Cancel" : "Back"}
                </Button>
                <div className="flex gap-3">
                  {step < steps.length - 1 ? (
                    <Button
                      className="rounded-xl h-11 px-8 gap-2"
                      onClick={() => setStep(step + 1)}
                      disabled={step === 1 && !form.title.trim()}
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="rounded-xl h-11 px-10 gap-2 font-bold shadow-[var(--shadow-glow)]"
                      style={{ background: "var(--gradient-primary)" }}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "Saving..." : "Add to Catalog"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
