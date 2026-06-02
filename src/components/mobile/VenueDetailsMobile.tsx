import { Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Clock, Star, Heart, Share2, Users } from "lucide-react";

export function VenueDetailsMobile({ venue }: { venue: any }) {
  if (!venue) return null;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header Image & Actions */}
      <div className="relative h-72 w-full">
        <img src={venue.cover} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="absolute top-0 left-0 right-0 pt-safe-top p-4 flex items-center justify-between z-10">
          <Link
            to="/venues"
            className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {venue.type}
          </div>
          <div className="bg-background/90 backdrop-blur-md rounded-full px-2.5 py-1 text-xs font-bold shadow-sm flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {venue.rating}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 pt-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">{venue.name}</h1>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {venue.location}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> {venue.openTime} - {venue.closeTime}
            </span>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6">
          <h3 className="font-bold mb-2">About</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{venue.description}</p>
        </div>

        <div className="border-t border-border/40 pt-6">
          <h3 className="font-bold mb-4">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {["Free WiFi", "Parking", "Wheelchair", "Cafeteria"].map((amenity, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-secondary/50 rounded-lg text-xs font-medium text-muted-foreground border border-border/40"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/80 backdrop-blur-xl border-t border-border/40 z-30">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Entry Fee
            </span>
            <span className="text-xl font-bold text-foreground">
              {venue.price > 0 ? `${venue.currency} ${venue.price}` : "Free"}
            </span>
          </div>
          <Link to="/venues/checkout/$venueId" params={{ venueId: venue.id }} className="flex-1">
            <button
              className="w-full h-12 rounded-xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
              style={{ background: "var(--gradient-primary)" }}
            >
              Book Ticket
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
