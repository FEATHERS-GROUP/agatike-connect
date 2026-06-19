import { createFileRoute } from "@tanstack/react-router";
import { Film, MapPin, Ticket, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_CINEMA = {
  id: "CenturyCinema",
  name: "Century Cinema",
  city: "Kigali",
  screens: 4,
  image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1600",
};

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/overview")({
  component: CinemaOverview,
});

function CinemaOverview() {
  const cinema = MOCK_CINEMA;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative w-full h-[250px] md:h-[300px] rounded-3xl overflow-hidden shadow-sm">
        <div className="absolute inset-0">
          <img src={cinema.image} alt={cinema.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 text-white">
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold w-fit mb-3 backdrop-blur-md">
                <Film className="h-4 w-4" />
                Active Cinema
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-md">
                {cinema.name}
              </h1>
              <div className="flex items-center gap-4 font-medium text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{cinema.city}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="flex items-center gap-1.5">
                  <Film className="h-4 w-4" />
                  <span>{cinema.screens} screens</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tickets Sold (Today)", value: "1,204", icon: Ticket, trend: "+12%" },
          { label: "Active Movies", value: "12", icon: Film, trend: "0%" },
          { label: "Total Revenue", value: "RWF 4.2M", icon: TrendingUp, trend: "+8%" },
          { label: "Attendees", value: "3,402", icon: Users, trend: "+15%" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bookings will appear here once movies are live.</p>
        </div>
      </div>
    </div>
  );
}
