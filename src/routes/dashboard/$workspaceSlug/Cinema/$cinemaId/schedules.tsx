import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchedules,
  deleteSchedule,
} from "@/api/cinema_management";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/schedules")({
  component: CinemaSchedulesPage,
});

function CinemaSchedulesPage() {
  const { cinemaId, workspaceSlug } = Route.useParams() as any;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["cinema_schedules", cinemaId],
    queryFn: () => getSchedules({ data: { cinema_id: cinemaId } }),
    enabled: !!cinemaId,
  });

  const now = new Date();
  const activeSchedules = schedules.filter((s: any) => {
    const timeStr = s.end_time || s.start_time || "00:00:00";
    const endTime = new Date(`${s.show_date}T${timeStr}`);
    return endTime >= now;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    navigate({ to: "/dashboard/$workspaceSlug/Cinema/$cinemaId/create-schedule", params: { workspaceSlug, cinemaId } });
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      await deleteSchedule({ data: { id: scheduleId } });
      queryClient.invalidateQueries({ queryKey: ["cinema_schedules", cinemaId] });
      toast.success("Showtime deleted successfully");
    } catch (error) {
      toast.error("Failed to delete showtime");
    }
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
        {!isLoading && activeSchedules.length === 0 && (
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
        {!isLoading && activeSchedules.length > 0 && (
          <div className="space-y-4">
            {activeSchedules.map((schedule: any) => (
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

      </div>
    </div>
  );
}
