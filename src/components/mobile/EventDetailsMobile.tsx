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
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { events, experiences, movies, ticketTiers, merch } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";
import { checkUserAttendance } from "@/api/attendees";

export function EventDetailsMobile({ eventId }: { eventId: string }) {
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
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Immersive Hero */}
      <section className="relative h-[65vh] w-full overflow-hidden">
        <Link
          to="/explore"
          className="absolute top-safe-top left-4 z-30 h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 mt-4"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Link>
        <div className="absolute top-safe-top right-4 z-30 flex gap-2 mt-4">
          <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
            <Heart className="h-5 w-5 text-white" />
          </button>
          <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>

        <img
          src={event.cover}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <span className="bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-white/10 shadow-sm">
            {event.category || event.genre || "Event"}
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white shadow-sm leading-none mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" /> {event.date || "Today"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> {event.time || event.duration || "All day"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />{" "}
              {event.venue || event.cinema || event.city}, {event.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary fill-primary" /> {avgRating}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-4 pt-6 space-y-8">
        {/* Organizer Row */}
        <div className="flex items-center justify-between bg-card/60 backdrop-blur rounded-3xl p-3 border border-border/40">
          <div className="flex items-center gap-3">
            <img
              src={event.cover}
              className="h-12 w-12 rounded-full object-cover border border-border"
              alt={event.organizer || event.host || event.cinema || "Host"}
            />
            <div>
              <p className="font-semibold leading-tight">
                {event.organizer || event.host || event.cinema}
              </p>
              <p className="text-xs text-muted-foreground">@{event.organizerHandle || "host"}</p>
            </div>
          </div>
          <Button size="sm" className="rounded-full h-8 px-4 font-bold">
            Follow
          </Button>
        </div>

        {/* About */}
        <div>
          <h2 className="text-lg font-bold mb-2">About</h2>
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
            {event.date || "Today"} · {event.time || event.duration || "All day"}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {event.description || event.synopsis || "An exciting experience awaits you."}
          </p>
        </div>

        {/* People Going */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Community</h2>
            <span className="text-sm text-primary">
              {(event.attendees || event.spots || 0).toLocaleString()} going
            </span>
          </div>
          <div className="flex -space-x-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?img=${i + 20}`}
                className="h-10 w-10 rounded-full border-2 border-background"
              />
            ))}
            <div className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold">
              +
              {(event.attendees || event.spots || 0) > 6
                ? (event.attendees || event.spots || 0) - 6
                : 0}
            </div>
          </div>
        </div>

        {/* Community Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Community reviews</h2>
            {attendeeRecord && (
              <Button asChild variant="outline" size="sm" className="rounded-full h-8">
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
              reviews.slice(0, 3).map((r: any) => (
                <div
                  key={r.id}
                  className="rounded-3xl border border-border/40 bg-card/60 p-4 backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {r.reviewer_name}
                    {r.is_verified && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-semibold">
                        Verified
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" /> {r.rating.toFixed(1)}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 text-sm font-semibold">{r.title}</p>}
                  {r.body && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {r.body}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-border/40 bg-card/60 p-6 text-center text-muted-foreground backdrop-blur">
                <p className="text-sm">No reviews yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tickets Section */}
        <div>
          <h2 className="text-lg font-bold mb-4">Tickets</h2>
          <div className="space-y-3">
            {ticketTiers.map((t) => (
              <div
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`w-full rounded-3xl border p-4 transition-all duration-300 ${tier === t.id ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/40 bg-card/50"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-base">{t.name}</p>
                  <p className="font-bold text-lg text-primary">
                    {event.currency || "$"}
                    {t.price}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{t.perks.join(" · ")}</p>
                {tier === t.id && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                    <span className="text-sm font-medium">Quantity</span>
                    <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1">
                      <button
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQty(Math.max(1, qty - 1));
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center font-bold text-sm">{qty}</span>
                      <button
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQty(qty + 1);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action (Apple Pay style checkout) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-xl font-bold">
            {event.currency || "$"}
            {total}
          </span>
        </div>
        <Button
          asChild
          className="w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Link to="/book/$eventId" params={{ eventId: event.id }} className="w-full block">
            Get Tickets
          </Link>
        </Button>
      </div>
    </div>
  );
}
