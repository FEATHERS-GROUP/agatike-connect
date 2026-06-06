import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationSearchInput } from "../LocationSearchInput";
import { Map, Plus, Trash2, Navigation } from "lucide-react";
import { getRouteDistance } from "@/api/geocoding";

export function ExperienceItineraryStep({
  data,
  updateField,
}: {
  data: any;
  updateField: (field: string, value: any) => void;
}) {
  const [calculating, setCalculating] = useState(false);
  const [totalKm, setTotalKm] = useState<string | null>(data.routeDistance || null);

  useEffect(() => {
    // Optionally auto-calculate or require a manual button press. We'll add a button.
  }, [data.itinerary]);

  const handleCalculateRoute = async () => {
    const stopsWithCoords = data.itinerary.filter((s: any) => s.lat && s.lng);
    if (stopsWithCoords.length < 2) return;

    setCalculating(true);
    const origin = `${stopsWithCoords[0].lat},${stopsWithCoords[0].lng}`;
    const destination = `${stopsWithCoords[stopsWithCoords.length - 1].lat},${stopsWithCoords[stopsWithCoords.length - 1].lng}`;
    const waypoints = stopsWithCoords.slice(1, -1).map((s: any) => `${s.lat},${s.lng}`);

    try {
      const result = await getRouteDistance({ data: { origin, destination, waypoints } } as any);
      if (result && result.kilometers) {
        setTotalKm(result.kilometers);
        updateField("routeDistance", result.kilometers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-accent/20 p-4 rounded-2xl border border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">Itinerary Planner</h3>
            <p className="text-xs text-muted-foreground">Add points like take-off, checkpoints, and stops.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {data.itinerary.filter((s: any) => s.lat && s.lng).length >= 2 && (
            <Button onClick={handleCalculateRoute} disabled={calculating} variant="secondary" size="sm" className="rounded-xl shadow-sm">
              <Navigation className="mr-2 h-4 w-4" /> {calculating ? "Calculating..." : totalKm ? `${totalKm} km` : "Calc Route"}
            </Button>
          )}
          <Button onClick={() => updateField("itinerary", [...data.itinerary, { id: Date.now().toString(), time: "", title: "", address: "", lat: null, lng: null }])} size="sm" className="rounded-xl shadow-sm" style={{ background: "var(--gradient-primary)" }}>
            <Plus className="mr-2 h-4 w-4" /> Add Stop
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {data.itinerary.map((stop: any, idx: number) => (
          <div key={stop.id} className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-sm group transition-all hover:border-border">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold shadow-sm z-10 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {idx + 1}
            </div>
            {data.itinerary.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => updateField("itinerary", data.itinerary.filter((s: any) => s.id !== stop.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Stop Title</Label>
                <Input
                  value={stop.title}
                  onChange={(e) => {
                    const newItinerary = [...data.itinerary];
                    newItinerary[idx].title = e.target.value;
                    updateField("itinerary", newItinerary);
                  }}
                  placeholder={idx === 0 ? "e.g. Base Camp Start" : "e.g. Midpoint Check"}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={stop.time}
                    onChange={(e) => {
                      const newItinerary = [...data.itinerary];
                      newItinerary[idx].time = e.target.value;
                      updateField("itinerary", newItinerary);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Address/Location</Label>
                  <LocationSearchInput
                    value={stop.address}
                    onChange={(val) => {
                      const newItinerary = [...data.itinerary];
                      newItinerary[idx].address = val;
                      updateField("itinerary", newItinerary);
                    }}
                    onSelectCoordinates={(lat, lng) => {
                      const newItinerary = [...data.itinerary];
                      newItinerary[idx].lat = lat;
                      newItinerary[idx].lng = lng;
                      updateField("itinerary", newItinerary);
                    }}
                    placeholder="Search address..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
