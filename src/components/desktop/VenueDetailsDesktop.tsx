import { Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Clock, Star, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export function VenueDetailsDesktop({ venue }: { venue: any }) {
  if (!venue) return null;

  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <Link
          to="/venues"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Venues
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Details */}
          <div className="flex-1 space-y-8">
            <div className="rounded-3xl overflow-hidden border border-border/50 bg-card shadow-[var(--shadow-card)]">
              <div className="aspect-[21/9] relative">
                <img src={venue.cover} alt={venue.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-full px-3 py-1 text-sm font-bold shadow-sm flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {venue.rating}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">{venue.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium mb-6">
                <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4 text-primary" /> {venue.location}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-primary" /> {venue.openTime} - {venue.closeTime}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full text-primary font-bold">
                  {venue.type}
                </span>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{venue.description}</p>
              </div>
            </div>

            <div className="border-t border-border/40 pt-8">
              <h3 className="text-xl font-semibold mb-4">Amenities & Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Free WiFi",
                  "Parking Available",
                  "Wheelchair Accessible",
                  "Guided Tours",
                  "Cafeteria",
                  "Restrooms",
                ].map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/40"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" /> {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: CTA Widget */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24 rounded-3xl border border-border/50 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-2xl font-bold tracking-tight mb-2">Entry Ticket</h3>
              <p className="text-muted-foreground mb-6">Book your access in advance</p>

              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
                <span className="text-muted-foreground font-medium">Standard Entry</span>
                <span className="text-3xl font-bold text-primary">
                  {venue.price > 0 ? `${venue.currency} ${venue.price}` : "Free"}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-muted-foreground bg-secondary/30 p-4 rounded-2xl border border-border/40">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">Skip the line access</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground bg-secondary/30 p-4 rounded-2xl border border-border/40">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">Valid for full day</span>
                </div>
              </div>

              <Link
                to="/venues/checkout/$venueId"
                params={{ venueId: venue.id }}
                className="block w-full"
              >
                <Button
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Book Ticket Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
