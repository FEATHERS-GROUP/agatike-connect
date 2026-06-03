import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
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
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        map.flyTo(center, 15, { duration: 1.5 });
      } catch (err) {
        // Ignore errors if leaflet internal state is corrupted by HMR
        console.warn("Leaflet flyTo skipped due to error:", err);
      }
    }
  }, [center, map]);
  return null;
}

export default function VenueMap({ lat, lng, venue, city }: { lat: number; lng: number; venue: string; city: string }) {
  const safeLat = isNaN(lat) || lat == null ? -1.9441 : Number(lat);
  const safeLng = isNaN(lng) || lng == null ? 30.0619 : Number(lng);

  return (
    <>
      <MapContainer
        center={[safeLat, safeLng]}
        zoom={15}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapUpdater center={[safeLat, safeLng]} />
        <Marker position={[safeLat, safeLng]} icon={venueIcon} />
      </MapContainer>
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 right-4 z-[400] bg-background/90 backdrop-blur-md px-4 py-3 rounded-xl border border-border shadow-sm flex items-center justify-between gap-3 transition-transform hover:scale-[1.02]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm font-semibold truncate">
            {venue ? `${venue}, ` : ""}{city}
          </p>
        </div>
        <div className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
          Open
        </div>
      </a>
    </>
  );
}
