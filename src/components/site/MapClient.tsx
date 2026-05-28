import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { events, Event } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle2, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";

// Custom component to handle map centering when an event is selected
function MapController({ selectedEvent }: { selectedEvent: Event | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedEvent && selectedEvent.lat && selectedEvent.lng) {
      map.flyTo([selectedEvent.lat, selectedEvent.lng], 14, { duration: 0.5 });
    }
  }, [selectedEvent, map]);
  return null;
}

export default function MapClient() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Center on Kigali initially
  const defaultCenter: [number, number] = [-1.9441, 30.0619];

  // Helper to create custom pin icons
  const createCustomIcon = (event: Event, isSelected: boolean) => {
    const selectedClass = isSelected ? 'scale-125 z-50' : 'z-10 hover:scale-110';
    
    // HTML for the ring if they have a story, or just a plain border if they don't
    const headHtml = event.hasStory
      ? `
        <div class="rounded-full p-[2px] shadow-lg" style="background: var(--gradient-primary)">
          <div class="rounded-full bg-background p-[2px]">
            <img src="${event.cover}" class="h-12 w-12 rounded-full object-cover block" />
          </div>
        </div>
      `
      : `
        <div class="rounded-full p-[2px] shadow-lg bg-background border border-border/40">
          <img src="${event.cover}" class="h-12 w-12 rounded-full object-cover block" />
        </div>
      `;

    const triangleColorClass = event.hasStory ? 'border-t-[#e11d48]' : 'border-t-background'; // fallback color or use primary

    return L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div class="relative flex flex-col items-center transition-transform duration-300 ${selectedClass}">
          <!-- Pin Head -->
          ${headHtml}
          <!-- Pin Point (Triangle) -->
          <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] ${event.hasStory ? 'border-t-primary' : 'border-t-background'} -mt-[1px] shadow-sm drop-shadow-md z-0"></div>
          
          <!-- Label -->
          <div class="mt-1 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-border/40 pointer-events-none">
            <span class="text-[10px] font-bold truncate max-w-[80px] block text-foreground">@${event.organizerHandle}</span>
          </div>
        </div>
      `,
      iconSize: [60, 85],
      iconAnchor: [30, 60],
    });
  };

  return (
    <div className="relative h-[100dvh] w-full bg-background overflow-hidden">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[400] pt-safe-top px-4 py-3 flex items-center gap-3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <button onClick={() => router.history.back()} className="p-2 -ml-2 rounded-full text-white bg-black/20 backdrop-blur-md pointer-events-auto transition-colors active:bg-black/40">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg text-white drop-shadow-md">Live Map</h1>
      </div>

      {/* Leaflet Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController selectedEvent={selectedEvent} />
          
          {events.filter(e => e.lat && e.lng).map((event) => (
            <Marker 
              key={event.id}
              position={[event.lat!, event.lng!]}
              icon={createCustomIcon(event, selectedEvent?.id === event.id)}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Bottom Sheet / Selected Event Details */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-[400] transition-transform duration-500 ease-in-out ${
          selectedEvent ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {selectedEvent && (
          <div className="bg-background rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border-t border-border/40 px-6 pt-2 pb-10">
            <div className="w-12 h-1.5 bg-secondary mx-auto rounded-full mb-5" />
            
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <div 
                  className={`h-16 w-16 rounded-full p-[2px] ${selectedEvent.hasStory ? "" : "border border-border"}`} 
                  style={selectedEvent.hasStory ? { background: "var(--gradient-primary)" } : {}}
                >
                  <div className="h-full w-full rounded-full bg-background p-0.5">
                    <img src={selectedEvent.cover} alt={selectedEvent.organizer} className="h-full w-full rounded-full object-cover" />
                  </div>
                </div>
                {selectedEvent.hasStory && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background uppercase tracking-wider">
                    Live
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-sm">@{selectedEvent.organizerHandle}</span>
                  <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
                </div>
                <h3 className="font-bold text-lg leading-tight truncate">{selectedEvent.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {selectedEvent.venue}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              {selectedEvent.hasStory && (
                <Button asChild variant="outline" className="flex-1 rounded-xl h-12 font-bold">
                  <Link to="/community/$postId" params={{ postId: selectedEvent.id }}>
                    View Story
                  </Link>
                </Button>
              )}
              <Button asChild className={`rounded-xl h-12 font-bold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent border-0 ${selectedEvent.hasStory ? "flex-1" : "w-full"}`}>
                <Link to="/book/$eventId" params={{ eventId: selectedEvent.id }}>
                  Book Tickets <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dimmed backdrop when an event is selected, to focus on the bottom sheet */}
      {selectedEvent && (
        <div 
          className="absolute inset-0 z-[300] bg-background/20 backdrop-blur-[1px] transition-opacity"
          onClick={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
