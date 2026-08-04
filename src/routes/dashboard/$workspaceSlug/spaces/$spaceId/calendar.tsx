import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSpaceResourceBookings, createSpaceResourceBooking, createSpaceResourceBookingsBulk, deleteSpaceResourceBooking, getSpaceResources } from "@/api/space_resources";
import { getSpaceSubscriptionsBySpaceId } from "@/api/space_subscriptions";
import { getWorkspaceUsers } from "@/api/workspace_users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, Trash2, Clock, MapPin, User, Repeat, ChevronDown, X } from "lucide-react";
import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["workspace_subscriptions", spaceId],
    queryFn: () => getSpaceSubscriptionsBySpaceId({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: workspaceUsers = [] } = useQuery({
    queryKey: ["workspace_users"],
    queryFn: () => getWorkspaceUsers(),
  });

  // Combine workspace staff + linked subscriber accounts into one suggestion list
  const subscriberSuggestions: { name: string; email: string; tag: string }[] = (() => {
    const map = new Map<string, { name: string; email: string; tag: string }>();

    // 1. Workspace users (staff / team)
    for (const u of workspaceUsers as any[]) {
      if (u.email) map.set(u.email, { name: u.name || u.email, email: u.email, tag: "Staff" });
    }

    // 2. Linked user accounts on subscriptions
    for (const s of subscriptions as any[]) {
      if (s.user?.email) {
        map.set(s.user.email, {
          name: s.user.username || s.user.email,
          email: s.user.email,
          tag: "Member",
        });
      }
      // Also include customer_name / customer_email if no linked user
      if (s.customer_email && !map.has(s.customer_email)) {
        map.set(s.customer_email, {
          name: s.customer_name || s.customer_email,
          email: s.customer_email,
          tag: "Subscriber",
        });
      }
    }

    return Array.from(map.values());
  })();

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
      setSelectedEvent(null);
    }
  });

  const createBulkMutation = useMutation({
    mutationFn: createSpaceResourceBookingsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resource_bookings", spaceId] });
      toast.success("Recurring bookings created successfully.");
      setTitle("");
      setStartTime("");
      setEndTime("");
      setIsRepeating(false);
    },
    onError: (err) => {
      toast.error("Failed to create recurring bookings.");
      console.error(err);
    }
  });

  const [title, setTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [showOrganizerDropdown, setShowOrganizerDropdown] = useState(false);
  const organizerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (organizerRef.current && !organizerRef.current.contains(e.target as Node)) {
        setShowOrganizerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = subscriberSuggestions.filter(
    (s) =>
      organizerName === "" ||
      s.name.toLowerCase().includes(organizerName.toLowerCase()) ||
      s.email.toLowerCase().includes(organizerName.toLowerCase())
  );
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState("daily"); // daily, weekly
  const [repeatUntil, setRepeatUntil] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !resourceId || !startTime || !endTime) return;
    
    if (isRepeating && repeatUntil) {
      const objects = [];
      let currentStart = new Date(startTime);
      let currentEnd = new Date(endTime);
      const endCondition = new Date(repeatUntil);
      endCondition.setHours(23, 59, 59, 999);

      while (currentStart <= endCondition) {
        objects.push({
          resource_id: resourceId,
          title,
          organizer_name: organizerName,
          start_time: new Date(currentStart).toISOString(),
          end_time: new Date(currentEnd).toISOString(),
        });

        if (repeatFrequency === "daily") {
          currentStart.setDate(currentStart.getDate() + 1);
          currentEnd.setDate(currentEnd.getDate() + 1);
        } else if (repeatFrequency === "weekly") {
          currentStart.setDate(currentStart.getDate() + 7);
          currentEnd.setDate(currentEnd.getDate() + 7);
        } else {
          break; // Safeguard
        }
      }

      if (objects.length > 0) {
        createBulkMutation.mutate({ data: { objects } });
      }
    } else {
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
    }
  };

  // All resources in the space can be scheduled
  const schedulableResources = resources;

  const events = bookings.map((b: any) => ({
    id: b.id,
    title: b.title,
    start: new Date(b.start_time),
    end: new Date(b.end_time),
    resourceId: b.resource_id,
    resourceName: b.resource?.name,
    organizerName: b.organizer_name,
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
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">Title / Event</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Yoga Class" 
              required
            />
          </div>
          <div className="space-y-2" ref={organizerRef}>
            <label className="text-sm font-medium">Organizer</label>
            <div className="relative">
              <Input 
                value={organizerName} 
                onChange={(e) => { setOrganizerName(e.target.value); setShowOrganizerDropdown(true); }} 
                onFocus={() => setShowOrganizerDropdown(true)}
                placeholder="Type name or pick a subscriber..." 
              />
              {organizerName && (
                <button
                  type="button"
                  onClick={() => { setOrganizerName(""); setShowOrganizerDropdown(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {showOrganizerDropdown && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border/60 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s.email}
                      type="button"
                      className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-secondary/60 transition-colors text-sm"
                      onClick={() => { setOrganizerName(s.name); setShowOrganizerDropdown(false); }}
                    >
                      <div className="h-6 w-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 text-xs font-bold">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        s.tag === "Staff" ? "bg-purple-500/10 text-purple-500" :
                        s.tag === "Member" ? "bg-orange-500/10 text-orange-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {s.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 lg:col-span-1">
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
          <div className="space-y-2 lg:col-span-6 flex items-center gap-3 mt-2 mb-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="repeatToggle"
                checked={isRepeating} 
                onChange={(e) => setIsRepeating(e.target.checked)} 
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="repeatToggle" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                <Repeat className="h-4 w-4 text-orange-500" />
                Repeat this booking
              </label>
            </div>
            
            {isRepeating && (
              <div className="flex items-center gap-4 ml-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Every</span>
                  <select
                    value={repeatFrequency}
                    onChange={(e) => setRepeatFrequency(e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="daily">Day</option>
                    <option value="weekly">Week</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Until</span>
                  <Input 
                    type="date"
                    value={repeatUntil} 
                    onChange={(e) => setRepeatUntil(e.target.value)} 
                    className="h-8"
                    required={isRepeating}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={createMutation.isPending || createBulkMutation.isPending || schedulableResources.length === 0}
            className="h-10 shrink-0 gap-2 px-5 rounded-lg lg:col-span-6 w-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            {isRepeating ? "Create Recurring Bookings" : "Book Resource"}
          </Button>
        </form>
        {schedulableResources.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <span className="text-orange-500">ℹ</span>
            No resources found. Head over to the <strong>Structure Builder</strong> to add your first room or space — then come back to schedule it.
          </p>
        )}
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm overflow-hidden min-h-[700px]">
        <h3 className="font-bold text-lg mb-4">Calendar</h3>
        
        {/* We add global overrides for react-big-calendar toolbar text colors so they appear correctly in both themes */}
        <style dangerouslySetInnerHTML={{__html: `
          .rbc-toolbar button { color: var(--foreground) !important; border-color: var(--border) !important; }
          .rbc-toolbar button.rbc-active { background-color: var(--secondary) !important; }
          .rbc-toolbar button:hover { background-color: var(--accent) !important; }
          .rbc-header { padding: 8px !important; font-weight: 600 !important; }
          .rbc-today { background-color: rgba(249,115,22, 0.05) !important; }
          .rbc-off-range-bg { background-color: var(--secondary) !important; opacity: 0.3 !important; }
        `}} />

        {bookingsLoading ? (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            Loading calendar...
          </div>
        ) : (
          <div className="h-[650px]">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground">Loading calendar view...</div>}>
              <LazyCalendar
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                popup
                style={{ height: "100%", background: "var(--background)", color: "var(--foreground)" }}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    borderRadius: "6px",
                  }
                })}
                onSelectEvent={(event: any) => setSelectedEvent(event)}
              />
            </Suspense>
          </div>
        )}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Details for this specific schedule.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-xl font-bold">{selectedEvent.title}</h4>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="font-medium text-foreground">
                      {selectedEvent.resourceName || "Unknown Resource"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0 text-orange-500" />
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {selectedEvent.start.toLocaleDateString()}
                      </span>
                      <span>
                        {selectedEvent.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {selectedEvent.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>

                  {selectedEvent.organizerName && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <User className="h-4 w-4 shrink-0 text-orange-500" />
                      <span className="font-medium text-foreground">
                        {selectedEvent.organizerName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="destructive"
              className="gap-2"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm(`Are you sure you want to cancel this booking?`)) {
                  deleteMutation.mutate({ data: { id: selectedEvent.id } });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Cancel Booking
            </Button>
            <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
