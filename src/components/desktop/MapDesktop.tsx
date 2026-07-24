import { useState, useMemo, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  MessageSquare,
  ArrowLeft,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Compass,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getPublicEvents } from "@/api/events";
import { getPublicVenues } from "@/api/venues";
import { getPublicSpaces } from "@/api/spaces";
import { getOrganizers } from "@/api/organizers";
import { getUserAllTickets } from "@/api/user_tickets";
import { getPublicCinemas, getPublicMovieSchedules } from "@/api/cinemas";
import { useTheme } from "@/contexts/ThemeContext";
import { isWeekendEvent } from "@/lib/utils";
import AgatikeLogo from "@/assets/logo/Agatike Icon.png";

const normalizeCityName = (city?: string) => {
  if (!city) return "Unknown";
  const clean = city.trim().toLowerCase();
  if (clean === "kgali" || clean === "kiigali" || clean === "kigali") return "Kigali";
  return clean
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// --- MAP COMPONENTS ---

function MapController({ selectedEvent }: { selectedEvent: any | null }) {
  const map = useMap();
  if (selectedEvent) {
    const lat = parseFloat(selectedEvent.lat as any);
    const lng = parseFloat(selectedEvent.lng as any);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      const size = map.getSize();
      if (size.x < 10 || size.y < 10) {
        map.setView([lat, lng], 15);
      } else {
        map.flyTo([lat, lng], 15, { duration: 0.5 });
      }
    }
  }
  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2">
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
  const { theme } = useTheme();
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true);
    } else if (theme === "light") {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, [theme]);

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

  const { data: dbSpaces = [] } = useQuery({
    queryKey: ["public-spaces"],
    queryFn: () => getPublicSpaces(),
  });

  const { data: dbCinemas = [] } = useQuery({
    queryKey: ["public-cinemas"],
    queryFn: () => getPublicCinemas(),
  });

  const { data: dbSchedules = [] } = useQuery({
    queryKey: ["public-cinema-schedules"],
    queryFn: () => getPublicMovieSchedules(),
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
      (e: any) => e.allowed_public === true && e.deleted !== true,
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
        image:
          e.cover ||
          "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=200",
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
      link: t.isVenueBooking ? `/dashboard/tickets/${t.id}` : `/tickets/${t.id}`,
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
          image:
            e.cover ||
            "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=100",
          type: "event",
          city: normalizeCityName(firstStopWithCoords.city),
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
          image:
            v.cover_url ||
            "https://images.unsplash.com/photo-1540306316208-161d02c7fbdf?auto=format&fit=crop&w=100",
          type: "venue",
          city: normalizeCityName(v.city),
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
          image:
            org.avatar ||
            org.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=random`,
          type: "user",
          city: normalizeCityName("Unknown"), // Organizers don't typically have a direct city mapped here
          raw: org,
        });
      }
    });

    // Process Spaces
    dbSpaces.forEach((s: any) => {
      const firstLoc = s.locations?.[0];
      if (firstLoc && firstLoc.lat && firstLoc.lng) {
        markers.push({
          id: `space-${s.id}`,
          title: s.name,
          date: firstLoc.city,
          lat: parseFloat(firstLoc.lat),
          lng: parseFloat(firstLoc.lng),
          image:
            s.cover_url ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100",
          type: "space",
          city: normalizeCityName(firstLoc.city),
          raw: s,
        });
      }
    });

    // Process Cinemas
    dbCinemas.forEach((c: any) => {
      if (c.latitude && c.longitude) {
        markers.push({
          id: `cinema-${c.id}`,
          title: c.name,
          date: c.city,
          lat: parseFloat(c.latitude),
          lng: parseFloat(c.longitude),
          image:
            c.cover_url ||
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100",
          type: "cinema",
          city: normalizeCityName(c.city),
          raw: c,
        });
      }
    });

    return markers.filter(
      (m) => !isNaN(m.lat) && !isNaN(m.lng) && isFinite(m.lat) && isFinite(m.lng),
    );
  }, [dbEvents, dbVenues, dbOrganizers, dbSpaces, dbCinemas]);

  const groupedCities = useMemo(() => {
    const cityMap = new Map<
      string,
      {
        name: string;
        count: number;
        lat: number;
        lng: number;
        image: string;
        bounds: [number, number][];
      }
    >();

    mapMarkers.forEach((m) => {
      if (m.type === "user") return; // Skip users for city grouping
      const c = m.city;
      if (!cityMap.has(c)) {
        cityMap.set(c, {
          name: c,
          count: 0,
          lat: m.lat,
          lng: m.lng,
          image: m.image,
          bounds: [],
        });
      }
      const existing = cityMap.get(c)!;
      existing.count += 1;
      existing.bounds.push([m.lat, m.lng]);
    });

    return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
  }, [mapMarkers]);

  const handleCityClick = (city: any) => {
    if (mapRef && city.bounds.length > 0) {
      const bounds = L.latLngBounds(city.bounds);
      if (!bounds.isValid()) return;

      if (city.bounds.length === 1 || bounds.getNorthEast().equals(bounds.getSouthWest())) {
        mapRef.flyTo(bounds.getCenter(), 13);
      } else {
        const size = mapRef.getSize();
        if (size.x > 100 && size.y > 100) {
          const paddingX = Math.min(50, size.x * 0.1);
          const paddingY = Math.min(50, size.y * 0.1);
          mapRef.flyToBounds(bounds, { padding: [paddingX, paddingY], maxZoom: 15 });
        } else {
          mapRef.flyTo(bounds.getCenter(), 13);
        }
      }
    }
  };

  const createCustomIcon = (marker: any) => {
    if (marker.type !== "user") {
      let borderColor = "border-primary";
      let bgColor = "bg-background";
      let triangleColor = "border-t-primary";
      let badgeBg = "bg-primary/20";
      let badgeText = "text-primary";

      if (marker.type === "venue") {
        borderColor = "border-blue-500";
        triangleColor = "border-t-blue-500";
        badgeBg = "bg-blue-500/20";
        badgeText = "text-blue-500";
      } else if (marker.type === "space") {
        borderColor = "border-purple-500";
        triangleColor = "border-t-purple-500";
        badgeBg = "bg-purple-500/20";
        badgeText = "text-purple-500";
      } else if (marker.type === "cinema") {
        borderColor = "border-orange-500";
        triangleColor = "border-t-orange-500";
        badgeBg = "bg-orange-500/20";
        badgeText = "text-orange-500";
      }

      return L.divIcon({
        className: "bg-transparent border-none",
        html: `
          <div class="relative flex flex-col items-center group cursor-pointer">
            <div class="${bgColor} rounded-2xl p-2 shadow-lg border-2 ${borderColor} flex items-center gap-3 w-48 transition-transform group-hover:-translate-y-1">
              <img src="${marker.image}" class="h-10 w-10 rounded-xl object-cover shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1 mb-0.5">
                  <span class="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${badgeBg} ${badgeText}">${marker.type}</span>
                </div>
                <p class="text-xs font-bold truncate">${marker.title}</p>
                <p class="text-[10px] text-muted-foreground truncate">${marker.date}</p>
              </div>
            </div>
            <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] ${triangleColor} drop-shadow-md"></div>
          </div>
        `,
        iconSize: [200, 80],
        iconAnchor: [100, 80],
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
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Map Background Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full z-0"
          zoomControl={false}
          attributionControl={false}
          ref={setMapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={
              isDark
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
            keepBuffer={8}
            updateWhenZooming={false}
            updateWhenIdle={true}
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
      </div>

      {/* Map Header Overlay Controls */}
      <div className="absolute top-6 left-[350px] z-[40] flex gap-2">
        <Button
          variant="secondary"
          className="rounded-full shadow-lg h-12 w-12 p-0 bg-background/90 backdrop-blur-md border-border/40 transition-transform hover:scale-105"
        >
          <Compass className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          className="rounded-full shadow-lg h-12 w-12 p-0 bg-background/90 backdrop-blur-md border-border/40 transition-transform hover:scale-105"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* FLOATING LEFT COLUMN: Categories */}
      <div className="absolute left-4 top-4 bottom-4 w-[320px] z-10 bg-background/85 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex flex-col overflow-y-auto hide-scrollbar">
        <div className="flex items-center gap-3 mb-6 shrink-0 px-1">
          <button
            onClick={() => router.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/40 shadow-sm transition-transform hover:scale-105 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img
            src={AgatikeLogo}
            alt="Agatike"
            className="h-9 w-9 rounded-xl shadow-sm object-cover"
          />
        </div>

        <h2 className="mb-4 text-xl font-bold tracking-tight px-1 shrink-0">Locations</h2>

        <div className="flex flex-col gap-4">
          {groupedCities.map((city) => (
            <div
              key={city.name}
              onClick={() => handleCityClick(city)}
              className="group relative h-40 w-full overflow-hidden rounded-3xl cursor-pointer shadow-sm transition-transform hover:scale-[1.02] shrink-0"
            >
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white tracking-tight leading-none drop-shadow-md">
                    {city.name}
                  </h3>
                  <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 backdrop-blur-md border border-white/10">
                    <span className="text-xs font-bold text-white">{city.count} Places</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING RIGHT COLUMN: Events & Past Events */}
      <div className="absolute right-4 top-4 bottom-4 w-[380px] z-10 bg-background/85 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col overflow-hidden">
        {selectedMarker ? (
          <div className="flex flex-col h-full overflow-hidden relative">
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
                  {selectedMarker.type === "event" &&
                    selectedMarker.raw?.event_tickets?.some((t: any) => t.cost === 0) && (
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                        FREE TIER AVAILABLE
                      </span>
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
                    <img
                      src={selectedMarker.raw.workspaces.organizer.image}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                        Organized by
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedMarker.raw.workspaces.organizer.name}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMarker.type === "event" &&
                  selectedMarker.raw?.event_tickets?.length > 0 && (
                    <div className="mt-5 p-3 bg-secondary/20 rounded-xl border border-border/40 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                          Starting from
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {Math.min(...selectedMarker.raw.event_tickets.map((t: any) => t.cost))}{" "}
                          {selectedMarker.raw.workspaces?.currency || "RWF"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                          Tickets
                        </p>
                        <p className="text-sm font-bold">
                          {selectedMarker.raw.event_tickets.length} Types
                        </p>
                      </div>
                    </div>
                  )}

                {/* Description */}
                {selectedMarker.raw?.description && (
                  <div className="mt-5">
                    <h3 className="text-sm font-bold tracking-tight mb-2">
                      About this {selectedMarker.type}
                    </h3>
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
                        <span
                          key={idx}
                          className="bg-secondary/40 border border-border/40 text-xs px-3 py-1.5 rounded-full font-medium"
                        >
                          {item.name || item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMarker.type === "venue" &&
                  selectedMarker.raw?.pricing_tiers?.length > 0 && (
                    <div className="mt-5 p-3 bg-secondary/20 rounded-xl border border-border/40">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                        Starting from
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {selectedMarker.raw.pricing_tiers[0]?.price}{" "}
                        {selectedMarker.raw.currency || "RWF"}
                      </p>
                    </div>
                  )}

                {selectedMarker.type === "venue" &&
                  selectedMarker.raw?.facilities_data?.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <h3 className="text-sm font-bold tracking-tight mb-2">Facilities</h3>
                      <div className="flex flex-col gap-3">
                        {selectedMarker.raw.facilities_data.map((facility: any) => (
                          <div
                            key={facility.id}
                            className="flex gap-3 bg-secondary/20 p-3 rounded-xl border border-border/40"
                          >
                            {facility.image_url && (
                              <img
                                src={facility.image_url}
                                alt={facility.name}
                                className="w-16 h-16 object-cover rounded-md shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="font-bold text-sm truncate">{facility.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                                {facility.type?.replace(/_/g, " ")}
                              </p>
                              <Link
                                to="/venues/$venueId/facilities/checkout/$facilityId"
                                params={{ venueId: selectedMarker.raw.id, facilityId: facility.id }}
                                className="inline-block mt-2 w-full"
                              >
                                <Button
                                  size="sm"
                                  className="w-full h-8 text-xs rounded-full shadow-[var(--shadow-glow)] transition-all"
                                  style={{ background: "var(--gradient-primary)" }}
                                >
                                  {facility.requires_approval ? "Request Booking" : "Book Now"}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedMarker.type === "space" && selectedMarker.raw?.plans?.length > 0 && (
                  <div className="mt-5 p-3 bg-secondary/20 rounded-xl border border-border/40">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                      Starting from
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {selectedMarker.raw.plans[0]?.price} {selectedMarker.raw.currency || "RWF"}
                    </p>
                  </div>
                )}

                {selectedMarker.type === "cinema" && (
                  <div className="mt-5 space-y-3">
                    <h3 className="text-sm font-bold tracking-tight mb-2">Playing Today</h3>
                    {dbSchedules.filter((s: any) => s.cinema?.id === selectedMarker.raw.id).length >
                    0 ? (
                      dbSchedules
                        .filter((s: any) => s.cinema?.id === selectedMarker.raw.id)
                        .map((schedule: any) => (
                          <div
                            key={schedule.id}
                            className="flex gap-3 bg-secondary/20 p-3 rounded-xl border border-border/40"
                          >
                            {schedule.movie?.cover_url && (
                              <img
                                src={schedule.movie.cover_url}
                                alt={schedule.movie.title}
                                className="w-12 h-16 object-cover rounded-md"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{schedule.movie?.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {schedule.movie?.genre} • {schedule.movie?.duration_minutes}m
                              </p>
                              <p className="text-xs font-semibold text-primary mt-1">
                                {schedule.start_time.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No movies scheduled for today.
                      </p>
                    )}
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
                    } else if (selectedMarker.type === "space") {
                      router.navigate({ to: "/spaces/$spaceId", params: { spaceId: rawId } });
                    } else if (selectedMarker.type === "cinema") {
                      router.navigate({ to: "/cinemas/$cinemaId", params: { cinemaId: rawId } });
                    } else {
                      router.navigate({ to: "/organizers" });
                    }
                  }}
                >
                  View Details <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
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
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {event.venue}
                        </p>
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
                          <p className="text-xs text-muted-foreground truncate">
                            Attended {event.title}
                          </p>
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
      </div>
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
