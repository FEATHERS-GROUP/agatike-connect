import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/schedules")({
  component: CinemaSchedules,
});

function CinemaSchedules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Master Schedule</h2>
        <p className="text-muted-foreground mt-1">Manage global showtimes and daily timetables across all your screens.</p>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-12 text-center shadow-sm mt-8">
        <h3 className="text-xl font-bold mb-2">Schedule Management</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          A master calendar view of all movies playing across all screens will appear here. This feature is coming soon!
        </p>
      </div>
    </div>
  );
}
