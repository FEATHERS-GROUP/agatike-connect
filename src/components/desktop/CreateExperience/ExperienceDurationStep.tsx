import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sun, CalendarRange } from "lucide-react";

export function ExperienceDurationStep({
  data,
  updateField,
}: {
  data: any;
  updateField: (k: string, v: any) => void;
}) {
  const isMultiDay = data.numberOfDays > 1;

  const handleModeChange = (mode: "single" | "multi") => {
    if (mode === "single") {
      updateField("numberOfDays", 1);
      // Clean up extra days in itinerary
      const singleDayItin = data.itinerary.filter((stop: any) => stop.day === 1);
      if (singleDayItin.length === 0) {
        updateField("itinerary", [
          { id: Math.random().toString(36).substring(2), day: 1, title: "Start", address: "", time: "08:00", lat: null, lng: null },
        ]);
      } else {
        updateField("itinerary", singleDayItin);
      }
    } else {
      updateField("numberOfDays", 2);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Trip Duration</h3>
        <p className="text-sm text-muted-foreground">
          Is this a one-day excursion or a multi-day adventure?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleModeChange("single")}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all duration-200 ${
            !isMultiDay
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-border/60 bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`p-3 rounded-full ${!isMultiDay ? "bg-primary/10" : "bg-secondary"}`}>
            <Sun className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="font-semibold block">Single Day</span>
            <span className="text-xs opacity-80 mt-1 block">Returns same day</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("multi")}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all duration-200 ${
            isMultiDay
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-border/60 bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`p-3 rounded-full ${isMultiDay ? "bg-primary/10" : "bg-secondary"}`}>
            <CalendarRange className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="font-semibold block">Multi-Day</span>
            <span className="text-xs opacity-80 mt-1 block">Overnight trips</span>
          </div>
        </button>
      </div>

      {isMultiDay && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6 bg-accent/20 border border-border/60 rounded-2xl p-6">
          <Label className="text-base font-semibold">Total number of days</Label>
          <p className="text-sm text-muted-foreground mb-4">
            How many days will this experience last? We'll create a separate itinerary tab for each day.
          </p>
          <div className="flex items-center gap-4 max-w-[200px]">
            <Input
              type="number"
              min={2}
              max={30}
              value={data.numberOfDays}
              onChange={(e) => {
                const days = Math.max(2, parseInt(e.target.value) || 2);
                updateField("numberOfDays", days);
              }}
              className="h-12 text-lg text-center"
            />
            <span className="font-medium text-muted-foreground">Days</span>
          </div>
        </div>
      )}
    </div>
  );
}
