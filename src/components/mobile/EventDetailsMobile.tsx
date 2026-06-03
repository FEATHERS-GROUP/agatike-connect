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
  ChevronLeft,
  Instagram,
} from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { events, experiences, movies, ticketTiers, merch } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";
import { checkUserAttendance } from "@/api/attendees";

function getCurrencySymbol(currency?: string) {
  const map: Record<string, string> = {
    RWF: "RWF ", USD: "$", EUR: "€", GBP: "£", KES: "KES ",
    UGX: "UGX ", TZS: "TZS ", NGN: "₦", GHS: "GH₵", XOF: "CFA ",
    ZAR: "R", MAD: "MAD ", ETB: "Br ", dollars: "$"
  };
  return map[currency || ""] || currency || "$";
}

const VenueMap = lazy(() => import("@/components/site/VenueMap"));

export function EventDetailsMobile({ eventId, event: initialEvent }: { eventId: string, event?: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const ev =
    initialEvent ||
    events.find((e) => e.id === eventId) ||
    experiences.find((x) => x.id === eventId) ||
    movies.find((m) => m.id === eventId) ||
    events[0];

  const isMock = !!ev.organizer || !!ev.host || !!ev.cinema;
  const tourStops = Array.isArray(ev.tour_stops) && ev.tour_stops.length > 0 ? ev.tour_stops : [{ city: ev.city, venue: ev.venue, date: ev.date, time: ev.time }];
  const [selectedStopIdx, setSelectedStopIdx] = useState(0);
  
  const currentStop = tourStops[selectedStopIdx] || tourStops[0];
  const date = isMock ? ev.date : currentStop.date || "TBD";
  const time = isMock ? ev.time || ev.duration : currentStop.time || "";
  const venue = isMock ? ev.venue || ev.cinema : currentStop.venue || "";
  const city = isMock ? ev.city : currentStop.city || "";
  
  const rawLat = isMock ? ev.lat : (currentStop.latitude || currentStop.lat);
  const rawLng = isMock ? ev.lng : (currentStop.longitude || currentStop.lng);
  let lat = rawLat ? parseFloat(rawLat) : -1.9441;
  let lng = rawLng ? parseFloat(rawLng) : 30.0619;
  if (isNaN(lat)) lat = -1.9441;
  if (isNaN(lng)) lng = 30.0619;
  
  const organizerName = isMock ? ev.organizer || ev.host || ev.cinema : (ev.workspaces?.organizer?.name || ev.workspaces?.name || "Organizer");
  const organizerHandle = isMock ? ev.organizerHandle : (ev.workspaces?.organizer?.handle || "host");
  const currency = getCurrencySymbol(isMock ? ev.currency : ev.workspaces?.wallet?.currency);
  const description = ev.description || ev.synopsis || "";
  const category = ev.category || ev.genre || "Event";
  const attendeesCount = isMock ? (ev.attendees || ev.spots || 0) : (ev.event_tickets?.reduce((acc: number, t: any) => acc + (parseInt(t.sold) || 0), 0) || 0);
  
  const lineup = Array.isArray(ev.lineup) && ev.lineup.length > 0 ? ev.lineup : (isMock ? [
    { id: '1', name: "DJ Nala", role: "Main DJ", instagram: "djnala" },
    { id: '2', name: "Burna Sound", role: "Guest Artist" },
    { id: '3', name: "Amapiano Live", role: "Set", instagram: "amapianolive" },
    { id: '4', name: "Surprise Guest", role: "Special Appearance" }
  ] : []);
  
  const allTicketTiers = isMock 
    ? ticketTiers 
    : (ev.event_tickets?.length ? ev.event_tickets : [{ id: 'ga', type: 'General Admission', cost: 0, remaining: 100 }]).map((t: any) => ({
        id: t.id,
        name: t.type,
        price: parseFloat(t.cost) || 0,
        perks: ev.vipPerks ? ev.vipPerks.split(",") : ["Entry"],
        remaining: t.remaining,
        tour_stop_idx: t.tour_stop_idx || 0
      }));

  const activeTicketTiers = allTicketTiers.filter((t: any) => t.tour_stop_idx === selectedStopIdx || tourStops.length <= 1);
      
  const activeMerch = isMock ? merch : (ev.merchandises || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    price: m.price,
    image: m.image_url || ev.cover
  }));

  const [tier, setTier] = useState(activeTicketTiers[0]?.id);
  const [qty, setQty] = useState(1);
  const selected = activeTicketTiers.find((t: any) => t.id === tier) || activeTicketTiers[0];
  const total = selected ? selected.price * qty : 0;

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
          src={ev.cover}
          alt={ev.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <span className="bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-white/10 shadow-sm">
            {category}
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white shadow-sm leading-none mb-4">
            {ev.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" /> {date || "Today"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> {time || "All day"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />{" "}
              {venue ? `${venue}, ` : ""}{city}
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
              src={ev.cover}
              className="h-12 w-12 rounded-full object-cover border border-border"
              alt={organizerName}
            />
            <div>
              <p className="font-semibold leading-tight">
                {organizerName}
              </p>
              <p className="text-xs text-muted-foreground">@{organizerHandle}</p>
            </div>
          </div>
          <Button size="sm" className="rounded-full h-8 px-4 font-bold">
            Follow
          </Button>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-lg font-bold mb-4">Venue</h2>
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-secondary relative z-0 border border-border/40">
            {isClient ? (
              <Suspense
                fallback={
                  <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground text-sm font-medium">
                    Loading map...
                  </div>
                }
              >
                <VenueMap lat={lat} lng={lng} venue={venue} city={city} />
              </Suspense>
            ) : (
              <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground text-sm font-medium">
                <MapPin className="h-4 w-4 mr-2" /> {venue ? `${venue}, ` : ""}
                {city}
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div>
          <h2 className="text-lg font-bold mb-2">About</h2>
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
            {date || "Today"} · {time || "All day"}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {description}
          </p>
        </div>

        {/* Lineup & Speakers */}
        {lineup.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3">Lineup & Speakers</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {lineup.map((member: any) => (
                <div
                  key={member.id || member.name}
                  className="snap-start shrink-0 w-[140px] rounded-3xl border border-border/40 bg-card/60 p-4 text-center backdrop-blur"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="mx-auto h-16 w-16 rounded-full object-cover shadow-sm border-2 border-primary/20"
                    />
                  ) : (
                    <div
                      className="mx-auto h-16 w-16 rounded-full shadow-sm border-2 border-primary/20"
                      style={{ background: "var(--gradient-primary)" }}
                    />
                  )}
                  <p className="mt-3 text-sm font-bold truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role || "Artist"}</p>
                  {member.instagram && (
                    <a 
                      href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-muted-foreground"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People Going */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Community</h2>
            <span className="text-sm text-primary">
              {attendeesCount.toLocaleString()} going
            </span>
          </div>
          {attendeesCount > 10 && (
            <div className="flex -space-x-3">
              {Array.from({ length: Math.min(attendeesCount || 6, 6) }).map((_, i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?img=${i + 20}`}
                  className="h-10 w-10 rounded-full border-2 border-background"
                  alt="Attendee"
                />
              ))}
              {attendeesCount > 6 && (
                <div className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold">
                  +{attendeesCount - 6}
                </div>
              )}
            </div>
          )}
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

        <div>
          <h2 className="text-lg font-bold mb-4">Tickets</h2>
          {tourStops.length > 1 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Select Tour Stop</p>
              <div className="grid grid-cols-2 gap-2 pb-2">
                {tourStops.map((stop: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedStopIdx(idx);
                      setTier(allTicketTiers.find((t: any) => t.tour_stop_idx === idx)?.id);
                    }}
                    className={`w-full px-2 py-2 rounded-xl text-[11px] leading-tight font-semibold border transition-all ${selectedStopIdx === idx ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-secondary"}`}
                  >
                    <span className="block truncate">{stop.city}</span>
                    <span className="block opacity-80 mt-0.5">{stop.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            {activeTicketTiers.map((t: any) => (
              <div
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`w-full rounded-3xl border p-4 transition-all duration-300 ${tier === t.id ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/40 bg-card/50"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-base">{t.name}</p>
                  <p className="font-bold text-lg text-primary">
                    {currency}{t.price}
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
            {currency}{total}
          </span>
        </div>
        <Button
          asChild
          className="w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Link to="/book/$eventId" params={{ eventId: ev.id }} className="w-full block">
            Get Tickets
          </Link>
        </Button>
      </div>
    </div>
  );
}
