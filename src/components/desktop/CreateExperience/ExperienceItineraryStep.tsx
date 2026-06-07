import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, Plus, Trash2, Clock, MapPin, Navigation, Loader2 } from "lucide-react";
import { LocationSearchInput } from "../LocationSearchInput";
import { getRouteDistance } from "@/api/geocoding";
import { toast } from "sonner";

function generateId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

export function ExperienceItineraryStep({
  data,
  updateField,
}: {
  data: any;
  updateField: (k: string, v: any) => void;
}) {
  const [activeDay, setActiveDay] = useState(1);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Group itinerary by day
  const daysArray = Array.from({ length: data.numberOfDays || 1 }, (_, i) => i + 1);
  const currentDayItinerary = useMemo(
    () => data.itinerary.filter((stop: any) => (stop.day || 1) === activeDay),
    [data.itinerary, activeDay],
  );

  const calculateDayRoute = async () => {
    // Only calculate for stops that have both lat and lng
    const validStops = currentDayItinerary.filter((s: any) => s.lat && s.lng);
    if (validStops.length < 2) {
      toast.error(
        `Please add at least 2 locations with Google Maps coordinates on Day ${activeDay} to calculate a route.`,
      );
      return;
    }

    setIsCalculatingDistance(true);
    try {
      const origin = `${validStops[0].lat},${validStops[0].lng}`;
      const destination = `${validStops[validStops.length - 1].lat},${validStops[validStops.length - 1].lng}`;
      const waypoints = validStops.slice(1, -1).map((s: any) => `${s.lat},${s.lng}`);

      const result = await getRouteDistance({ data: { origin, destination, waypoints } } as any);
      if (result && result.kilometers) {
        // Just store the total route distance, could be enhanced to store per-day distance
        updateField("routeDistance", result.kilometers);
        toast.success(`Calculated route distance: ${result.kilometers} km`);
      } else {
        toast.error("Could not calculate route. Please check the locations.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate route distance.");
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const addStop = () => {
    updateField("itinerary", (prev: any[]) => [
      ...prev,
      { id: generateId(), day: activeDay, title: "", address: "", time: "", lat: null, lng: null },
    ]);
  };

  const removeStop = (id: string) => {
    updateField("itinerary", (prev: any[]) => prev.filter((s: any) => s.id !== id));
  };

  const updateStop = (id: string, updates: any) => {
    updateField("itinerary", (prevItinerary: any[]) =>
      prevItinerary.map((s: any) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  return (
    <div className="space-y-6">
      {data.numberOfDays > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {daysArray.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeDay === day
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60"
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-accent/20 p-4 rounded-2xl border border-border/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">
              Itinerary Planner {data.numberOfDays > 1 ? `- Day ${activeDay}` : ""}
            </h3>
            <p className="text-xs text-muted-foreground">
              Add points like take-off, checkpoints, and stops.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {currentDayItinerary.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shadow-sm bg-background"
              onClick={calculateDayRoute}
              disabled={isCalculatingDistance}
            >
              {isCalculatingDistance ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="mr-1.5 h-3.5 w-3.5 text-primary" />
              )}
              Calc Route
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm bg-background"
            onClick={addStop}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Stop
          </Button>
        </div>
      </div>

      {data.routeDistance && (
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <Navigation className="h-4 w-4" />
          Total Route Distance: {data.routeDistance} km
        </div>
      )}

      {currentDayItinerary.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border/60 rounded-2xl">
          <p className="text-muted-foreground">No stops planned for Day {activeDay} yet.</p>
          <Button variant="link" onClick={addStop}>
            Add your first stop
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {currentDayItinerary.map((stop: any, idx: number) => (
            <div
              key={stop.id}
              className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-sm group transition-all hover:border-border"
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold shadow-sm z-10 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {idx + 1}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => removeStop(stop.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid gap-4 md:grid-cols-2 ml-4">
                <div className="space-y-2">
                  <Label>Stop Title</Label>
                  <Input
                    value={stop.title}
                    onChange={(e) => updateStop(stop.id, { title: e.target.value })}
                    placeholder="e.g. Take-off Point"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={stop.time}
                      onChange={(e) => updateStop(stop.id, { time: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="col-span-full space-y-2">
                  <Label>Location Search (Google Maps)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <LocationSearchInput
                      value={stop.address}
                      onChange={(val) => updateStop(stop.id, { address: val })}
                      onSelectCoordinates={(lat, lng) => updateStop(stop.id, { lat, lng })}
                      placeholder="Search for trailheads, peaks, or parking..."
                      className="pl-9"
                    />
                  </div>
                  {stop.lat && stop.lng && (
                    <p className="text-[10px] text-green-600 font-medium">✓ Coordinates saved</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
