import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Search,
  List,
  Calendar,
  ShoppingBag,
  User,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";

import { getPublicEvents } from "@/api/events";
import { getPublicVenues } from "@/api/venues";
import { getPublicSpaces } from "@/api/spaces";
import { getPublicCinemas } from "@/api/cinemas";

const normalizeCityName = (city?: string) => {
  if (!city) return "Unknown";
  const clean = city.trim().toLowerCase();
  if (clean === "kgali" || clean === "kiigali" || clean === "kigali") return "Kigali";
  return clean
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function MapController({
  selectedCity,
  selectedMarker,
}: {
  selectedCity: any | null;
  selectedMarker: any | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedMarker) {
      const lat = parseFloat(selectedMarker.lat as any);
      const lng = parseFloat(selectedMarker.lng as any);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        // Offset the center slightly so the marker isn't hidden under the bottom card
        const size = map.getSize();
        if (size.x < 10 || size.y < 10) {
          map.setView([lat - 0.005, lng], 15);
        } else {
          map.flyTo([lat - 0.005, lng], 15, { duration: 0.5 });
        }
      }
    } else if (selectedCity && selectedCity.bounds && selectedCity.bounds.length > 0) {
      const bounds = L.latLngBounds(selectedCity.bounds);
      if (!bounds.isValid()) return;
      
      const size = map.getSize();
      // If the map hasn't fully laid out, animation will crash with NaN. Set view instantly.
      if (size.x < 10 || size.y < 10) {
        map.setView(bounds.getCenter(), 13);
        return;
      }

      if (selectedCity.bounds.length === 1 || bounds.getNorthEast().equals(bounds.getSouthWest())) {
        map.flyTo(bounds.getCenter(), 13, { duration: 0.5 });
      } else {
        if (size.x > 100 && size.y > 100) {
          const paddingX = Math.min(50, size.x * 0.1);
          const paddingY = Math.min(50, size.y * 0.1);
          map.flyToBounds(bounds, { padding: [paddingX, paddingY], duration: 0.5, maxZoom: 15 });
        } else {
          map.flyTo(bounds.getCenter(), 13, { duration: 0.5 });
        }
      }
    }
  }, [selectedMarker, selectedCity, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

export default function MapClient() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);

  const [showCityModal, setShowCityModal] = useState(true);
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null);

  useEffect(() => {
    if (theme === "dark") setIsDark(true);
    else if (theme === "light") setIsDark(false);
    else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, [theme]);

  // Queries
  const { data: dbEvents = [] } = useQuery({
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

  const mapMarkers = useMemo(() => {
    const markers: any[] = [];
    dbEvents.forEach((e: any) => {
      const firstStop = e.tour_stops?.find((s: any) => s.latitude && s.longitude);
      if (e.allowed_public && !e.deleted && firstStop) {
        markers.push({
          id: `event-${e.id}`,
          title: e.title,
          date: new Date(e.created_at).toLocaleDateString(),
          lat: parseFloat(firstStop.latitude),
          lng: parseFloat(firstStop.longitude),
          image:
            e.cover ||
            "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=100",
          type: "event",
          city: normalizeCityName(firstStop.city),
          raw: e,
        });
      }
    });
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
    dbSpaces.forEach((s: any) => {
      const loc = s.locations?.[0];
      if (loc && loc.lat && loc.lng) {
        markers.push({
          id: `space-${s.id}`,
          title: s.name,
          date: loc.city,
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lng),
          image:
            s.cover_url ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100",
          type: "space",
          city: normalizeCityName(loc.city),
          raw: s,
        });
      }
    });
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
  }, [dbEvents, dbVenues, dbSpaces, dbCinemas]);

  const groupedCities = useMemo(() => {
    const cityMap = new Map<
      string,
      { name: string; count: number; image: string; bounds: [number, number][] }
    >();
    mapMarkers.forEach((m) => {
      const c = m.city;
      if (!cityMap.has(c)) {
        const cityImage =
          m.image ||
          "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=200";
        cityMap.set(c, { name: c, count: 0, image: cityImage, bounds: [] });
      }
      const existing = cityMap.get(c)!;
      existing.count += 1;
      existing.bounds.push([m.lat, m.lng]);
    });
    return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
  }, [mapMarkers]);

  const hasAttemptedLocation = useRef(false);

  useEffect(() => {
    if (groupedCities.length > 0 && !selectedCityName && !hasAttemptedLocation.current) {
      hasAttemptedLocation.current = true;
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            let closestCity: string | null = null;
            let minDistance = Infinity;

            groupedCities.forEach((city) => {
              if (city.bounds.length > 0) {
                const centerLat = city.bounds[0][0];
                const centerLng = city.bounds[0][1];
                const dist = getDistanceFromLatLonInKm(userLat, userLng, centerLat, centerLng);
                if (dist < minDistance) {
                  minDistance = dist;
                  closestCity = city.name;
                }
              }
            });

            // If a city is found within 150km, select it automatically
            if (closestCity && minDistance < 150) {
              setSelectedCityName(closestCity);
              setShowCityModal(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { timeout: 15000, maximumAge: 300000 },
        );
      }
    }
  }, [groupedCities, selectedCityName]);

  const selectedCityObj = groupedCities.find((c) => c.name === selectedCityName) || null;

  const createCustomIcon = (marker: any, isSelected: boolean) => {
    const selectedClass = isSelected ? "scale-125 z-50" : "z-10 hover:scale-110";
    return L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative flex flex-col items-center transition-transform duration-300 ${selectedClass}">
          <div class="rounded-full bg-background p-[3px] shadow-md border border-border/20 relative">
             ${isSelected ? `<div class="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-background"></div>` : ""}
             <img src="${marker.image}" class="h-10 w-10 rounded-full object-cover block" />
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-background -mt-1 shadow-sm drop-shadow-sm z-0"></div>
        </div>
      `,
      iconSize: [46, 56],
      iconAnchor: [23, 56],
    });
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCityName(cityName);
    setSelectedMarker(null);
    setShowCityModal(false);
  };

  return (
    <div className="relative h-[100dvh] w-full bg-background overflow-hidden flex flex-col">
      {/* MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[-1.9441, 30.0619]}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url={
              isDark
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
          />
          <MapController selectedCity={selectedCityObj} selectedMarker={selectedMarker} />
          <MapEvents onMapClick={() => setSelectedMarker(null)} />

          {mapMarkers
            .filter((m) => !selectedCityName || m.city === selectedCityName)
            .map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                icon={createCustomIcon(marker, selectedMarker?.id === marker.id)}
                eventHandlers={{ click: () => setSelectedMarker(marker) }}
              />
            ))}
        </MapContainer>
      </div>

      {/* TOP FLOATING SEARCH & FILTERS */}
      <div className="absolute top-safe-top left-0 right-0 z-[20] pt-4 px-4 pointer-events-none flex flex-col gap-3">
        <div className="flex gap-2 pointer-events-auto">
          <Button
            variant="outline"
            className="rounded-full w-12 h-12 p-0 shadow-md shrink-0 bg-background/95 backdrop-blur-md"
            onClick={() => setShowCityModal(true)}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-full h-12 pl-12 pr-4 rounded-full bg-background/95 backdrop-blur-md shadow-md border border-border/40 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pointer-events-auto pb-2">
          <div className="px-4 py-2 bg-background/95 backdrop-blur-md border border-border/40 rounded-full shadow-sm text-xs font-semibold whitespace-nowrap">
            Start Saturday, 12:05 {">"} 15:25
          </div>
          <div className="px-4 py-2 bg-background/95 backdrop-blur-md border border-border/40 rounded-full shadow-sm text-xs font-semibold whitespace-nowrap flex items-center gap-1">
            Any level <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* BOTTOM SELECTED MARKER DETAILS OVERLAY */}
      <div
        className={`absolute bottom-20 left-0 right-0 z-[20] transition-transform duration-300 px-4 ${selectedMarker ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
      >
        {selectedMarker && (
          <div className="bg-background rounded-3xl shadow-xl border border-border/40 p-5 mb-4 pointer-events-auto relative max-h-[50vh] overflow-y-auto hide-scrollbar flex flex-col gap-3">
            {/* Header: Type and Free Tier */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-tight text-primary border-primary/20 bg-primary/10">
                {selectedMarker.type}
              </div>
              {selectedMarker.type === "event" &&
                selectedMarker.raw?.event_tickets?.some((t: any) => t.cost === 0) && (
                  <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                    FREE TIER AVAILABLE
                  </span>
                )}
            </div>

            {/* Title and Address */}
            <div>
              <h3 className="font-bold text-lg leading-tight">{selectedMarker.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="line-clamp-1">
                  {selectedMarker.raw?.address || selectedMarker.city}
                </span>
              </p>
            </div>

            {/* Starting Price (if Event) */}
            {selectedMarker.type === "event" && selectedMarker.raw?.event_tickets?.length > 0 && (
              <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                    Starting from
                  </p>
                  <p className="text-base font-bold text-primary">
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

            {/* Organizer (if Event) */}
            {selectedMarker.type === "event" && selectedMarker.raw?.workspaces?.organizer && (
              <div className="flex items-center gap-3 mt-1">
                <img
                  src={selectedMarker.raw.workspaces.organizer.image}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">
                    Organized by
                  </p>
                  <p className="text-xs font-semibold">
                    {selectedMarker.raw.workspaces.organizer.name}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {selectedMarker.raw?.description && (
              <div className="mt-1">
                <div
                  className="text-xs text-muted-foreground line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedMarker.raw.description }}
                />
              </div>
            )}

            {/* Facilities (if Venue) */}
            {selectedMarker.type === "venue" && selectedMarker.raw?.facilities_data?.length > 0 && (
              <div className="mt-3">
                <h3 className="text-xs font-bold tracking-tight mb-2">Facilities</h3>
                <div className="flex flex-col gap-2">
                  {selectedMarker.raw.facilities_data.map((facility: any) => (
                    <div
                      key={facility.id}
                      className="flex gap-2 bg-secondary/30 p-2 rounded-xl border border-border/40"
                    >
                      {facility.image_url && (
                        <img
                          src={facility.image_url}
                          alt={facility.name}
                          className="w-12 h-12 object-cover rounded-md shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-bold text-xs truncate">{facility.name}</p>
                        <p className="text-[9px] text-muted-foreground capitalize">
                          {facility.type?.replace(/_/g, " ")}
                        </p>
                        <Link
                          to="/venues/$venueId/facilities/checkout/$facilityId"
                          params={{ venueId: selectedMarker.raw.id, facilityId: facility.id }}
                          className="inline-block mt-1.5 w-full"
                        >
                          <Button
                            size="sm"
                            className="w-full h-7 text-[10px] rounded-full shadow-[var(--shadow-glow)] transition-all"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {facility.requires_approval ? "Request" : "Book"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-2">
              <Button
                className="w-full rounded-full font-bold"
                onClick={() => {
                  const rawId = selectedMarker.id.split("-").slice(1).join("-");
                  if (selectedMarker.type === "event")
                    router.navigate({ to: "/events/$eventId", params: { eventId: rawId } });
                  else if (selectedMarker.type === "venue")
                    router.navigate({ to: "/venues/$venueId", params: { venueId: rawId } });
                  else if (selectedMarker.type === "space")
                    router.navigate({ to: "/spaces/$spaceId", params: { spaceId: rawId } });
                  else if (selectedMarker.type === "cinema")
                    router.navigate({ to: "/cinemas/$cinemaId", params: { cinemaId: rawId } });
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FAB FOR LOCATION (List View Equivalent in design) */}
      <div className="absolute bottom-28 right-4 z-[10] pointer-events-auto">
        <Button
          variant="outline"
          className="w-12 h-12 rounded-full shadow-lg bg-background border-border/40 p-0"
          onClick={() => setShowCityModal(true)}
        >
          <List className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* BOTTOM NAVIGATION TAB BAR */}
      <div className="mt-auto h-20 bg-background border-t border-border/40 z-[50] flex items-center justify-around px-2 pb-safe-bottom pt-2 shrink-0">
        <div
          className="flex flex-col items-center gap-1 opacity-100 text-primary cursor-pointer"
          onClick={() => setShowCityModal(true)}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-[10px] font-bold">New booking</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50 text-muted-foreground cursor-pointer">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-[10px] font-medium">Bookings</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50 text-muted-foreground cursor-pointer">
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>

      {/* LOCATION SELECTION MODAL (FULL SCREEN OVERLAY) */}
      {showCityModal && (
        <div className="fixed inset-0 z-[500] bg-background flex flex-col pointer-events-auto">
          {/* Header Image Area */}
          <div className="h-[30vh] w-full relative shrink-0 bg-muted">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white mb-1">Before we begin</h1>
              <p className="text-white/90 text-sm">Please select your default location</p>
            </div>
            {/* Back button */}
            <button
              className="absolute top-safe-top left-4 mt-2 p-2 bg-black/20 backdrop-blur-md rounded-full text-white"
              onClick={() => router.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-background -mt-4 rounded-t-2xl relative z-10 p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold">
              <MapPin className="h-4 w-4" /> Available Locations
            </div>

            <div className="flex flex-col gap-4 pb-8">
              {groupedCities.map((city) => (
                <div
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
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
        </div>
      )}
    </div>
  );
}
