import { Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Clock, Star, Heart, Share2, Users, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";
import { Button } from "@/components/ui/button";
export function VenueDetailsMobile({ venue }: { venue: any }) {
  if (!venue) return null;

  const [isTicketsExpanded, setIsTicketsExpanded] = useState(true);

  const { data: feedbackData } = useQuery({
    queryKey: ["eventFeedback", venue.id],
    queryFn: () => getEventFeedbackPublic({ data: { event_id: venue.id } } as any),
    enabled: !!venue.id,
  });

  const reviews = feedbackData?.reviews || [];
  const avgRating = feedbackData?.aggregate?.avg?.rating
    ? parseFloat(feedbackData.aggregate.avg.rating).toFixed(1)
    : "N/A";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsTicketsExpanded(false);
      } else if (window.scrollY < 10) {
        setIsTicketsExpanded(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header Image & Actions */}
      <div className="relative h-72 w-full">
        <img src={venue.cover_url} alt={venue.name} className="w-full h-full object-cover" />
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
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 pt-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">{venue.name}</h1>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {venue.city || venue.address}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> {venue.opening_hours || "09:00"} -{" "}
              {venue.closing_hours || "22:00"}
            </span>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6">
          <h3 className="font-bold mb-2">About</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{venue.description}</p>
        </div>

        {venue.facilities_data && venue.facilities_data.length > 0 && (
          <div className="border-t border-border/40 pt-6">
            <h3 className="font-bold mb-4">Facilities & Spaces</h3>
            <div className="flex flex-col gap-4">
              {venue.facilities_data.map((facility: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col bg-secondary/20 rounded-2xl border border-border/60 overflow-hidden"
                >
                  {facility.image_url && (
                    <img
                      src={facility.image_url}
                      alt={facility.name}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize mt-1 mb-3">
                      {facility.type.replace(/_/g, " ")}
                    </p>
                    <div className="text-sm font-medium space-y-1 mb-4">
                      {facility.pricing?.hourly_rate && (
                        <p>
                          Hourly:{" "}
                          {formatCurrency(facility.pricing.hourly_rate, venue.currency || "RWF")}
                        </p>
                      )}
                      {facility.pricing?.daily_rate && (
                        <p>
                          Daily:{" "}
                          {formatCurrency(facility.pricing.daily_rate, venue.currency || "RWF")}
                        </p>
                      )}
                      {facility.type === "shared_access" && facility.max_capacity && (
                        <p>Max Capacity: {facility.max_capacity} people</p>
                      )}
                    </div>
                    <div className="mt-auto">
                      <Link
                        to="/venues/$venueId_/facilities/checkout/$facilityId"
                        params={{ venueId_: venue.id, facilityId: facility.id }}
                        className="block w-full"
                      >
                        <Button
                          className="w-full"
                          variant={facility.requires_approval ? "outline" : "default"}
                        >
                          {facility.requires_approval ? "Request Booking" : "Book Now"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border/40 pt-6">
          <h3 className="font-bold mb-4">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {(venue.amenities || []).map((amenity: any, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-secondary/50 rounded-lg text-xs font-medium text-muted-foreground border border-border/40"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border/40 pt-6">
          <h3 className="font-bold mb-4">Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {venue.capacity && (
              <div>
                <span className="text-muted-foreground block text-xs">Capacity</span>
                <span className="font-medium">{venue.capacity} people</span>
              </div>
            )}
            {venue.rental_model && (
              <div>
                <span className="text-muted-foreground block text-xs">Rental Model</span>
                <span className="font-medium capitalize">
                  {venue.rental_model.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {venue.rental_type && (
              <div>
                <span className="text-muted-foreground block text-xs">Rental Type</span>
                <span className="font-medium capitalize">
                  {venue.rental_type.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {venue.is_venue_private !== undefined && venue.is_venue_private !== null && (
              <div>
                <span className="text-muted-foreground block text-xs">Access</span>
                <span className="font-medium">{venue.is_venue_private ? "Private" : "Public"}</span>
              </div>
            )}
          </div>
        </div>

        {venue.instructions && (
          <div className="border-t border-border/40 pt-6 prose prose-sm prose-neutral dark:prose-invert max-w-none break-words overflow-hidden">
            <h3 className="font-bold mb-4">Instructions</h3>
            <div
              className="text-muted-foreground text-sm leading-relaxed [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: venue.instructions }}
            />
          </div>
        )}

        <div className="border-t border-border/40 pt-6">
          <h3 className="font-bold mb-4">Entry Tickets</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {venue.entrance_type === "consumable"
              ? `Includes a ${formatCurrency(venue.consumable_value || 0, venue.currency || "RWF")} consumable voucher.`
              : venue.entrance_type === "free"
                ? "General admission is free."
                : "Book your access in advance"}
          </p>

          {venue.entrance_type !== "free" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/30">
                <span className="text-muted-foreground text-sm font-medium">Standard Entrance</span>
                <span className="font-bold text-primary">
                  {venue.entrance_fee > 0
                    ? formatCurrency(venue.entrance_fee, venue.currency || "RWF")
                    : "Free"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Community Reviews */}
        <div className="border-t border-border/40 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Community reviews</h2>
              {feedbackData?.aggregate?.count > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-foreground">{avgRating}</span>
                  <span>({feedbackData.aggregate.count} reviews)</span>
                </div>
              )}
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full h-8">
              <Link to="/f/$eventId/review" params={{ eventId: venue.id }}>
                Leave a Review
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-3xl border border-border/40 bg-card/60 p-4 backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {r.reviewer_name}
                    {r.is_verified && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold tracking-wide uppercase">
                        Verified
                      </span>
                    )}
                    {r.is_featured && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold tracking-wide uppercase">
                        Featured
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" /> {r.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 mb-2">
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
                  {r.body && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {r.body}
                    </p>
                  )}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {r.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-medium capitalize"
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>

        {venue.latitude && venue.longitude && (
          <div className="border-t border-border/40 pt-6">
            <h3 className="font-bold mb-4">Location</h3>
            <div className="aspect-video rounded-2xl overflow-hidden bg-secondary/30 relative border border-border/40 shadow-sm">
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

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/95 backdrop-blur-xl border-t border-border/50 z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="max-w-md mx-auto">
          {/* Collapsible Header/Toggle */}
          <div
            className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setIsTicketsExpanded(!isTicketsExpanded)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground font-semibold">
                Entry Ticket Prices
              </span>
              <ChevronUp
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isTicketsExpanded ? "rotate-180" : ""}`}
              />
            </div>
            {!isTicketsExpanded && <span className="text-xs text-primary font-bold">View All</span>}
          </div>

          {isTicketsExpanded && venue.entrance_type !== "free" && (
            <div className="mb-4 space-y-2 max-h-48 overflow-y-auto pr-1 border-t border-border/40 pt-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="flex items-center justify-between py-1 text-sm animate-in fade-in duration-150">
                <span className="text-muted-foreground font-medium">Standard Entrance</span>
                <span className="font-bold text-foreground">
                  {venue.entrance_fee > 0
                    ? formatCurrency(venue.entrance_fee, venue.currency || "RWF")
                    : "Free"}
                </span>
              </div>
            </div>
          )}

          {venue.entrance_type !== "free" && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Tickets from
                </span>
                <span className="text-xl font-bold text-foreground">
                  {venue.entrance_fee > 0
                    ? formatCurrency(venue.entrance_fee, venue.currency || "RWF")
                    : "Free"}
                </span>
              </div>
              <Link
                to="/venues/checkout/$venueId"
                params={{ venueId: venue.id }}
                className="flex-1"
              >
                <button
                  className="w-full h-12 rounded-xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Book Ticket
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
