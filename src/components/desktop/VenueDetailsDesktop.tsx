import { Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Clock, Star, Users, ArrowRight, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";

import { useState } from "react";

export function VenueDetailsDesktop({ venue }: { venue: any }) {
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  if (!venue) return null;

  /** Strip Quill's inline color/background-color so dark theme takes over */
  const sanitizeWysiwyg = (html: string) =>
    html
      .replace(/background-color\s*:\s*[^;"']+[;"']/gi, "")
      .replace(/(?<![\-a-z])color\s*:\s*[^;"']+[;"']/gi, "")
      .replace(/style=""/gi, "");

  const { data: feedbackData } = useQuery({
    queryKey: ["eventFeedback", venue.id],
    queryFn: () => getEventFeedbackPublic({ data: { event_id: venue.id } } as any),
    enabled: !!venue.id,
  });

  const reviews = feedbackData?.reviews || [];
  const avgRating = feedbackData?.aggregate?.avg?.rating
    ? parseFloat(feedbackData.aggregate.avg.rating).toFixed(1)
    : "N/A";

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
              <Clock className="h-4 w-4" /> {venue.opening_hours || "09:00"} -{" "}
              {venue.closing_hours || "22:00"}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-10 min-w-0">
          <div>
            <h2 className="text-xl font-semibold">About this venue</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{venue.description}</p>
          </div>

          {venue.images && venue.images.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.images.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${venue.name} Gallery Image ${i + 1}`}
                    onClick={() => setSelectedGalleryIndex(i)}
                    className="w-full h-40 object-cover rounded-2xl border border-border/40 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Map — shown above amenities */}
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

          {venue.facilities_data && venue.facilities_data.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Spaces & Activities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{facility.name}</h3>
                        {facility.category && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {facility.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize mb-3">
                        {facility.type.replace(/_/g, " ")}
                      </p>
                      <div className="text-sm font-medium space-y-1 mb-4">
                        {facility.pricing?.per_session_rate && (
                          <p>
                            Session:{" "}
                            {formatCurrency(facility.pricing.per_session_rate, venue.currency || "RWF")}
                            {facility.duration_minutes && ` (${facility.duration_minutes} mins)`}
                          </p>
                        )}
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
                          to="/venues/$venueId/facilities/checkout/$facilityId"
                          params={{ venueId: venue.id, facilityId: facility.id }}
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
                  <span className="font-medium capitalize">
                    {venue.rental_model.replace(/_/g, " ")}
                  </span>
                </div>
              )}
              {venue.rental_type && (
                <div>
                  <span className="text-muted-foreground block">Rental Type</span>
                  <span className="font-medium capitalize">
                    {venue.rental_type.replace(/_/g, " ")}
                  </span>
                </div>
              )}
              {venue.is_venue_private !== undefined && venue.is_venue_private !== null && (
                <div>
                  <span className="text-muted-foreground block">Access</span>
                  <span className="font-medium">
                    {venue.is_venue_private ? "Private" : "Public"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {venue.instructions && (
            <div className="min-w-0 overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <div
                className={[
                  "text-foreground leading-relaxed break-words overflow-hidden max-w-full min-w-0",
                  "[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_p]:break-words",
                  "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-foreground",
                  "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-foreground",
                  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-4 [&_h3]:text-foreground",
                  "[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-foreground",
                  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1",
                  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1",
                  "[&_li]:text-muted-foreground [&_li]:leading-relaxed",
                  "[&_strong]:font-semibold [&_strong]:text-foreground",
                  "[&_em]:italic [&_em]:text-muted-foreground",
                  "[&_u]:underline",
                  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary/80 [&_a]:transition-colors",
                  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
                  "[&_pre]:bg-secondary [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:text-sm",
                  "[&_code]:bg-secondary [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_code]:text-foreground",
                  "[&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify",
                  "[&_.ql-indent-1]:pl-8 [&_.ql-indent-2]:pl-16 [&_.ql-indent-3]:pl-24",
                  "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4",
                  "[&_hr]:border-border/40 [&_hr]:my-6",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: sanitizeWysiwyg(venue.instructions) }}
              />
            </div>
          )}

          {/* Community Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Community reviews</h2>
                {feedbackData?.aggregate?.count > 0 && (
                  <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-muted-foreground">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-foreground">{avgRating}</span>
                    <span>({feedbackData?.aggregate?.count ?? 0} reviews)</span>
                  </div>
                )}
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/f/$eventId/review" params={{ eventId: venue.id }}>
                  Leave a Review
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-sm font-bold uppercase">
                        {r.reviewer_name?.substring(0, 2) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{r.reviewer_name}</span>
                          {r.is_verified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold tracking-wide uppercase">
                              Verified
                            </span>
                          )}
                          {r.is_featured && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold tracking-wide uppercase">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(r.rating) ? "fill-primary text-primary" : "text-muted"}`}
                            />
                          ))}
                          <span className="ml-2 text-[10px]">
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {r.title && <p className="mt-3 font-semibold text-foreground">{r.title}</p>}
                    {r.body && (
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
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
        </div>

        {/* Right Column: CTA Widget */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              {venue.rental_model === "ENTIRE_VENUE"
                ? "Rent Venue"
                : venue.entrance_type === "free"
                  ? "Free Entry"
                  : "Entry Ticket"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {venue.rental_model === "ENTIRE_VENUE"
                ? `Rent this venue for your exclusive use.`
                : venue.entrance_type === "consumable"
                  ? `Includes a ${formatCurrency(venue.consumable_value || 0, venue.currency || "RWF")} consumable voucher.`
                  : venue.entrance_type === "free"
                    ? "General admission is free."
                    : "Book your access in advance"}
            </p>

            {venue.rental_model !== "ENTIRE_VENUE" && venue.entrance_type !== "free" && (
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-secondary/30">
                  <span className="text-muted-foreground font-medium">Standard Entrance</span>
                  <span className="text-xl font-bold">
                    {venue.entrance_fee > 0
                      ? formatCurrency(venue.entrance_fee, venue.currency || "RWF")
                      : "Free"}
                  </span>
                </div>
                {venue.pricing_tiers &&
                  venue.pricing_tiers.length > 0 &&
                  venue.pricing_tiers.map((tier: any, i: number) => (
                    <div
                      key={`tier-${i}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-secondary/30"
                    >
                      <span className="text-muted-foreground font-medium">{tier.name}</span>
                      <span className="text-xl font-bold">
                        {formatCurrency(tier.amount, venue.currency || "RWF")}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {venue.rental_model === "ENTIRE_VENUE" &&
              venue.pricing_tiers &&
              venue.pricing_tiers.length > 0 && (
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-secondary/30">
                    <span className="text-muted-foreground font-medium">Starting from</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(venue.pricing_tiers[0].amount, venue.currency || "RWF")}
                    </span>
                  </div>
                </div>
              )}

            {(venue.rental_model === "ENTIRE_VENUE" || venue.entrance_type !== "free") && (
              <Link
                to="/venues/checkout/$venueId"
                params={{ venueId: venue.id }}
                className="block w-full"
              >
                <Button
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {venue.rental_model === "ENTIRE_VENUE" ? "Rent Now" : "Get Ticket"}{" "}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </aside>
      </div>

      <Footer />

      {selectedGalleryIndex !== null && venue?.images && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <button
            onClick={() => setSelectedGalleryIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={() =>
              setSelectedGalleryIndex((prev) => (prev! > 0 ? prev! - 1 : venue.images.length - 1))
            }
            className="absolute left-6 text-white/70 hover:text-white p-2 transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <img
            src={venue.images[selectedGalleryIndex]}
            alt="Gallery view"
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
          />

          <button
            onClick={() =>
              setSelectedGalleryIndex((prev) => (prev! < venue.images.length - 1 ? prev! + 1 : 0))
            }
            className="absolute right-6 text-white/70 hover:text-white p-2 transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}
    </div>
  );
}
