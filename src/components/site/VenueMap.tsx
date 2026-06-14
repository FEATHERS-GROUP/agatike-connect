import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const venueIcon = L.divIcon({
  className: "bg-transparent border-none",
  html: `<div class="text-primary drop-shadow-md flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const activeVenueIcon = L.divIcon({
  className: "bg-transparent border-none scale-125 z-[1000]",
  html: `<div class="text-primary drop-shadow-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="var(--primary)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

interface ParsedStop {
  id: string;
  lat: number;
  lng: number;
  venue: string;
  city: string;
  address: string;
}

function MapUpdater({
  center,
  bounds,
}: {
  center?: [number, number];
  bounds?: [[number, number], [number, number]];
}) {
  const map = useMap();
  const [hasFittedBounds, setHasFittedBounds] = useState(false);

  useEffect(() => {
    if (bounds && !hasFittedBounds) {
      const timer = setTimeout(() => {
        try {
          map.invalidateSize();
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          setHasFittedBounds(true);
        } catch (err) {
          console.warn("Leaflet fitBounds skipped due to error:", err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [bounds, map, hasFittedBounds]);

  useEffect(() => {
    if (center && Array.isArray(center)) {
      const lat = parseFloat(center[0] as any);
      const lng = parseFloat(center[1] as any);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        const timer = setTimeout(() => {
          try {
            map.invalidateSize();
            const currentCenter = map.getCenter();
            if (!currentCenter || isNaN(currentCenter.lat) || isNaN(currentCenter.lng)) {
              map.setView([lat, lng], 15);
            } else {
              map.flyTo([lat, lng], 15, { duration: 1.5 });
            }
          } catch (err) {
            console.warn("Leaflet map update failed, falling back to setView:", err);
            try {
              map.setView([lat, lng], 15);
            } catch (fallbackErr) {
              console.warn("Leaflet fallback setView failed:", fallbackErr);
            }
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [center, map]);

  return null;
}

export default function VenueMap({
  lat,
  lng,
  venue,
  city,
  tourStops = [],
  selectedStopIdx = 0,
}: {
  lat?: number;
  lng?: number;
  venue?: string;
  city?: string;
  tourStops?: any[];
  selectedStopIdx?: number;
}) {
  let parsedLat = parseFloat(lat as any);
  let parsedLng = parseFloat(lng as any);

  if (isNaN(parsedLat) || !isFinite(parsedLat)) parsedLat = -1.9441;
  if (isNaN(parsedLng) || !isFinite(parsedLng)) parsedLng = 30.0619;

  const validStops: ParsedStop[] = (tourStops || [])
    .map((stop: any, idx: number) => {
      const stopLat = parseFloat(stop.latitude ?? stop.lat);
      const stopLng = parseFloat(stop.longitude ?? stop.lng);
      return {
        id: stop.id || String(idx),
        lat: stopLat,
        lng: stopLng,
        venue: stop.venue || stop.venueName || "",
        city: stop.city || "",
        address: stop.address || stop.venueAddress || "",
      };
    })
    .filter(
      (stop) => !isNaN(stop.lat) && !isNaN(stop.lng) && isFinite(stop.lat) && isFinite(stop.lng),
    );

  const points =
    validStops.length > 0
      ? validStops
      : [
          {
            id: "default",
            lat: parsedLat,
            lng: parsedLng,
            venue: venue || "",
            city: city || "",
            address: "",
          },
        ];

  let mapCenter: [number, number] = [parsedLat, parsedLng];
  let mapBounds: [[number, number], [number, number]] | undefined = undefined;

  if (validStops.length > 1) {
    const lats = validStops.map((s) => s.lat);
    const lngs = validStops.map((s) => s.lng);
    mapBounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    const selectedStop = validStops[selectedStopIdx];
    if (selectedStop) {
      mapCenter = [selectedStop.lat, selectedStop.lng];
    }
  } else if (validStops.length === 1) {
    mapCenter = [validStops[0].lat, validStops[0].lng];
  }

  const activeStop =
    validStops.length > 0 ? validStops[selectedStopIdx] || validStops[0] : points[0];

  const activeLat = activeStop.lat;
  const activeLng = activeStop.lng;
  const activeVenue = activeStop.venue;
  const activeCity = activeStop.city;

  return (
    <>
      <MapContainer center={mapCenter} zoom={15} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapUpdater center={[activeLat, activeLng]} bounds={mapBounds} />
        {points.map((pt, idx) => {
          const isSelected = validStops.length > 0 && idx === selectedStopIdx;
          return (
            <Marker
              key={pt.id}
              position={[pt.lat, pt.lng]}
              icon={isSelected ? activeVenueIcon : venueIcon}
            >
              <Popup className="rounded-xl">
                <div className="p-1 text-foreground">
                  <p className="font-bold text-sm">{pt.venue || "Venue"}</p>
                  {pt.city && <p className="text-xs text-muted-foreground mt-0.5">{pt.city}</p>}
                  {pt.address && (
                    <p className="text-xs text-muted-foreground mt-0.5">{pt.address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 right-4 z-[400] bg-background/90 backdrop-blur-md px-4 py-3 rounded-xl border border-border shadow-sm flex items-center justify-between gap-3 transition-transform hover:scale-[1.02]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm font-semibold truncate">
            {activeVenue ? `${activeVenue}, ` : ""}
            {activeCity}
          </p>
        </div>
        <div className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
          Open
        </div>
      </a>
    </>
  );
}
