import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { MapPin, Plus, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/locations")({
  component: SpaceLocationsPage,
});

function SpaceLocationsPage() {
  const { spaceId } = useParams({ strict: false }) as any;

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading locations...</div>;
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Locations</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Add or edit the physical locations for this space.
          </p>
        </div>
        <Button className="gap-2 rounded-xl h-11 px-6 shadow-sm" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {space.locations?.map((loc: any, idx: number) => (
          <div key={idx} className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 flex justify-between items-start border-b border-border/60 bg-secondary/10">
              <div>
                <h4 className="font-bold text-xl">{loc.name || `Location ${idx + 1}`}</h4>
                <p className="text-muted-foreground flex items-center gap-1.5 mt-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary shrink-0" /> 
                  <span className="truncate">{loc.address}, {loc.city} ({loc.country})</span>
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-secondary">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 bg-secondary/5 flex-1">
              <h5 className="font-semibold text-sm flex items-center gap-2 mb-4 text-muted-foreground">
                <Clock className="h-4 w-4" /> Operating Hours
              </h5>
              
              <div className="grid grid-cols-1 gap-2">
                {loc.opening_hours ? Object.entries(loc.opening_hours).map(([day, h]: any) => (
                  <div key={day} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-secondary/20 transition-colors">
                    <span className="font-medium capitalize w-24">{day}</span>
                    <span className={h.closed ? "text-muted-foreground text-xs font-semibold uppercase tracking-wider" : "text-foreground font-medium"}>
                      {h.closed ? "Closed" : h.is24Hours ? "Open 24 Hours" : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground p-2">No operating hours defined.</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {(!space.locations || space.locations.length === 0) && (
          <div className="col-span-full p-12 text-center bg-secondary/20 border border-dashed border-border/60 rounded-3xl">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">No Locations</h3>
            <p className="text-muted-foreground">This space doesn't have any physical locations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
