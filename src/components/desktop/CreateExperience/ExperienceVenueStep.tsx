import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationSearchInput } from "../LocationSearchInput";
import { MapPin } from "lucide-react";

export function ExperienceVenueStep({
  data,
  updateField,
}: {
  data: any;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 bg-accent/20 p-4 rounded-2xl border border-border/60">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium">Venue Details</h3>
          <p className="text-xs text-muted-foreground">Where and when is this experience happening?</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Venue Name</Label>
          <Input
            value={data.venueName || ""}
            onChange={(e) => updateField("venueName", e.target.value)}
            placeholder="e.g. Zen Yoga Studio"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Address</Label>
          <LocationSearchInput
            value={data.city || ""}
            onChange={(val) => updateField("city", val)}
            onSelectCoordinates={(lat, lng) => {
              updateField("latitude", lat);
              updateField("longitude", lng);
            }}
            placeholder="e.g. 123 Main St, New York"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={data.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Start Time</Label>
          <Input
            type="time"
            value={data.startTime || ""}
            onChange={(e) => updateField("startTime", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>End Time</Label>
          <Input
            type="time"
            value={data.endTime || ""}
            onChange={(e) => updateField("endTime", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
