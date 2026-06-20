import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createSchedule, getScreens, getCinemaMovies } from "@/api/cinema_management";
import { getCinemaTicketTiers } from "@/api/cinema_ticket_tiers";
import {
  Film,
  MonitorPlay,
  CalendarDays,
  Clock,
  Save,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/create-schedule")({
  component: CreateSchedulePage,
});

const EMPTY_FORM = {
  movie_id: "",
  screen_id: "",
  show_date: new Date(),
  start_time: "18:00",
  end_time: "20:00",
  language: "English",
  is_premiere: false,
  is_3d: false,
  is_imax: false,
  status: "scheduled",
  ticket_tiers: [] as string[],
};

const TIME_OPTIONS = Array.from({ length: 24 * 4 }).map((_, i) => {
  const h = Math.floor(i / 4).toString().padStart(2, "0");
  const m = ((i % 4) * 15).toString().padStart(2, "0");
  return `${h}:${m}`;
});

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "English (Subbed)",
  "French (Subbed)",
  "English (Dubbed)",
  "French (Dubbed)",
];

function CreateSchedulePage() {
  const { workspaceSlug, cinemaId } = Route.useParams() as any;
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Data Queries ────────────────────────────────────────────────────────
  const { data: screens = [] } = useQuery({
    queryKey: ["cinema_screens", cinemaId],
    queryFn: () => getScreens({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const { data: moviesRaw = [] } = useQuery({
    queryKey: ["cinema_movie_cinemas", cinemaId],
    queryFn: () => getCinemaMovies({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const { data: ticketTiers = [] } = useQuery({
    queryKey: ["cinema_ticket_tiers", activeWorkspace?.id],
    queryFn: () => getCinemaTicketTiers({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const movies = moviesRaw.map((m: any) => m.movie);

  // ── Handlers ────────────────────────────────────────────────────────────
  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const toggleTier = (id: string) => {
    setForm((p: any) => {
      const tiers = p.ticket_tiers.includes(id)
        ? p.ticket_tiers.filter((t: string) => t !== id)
        : [...p.ticket_tiers, id];
      return { ...p, ticket_tiers: tiers };
    });
  };

  const STEPS = [
    { title: "Movie & Screen", description: "Select what to play and where" },
    { title: "Date & Time", description: "Set the showtime and formats" },
    { title: "Ticket Tiers", description: "Select available pricing" },
  ];

  const handleNext = () => {
    if (step === 0 && (!form.movie_id || !form.screen_id)) {
      toast.error("Please select a movie and a screen");
      return;
    }
    if (step === 1 && (!form.show_date || !form.start_time)) {
      toast.error("Please set the date and start time");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate({ to: "/dashboard/$workspaceSlug/Cinema/$cinemaId/schedules", params: { workspaceSlug, cinemaId } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const scheduleData = {
        cinema_id: cinemaId,
        movie_id: form.movie_id,
        screen_id: form.screen_id,
        show_date: format(form.show_date, "yyyy-MM-dd"),
        start_time: form.start_time,
        end_time: form.end_time || null,
        language: form.language,
        is_premiere: form.is_premiere,
        is_3d: form.is_3d,
        is_imax: form.is_imax,
        status: form.status,
        ticket_tiers: {
          data: form.ticket_tiers.map((tId: string) => ({
            ticket_tier_id: tId,
          })),
        },
      };

      await createSchedule({ data: scheduleData });
      toast.success("Schedule created successfully!");
      await queryClient.invalidateQueries({ queryKey: ["cinema_schedules"] });
      navigate({ to: "/dashboard/$workspaceSlug/Cinema/$cinemaId/schedules", params: { workspaceSlug, cinemaId } });
    } catch (err: any) {
      toast.error(err.message || "Failed to create schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden">
      {/* Left Sidebar - Sticky Progress */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 bg-card border-r border-border/60 flex flex-col justify-between hidden md:flex">
        <div className="p-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedules
          </button>

          <h2 className="text-2xl font-black mb-8">Schedule Showtime</h2>

          <div className="space-y-8 relative">
            {/* Progress line connector */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-secondary -z-10" />

            {STEPS.map((s, i) => {
              const active = step === i;
              const past = step > i;
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors shadow-sm",
                      active
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                        : past
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className={cn("font-bold", active ? "text-primary" : past ? "text-foreground" : "text-muted-foreground")}>
                      {s.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 border-t border-border/60 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">New Showtime</p>
              <p className="text-xs text-muted-foreground">Planet Events Cinema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 p-4 lg:p-10 relative">
        <div className="max-w-5xl w-full mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-4 mb-8">
            <button onClick={handleBack} className="p-2 rounded-full bg-secondary text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-medium text-primary mb-1">
                Step {step + 1} of {STEPS.length}
              </p>
              <h1 className="text-xl font-bold">{STEPS[step].title}</h1>
            </div>
          </div>

          {/* Wrapper for the card styling */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm animate-in slide-in-from-bottom-4 duration-500 fade-in">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  {step === 0 && <Film className="h-6 w-6 text-primary" />}
                  {step === 1 && <Clock className="h-6 w-6 text-primary" />}
                  {step === 2 && <Ticket className="h-6 w-6 text-primary" />}
                  {STEPS[step].title}
                </h2>
                <p className="text-muted-foreground">{STEPS[step].description}</p>
              </div>

              {/* ── STEP 0: Movie & Screen ──────────────────────────────────── */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Movie</Label>
                    {movies.length === 0 ? (
                      <div className="text-sm text-destructive p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
                        No movies linked to this cinema. Add movies first.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {movies.map((m: any) => (
                          <label
                            key={m.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                              form.movie_id === m.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/60 hover:bg-secondary/50",
                            )}
                          >
                            <input
                              type="radio"
                              name="movie_id"
                              checked={form.movie_id === m.id}
                              onChange={() => set("movie_id", m.id)}
                              className="sr-only"
                            />
                            <div className="h-16 w-12 rounded-md overflow-hidden bg-secondary shrink-0">
                              {m.cover_url ? (
                                <img src={m.cover_url} alt={m.title} className="w-full h-full object-cover" />
                              ) : (
                                <Film className="w-full h-full p-3 text-muted-foreground/30" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold">{m.title}</p>
                              <p className="text-xs text-muted-foreground">{m.duration_minutes} mins</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Screen / Hall</Label>
                    {screens.length === 0 ? (
                      <div className="text-sm text-destructive p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
                        No screens found. Create a screen first.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {screens.map((s: any) => (
                          <label
                            key={s.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                              form.screen_id === s.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/60 hover:bg-secondary/50",
                            )}
                          >
                            <input
                              type="radio"
                              name="screen_id"
                              checked={form.screen_id === s.id}
                              onChange={() => set("screen_id", s.id)}
                              className="sr-only"
                            />
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                              <MonitorPlay className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold">{s.name}</p>
                              <p className="text-xs text-muted-foreground">Capacity: {s.capacity}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 1: Date & Time ─────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 flex flex-col">
                      <Label>Show Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal rounded-xl h-12",
                              !form.show_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {form.show_date ? format(form.show_date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.show_date}
                            onSelect={(date) => date && set("show_date", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select value={form.start_time} onValueChange={(val) => set("start_time", val)}>
                        <SelectTrigger className="w-full rounded-xl h-12">
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Select value={form.end_time} onValueChange={(val) => set("end_time", val)}>
                        <SelectTrigger className="w-full rounded-xl h-12">
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language / Audio</Label>
                      <Select value={form.language} onValueChange={(val) => set("language", val)}>
                        <SelectTrigger className="w-full rounded-xl h-12">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Label className="mb-4 block text-base font-semibold">Special Formats</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          form.is_3d ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={form.is_3d}
                          onChange={(e) => set("is_3d", e.target.checked)}
                          className="rounded text-primary focus:ring-primary w-5 h-5"
                        />
                        <span className="font-bold">3D Screening</span>
                      </label>
                      <label
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          form.is_imax ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={form.is_imax}
                          onChange={(e) => set("is_imax", e.target.checked)}
                          className="rounded text-primary focus:ring-primary w-5 h-5"
                        />
                        <span className="font-bold">IMAX</span>
                      </label>
                      <label
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          form.is_premiere ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={form.is_premiere}
                          onChange={(e) => set("is_premiere", e.target.checked)}
                          className="rounded text-primary focus:ring-primary w-5 h-5"
                        />
                        <span className="font-bold">Premiere</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Ticket Tiers ────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  {ticketTiers.length === 0 ? (
                    <div className="text-center p-12 bg-secondary/30 rounded-3xl border border-border/40">
                      <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-bold">No Ticket Tiers Found</h3>
                      <p className="text-muted-foreground mt-2">
                        You need to create ticket tiers in the workspace first.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ticketTiers.map((tier: any) => (
                        <label
                          key={tier.id}
                          className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                            form.ticket_tiers.includes(tier.id)
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 hover:bg-secondary/50",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={form.ticket_tiers.includes(tier.id)}
                            onChange={() => toggleTier(tier.id)}
                            className="mt-1 rounded text-primary focus:ring-primary w-5 h-5"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-lg leading-none">{tier.name}</h4>
                              <span className="font-bold bg-background border border-border/40 px-2 py-1 rounded-md text-sm">
                                {tier.currency} {tier.price}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{tier.type} Tier</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-80 lg:left-96 right-0 border-t border-border/60 bg-background/80 backdrop-blur-xl p-4 md:p-6 z-20 flex justify-between items-center animate-in slide-in-from-bottom-8 duration-500">
        <Button variant="ghost" onClick={handleBack} className="h-12 px-6 rounded-xl font-medium">
          {step === 0 ? "Cancel" : "Previous Step"}
        </Button>
        <div className="flex gap-4">
          {step < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              className="h-12 px-8 rounded-xl font-bold shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Next Step <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-8 rounded-xl font-bold shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {saving ? "Creating..." : "Create Schedule"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
