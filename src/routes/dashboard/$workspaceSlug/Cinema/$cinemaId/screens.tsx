import { createFileRoute } from "@tanstack/react-router";
import { Plus, MonitorPlay, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_SCREENS = [
  { id: "1", name: "Screen 1 - IMAX", capacity: 350, type: "IMAX 3D", status: "Active" },
  { id: "2", name: "Screen 2 - VIP", capacity: 50, type: "VIP Recliners", status: "Active" },
  { id: "3", name: "Screen 3", capacity: 150, type: "Standard 2D", status: "Maintenance" },
  { id: "4", name: "Screen 4", capacity: 150, type: "Standard 2D/3D", status: "Active" },
];

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/screens")({
  component: CinemaScreens,
});

function CinemaScreens() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Screens & Halls</h2>
          <p className="text-muted-foreground mt-1">Manage physical cinema rooms and their seating capacities.</p>
        </div>
        <Button className="gap-2 rounded-xl h-11 px-6 font-bold shadow-sm">
          <Plus className="h-5 w-5" /> Add Screen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {MOCK_SCREENS.map((screen) => (
          <div key={screen.id} className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary rounded-2xl">
                <MonitorPlay className="h-6 w-6 text-foreground" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                screen.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
              }`}>
                {screen.status}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{screen.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">{screen.type}</p>
            
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{screen.capacity} Seats</span>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg h-8">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
