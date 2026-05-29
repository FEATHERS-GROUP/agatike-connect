import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MapPin, Users, CalendarDays, MoreHorizontal, Store, BarChart3, Clock, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rentableVenues, type RentableVenue } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/venue-rent")({
  head: () => ({
    meta: [
      { title: "Venue Listings — Agatike" },
      { name: "description", content: "Manage your rentable venues and bookings." },
    ],
  }),
  component: VenueListingsPage,
});

function VenueListingsPage() {
  const totalVenues = rentableVenues.length;
  const activeRentals = rentableVenues.reduce((acc, v) => acc + v.activeRentals, 0);
  const pendingRequests = rentableVenues.reduce((acc, v) => acc + v.pendingRequests, 0);

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Venue Listings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage the properties you rent out to organizers.</p>
            </div>
            <Button className="shrink-0 gap-2 rounded-full h-10 px-5 shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="h-4 w-4" /> List New Venue
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVenues}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Listings</p>
              </div>
            </div>
            <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRentals}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Rentals</p>
              </div>
            </div>
            <div className="bg-background rounded-2xl border border-border/60 p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Your Properties</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rentableVenues.map(venue => (
            <Link 
              key={venue.id} 
              to={`/dashboard/venues/${venue.id}/overview`}
              className="group flex flex-col sm:flex-row rounded-3xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Image side */}
              <div className="relative w-full sm:w-48 shrink-0 aspect-[4/3] sm:aspect-auto">
                <img 
                  src={venue.cover} 
                  alt={venue.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <StatusBadge status={venue.status} />
                </div>
              </div>
              
              {/* Content side */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-lg leading-tight">{venue.name}</h3>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{venue.city}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{venue.capacity.toLocaleString()}</span>
                  </div>
                </div>

                {/* Management Details */}
                <div className="mt-2 pt-4 border-t border-border/60 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Requests</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{venue.pendingRequests}</span>
                      {venue.pendingRequests > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                          <AlertCircle className="h-3 w-3" /> New
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Price / Day</p>
                    <p className="font-semibold text-foreground">{venue.currency}{venue.pricePerDay.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 rounded-xl gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <CalendarDays className="h-4 w-4" /> Calendar
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "Active" | "Draft" | "Maintenance" }) {
  const styles = {
    Active: "bg-green-500/90 text-white",
    Draft: "bg-muted/90 text-muted-foreground",
    Maintenance: "bg-orange-500/90 text-white"
  };

  return (
    <span className={`${styles[status]} backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
      {status}
    </span>
  );
}
