import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Users,
  Edit2,
  Share2,
  Activity,
  DollarSign,
  Map as MapIcon,
  Navigation,
  CheckCircle2,
  CheckCircle,
  PackagePlus,
  ShoppingBag,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventById, createEventSchedule, updateEvent } from "@/api/events";
import { getEventStaff } from "@/api/staff";
import { getEventFeedback } from "@/api/feedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const ExperienceMap = lazy(() => import("@/components/desktop/ExperienceMap"));

export const Route = createFileRoute("/dashboard/$workspaceSlug/experiences/$experienceId/")({
  component: DashboardExperienceDetails,
});

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function DashboardExperienceDetails() {
  const { experienceId, workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: rawEvent, isLoading } = useQuery({
    queryKey: ["event", experienceId],
    queryFn: () => getEventById({ data: { id: experienceId } } as any),
    enabled: !!experienceId,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["event-staff", experienceId],
    queryFn: async () => {
      const res = await getEventStaff({ data: { event_id: experienceId } } as any);
      return res || [];
    },
    enabled: !!experienceId,
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["event-feedback", experienceId],
    queryFn: () => getEventFeedback({ data: { event_id: experienceId } } as any),
    enabled: !!experienceId,
  });

  const experience = useMemo(() => {
    if (!rawEvent) return null;

    const e = rawEvent;
    const ts = e.tour_stops || {};
    const fr = e.event_requency || {};

    let price = 0;
    let spots = 0;
    if (e.event_tickets && e.event_tickets.length > 0) {
      price = Math.min(...e.event_tickets.map((t: any) => Number(t.cost || 0)));
      spots = e.event_tickets.reduce(
        (acc: number, t: any) => acc + Number(t.remaining || 0) + Number(t.sold || 0),
        0,
      );
    }

    const dateStr = fr.date || ts.date || "";
    const numDays = fr.numberOfDays || 1;

    let durationStr = "Not specified";
    let endDateStr = dateStr;

    if (numDays > 1) {
      durationStr = `${numDays} Days`;
      if (dateStr) {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + numDays - 1);
        endDateStr = d.toISOString().split("T")[0];
      }
    } else {
      const itin = ts.itinerary || [];
      if (itin.length >= 2) {
        const firstTime = itin[0].time;
        const lastTime = itin[itin.length - 1].time;
        if (firstTime && lastTime) {
          const [h1, m1] = firstTime.split(":").map(Number);
          const [h2, m2] = lastTime.split(":").map(Number);
          const diff = h2 + m2 / 60 - (h1 + m1 / 60);
          durationStr = diff > 0 ? `${Math.round(diff * 10) / 10} hours` : "Not specified";
        }
      }
    }

    const displayDate =
      numDays > 1 && dateStr ? `${dateStr} to ${endDateStr}` : dateStr || "Not scheduled";
    const city = ts.city || ts.venueName || "Location not set";

    return {
      id: e.id,
      title: e.title || "Untitled Experience",
      description: e.description || "No description provided.",
      cover:
        e.cover ||
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80",
      category: e.category || "experience",
      date: displayDate,
      city: city,
      price,
      currency: activeWorkspace?.currency || "USD",
      duration: durationStr,
      spots,
      rating: feedbackData?.aggregate?.avg?.rating
        ? Number(feedbackData.aggregate.avg.rating).toFixed(1)
        : "N/A",
      itinerary: ts.itinerary || [],
      requirements: [],
      included: ts.included || [],
      schedules: [
        // Schedule #1 — the primary event date from event_requency
        ...(dateStr
          ? [
              {
                id: `primary-${e.id}`,
                date: dateStr,
                totalSpots: spots,
                spotsFilled: e.event_tickets
                  ? e.event_tickets.reduce((acc: number, t: any) => acc + Number(t.sold || 0), 0)
                  : 0,
              },
            ]
          : []),
        // Additional future runs added via the Schedules UI
        ...(e.schedules || []).map((s: any) => ({
          id: s.id,
          date: s.start_date,
          totalSpots: s.total_spots,
          spotsFilled: s.spots_filled,
        })),
      ].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      addons: e.merchandises || [],
      team: staff.map((s: any) => {
        const isUnregistered = !s.user_id && (s.first_name || s.last_name);
        const displayName = isUnregistered
          ? `${s.first_name || ""} ${s.last_name || ""}`.trim()
          : `User ${s.user_id?.substring(0, 6) || "Unknown"}`;
        return {
          name: displayName,
          role: s.role,
          avatar: s.profile_image,
        };
      }),
    };
  }, [rawEvent, activeWorkspace, staff, feedbackData]);

  const { totalBookings, maxCapacity } = useMemo(() => {
    let booked = 0;
    let capacity = 0;
    if (experience?.schedules && experience.schedules.length > 0) {
      booked = experience.schedules.reduce(
        (acc: number, s: any) => acc + Number(s.spotsFilled || 0),
        0,
      );
      capacity = experience.schedules.reduce(
        (acc: number, s: any) => acc + Number(s.totalSpots || 0),
        0,
      );
    } else {
      if (rawEvent?.event_tickets) {
        booked = rawEvent.event_tickets.reduce(
          (acc: number, t: any) => acc + Number(t.sold || 0),
          0,
        );
      }
      capacity = experience?.spots || 0;
    }
    return { totalBookings: booked, maxCapacity: capacity };
  }, [rawEvent, experience]);

  const addScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!newScheduleDate) return;
      const d = new Date(newScheduleDate);
      const numDays = rawEvent?.event_requency?.numberOfDays || 1;
      d.setDate(d.getDate() + Math.max(1, numDays) - 1);
      const endDateStr = d.toISOString().split("T")[0];

      const payload = {
        event_id: experienceId,
        start_date: newScheduleDate,
        end_date: endDateStr,
        total_spots: maxCapacity,
      };

      return await createEventSchedule({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Schedule added successfully!");
      setIsAddScheduleOpen(false);
      setNewScheduleDate("");
      queryClient.invalidateQueries({ queryKey: ["event", experienceId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add schedule");
    },
  });

  const { totalDistance, mapCenter, polylinePositions, bounds } = useMemo(() => {
    let distance = 0;
    let positions: [number, number][] = [];
    let lats: number[] = [];
    let lngs: number[] = [];

    if (experience?.itinerary) {
      const validStops = experience.itinerary.filter(
        (stop: any) =>
          stop.lat != null &&
          stop.lng != null &&
          !isNaN(Number(stop.lat)) &&
          !isNaN(Number(stop.lng)),
      );
      validStops.forEach((stop: any, i: number) => {
        const lat = Number(stop.lat);
        const lng = Number(stop.lng);
        positions.push([lat, lng]);
        lats.push(lat);
        lngs.push(lng);

        if (i > 0) {
          const prev = validStops[i - 1];
          distance += getDistanceFromLatLonInKm(Number(prev.lat), Number(prev.lng), lat, lng);
        }
      });
    }

    let center: [number, number] = [0, 0];
    let bnds: L.LatLngBoundsExpression | undefined = undefined;

    if (lats.length > 0) {
      center = [
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length,
      ];
      bnds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
    }

    return {
      totalDistance: distance.toFixed(1),
      mapCenter: center,
      polylinePositions: positions,
      bounds: bnds,
    };
  }, [experience]);

  const togglePublicMutation = useMutation({
    mutationFn: async (newValue: boolean) => {
      const payload = {
        id: experienceId,
        allowed_public: newValue,
      };
      return await updateEvent({ data: payload } as any);
    },
    onSuccess: (data, variables) => {
      toast.success(variables ? "Experience is now public!" : "Experience is now private.");
      queryClient.invalidateQueries({ queryKey: ["event", experienceId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update visibility");
    },
  });

  if (isLoading || !experience) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-lg font-medium">Experience not found.</p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() =>
            navigate({
              to: "/dashboard/$workspaceSlug/experiences",
              params: { workspaceSlug: workspaceSlug || "workspace" },
            })
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Experiences
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-6xl mx-auto w-full pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() =>
            navigate({
              to: "/dashboard/$workspaceSlug/experiences",
              params: { workspaceSlug: workspaceSlug || "workspace" },
            })
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Active
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {experience.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight truncate">{experience.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border/50">
            <Label htmlFor="public-toggle" className="text-sm font-medium cursor-pointer">
              Public
            </Label>
            <Switch
              id="public-toggle"
              checked={rawEvent?.allowed_public || false}
              onCheckedChange={(checked) => togglePublicMutation.mutate(checked)}
              disabled={togglePublicMutation.isPending}
            />
          </div>
          <Button variant="outline" className="rounded-full shadow-sm hidden md:flex">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button
            className="rounded-full shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
            onClick={() =>
              navigate({
                to: "/dashboard/$workspaceSlug/experiences/$experienceId/edit",
                params: { workspaceSlug: workspaceSlug || "workspace", experienceId },
              })
            }
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit Experience
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(
              experience.price * totalBookings,
              experience.currency || activeWorkspace?.currency,
            )}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Est. from {totalBookings} bookings
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Bookings</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">
            {totalBookings}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ {maxCapacity}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Total capacity filled</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Duration</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500">{experience.duration}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Rating</span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-500">{experience.rating}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            From {feedbackData?.aggregate?.count || 0} review
            {(feedbackData?.aggregate?.count || 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-secondary/50 p-1 rounded-2xl w-full justify-start h-auto overflow-x-auto">
              <TabsTrigger
                value="overview"
                className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="schedules"
                className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm"
              >
                Upcoming Schedules
              </TabsTrigger>
              <TabsTrigger
                value="addons"
                className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm"
              >
                Products & Add-ons
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)] border border-border/60">
                <img
                  src={experience.cover}
                  alt={experience.title}
                  className="w-full h-80 object-cover"
                />
                <div className="bg-card p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-4">About this Experience</h2>
                  <p className="text-muted-foreground leading-relaxed">{experience.description}</p>

                  <div className="mt-8 flex flex-wrap gap-6">
                    <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2.5 rounded-2xl border border-border/40">
                      <div className="p-2 bg-background rounded-full shadow-sm text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date & Time</p>
                        <p className="text-sm font-medium">{experience.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2.5 rounded-2xl border border-border/40">
                      <div className="p-2 bg-background rounded-full shadow-sm text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">{experience.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REQUIREMENTS SECTION */}
              {experience.requirements && experience.requirements.length > 0 && (
                <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
                  <h3 className="text-xl font-semibold mb-1">What to Bring & Instructions</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Requirements and recommendations from the host.
                  </p>

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {experience.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/90 leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ITINERARY & MAP SECTION */}
              {experience.itinerary && experience.itinerary.length > 0 && (
                <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Route & Schedule</h3>
                      <p className="text-sm text-muted-foreground">
                        Interactive map and timeline of the experience.
                      </p>
                    </div>
                    {Number(totalDistance) > 0 && (
                      <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                        <Navigation className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                          {totalDistance} km total route
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-8 w-full">
                    {/* Visual Map */}
                    {polylinePositions.length > 0 && (
                      <div className="rounded-2xl overflow-hidden border border-border/60 h-[400px] z-10 relative mb-8 lg:mb-0">
                        {isMounted ? (
                          <Suspense
                            fallback={
                              <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                                Loading map...
                              </div>
                            }
                          >
                            <ExperienceMap
                              itinerary={experience.itinerary}
                              bounds={bounds}
                              mapCenter={mapCenter}
                              polylinePositions={polylinePositions}
                            />
                          </Suspense>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                            <div className="text-center text-muted-foreground">
                              <MapIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Loading map...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text Timeline */}
                    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-2">
                      {experience.itinerary.map((stop: any) => (
                        <div
                          key={stop.id}
                          className="relative flex items-start group is-active py-4"
                        >
                          {/* Marker */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary shadow-sm shrink-0 relative z-10">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                          {/* Content */}
                          <div className="ml-4 bg-secondary/30 w-full p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:bg-secondary/50">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-foreground">{stop.title}</h4>
                              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {stop.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{stop.address}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedules" className="space-y-6 mt-0">
              {/* UPCOMING SCHEDULES */}
              {experience.schedules && experience.schedules.length > 0 ? (
                <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Upcoming Schedules</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage bookings for your upcoming scheduled dates.
                      </p>
                    </div>
                    <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="rounded-full shadow-sm"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[2rem] border-border/60">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">
                            Add Upcoming Schedule
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              className="rounded-xl h-11"
                              value={newScheduleDate}
                              onChange={(e) => setNewScheduleDate(e.target.value)}
                            />
                          </div>
                          <Button
                            className="w-full rounded-xl h-11"
                            disabled={!newScheduleDate || addScheduleMutation.isPending}
                            onClick={() => addScheduleMutation.mutate()}
                          >
                            {addScheduleMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Add Schedule
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    {experience.schedules.map((schedule: any) => {
                      const percentage = Math.round(
                        (schedule.spotsFilled / schedule.totalSpots) * 100,
                      );
                      const isFull = schedule.spotsFilled >= schedule.totalSpots;
                      return (
                        <div
                          key={schedule.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-foreground">{schedule.date}</h4>
                              {isFull && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-500">
                                  Sold Out
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {schedule.spotsFilled} / {schedule.totalSpots} booked
                              </span>
                              <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isFull ? "bg-amber-500" : "bg-primary"}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="secondary"
                            className="rounded-xl shrink-0"
                            onClick={() =>
                              navigate({
                                to: "/dashboard/$workspaceSlug/events/$eventId/attendees",
                                params: {
                                  workspaceSlug: workspaceSlug || "workspace",
                                  eventId: experienceId,
                                },
                              })
                            }
                          >
                            <Users className="mr-2 h-4 w-4" /> Manage Attendees
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-border/60 bg-card p-12 text-center shadow-[var(--shadow-card)] flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-4">
                    No upcoming schedules found.
                  </p>
                  <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="rounded-full shadow-sm"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add First Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] border-border/60">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                          Add Upcoming Schedule
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            className="rounded-xl h-11"
                            value={newScheduleDate}
                            onChange={(e) => setNewScheduleDate(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full rounded-xl h-11"
                          disabled={!newScheduleDate || addScheduleMutation.isPending}
                          onClick={() => addScheduleMutation.mutate()}
                        >
                          {addScheduleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Add Schedule
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>

            <TabsContent value="addons" className="space-y-6 mt-0">
              <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Products & Add-ons</h3>
                    <p className="text-sm text-muted-foreground">
                      Optional rentals and merchandise for attendees.
                    </p>
                  </div>
                  <Button
                    className="rounded-full shadow-sm"
                    style={{ background: "var(--gradient-primary)" }}
                    onClick={() =>
                      navigate({
                        to: "/dashboard/$workspaceSlug/products&add-ons",
                        params: { workspaceSlug: workspaceSlug || "workspace" },
                      })
                    }
                  >
                    <PackagePlus className="h-4 w-4 mr-2" /> Manage Add-ons
                  </Button>
                </div>

                {experience.addons && experience.addons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {experience.addons.map((addon: any) => (
                      <div
                        key={addon.id}
                        className="rounded-2xl border border-border/60 p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors flex flex-col h-full"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-semibold text-foreground line-clamp-2">
                              {addon.name}
                            </h4>
                            <span className="font-bold text-primary shrink-0">
                              {formatCurrency(
                                addon.price,
                                experience.currency || activeWorkspace?.currency,
                              )}
                            </span>
                          </div>
                          {addon.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                              {addon.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-border/60 rounded-2xl">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">No add-ons available.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Offer optional extras for your attendees.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold text-lg mb-4">People to Help</h3>
            {experience.team && experience.team.length > 0 ? (
              <div className="space-y-4 mb-6">
                {experience.team.map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border-2 border-border/50 shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-sm">
                        {member.avatar ? (
                          <img src={member.avatar} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">No people assigned to help.</p>
            )}

            <div className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experience Price</span>
                <span className="font-semibold">
                  {experience.price === 0
                    ? "Free"
                    : formatCurrency(
                        experience.price,
                        experience.currency || activeWorkspace?.currency,
                      )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Standard Capacity</span>
                <span className="font-semibold">{experience.spots}</span>
              </div>
            </div>
          </div>

          {experience.included && experience.included.length > 0 && (
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] animate-in fade-in duration-300">
              <h3 className="font-semibold text-lg mb-4">What's Included</h3>
              <div className="space-y-3">
                {experience.included.map((item: any, idx: number) => {
                  const title = typeof item === "string" ? item : item.title;
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm text-foreground/90 leading-relaxed">{title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
