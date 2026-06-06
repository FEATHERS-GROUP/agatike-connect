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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { experiences } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExperienceMap = lazy(() => import("@/components/desktop/ExperienceMap"));

export const Route = createFileRoute("/dashboard/$workspaceSlug/experiences/$experienceId/")({
  component: DashboardExperienceDetails,
});

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function DashboardExperienceDetails() {
  const { experienceId, workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const experience = experiences.find((e) => e.id === experienceId) || experiences[0];

  const { totalBookings, maxCapacity } = useMemo(() => {
    if (experience?.schedules) {
      const bookings = experience.schedules.reduce((acc, curr) => acc + curr.spotsFilled, 0);
      const capacity = experience.schedules.reduce((acc, curr) => acc + curr.totalSpots, 0);
      return { totalBookings: bookings, maxCapacity: capacity };
    }
    return { totalBookings: 8, maxCapacity: experience?.spots || 12 };
  }, [experience]);

  const { totalDistance, mapCenter, polylinePositions, bounds } = useMemo(() => {
    let distance = 0;
    let positions: [number, number][] = [];
    let lats: number[] = [];
    let lngs: number[] = [];

    if (experience?.itinerary) {
      const validStops = experience.itinerary.filter(stop => stop.lat && stop.lng);
      validStops.forEach((stop, i) => {
        const lat = stop.lat!;
        const lng = stop.lng!;
        positions.push([lat, lng]);
        lats.push(lat);
        lngs.push(lng);

        if (i > 0) {
          const prev = validStops[i - 1];
          distance += getDistanceFromLatLonInKm(prev.lat!, prev.lng!, lat, lng);
        }
      });
    }

    let center: [number, number] = [0, 0];
    let bnds: L.LatLngBoundsExpression | undefined = undefined;

    if (lats.length > 0) {
      center = [
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length
      ];
      bnds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];
    }

    return {
      totalDistance: distance.toFixed(1),
      mapCenter: center,
      polylinePositions: positions,
      bounds: bnds
    };
  }, [experience]);

  if (!experience) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-lg font-medium">Experience not found.</p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate({ to: "/dashboard/$workspaceSlug/experiences", params: { workspaceSlug: workspaceSlug || "workspace" } })}
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
          onClick={() => navigate({ to: "/dashboard/$workspaceSlug/experiences", params: { workspaceSlug: workspaceSlug || "workspace" } })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
              Active
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{experience.category}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight truncate">{experience.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full shadow-sm hidden md:flex">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant="outline" className="rounded-full shadow-sm">
            <User className="mr-2 h-4 w-4" /> Manage Team
          </Button>
          <Button className="rounded-full shadow-sm" style={{ background: "var(--gradient-primary)" }}>
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
            {formatCurrency(experience.price * totalBookings, experience.currency || activeWorkspace?.currency)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Est. from {totalBookings} bookings</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Bookings</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{totalBookings} <span className="text-sm font-normal text-muted-foreground">/ {maxCapacity}</span></p>
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
          <p className="text-[11px] text-muted-foreground mt-1">From past attendees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-secondary/50 p-1 rounded-2xl w-full justify-start h-auto overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="schedules" className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm">Upcoming Schedules</TabsTrigger>
              <TabsTrigger value="addons" className="rounded-xl px-6 py-2 data-[state=active]:shadow-sm">Products & Add-ons</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="rounded-[2rem] overflow-hidden shadow-[var(--shadow-card)] border border-border/60">
                <img src={experience.cover} alt={experience.title} className="w-full h-80 object-cover" />
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
              <p className="text-sm text-muted-foreground mb-6">Requirements and recommendations from the host.</p>
              
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
                  <p className="text-sm text-muted-foreground">Interactive map and timeline of the experience.</p>
                </div>
                {Number(totalDistance) > 0 && (
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                    <Navigation className="h-4 w-4" />
                    <span className="font-semibold text-sm">{totalDistance} km total route</span>
                  </div>
                )}
              </div>
              
              <div className={polylinePositions.length > 0 ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "block"}>
                {/* Visual Map */}
                {polylinePositions.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-border/60 h-[400px] z-10 relative mb-8 lg:mb-0">
                    {isMounted ? (
                      <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-secondary/50">Loading map...</div>}>
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
                  {experience.itinerary.map((stop) => (
                    <div key={stop.id} className="relative flex items-start group is-active py-4">
                      {/* Marker */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary shadow-sm shrink-0 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      {/* Content */}
                      <div className="ml-4 bg-secondary/30 w-full p-4 rounded-2xl border border-border/60 shadow-sm transition-all hover:bg-secondary/50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground">{stop.title}</h4>
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{stop.time}</span>
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
                <h3 className="text-xl font-semibold mb-1">Upcoming Schedules</h3>
                <p className="text-sm text-muted-foreground mb-6">Manage bookings for your upcoming scheduled dates.</p>
                
                <div className="space-y-4">
                  {experience.schedules.map((schedule) => {
                    const percentage = Math.round((schedule.spotsFilled / schedule.totalSpots) * 100);
                    const isFull = schedule.spotsFilled >= schedule.totalSpots;
                    return (
                      <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors">
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
                            <span className="text-muted-foreground">{schedule.spotsFilled} / {schedule.totalSpots} booked</span>
                            <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isFull ? 'bg-amber-500' : 'bg-primary'}`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="secondary"
                          className="rounded-xl shrink-0"
                          onClick={() => navigate({ 
                            to: "/dashboard/$workspaceSlug/events/$eventId/attendees", 
                            params: { workspaceSlug: workspaceSlug || "workspace", eventId: experienceId } 
                          })}
                        >
                          <Users className="mr-2 h-4 w-4" /> Manage Attendees
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-border/60 bg-card p-12 text-center shadow-[var(--shadow-card)]">
                <p className="text-muted-foreground">No upcoming schedules found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="addons" className="space-y-6 mt-0">
            <div className="rounded-[2rem] border border-border/60 bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Products & Add-ons</h3>
                  <p className="text-sm text-muted-foreground">Optional rentals and merchandise for attendees.</p>
                </div>
                <Button 
                  className="rounded-full shadow-sm" 
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => navigate({ to: "/dashboard/$workspaceSlug/products&add-ons", params: { workspaceSlug: workspaceSlug || "workspace" } })}
                >
                  <PackagePlus className="h-4 w-4 mr-2" /> Manage Add-ons
                </Button>
              </div>

              {experience.addons && experience.addons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {experience.addons.map((addon) => (
                    <div key={addon.id} className="rounded-2xl border border-border/60 p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold text-foreground line-clamp-2">{addon.name}</h4>
                          <span className="font-bold text-primary shrink-0">
                            {formatCurrency(addon.price, experience.currency || activeWorkspace?.currency)}
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
                  <p className="text-sm text-muted-foreground/70 mt-1">Offer optional extras for your attendees.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT COLUMN (Sidebar) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] sticky top-6">
            <h3 className="font-semibold text-lg mb-4">Meet the Team</h3>
            {experience.team && experience.team.length > 0 ? (
              <div className="space-y-4 mb-6">
                {experience.team.map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border-2 border-border/50 shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-sm">
                        {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
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
              <p className="text-sm text-muted-foreground mb-6">No team members assigned.</p>
            )}
            
            <div className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experience Price</span>
                <span className="font-semibold">{experience.price === 0 ? "Free" : formatCurrency(experience.price, experience.currency || activeWorkspace?.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Standard Capacity</span>
                <span className="font-semibold">{experience.spots}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
