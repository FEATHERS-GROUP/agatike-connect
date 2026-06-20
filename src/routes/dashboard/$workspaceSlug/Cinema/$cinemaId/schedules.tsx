import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
  getScreens,
  getCinemaMovies,
} from "@/api/cinema_management";
import { getCinemaTicketTiers } from "@/api/cinema_ticket_tiers";
import {
  Plus,
  CalendarDays,
  MoreVertical,
  Loader2,
  Trash2,
  Clock,
  Film,
  MonitorPlay,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/schedules")({
  component: CinemaSchedulesPage,
});

const EMPTY_FORM = {
  movie_id: "",
  screen_id: "",
  show_date: new Date().toISOString().split("T")[0],
  start_time: "18:00",
  end_time: "20:00",
  language: "English",
  is_premiere: false,
  is_3d: false,
  is_imax: false,
  status: "scheduled",
  ticket_tiers: [] as string[], // array of tier ids
};

function CinemaSchedulesPage() {
  const { cinemaId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["cinema_schedules", cinemaId],
    queryFn: () => getSchedules({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["cinema_screens", cinemaId],
    queryFn: () => getScreens({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId && sheetOpen,
  });

  const { data: moviesRaw = [] } = useQuery({
    queryKey: ["cinema_movie_cinemas", cinemaId],
    queryFn: () => getCinemaMovies({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId && sheetOpen,
  });

  const { data: ticketTiers = [] } = useQuery({
    queryKey: ["cinema_ticket_tiers", activeWorkspace?.id],
    queryFn: () => getCinemaTicketTiers({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id && sheetOpen,
  });

  const movies = moviesRaw.map((m: any) => m.movie);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!form.movie_id || !form.screen_id || !form.show_date || !form.start_time) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const scheduleData = {
        cinema_id: cinemaId,
        movie_id: form.movie_id,
        screen_id: form.screen_id,
        show_date: form.show_date,
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
      await queryClient.invalidateQueries({ queryKey: ["cinema_schedules"] });
      toast.success("Schedule created successfully");
      setSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this schedule?`)) return;
    try {
      await deleteSchedule({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["cinema_schedules"] });
      toast.success("Schedule deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete schedule");
    }
  };

  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const toggleTier = (id: string) => {
    setForm((p: any) => {
      const tiers = p.ticket_tiers.includes(id)
        ? p.ticket_tiers.filter((t: string) => t !== id)
        : [...p.ticket_tiers, id];
      return { ...p, ticket_tiers: tiers };
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Show Schedules</h1>
            <p className="text-muted-foreground">
              Manage movie showtimes, screens, and ticket pricing.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" /> Add Showtime
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && schedules.length === 0 && (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Schedules Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create showtimes by linking movies to your screens.
            </p>
            <Button onClick={handleOpenCreate} className="gap-2 rounded-xl h-11 px-6 font-bold">
              <Plus className="h-5 w-5" /> Create First Schedule
            </Button>
          </div>
        )}

        {/* List */}
        {!isLoading && schedules.length > 0 && (
          <div className="space-y-4">
            {schedules.map((schedule: any) => (
              <div
                key={schedule.id}
                className="group flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-card border border-border/60 hover:shadow-sm hover:border-border/80 transition-all"
              >
                {/* Date & Time Column */}
                <div className="flex sm:flex-col gap-3 sm:gap-1 items-center sm:items-start shrink-0 w-32 justify-center sm:justify-center border-b sm:border-b-0 sm:border-r border-border/40 pb-4 sm:pb-0 sm:pr-6">
                  <p className="font-semibold text-muted-foreground text-sm">
                    {new Date(schedule.show_date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-2xl font-bold">{schedule.start_time.slice(0, 5)}</p>
                </div>

                {/* Movie Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-20 w-14 rounded-lg bg-secondary shrink-0 overflow-hidden">
                    {schedule.movie.cover_url ? (
                      <img
                        src={schedule.movie.cover_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="h-6 w-6 m-auto mt-7 text-muted-foreground/30" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{schedule.movie.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MonitorPlay className="h-3.5 w-3.5" /> {schedule.screen.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {schedule.movie.duration_minutes}m
                      </span>
                      {schedule.is_3d && (
                        <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                          3D
                        </span>
                      )}
                      {schedule.is_imax && (
                        <span className="bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                          IMAX
                        </span>
                      )}
                      {schedule.is_premiere && (
                        <span className="bg-purple-500/20 text-purple-500 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                          Premiere
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column / Actions */}
                <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold">
                      {schedule.ticket_tiers.length} Ticket Tiers
                    </p>
                    <p className="text-xs text-emerald-500 font-medium capitalize">
                      {schedule.status}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Showtime
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Create Sheet ──────────────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl">Create Showtime</SheetTitle>
              <SheetDescription>
                Schedule a movie, select the screen, and assign ticket tiers.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>
                  Movie <span className="text-destructive">*</span>
                </Label>
                {movies.length === 0 ? (
                  <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-xl">
                    No movies linked to this cinema. Add movies first.
                  </div>
                ) : (
                  <select
                    value={form.movie_id}
                    onChange={(e) => set("movie_id", e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Select a movie
                    </option>
                    {movies.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.duration_minutes}m)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Screen / Hall <span className="text-destructive">*</span>
                </Label>
                {screens.length === 0 ? (
                  <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-xl">
                    No screens found. Create a screen first.
                  </div>
                ) : (
                  <select
                    value={form.screen_id}
                    onChange={(e) => set("screen_id", e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Select a screen
                    </option>
                    {screens.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Cap: {s.capacity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.show_date}
                    onChange={(e) => set("show_date", e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => set("start_time", e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => set("end_time", e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input
                    value={form.language}
                    onChange={(e) => set("language", e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <Label className="mb-3 block">Formats</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.is_3d}
                      onChange={(e) => set("is_3d", e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">3D Screening</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.is_imax}
                      onChange={(e) => set("is_imax", e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">IMAX Screening</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border/60 rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={form.is_premiere}
                      onChange={(e) => set("is_premiere", e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Premiere</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <Label className="mb-3 block">Ticket Tiers available for this show</Label>
                {ticketTiers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No global ticket tiers found.</p>
                ) : (
                  <div className="space-y-2">
                    {ticketTiers.map((tier: any) => (
                      <label
                        key={tier.id}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                          form.ticket_tiers.includes(tier.id)
                            ? "bg-primary/5 border-primary text-primary"
                            : "border-border/60 hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={form.ticket_tiers.includes(tier.id)}
                            onChange={() => toggleTier(tier.id)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-semibold text-sm">{tier.name}</p>
                            <p className="text-xs opacity-80">{tier.type}</p>
                          </div>
                        </div>
                        <span className="font-bold">
                          {tier.price} {tier.currency}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
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
                  {saving ? "Creating..." : "Schedule Movie"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
