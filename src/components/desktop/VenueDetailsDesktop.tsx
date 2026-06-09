import { Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Clock, Star, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export function VenueDetailsDesktop({ venue }: { venue: any }) {
  if (!venue) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Cinematic banner */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={venue.cover_url}
          alt={venue.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <span className="w-fit rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur font-bold uppercase tracking-wider">
            {venue.type}
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{venue.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {venue.city || venue.address}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {venue.opening_hours || "09:00"} - {venue.closing_hours || "22:00"}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-10 min-w-0">
          <div>
            <h2 className="text-xl font-semibold">About this venue</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {venue.description}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Amenities & Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(venue.amenities || []).map((amenity: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/40"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" /> {amenity}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {venue.capacity && (
                <div>
                  <span className="text-muted-foreground block">Capacity</span>
                  <span className="font-medium">{venue.capacity} people</span>
                </div>
              )}
              {venue.rental_model && (
                <div>
                  <span className="text-muted-foreground block">Rental Model</span>
                  <span className="font-medium capitalize">{venue.rental_model.replace(/_/g, " ")}</span>
                </div>
              )}
              {venue.rental_type && (
                <div>
                  <span className="text-muted-foreground block">Rental Type</span>
                  <span className="font-medium capitalize">{venue.rental_type.replace(/_/g, " ")}</span>
                </div>
              )}
              {venue.is_venue_private !== undefined && venue.is_venue_private !== null && (
                <div>
                  <span className="text-muted-foreground block">Access</span>
                  <span className="font-medium">{venue.is_venue_private ? "Private" : "Public"}</span>
                </div>
              )}
            </div>
          </div>

          {venue.instructions && (
            <div className="prose prose-neutral dark:prose-invert max-w-none break-words overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <div 
                className="text-muted-foreground leading-relaxed [&>p]:mb-4"
                dangerouslySetInnerHTML={{ __html: venue.instructions }}
              />
            </div>
          )}

          {venue.latitude && venue.longitude && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-[350px] rounded-2xl overflow-hidden bg-secondary/30 relative border border-border/40 shadow-sm">
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}&output=embed`}
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: CTA Widget */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-2xl font-bold tracking-tight mb-2">Entry Ticket</h3>
            <p className="text-muted-foreground mb-6">Book your access in advance</p>

            <div className="space-y-3 mb-8">
              {(venue.pricing_tiers?.length > 0 ? venue.pricing_tiers : [{ name: "Standard Entry", amount: 0 }]).map((tier: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-secondary/30">
                  <span className="text-muted-foreground font-medium">{tier.name || "Standard Entry"}</span>
                  <span className="text-xl font-bold">
                    {tier.amount > 0 ? formatCurrency(tier.amount, venue.currency) : "Free"}
                  </span>
                </div>
              ))}
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
        </aside>
      </div>

      <Footer />
    </div>
  );
}
