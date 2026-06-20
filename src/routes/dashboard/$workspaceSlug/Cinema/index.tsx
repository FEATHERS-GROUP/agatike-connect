import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Plus, MapPin, Film, MoreVertical, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data for the list of cinemas
const MOCK_CINEMAS = [
  {
    id: "CenturyCinema",
    name: "Century Cinema",
    city: "Kigali",
    screens: 4,
    movies_count: 12,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "CanalOlympia",
    name: "Canal Olympia",
    city: "Kigali",
    screens: 1,
    movies_count: 5,
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800",
  }
];

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/")({
  component: CinemaDashboardList,
});

function CinemaDashboardList() {
  const router = useRouter();
  const { workspaceSlug } = Route.useParams();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Cinemas & Theaters</h1>
            <p className="text-muted-foreground">Manage your cinema venues, schedules, and premieres.</p>
          </div>
          <Button className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
            <Plus className="h-5 w-5" /> Add New Cinema
          </Button>
        </div>

        {MOCK_CINEMAS.length === 0 ? (
          <div className="bg-secondary/40 rounded-3xl p-12 text-center border border-border/40 max-w-2xl mx-auto mt-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No Cinemas Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first cinema or theater to start scheduling movies and selling tickets.</p>
            <Button className="gap-2 rounded-xl h-11 px-6 font-bold shadow-sm">
              <Plus className="h-5 w-5" /> Create First Cinema
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CINEMAS.map((cinema) => (
              <div
                key={cinema.id}
                className="group flex flex-col bg-card/40 hover:bg-card border border-border/40 hover:border-border/80 rounded-3xl overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={cinema.image}
                    alt={cinema.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{cinema.name}</h3>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {cinema.city}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                      <Film className="h-3.5 w-3.5" /> {cinema.screens} Screens
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md border border-border/60">
                      <Film className="h-3.5 w-3.5" /> {cinema.movies_count} Movies Active
                    </div>
                  </div>
                  
                  <Button asChild variant="secondary" className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-2">
                    <Link to="/dashboard/$workspaceSlug/Cinema/$cinemaId" params={{ cinemaId: cinema.id }}>
                      Manage Cinema
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
