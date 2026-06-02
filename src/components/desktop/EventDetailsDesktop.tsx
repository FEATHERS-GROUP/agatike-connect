import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
  Heart,
  Share2,
  Plus,
  Minus,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { events, experiences, movies, ticketTiers, merch } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";
import { checkUserAttendance } from "@/api/attendees";

export function EventDetailsDesktop({ eventId }: { eventId: string }) {
  const event: any =
    events.find((e) => e.id === eventId) ||
    experiences.find((x) => x.id === eventId) ||
    movies.find((m) => m.id === eventId) ||
    events[0];
  const [tier, setTier] = useState(ticketTiers[0].id);
  const [qty, setQty] = useState(1);
  const selected = ticketTiers.find((t) => t.id === tier)!;
  const total = selected.price * qty;

  const { data: feedbackData } = useQuery({
    queryKey: ["public-feedback", eventId],
    queryFn: () => getEventFeedbackPublic({ data: { event_id: eventId } } as any),
  });

  const { data: attendeeRecord } = useQuery({
    queryKey: ["check-attendance", eventId],
    queryFn: () => checkUserAttendance({ data: { event_id: eventId } } as any),
  });

  const reviews = feedbackData?.reviews || [];
  const avgRating = feedbackData?.aggregate?.avg?.rating
    ? parseFloat(feedbackData.aggregate.avg.rating).toFixed(1)
    : "5.0";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Cinematic banner */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={event.cover}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <span className="w-fit rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">
            {event.category}
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{event.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {event.date || "Today"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {event.time || event.duration || "All day"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {event.venue || event.cinema || event.city},{" "}
              {event.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" /> {avgRating}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1fr_400px]">
        {/* Left */}
        <div className="space-y-10">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-3">
              <img
                src={event.cover}
                className="h-12 w-12 rounded-full object-cover"
                alt={event.organizer || event.host || event.cinema || "Organizer"}
              />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Organized by
                </p>
                <p className="font-semibold">
                  {event.organizer || event.host || event.cinema || "Host"}{" "}
                  <span className="text-xs text-muted-foreground">
                    @{event.organizerHandle || "host"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button className="rounded-full">Follow</Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {event.description || event.synopsis || "Join us for an exciting experience."} Expect
              curated sound, immersive lighting and a crowd that brings the energy. Doors open one
              hour before showtime — bring an ID and your good vibes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Lineup</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {["DJ Nala", "Burna Sound", "Amapiano Live", "Surprise Guest"].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-border/60 bg-card p-4 text-center"
                >
                  <div
                    className="mx-auto h-14 w-14 rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                  <p className="mt-3 text-sm font-medium">{n}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              People going · {(event.attendees || event.spots || 0).toLocaleString()}
            </h2>
            <div className="mt-4 flex -space-x-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-background"
                  style={{ background: `oklch(${0.6 + (i % 3) * 0.1} 0.18 ${30 + i * 20})` }}
                />
              ))}
              <div className="ml-3 grid h-10 place-items-center rounded-full bg-secondary px-3 text-xs font-medium">
                +{" "}
                {((event.attendees || event.spots || 0) - 8 > 0
                  ? (event.attendees || event.spots || 0) - 8
                  : 0
                ).toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Merchandise & add-ons</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {merch.map((m) => (
                <div
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card"
                >
                  <img
                    src={m.image}
                    alt={m.name}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium">{m.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {event.currency || "$"}
                        {m.price}
                      </span>
                      <Button size="sm" variant="outline" className="rounded-full">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Venue</h2>
            <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 bg-secondary">
              <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" /> {event.venue || event.cinema || event.city},{" "}
                {event.city}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Community reviews</h2>
              {attendeeRecord && (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link
                    to="/f/$eventId/review"
                    params={{ eventId }}
                    search={{
                      attendeeId: attendeeRecord.id,
                      name: attendeeRecord.names,
                      email: attendeeRecord.email,
                    }}
                  >
                    Leave a Review
                  </Link>
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {r.reviewer_name}
                      {r.is_verified && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold">
                          Verified
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" /> {r.rating.toFixed(1)}
                      </span>
                    </div>
                    {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
                    {r.body && (
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-muted-foreground">
                  <p className="text-sm">No reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating ticket card */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="text-2xl font-semibold">
                {event.currency || "$"}
                {ticketTiers[0].price}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {ticketTiers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${tier === t.id ? "border-primary bg-accent/40" : "border-border bg-background hover:bg-secondary"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t.name}</p>
                    <p className="font-semibold">
                      {event.currency || "$"}
                      {t.price}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t.perks.join(" · ")}</p>
                  <p className="mt-1 text-xs text-primary">{t.remaining} left</p>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-background p-2">
              <span className="px-3 text-sm">Quantity</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">
                {event.currency || "$"}
                {total}
              </span>
            </div>

            <Button
              asChild
              className="mt-4 h-12 w-full rounded-2xl text-base shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Link to="/book/$eventId" params={{ eventId: event.id }} className="w-full block">
                Get Tickets
              </Link>
            </Button>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> Secure checkout · Mobile QR ticket
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-border p-4 text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-xl bg-foreground text-background text-xs font-mono">
                QR PREVIEW
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Tickets are scanned at the door from your phone.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" /> {(event.attendees || event.spots || 0).toLocaleString()}{" "}
              going
            </span>
            <Link to="/feed" className="text-primary hover:underline">
              See moments
            </Link>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
