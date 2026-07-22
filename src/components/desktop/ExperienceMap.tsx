import React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Map as MapIcon } from "lucide-react";

const orangeIcon = L.divIcon({
  className: "bg-transparent",
  html: `<svg width="28" height="40" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 0C5.372 0 0 5.373 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.373 18.628 0 12 0ZM12 18C8.686 18 6 15.314 6 12C6 8.686 8.686 6 12 6C15.314 6 18 8.686 18 12C18 15.314 15.314 18 12 18Z" fill="#f97316"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

interface Stop {
  id: string;
  title: string;
  time: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface ExperienceMapProps {
  itinerary: Stop[];
  bounds: L.LatLngBoundsExpression | undefined;
  mapCenter: [number, number];
  polylinePositions: [number, number][];
}

export default function ExperienceMap({
  itinerary,
  bounds,
  mapCenter,
  polylinePositions,
}: ExperienceMapProps) {
  if (polylinePositions.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-secondary/50">
        <div className="text-center text-muted-foreground">
          <MapIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No map coordinates available for this itinerary.</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      bounds={bounds}
      center={mapCenter}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {itinerary.map(
        (stop) =>
          stop.lat != null &&
          stop.lng != null &&
          !isNaN(Number(stop.lat)) &&
          !isNaN(Number(stop.lng)) && (
            <Marker key={stop.id} position={[Number(stop.lat), Number(stop.lng)]} icon={orangeIcon}>
              <Popup className="rounded-xl">
                <p className="font-semibold">{stop.title}</p>
                <p className="text-xs text-muted-foreground">{stop.time}</p>
              </Popup>
            </Marker>
          ),
      )}
      <Polyline
        positions={polylinePositions}
        color="var(--primary)"
        weight={4}
        dashArray="10, 10"
      />
    </MapContainer>
  );
}
