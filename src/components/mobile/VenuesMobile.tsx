import { Search, MapPin, Ticket, Star, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import { mockVenues } from "@/lib/mock-venue-data";
import { useState } from "react";
import { MobileNav } from "@/components/mobile/MobileNav";

export function VenuesMobile() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const types = ["All", ...Array.from(new Set(mockVenues.map((v) => v.type)))];

  const filteredVenues = mockVenues.filter((venue) => {
    if (searchTerm && !venue.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== "All" && venue.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3 pt-safe-top">
        <div className="flex items-center justify-between mb-4 mt-2">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Venue Tickets</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search venues..."
              className="pl-9 bg-secondary/40 border-transparent rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 -mx-4 px-4">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                typeFilter === type
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Venues List */}
      <div className="px-4 py-4 space-y-4">
        {filteredVenues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No venues found</p>
          </div>
        ) : (
          filteredVenues.map((venue) => (
            <Link
              key={venue.id}
              to="/venues/$venueId"
              params={{ venueId: venue.id }}
              className="block active:scale-[0.98] transition-transform"
            >
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
                <div className="aspect-[16/9] relative">
                  <img src={venue.cover} alt={venue.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-background/90 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {venue.rating}
                  </div>
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm">
                    {venue.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base leading-tight mb-1">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mb-3">
                    <MapPin className="w-3 h-3" />{" "}
                    <span className="truncate">{venue.location}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/40">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        Entry Fee
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {venue.price > 0 ? formatCurrency(venue.price, venue.currency) : "Free"}
                      </span>
                    </div>
                    <div
                      className="h-8 px-4 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Get Ticket
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <MobileNav />
    </div>
  );
}
