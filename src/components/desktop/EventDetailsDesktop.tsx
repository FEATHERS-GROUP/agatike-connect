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
  Instagram,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useFollowedOrganizers } from "@/hooks/useFollowedOrganizers";
import {
  events,
  experiences,
  movies,
  ticketTiers,
  merch,
  experienceCategories,
} from "@/lib/mock-data";

import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";
import { checkUserAttendance, getEventAttendees } from "@/api/attendees";
import { formatCurrency } from "@/lib/currency";

const VenueMap = lazy(() => import("@/components/site/VenueMap"));
const ExperienceMap = lazy(() => import("@/components/desktop/ExperienceMap"));

export function EventDetailsDesktop({
  eventId,
  event: initialEvent,
}: {
  eventId: string;
  event?: any;
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const ev =
    initialEvent ||
    events.find((e) => e.id === eventId) ||
    experiences.find((x) => x.id === eventId) ||
    movies.find((m) => m.id === eventId) ||
    events[0];

  const isMock = !!ev.organizer || !!ev.host || !!ev.cinema;
  const tourStops =
    Array.isArray(ev.tour_stops) && ev.tour_stops.length > 0
      ? ev.tour_stops
      : [{ city: ev.city, venue: ev.venue, date: ev.date, time: ev.time }];
  const [selectedStopIdx, setSelectedStopIdx] = useState(0);

  const currentStop = tourStops[selectedStopIdx] || tourStops[0];
  const date = isMock ? ev.date : currentStop.date || "TBD";
  const time = isMock ? ev.time || ev.duration : currentStop.time || "";
  const venue = isMock ? ev.venue || ev.cinema : currentStop.venue || "";
  const city = isMock ? ev.city : currentStop.venue || currentStop.city || "";

  const rawLat = isMock ? ev.lat : currentStop.latitude || currentStop.lat;
  const rawLng = isMock ? ev.lng : currentStop.longitude || currentStop.lng;
  let lat = rawLat ? parseFloat(rawLat) : -1.9441;
  let lng = rawLng ? parseFloat(rawLng) : 30.0619;
  if (isNaN(lat)) lat = -1.9441;
  if (isNaN(lng)) lng = 30.0619;

  const { isLoggedIn, user } = useUserAuth();
  const { isFollowing, toggleFollow } = useFollowedOrganizers();

  const organizerName = isMock
    ? ev.organizer || ev.host || ev.cinema
    : ev.workspaces?.organizer?.name || ev.workspaces?.name || "Organizer";
  const organizerHandle = isMock ? ev.organizerHandle : ev.workspaces?.organizer?.handle || "host";

  const organizerId = ev.workspaces?.organizer?.id || ev.workspaces?.orgnizer_id || ev.workspace_id;
  const following = organizerId ? isFollowing(organizerId) : false;
  const currencyCode = isMock ? ev.currency : ev.workspaces?.currency;
  const description = ev.description || ev.synopsis || "";
  const category = ev.category || ev.genre || "Event";
  const attendeesCount = isMock
    ? ev.attendees || ev.spots || 0
    : ev.event_attendees_aggregate?.aggregate?.count ?? 0;

  const isExperience = experienceCategories.includes(category);

  const lineup =
    Array.isArray(ev.lineup) && ev.lineup.length > 0
      ? ev.lineup
      : isMock
        ? [
            { id: "1", name: "DJ Nala", role: "Main DJ", instagram: "djnala" },
            { id: "2", name: "Burna Sound", role: "Guest Artist" },
            { id: "3", name: "Amapiano Live", role: "Set", instagram: "amapianolive" },
            { id: "4", name: "Surprise Guest", role: "Special Appearance" },
          ]
        : [];

  const itinerary =
    isExperience && Array.isArray(ev.itinerary) && ev.itinerary.length > 0 ? ev.itinerary : [];
  const included = isExperience
    ? Array.isArray(ev.included) && ev.included.length > 0
      ? ev.included
      : ev.tour_stops?.included || []
    : [];

  const polylinePositions: [number, number][] = itinerary
    .filter((stop: any) => stop.lat && stop.lng)
    .map((stop: any) => [stop.lat, stop.lng] as [number, number]);

  let mapCenter: [number, number] =
    polylinePositions.length > 0 ? polylinePositions[0] : [lat, lng];
  let bounds: any = undefined;
  if (polylinePositions.length > 1) {
    const lats = polylinePositions.map((p: any) => p[0]);
    const lngs = polylinePositions.map((p: any) => p[1]);
    bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }

  const schedules =
    isExperience && Array.isArray(ev.schedules) && ev.schedules.length > 0 ? ev.schedules : [];

  const allTicketTiers = isMock
    ? ticketTiers
    : (ev.event_tickets?.length
        ? ev.event_tickets
        : [{ id: "ga", type: "General Admission", cost: 0, remaining: 100, sold: 0 }]
      ).map((t: any) => {
        const sold = parseInt(t.sold) || 0;
        const capacity = parseInt(t.remaining) || 0;
        const ticketsLeft = Math.max(0, capacity - sold);
        return {
          id: t.id,
          name: t.type,
          price: parseFloat(t.cost) || 0,
          perks: ev.vipPerks ? ev.vipPerks.split(",") : ["Entry"],
          remaining: ticketsLeft,
          sold,
          tour_stop_idx: t.tour_stop_idx || 0,
        };
      });

  const activeTicketTiers = allTicketTiers.filter((t: any) =>
    // Filter by tour stop AND hide sold-out tiers
    (isExperience ? true : t.tour_stop_idx === selectedStopIdx || tourStops.length <= 1) &&
    t.remaining > 0,
  );

  const activeMerch = isMock
    ? merch
    : (ev.merchandises || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        image: m.image_url || ev.cover,
      }));

  const [cart, setCart] = useState<Record<string, number>>({});

  const total = Object.entries(cart).reduce((sum, [key, qty]) => {
    if (qty <= 0) return sum;
    const [stopIdx, tierId] = key.split("_");
    const tier = allTicketTiers.find((t: any) => t.id === tierId);
    return sum + (tier ? tier.price * qty : 0);
  }, 0);

  const totalTickets = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const { data: feedbackData } = useQuery({
    queryKey: ["public-feedback", eventId],
    queryFn: () => getEventFeedbackPublic({ data: { event_id: eventId } } as any),
  });

  const { data: attendeeRecord } = useQuery({
    queryKey: ["check-attendance", eventId],
    queryFn: () => checkUserAttendance({ data: { event_id: eventId } } as any),
  });

  const { data: rawAttendeesList = [] } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
  });

  // Deduplicate by email so a user who bought multiple tickets only appears once
  const attendeesList = useMemo(() => {
    const seen = new Set<string>();
    return rawAttendeesList.filter((att: any) => {
      const key = att.email || att.user_id || att.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rawAttendeesList]);

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
          src={ev.cover}
          alt={ev.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">
          <span className="w-fit rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">
            {category}
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{ev.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {date || "Today"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> {time || "All day"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {venue ? `${venue}, ` : ""}
              {city}
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
                src={ev.workspaces?.organizer?.image || ev.cover}
                className="h-12 w-12 rounded-full object-cover"
                alt={organizerName}
              />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Organized by
                </p>
                <p className="font-semibold">
                  {organizerName}{" "}
                  <span className="text-xs text-muted-foreground">@{organizerHandle}</span>
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
              {organizerId && following && isLoggedIn && (
                <Button asChild variant="outline" size="icon" className="rounded-full">
                  <Link to="/$userId/message" params={{ userId: user?.id }} search={{ chatId: organizerId, eventId: ev.id }}>
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {organizerId && !following && (
                <Button
                  variant="default"
                  className="rounded-full"
                  onClick={() => toggleFollow(organizerId)}
                >
                  Follow
                </Button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {description} Expect curated sound, immersive lighting and a crowd that brings the
              energy. Doors open one hour before showtime — bring an ID and your good vibes.
            </p>
          </div>

          {lineup.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">
                {isExperience ? "Meet the Team" : "Lineup & Speakers"}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {lineup.map((member: any) => (
                  <div
                    key={member.id || member.name}
                    className="group rounded-2xl border border-border/60 bg-card p-4 text-center transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="mx-auto h-16 w-16 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
                      />
                    ) : (
                      <div
                        className="mx-auto h-16 w-16 rounded-full shadow-sm ring-2 ring-primary/20"
                        style={{ background: "var(--gradient-primary)" }}
                      />
                    )}
                    <p className="mt-3 text-sm font-semibold truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role || "Artist"}
                    </p>
                    {member.instagram && (
                      <a
                        href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">
              People going · {attendeesCount.toLocaleString()}
            </h2>
            {attendeesList && attendeesList.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex -space-x-3 overflow-hidden">
                  {attendeesList.slice(0, 8).map((att: any, i: number) => {
                    const avatarUrl = att.users?.profile || `https://i.pravatar.cc/100?img=${i + 20}`;
                    return (
                      <img
                        key={att.id || i}
                        src={avatarUrl}
                        className="h-10 w-10 rounded-full border-2 border-background object-cover"
                        alt={att.names || "Attendee"}
                      />
                    );
                  })}
                  {attendeesList.length > 8 && (
                    <div className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold border-2 border-background">
                      +{attendeesList.length - 8}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {attendeesList.slice(0, 8).map((att: any, i: number) => {
                    const name = att.users?.handle ? `@${att.users.handle}` : att.names;
                    if (!name) return null;
                    return (
                      <span key={att.id || i} className="text-xs bg-secondary/50 text-muted-foreground px-2.5 py-1 rounded-full border border-border/30 font-medium">
                        {name}
                      </span>
                    );
                  })}
                  {attendeesList.length > 8 && (
                    <span className="text-xs text-muted-foreground self-center ml-1">
                      & {attendeesList.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            ) : attendeesCount > 0 ? (
              <div className="mt-4 flex -space-x-3">
                {Array.from({ length: Math.min(attendeesCount || 8, 8) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background"
                    style={{ background: `oklch(${0.6 + (i % 3) * 0.1} 0.18 ${30 + i * 20})` }}
                  />
                ))}
                {attendeesCount > 8 && (
                  <div className="ml-3 grid h-10 place-items-center rounded-full bg-secondary px-3 text-xs font-medium">
                    + {(attendeesCount - 8).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Be the first to join!</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Merchandise & add-ons</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {activeMerch.map((m: any) => (
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
                        {formatCurrency(m.price, currencyCode)}
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

          {isExperience && included.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">What's Included</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {included.map((item: any, idx: number) => {
                  const title = typeof item === "string" ? item : item.title;
                  const description = typeof item === "string" ? null : item.description;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{title}</p>
                        {description && (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">{isExperience ? "Route & Schedule" : "Venue"}</h2>

            {isExperience && itinerary.length > 0 ? (
              <div
                className={
                  polylinePositions.length > 0
                    ? "mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8"
                    : "mt-4 block"
                }
              >
                {polylinePositions.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-border/60 h-[400px] z-10 relative mb-8 lg:mb-0">
                    {isClient ? (
                      <Suspense
                        fallback={
                          <div className="h-full w-full bg-secondary flex items-center justify-center">
                            Loading map...
                          </div>
                        }
                      >
                        <ExperienceMap
                          itinerary={itinerary}
                          bounds={bounds}
                          mapCenter={mapCenter}
                          polylinePositions={polylinePositions}
                        />
                      </Suspense>
                    ) : (
                      <div className="h-full w-full bg-secondary flex items-center justify-center">
                        Loading map...
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-2">
                  {itinerary.map((stop: any) => (
                    <div key={stop.id} className="relative flex items-start group py-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary shadow-sm shrink-0 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div className="ml-4 bg-secondary/30 w-full p-4 rounded-2xl border border-border/60 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold">{stop.title}</h4>
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {stop.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{stop.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 bg-secondary relative z-0">
                {isClient ? (
                  <Suspense
                    fallback={
                      <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground">
                        Loading map...
                      </div>
                    }
                  >
                    <VenueMap lat={lat} lng={lng} venue={venue} city={city} tourStops={tourStops} selectedStopIdx={selectedStopIdx} />
                  </Suspense>
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground">
                    <MapPin className="mr-2 h-5 w-5" /> {venue ? `${venue}, ` : ""}
                    {city}
                  </div>
                )}
              </div>
            )}
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
                {formatCurrency(activeTicketTiers[0]?.price || 0, currencyCode)}
              </p>
            </div>

            {isExperience
              ? schedules.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Select Schedule
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {schedules.map((schedule: any, idx: number) => {
                        const isFull = schedule.spotsFilled >= schedule.totalSpots;
                        return (
                          <button
                            key={schedule.id || idx}
                            onClick={() => {
                              if (!isFull) {
                                setSelectedStopIdx(idx);
                              }
                            }}
                            disabled={isFull}
                            className={`w-full px-3 py-2.5 rounded-xl text-left border transition-all ${
                              selectedStopIdx === idx
                                ? "bg-primary/10 border-primary text-foreground"
                                : isFull
                                  ? "bg-secondary/30 border-border/40 opacity-60 cursor-not-allowed"
                                  : "bg-background border-border hover:bg-secondary"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[13px]">{schedule.date}</span>
                              {isFull ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                  Sold Out
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {schedule.totalSpots - (schedule.spotsFilled || 0)} spots
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              : tourStops.length > 1 && (
                  <div className="mt-5">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Select Tour Stop
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {tourStops.map((stop: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedStopIdx(idx);
                          }}
                          className={`w-full px-2 py-2 rounded-xl text-[11px] leading-tight font-semibold border transition-all ${selectedStopIdx === idx ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-secondary"}`}
                        >
                          <span className="block truncate">{stop.city}</span>
                          <span className="block opacity-80 mt-0.5">{stop.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

            <div className="mt-5 space-y-3">
              {activeTicketTiers.map((t: any) => {
                const cartKey = `${selectedStopIdx}_${t.id}`;
                const itemQty = cart[cartKey] || 0;
                const isSelected = itemQty > 0;

                return (
                  <div
                    key={t.id}
                    className={`w-full rounded-2xl border p-4 text-left transition ${isSelected ? "border-primary bg-accent/40" : "border-border bg-background hover:bg-secondary"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="font-semibold">{formatCurrency(t.price, currencyCode)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-background rounded-full border p-1 shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() =>
                            setCart((prev) => ({ ...prev, [cartKey]: Math.max(0, itemQty - 1) }))
                          }
                          disabled={itemQty === 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-4 text-center text-sm font-medium">{itemQty}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => setCart((prev) => ({ ...prev, [cartKey]: itemQty + 1 }))}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{t.perks.join(" · ")}</p>
                    <p className="mt-1 text-xs text-primary">{t.remaining} left</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total ({totalTickets} items)</span>
              <span className="text-lg font-semibold">{formatCurrency(total, currencyCode)}</span>
            </div>

            <Button
              asChild
              className="mt-4 h-12 w-full rounded-2xl text-base shadow-[var(--shadow-glow)]"
              style={{
                background:
                  total === 0 && totalTickets > 0 ? "var(--foreground)" : "var(--gradient-primary)",
                opacity: totalTickets === 0 ? 0.5 : 1,
                pointerEvents: totalTickets === 0 ? "none" : "auto",
              }}
              onClick={() => {
                localStorage.setItem(`event_checkout_${ev.id}`, JSON.stringify(cart));
              }}
            >
              <Link to="/book/$eventId" params={{ eventId: ev.id }} className="w-full block">
                {total === 0 && totalTickets > 0 ? "Register for Free" : "Get Tickets"}
              </Link>
            </Button>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> Secure checkout · Mobile QR ticket
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" /> {attendeesCount.toLocaleString()} going
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
