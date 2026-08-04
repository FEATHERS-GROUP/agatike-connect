import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceResourceBookings, createSpaceResourceBooking, deleteSpaceResourceBooking, getSpaceResources } from "@/api/space_resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, Trash2, Clock, MapPin } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { toast } from "sonner";
import "react-big-calendar/lib/css/react-big-calendar.css";

const LazyCalendar = lazy(() => import("@/components/lazy/LazyCalendar"));

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/calendar")({
  component: SchedulePage,
});

function SchedulePage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["space_resource_bookings", spaceId],
    queryFn: () => getSpaceResourceBookings({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["space_resources", spaceId],
    queryFn: () => getSpaceResources({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const createMutation = useMutation({
    mutationFn: createSpaceResourceBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resource_bookings", spaceId] });
      toast.success("Booking created successfully.");
      setTitle("");
      setStartTime("");
      setEndTime("");
    },
    onError: (err) => {
      toast.error("Failed to create booking.");
      console.error(err);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpaceResourceBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resource_bookings", spaceId] });
      toast.success("Booking cancelled.");
    }
  });

  const [title, setTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !resourceId || !startTime || !endTime) return;
    createMutation.mutate({
      data: {
        object: {
          resource_id: resourceId,
          title,
          organizer_name: organizerName,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
        }
      }
    });
  };

  const schedulableResources = resources.filter((r: any) => 
    ["meeting_room", "gym_studio"].includes(r.type)
  );

  const events = bookings.map((b: any) => ({
    id: b.id,
    title: `${b.title} (${b.resource?.name})`,
    start: new Date(b.start_time),
    end: new Date(b.end_time),
    resourceId: b.resource_id,
  }));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-7 w-7 text-orange-500" />
          Schedule & Bookings
        </h2>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage bookings for your meeting rooms and gym studios.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">New Booking</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title / Event</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Yoga Class" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Resource</label>
            <select 
              value={resourceId} 
              onChange={(e) => setResourceId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>Select a room...</option>
              {schedulableResources.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name} ({r.type.replace('_', ' ')})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input 
              type="datetime-local"
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Input 
              type="datetime-local"
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || schedulableResources.length === 0}
            className="h-10 shrink-0 gap-2 px-5 rounded-lg w-full"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            Book
          </Button>
        </form>
        {schedulableResources.length === 0 && (
          <p className="text-xs text-amber-500 mt-2">
            * You need to create a Meeting Room or Gym Studio in the Structure Builder first.
          </p>
        )}
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm overflow-hidden min-h-[600px]">
        <h3 className="font-bold text-lg mb-4">Calendar</h3>
        {bookingsLoading ? (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            Loading calendar...
          </div>
        ) : (
          <div className="h-[600px]">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground">Loading calendar view...</div>}>
              <LazyCalendar
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%", background: "var(--background)", color: "var(--foreground)" }}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: "var(--primary)", // Orange brand color
                    color: "var(--primary-foreground)",
                    border: "none",
                    borderRadius: "6px",
                  }
                })}
                onSelectEvent={(event: any) => {
                  if (confirm(`Do you want to delete this booking: ${event.title}?`)) {
                    deleteMutation.mutate({ data: { id: event.id } });
                  }
                }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
