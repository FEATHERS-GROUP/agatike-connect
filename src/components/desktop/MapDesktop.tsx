import { useState, useMemo } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, MessageSquare, ArrowLeft, Maximize2, ZoomIn, ZoomOut, Compass, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getPublicEvents } from "@/api/events";
import { getPublicVenues } from "@/api/venues";
import { getOrganizers } from "@/api/organizers";
import { getUserAllTickets } from "@/api/user_tickets";
import { isWeekendEvent } from "@/lib/utils"; // Assuming we want to filter upcoming by weekend or just take all public events

// --- CATEGORY CONSTANTS ---

const CATEGORIES = [
  {
    id: "venues",
    title: "Venues",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1540306316208-161d02c7fbdf?auto=format&fit=crop&w=800",
  },
  {
    id: "facilities",
    title: "Facilities",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?auto=format&fit=crop&w=800",
  },
  {
    id: "events",
    title: "Events",
    rating: "4.5",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800",
  },
  {
    id: "organizers",
    title: "Organizers",
    rating: "4.3",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800",
  },
];

// --- MAP COMPONENTS ---

function MapController({ selectedEvent }: { selectedEvent: any | null }) {
  const map = useMap();
  if (selectedEvent) {
    const lat = parseFloat(selectedEvent.lat as any);
    const lng = parseFloat(selectedEvent.lng as any);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      map.flyTo([lat, lng], 15, { duration: 0.5 });
    }
  }
  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg transition-transform hover:scale-105"
      >
        <ZoomIn className="h-5 w-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg transition-transform hover:scale-105"
      >
        <ZoomOut className="h-5 w-5" />
      </button>
    </div>
  );
}

// --- MAIN COMPONENT ---

export function MapDesktop() {
  const router = useRouter();
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);

  const defaultCenter: [number, number] = [-1.9441, 30.0619];

  // Queries
  const { data: dbEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const { data: dbVenues = [] } = useQuery({
    queryKey: ["public-venues"],
    queryFn: () => getPublicVenues(),
  });

  const { data: dbOrganizers = [] } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  const { data: userTickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ["user-all-tickets"],
    queryFn: () => getUserAllTickets(),
  });

  // Data processing
  const upcomingEvents = useMemo(() => {
    const publicEvents = dbEvents.filter(
      (e: any) => e.allowed_public === true && e.deleted !== true
    );
    // Return first 10 for display
    return publicEvents.slice(0, 10).map((e: any) => {
      const city = e.workspaces?.city || e.workspaces?.name || "Local";
      const dateStr = e.tour_stops?.[0]?.date || e.created_at;
      return {
        id: e.id,
        title: e.title,
        venue: city,
        date: new Date(dateStr).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        image: e.cover || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=200",
      };
    });
  }, [dbEvents]);

  const pastEvents = useMemo(() => {
    // Tickets already contain past/future information but we'll just show them as "Previous Events" or "User Tickets"
    // In a real app we might filter by date < now. For now, display all fetched user tickets.
    return userTickets.slice(0, 10).map((t: any) => ({
      id: t.id,
      title: t.title,
      date: t.date,
      image: t.cover,
      organizer: {
        name: t.venueName || t.cinema || "Organizer",
        avatar: t.cover,
      },
      link: t.isVenueBooking ? `/dashboard/tickets/${t.id}` : `/tickets/${t.id}`
    }));
  }, [userTickets]);

  const mapMarkers = useMemo(() => {
    const markers: any[] = [];
    
    // Process Events
    dbEvents.forEach((e: any) => {
      const firstStopWithCoords = e.tour_stops?.find((s: any) => s.latitude && s.longitude);
      if (e.allowed_public && !e.deleted && firstStopWithCoords) {
        markers.push({
          id: `event-${e.id}`,
          title: e.title,
          date: new Date(e.created_at).toLocaleDateString(),
          lat: parseFloat(firstStopWithCoords.latitude),
          lng: parseFloat(firstStopWithCoords.longitude),
          image: e.cover || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=100",
          type: "event",
          raw: e,
        });
      }
    });

    // Process Venues
    dbVenues.forEach((v: any) => {
      if (v.latitude && v.longitude) {
        markers.push({
          id: `venue-${v.id}`,
          title: v.name,
          date: v.city,
          lat: parseFloat(v.latitude),
          lng: parseFloat(v.longitude),
          image: v.cover_url || "https://images.unsplash.com/photo-1540306316208-161d02c7fbdf?auto=format&fit=crop&w=100",
          type: "venue",
          raw: v,
        });
      }
    });

    // Process Organizers (Users)
    dbOrganizers.forEach((org: any) => {
      // Fake coordinates since organizers don't have lat/lng in schema usually, but if they do:
      if (org.lat && org.lng) {
        markers.push({
          id: `org-${org.id}`,
          title: org.name,
          lat: parseFloat(org.lat),
          lng: parseFloat(org.lng),
          image: org.avatar || org.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=random`,
          type: "user",
          raw: org,
        });
      }
    });

    return markers.filter(m => !isNaN(m.lat) && !isNaN(m.lng) && isFinite(m.lat) && isFinite(m.lng));
  }, [dbEvents, dbVenues, dbOrganizers]);

  const createCustomIcon = (marker: any) => {
    if (marker.type === "event" || marker.type === "venue") {
      return L.divIcon({
        className: "bg-transparent border-none",
        html: `
          <div class="relative flex flex-col items-center group cursor-pointer">
            <div class="bg-background rounded-2xl p-2 shadow-lg border border-border/40 flex items-center gap-3 w-48 transition-transform group-hover:-translate-y-1">
              <img src="${marker.image}" class="h-10 w-10 rounded-xl object-cover shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold truncate">${marker.title}</p>
                <p class="text-[10px] text-muted-foreground truncate">${marker.date}</p>
              </div>
            </div>
            <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-background drop-shadow-md"></div>
          </div>
        `,
        iconSize: [200, 70],
        iconAnchor: [100, 70],
      });
    }

    // User pin
    return L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative group cursor-pointer transition-transform hover:scale-110">
          <div class="h-12 w-12 rounded-full p-1 bg-gradient-to-tr from-primary to-accent shadow-lg">
            <img src="${marker.image}" class="h-full w-full rounded-full object-cover border-2 border-background" />
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* LEFT COLUMN: Categories */}
      <div className="w-[300px] border-r border-border/40 bg-secondary/20 p-4 flex flex-col h-full overflow-y-auto hide-scrollbar">
        <button
          onClick={() => router.history.back()}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/40 shadow-sm transition-transform hover:scale-105 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold tracking-tight px-1 shrink-0">Categories</h2>
        
        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group relative h-40 w-full overflow-hidden rounded-3xl cursor-pointer shadow-sm transition-transform hover:scale-[1.02] shrink-0"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <span className="text-[10px]">★</span> {cat.rating}
              </div>

              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-lg bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                  {cat.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: Map */}
      <div className="relative flex-1 bg-muted">
        <MapContainer center={defaultCenter} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapController selectedEvent={selectedMarker} />
          
          {mapMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker)}
              eventHandlers={{
                click: () => setSelectedMarker(marker),
              }}
            />
          ))}

          <ZoomControls />
        </MapContainer>

        {/* Map Header Overlay */}
        <div className="absolute top-6 right-6 z-[400] flex gap-2">
          <Button variant="secondary" className="rounded-full shadow-lg h-12 w-12 p-0 bg-background/90 backdrop-blur-md border-border/40">
            <Compass className="h-5 w-5" />
          </Button>
          <Button variant="secondary" className="rounded-full shadow-lg h-12 w-12 p-0 bg-background/90 backdrop-blur-md border-border/40">
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* RIGHT COLUMN: Events & Past Events */}
      {selectedMarker ? (
        <div className="w-[350px] border-l border-border/40 bg-background flex flex-col h-full overflow-hidden relative">
          <div className="relative h-64 w-full shrink-0">
             <img src={selectedMarker.image} className="h-full w-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
             <Button 
               variant="ghost" 
               size="icon" 
               className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md"
               onClick={() => setSelectedMarker(null)}
             >
               <X className="h-5 w-5" />
             </Button>
          </div>
          <div className="flex flex-col p-6 space-y-6 flex-1 overflow-y-auto">
             <div>
               <div className="flex items-center justify-between mb-3">
                 <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-tight text-primary border-primary/20 bg-primary/10">
                   {selectedMarker.type}
                 </div>
                 {selectedMarker.type === "event" && selectedMarker.raw?.event_tickets?.some((t: any) => t.cost === 0) && (
                   <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">FREE TIER AVAILABLE</span>
                 )}
               </div>
               <h2 className="text-2xl font-bold tracking-tight">{selectedMarker.title}</h2>
               
               {/* Location / Date string */}
               <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground">
                 <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                 <span>{selectedMarker.date}</span>
               </div>
               
               {/* Organizer / Additional Info */}
               {selectedMarker.type === "event" && selectedMarker.raw?.workspaces?.organizer && (
                 <div className="flex items-center gap-3 mt-5 p-3 bg-secondary/20 rounded-xl border border-border/40">
                   <img src={selectedMarker.raw.workspaces.organizer.image} className="h-10 w-10 rounded-full object-cover" />
                   <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Organized by</p>
                     <p className="text-sm font-semibold">{selectedMarker.raw.workspaces.organizer.name}</p>
                   </div>
                 </div>
               )}
               
               {selectedMarker.type === "event" && selectedMarker.raw?.event_tickets?.length > 0 && (
                 <div className="mt-5 p-3 bg-secondary/20 rounded-xl border border-border/40 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Starting from</p>
                     <p className="text-lg font-bold text-primary">
                       {Math.min(...selectedMarker.raw.event_tickets.map((t: any) => t.cost))} {selectedMarker.raw.workspaces?.currency || "RWF"}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Tickets</p>
                     <p className="text-sm font-bold">{selectedMarker.raw.event_tickets.length} Types</p>
                   </div>
                 </div>
               )}
               
               {/* Description */}
               {selectedMarker.raw?.description && (
                 <div className="mt-5">
                   <h3 className="text-sm font-bold tracking-tight mb-2">About this {selectedMarker.type}</h3>
                   <div 
                     className="text-sm text-muted-foreground line-clamp-4 leading-relaxed"
                     dangerouslySetInnerHTML={{ __html: selectedMarker.raw.description }} 
                   />
                 </div>
               )}

               {/* Lineup */}
               {selectedMarker.type === "event" && selectedMarker.raw?.lineup?.length > 0 && (
                 <div className="mt-5">
                   <h3 className="text-sm font-bold tracking-tight mb-3">Lineup</h3>
                   <div className="flex flex-wrap gap-2">
                     {selectedMarker.raw.lineup.map((item: any, idx: number) => (
                       <span key={idx} className="bg-secondary/40 border border-border/40 text-xs px-3 py-1.5 rounded-full font-medium">
                         {item.name || item}
                       </span>
                     ))}
                   </div>
                 </div>
               )}

               {selectedMarker.type === "venue" && selectedMarker.raw?.pricing_tiers?.length > 0 && (
                 <div className="mt-5 p-3 bg-secondary/20 rounded-xl border border-border/40">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Starting from</p>
                   <p className="text-lg font-bold text-primary">
                     {selectedMarker.raw.pricing_tiers[0]?.price} {selectedMarker.raw.currency || "RWF"}
                   </p>
                 </div>
               )}
             </div>
             
             {/* Action Button */}
             <div className="mt-auto pt-6">
                <Button 
                  className="w-full rounded-full shadow-[var(--shadow-glow)] h-12"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => {
                     const rawId = selectedMarker.id.split("-").slice(1).join("-");
                     if (selectedMarker.type === "event") {
                       router.navigate({ to: "/events/$eventId", params: { eventId: rawId } });
                     } else if (selectedMarker.type === "venue") {
                       router.navigate({ to: "/venues/$venueId", params: { venueId: rawId } });
                     } else {
                       router.navigate({ to: "/organizers/$organizerId", params: { organizerId: rawId } });
                     }
                  }}
                >
                  View Details <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
             </div>
          </div>
        </div>
      ) : (
        <div className="w-[350px] border-l border-border/40 bg-background flex flex-col h-full overflow-hidden">
        {/* Events Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 pb-2 flex items-center justify-between border-b border-border/20">
            <h2 className="text-xl font-bold tracking-tight">Events</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar p-5 pt-3 space-y-3">
            {isLoadingEvents ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-2">
                  <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
                  <div className="flex flex-col justify-center flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No upcoming events found.
              </div>
            ) : (
              upcomingEvents.map((event: any) => (
                <Link
                  key={event.id}
                  to="/events/$eventId"
                  params={{ eventId: event.id }}
                  className="group flex gap-4 rounded-2xl bg-secondary/30 p-2 cursor-pointer transition-colors hover:bg-secondary/60 block"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{event.venue}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{event.date}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Past Events Section */}
        <div className="h-[45%] flex flex-col border-t border-border/40 bg-secondary/10">
          <div className="p-5 pb-2 flex items-center justify-between border-b border-border/20">
            <h2 className="text-xl font-bold tracking-tight">Previous Events</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar p-5 pt-3 space-y-3">
            {isLoadingTickets ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 border border-border/40 rounded-2xl">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex flex-col justify-center flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : pastEvents.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                You haven't attended any events yet.
              </div>
            ) : (
              pastEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl bg-card p-3 shadow-sm border border-border/40 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={event.organizer.avatar}
                        alt={event.organizer.name}
                        className="h-10 w-10 rounded-full object-cover border border-border/40 bg-muted"
                      />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{event.organizer.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">Attended {event.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{event.date}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
