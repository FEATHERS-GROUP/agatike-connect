import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Image as ImageIcon, Map, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/events/$eventId/venue")({
  component: VenueView,
});

function VenueView() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Venue Details</h1>
          <p className="text-sm text-muted-foreground">Information about the event location.</p>
        </div>
        <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          Save Changes
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" /> Location Information
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">Venue Name</label>
                <div className="p-3 bg-secondary/50 rounded-xl border border-border">Eko Convention Center</div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">Address</label>
                <div className="p-3 bg-secondary/50 rounded-xl border border-border">Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos</div>
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-medium uppercase mb-1 block">Capacity</label>
                <div className="p-3 bg-secondary/50 rounded-xl border border-border">6,000 Attendees</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-primary" /> Amenities
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">✓ VIP Lounge Access</li>
              <li className="flex items-center gap-2">✓ Backstage Dressing Rooms</li>
              <li className="flex items-center gap-2">✓ 500 Parking Spots</li>
              <li className="flex items-center gap-2">✓ Wheelchair Accessible</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Map className="h-5 w-5 text-primary" /> Floor Plan
            </h3>
            <div className="aspect-video bg-secondary rounded-2xl border border-border border-dashed flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Upload Floor Plan Map</p>
              <Button variant="outline" size="sm" className="mt-4 rounded-full">Browse Files</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
