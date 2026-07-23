import { Link, useNavigate } from "@tanstack/react-router";
import { Stories } from "@/components/site/Stories";
import {
  MessageCircle,
  Activity,
  Loader2,
  MapPin,
  ChevronRight,
  X,
  Compass,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizers } from "@/api/organizers";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import { useFirestoreUserMessages } from "@/hooks/useFirestoreUserMessages";
import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPublicEvents } from "@/api/events";
import { getPublicCinemas } from "@/api/cinemas";
import { getPublicVenues } from "@/api/venues";
import { getPublicSpaces } from "@/api/spaces";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/contexts/ThemeContext";

const normalizeCityName = (city?: string) => {
  if (!city) return "Unknown";
  const clean = city.trim().toLowerCase();
  if (clean === "kgali" || clean === "kiigali" || clean === "kigali") return "Kigali";
  return clean
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

function MapController({ selectedMarker }: { selectedMarker: any | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedMarker) {
      const lat = parseFloat(selectedMarker.lat as any);
      const lng = parseFloat(selectedMarker.lng as any);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        // Offset the center slightly so the marker isn't hidden under the bottom card
        map.flyTo([lat - 0.005, lng], 14, { duration: 0.5 });
      }
    }
  }, [selectedMarker, map]);
  return null;
}

export function HomeMobile() {
  const { user, isLoading, isLoggedIn } = useUserAuth();
  const navigate = useNavigate({ from: "/$userId" } as any);
  const { followedIds } = useFollowedOrganizers();
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

  // --- QUERIES ---
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

  const { data: dbOrganizers = [] } = useQuery({
    queryKey: ["organizers"],
    queryFn: () => getOrganizers(),
  });

  // Notifications / Chats
  const { channels } = useFirestoreUserMessages(user?.id || "", followedIds);
  const unreadChatsCount = channels.filter((c) => {
    const isUnread =
      c.lastMessageSenderId !== user?.id &&
      c.rawTimeMillis > parseInt(localStorage.getItem(`chat_read_${c.id}`) || "0", 10);
    return c.lastMessageSenderId !== user?.id && (c.unread > 0 || isUnread);
  }).length;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const q = query(
      collection(db, "agatike_notifications"),
      where("targetUsers", "array-contains", user.id),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lastReadTimestamp = parseInt(
        localStorage.getItem("lastActivityReadTimestamp") || "0",
        10,
      );
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.actorId !== user.id) {
          const notifTime = data.createdAt ? new Date(data.createdAt).getTime() : 0;
          if (notifTime > lastReadTimestamp) count++;
        }
      });
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    const handleReadEvent = () => setUnreadCount(0);
    window.addEventListener("activityRead", handleReadEvent);
    return () => window.removeEventListener("activityRead", handleReadEvent);
  }, [user?.id]);

  // --- MAP DATA PROCESSING ---
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
          city: normalizeCityName("Unknown"),
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

  const createCustomIcon = (marker: any) => {
    const isSelected = selectedMarker?.id === marker.id;

    // Determine colors based on type
    let gradientClass = "from-primary to-accent";
    let triangleClass = "border-t-primary";
    let labelBgClass = "bg-primary";
    let labelTextClass = "text-primary-foreground";
    let ringClass = "ring-primary";

    switch (marker.type) {
      case "event":
        gradientClass = "from-orange-500 to-red-500";
        triangleClass = "border-t-orange-500";
        labelBgClass = "bg-orange-500";
        labelTextClass = "text-white";
        ringClass = "ring-orange-500";
        break;
      case "venue":
        gradientClass = "from-blue-500 to-cyan-500";
        triangleClass = "border-t-blue-500";
        labelBgClass = "bg-blue-500";
        labelTextClass = "text-white";
        ringClass = "ring-blue-500";
        break;
      case "space":
        gradientClass = "from-green-500 to-emerald-500";
        triangleClass = "border-t-green-500";
        labelBgClass = "bg-green-500";
        labelTextClass = "text-white";
        ringClass = "ring-green-500";
        break;
      case "cinema":
        gradientClass = "from-purple-500 to-fuchsia-500";
        triangleClass = "border-t-purple-500";
        labelBgClass = "bg-purple-500";
        labelTextClass = "text-white";
        ringClass = "ring-purple-500";
        break;
    }

    const scaleClass = isSelected ? `scale-110 z-50 ring-4 ${ringClass}` : "hover:scale-110 z-10";

    return L.divIcon({
      className: "bg-transparent border-none",
      html: `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-300 ${scaleClass}">
          <div class="rounded-full p-[2px] bg-gradient-to-tr ${gradientClass} shadow-md relative">
             <img src="${marker.image}" class="h-10 w-10 rounded-full object-cover block border-2 border-background" />
          </div>
          <!-- Little pointer triangle at the bottom -->
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${triangleClass} -mt-1 drop-shadow-sm"></div>
          
          <!-- Name Label -->
          <div class="mt-1 px-2 py-0.5 ${labelBgClass} rounded-full shadow-sm text-[10px] font-bold whitespace-nowrap ${labelTextClass} max-w-[90px] truncate text-center">
            ${marker.title}
          </div>
        </div>
      `,
      iconSize: [120, 80],
      iconAnchor: [60, 52],
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full bg-background overflow-hidden pb-16">
      {/* Map Layer */}
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
          />
          <MapController selectedMarker={selectedMarker} />
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
        </MapContainer>
      </div>

      {/* Top Overlay Layer: Header + Stories */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex flex-col pointer-events-none">
        {/* Header */}
        <div className="pointer-events-none pt-safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            {isLoggedIn ? (
              <Link
                to="/$userId/message"
                params={{ userId: user?.id || "me" }}
                className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border/50 shadow-md text-foreground transition-transform active:scale-95 hover:bg-muted"
              >
                <MessageCircle className="h-6 w-6" />
                {unreadChatsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-primary text-[11px] font-bold text-primary-foreground flex items-center justify-center px-1.5 shadow-[var(--shadow-glow)] shadow-primary/20">
                    {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/signin"
                className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border/50 shadow-md text-foreground transition-transform active:scale-95 hover:bg-muted"
              >
                <MessageCircle className="h-6 w-6" />
              </Link>
            )}

            <div className="pointer-events-auto flex h-12 px-5 items-center justify-center rounded-full bg-background border border-border/50 shadow-md">
              <img src="/icon.svg" alt="Agatike" className="h-7 w-auto object-contain" />
            </div>

            {isLoggedIn ? (
              <Link
                to="/activity"
                className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border/50 shadow-md text-foreground transition-transform active:scale-95 hover:bg-muted"
              >
                <Activity className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-[11px] font-bold text-white flex items-center justify-center px-1.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/signin"
                className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border/50 shadow-md text-foreground transition-transform active:scale-95 hover:bg-muted"
              >
                <Activity className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Stories (Interactive) */}
        {isLoggedIn && (
          <div className="pointer-events-auto w-full px-4 mb-2">
            <div className="p-2.5 bg-background/40 backdrop-blur-md border border-border/40 rounded-full shadow-lg">
              <Stories />
            </div>
          </div>
        )}
      </div>

      {/* Map Controls (Right Side) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
        <Button
          variant="secondary"
          className="rounded-full shadow-lg h-10 w-10 p-0 bg-background/90 backdrop-blur-md border-border/40 pointer-events-auto active:scale-95"
          onClick={() => {
            if (mapRef) {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    mapRef.flyTo([position.coords.latitude, position.coords.longitude], 15, {
                      duration: 1,
                    });
                  },
                  (error) => {
                    console.error("Geolocation error:", error);
                    mapRef.flyTo(defaultCenter, 13);
                  },
                  { timeout: 5000 },
                );
              } else {
                mapRef.flyTo(defaultCenter, 13);
              }
            }
          }}
        >
          <Compass className="h-5 w-5 text-foreground" />
        </Button>
      </div>

      {/* Selected Marker Details Card (Bottom Sheet style) */}
      {selectedMarker && (
        <div className="absolute bottom-20 left-4 right-4 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-card text-card-foreground rounded-[32px] p-4 shadow-xl border border-border/40 backdrop-blur-xl bg-opacity-95">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={selectedMarker.image}
                alt={selectedMarker.title}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-md bg-muted"
              />
              <div className="flex-1 min-w-0 flex flex-col pt-1">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h3 className="font-bold text-base leading-tight truncate">
                    {selectedMarker.title}
                  </h3>
                  <button
                    onClick={() => setSelectedMarker(null)}
                    className="shrink-0 h-6 w-6 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground transition-colors active:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{selectedMarker.city}</span>
                </div>
                <div className="inline-flex items-center mt-2 w-max px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {selectedMarker.type}
                </div>
              </div>
            </div>

            <Button
              className="w-full rounded-full shadow-[var(--shadow-glow)] h-12 text-sm font-bold transition-transform active:scale-95"
              style={{ background: "var(--gradient-primary)" }}
              onClick={() => {
                const rawId = selectedMarker.id.split("-").slice(1).join("-");
                if (selectedMarker.type === "event") {
                  navigate({ to: "/events/$eventId", params: { eventId: rawId } });
                } else if (selectedMarker.type === "venue") {
                  navigate({ to: "/venues/$venueId", params: { venueId: rawId } });
                } else if (selectedMarker.type === "space") {
                  navigate({ to: "/spaces/$spaceId", params: { spaceId: rawId } });
                } else if (selectedMarker.type === "cinema") {
                  navigate({ to: "/cinemas/$cinemaId", params: { cinemaId: rawId } });
                } else {
                  navigate({ to: "/organizers" });
                }
              }}
            >
              View Details <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
