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
  ChevronUp,
  Instagram,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
import { getEventVenueProjects } from "@/api/venues";
import { formatCurrency } from "@/lib/currency";
import { VenueSeatSelector } from "@/components/shared/VenueSeatSelector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const VenueMap = lazy(() => import("@/components/site/VenueMap"));

export function EventDetailsMobile({
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
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsTicketsExpanded(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const isExperience = ev.event_type === "experience" || experienceCategories.includes(category);
  const included = isExperience
    ? Array.isArray(ev.included) && ev.included.length > 0
      ? ev.included
      : ev.tour_stops?.included || []
    : [];
  const attendeesCount = isMock
    ? ev.attendees || ev.spots || 0
    : (ev.event_attendees_aggregate?.aggregate?.count ?? 0);

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
          sale_ends_at: t.sale_ends_at,
          tour_stop_idx: t.tour_stop_idx || 0,
        };
      });

  const activeTicketTiers = allTicketTiers.filter((t: any) => {
    // Filter by tour stop
    const rightStop = t.tour_stop_idx === selectedStopIdx || tourStops.length <= 1;
    // Hide sold-out tiers
    const hasInventory = t.remaining > 0;
    // Hide expired tiers
    const isNotExpired = !t.sale_ends_at || new Date(t.sale_ends_at) > new Date();

    return rightStop && hasInventory && isNotExpired;
  });

  const activeMerch = isMock
    ? merch
    : (ev.merchandises || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        image: m.image_url || ev.cover,
      }));

  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedSeatsObj, setSelectedSeatsObj] = useState<any[]>([]);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [activeTicketIdForMap, setActiveTicketIdForMap] = useState<string | undefined>();

  const handleSeatSelect = (seat: any) => {
    setSelectedSeatsObj((prev) => [...prev, seat]);
    setCart((prev) => {
      const key = `${selectedStopIdx}_${seat.ticketId}`;
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  };

  const handleSeatDeselect = (code: string) => {
    const seat = selectedSeatsObj.find((s) => s.code === code);
    if (!seat) return;
    setSelectedSeatsObj((prev) => prev.filter((s) => s.code !== code));
    setCart((prev) => {
      const key = `${selectedStopIdx}_${seat.ticketId}`;
      return { ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) };
    });
  };

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

  const { data: eventVenueProjects } = useQuery({
    queryKey: ["event-venues", eventId],
    queryFn: () => getEventVenueProjects({ data: { event_id: eventId } } as any),
  });

  const currentVenueProject = eventVenueProjects?.find(
    (p: any) => p.tour_stop_idx === selectedStopIdx
  );

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
    <div className="min-h-screen bg-background text-foreground pb-[280px]">
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
              <MapPin className="h-4 w-4 text-primary" /> {venue ? `${venue}, ` : ""}
              {city}
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
              src={ev.workspaces?.organizer?.image || ev.cover}
              className="h-12 w-12 rounded-full object-cover border border-border"
              alt={organizerName}
            />
            <div>
              <p className="font-semibold leading-tight">{organizerName}</p>
              <p className="text-xs text-muted-foreground">@{organizerHandle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {organizerId && following && isLoggedIn && (
              <Button asChild size="icon" variant="outline" className="rounded-full h-8 w-8">
                <Link
                  to="/$userId/message"
                  params={{ userId: user?.id }}
                  search={{ chatId: organizerId, eventId: ev.id }}
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {organizerId && !following && (
              <Button
                size="sm"
                variant="default"
                className="rounded-full h-8 px-4 font-bold"
                onClick={() => toggleFollow(organizerId)}
              >
                Follow
              </Button>
            )}
          </div>
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
                <VenueMap
                  lat={lat}
                  lng={lng}
                  venue={venue}
                  city={city}
                  tourStops={tourStops}
                  selectedStopIdx={selectedStopIdx}
                />
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
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{description}</p>
        </div>

        {/* What's Included */}
        {isExperience && included.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">What's Included</h2>
            <div className="grid grid-cols-1 gap-3">
              {included.map((item: any, idx: number) => {
                const title = typeof item === "string" ? item : item.title;
                const description = typeof item === "string" ? null : item.description;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-3xl border border-border/40 bg-card/60 p-4 backdrop-blur"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-sm">{title}</p>
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
                  <p className="text-xs text-muted-foreground truncate">
                    {member.role || "Artist"}
                  </p>
                  {member.instagram && (
                    <a
                      href={`https://instagram.com/${member.instagram.replace("@", "")}`}
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
            <span className="text-sm text-primary">{attendeesCount.toLocaleString()} going</span>
          </div>
          {attendeesList && attendeesList.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex -space-x-3 overflow-hidden">
                {attendeesList.slice(0, 6).map((att: any, i: number) => {
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
                {attendeesList.length > 6 && (
                  <div className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold border-2 border-background">
                    +{attendeesList.length - 6}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {attendeesList.slice(0, 5).map((att: any, i: number) => {
                  const name = att.users?.handle ? `@${att.users.handle}` : att.names;
                  if (!name) return null;
                  return (
                    <span
                      key={att.id || i}
                      className="text-[10px] bg-secondary/50 text-muted-foreground px-2 py-1 rounded-md border border-border/30 font-medium"
                    >
                      {name}
                    </span>
                  );
                })}
                {attendeesList.length > 5 && (
                  <span className="text-xs text-muted-foreground self-center ml-1">
                    & {attendeesList.length - 5} more
                  </span>
                )}
              </div>
            </div>
          ) : attendeesCount > 0 ? (
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
          ) : (
            <p className="text-xs text-muted-foreground">Be the first to join!</p>
          )}
        </div>

        {/* Community Reviews */}
        <div>
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
              <Link
                to="/f/$eventId/review"
                params={{ eventId }}
                search={
                  attendeeRecord
                    ? {
                        attendeeId: attendeeRecord.id,
                        name: attendeeRecord.names,
                        email: attendeeRecord.email,
                      }
                    : undefined
                }
              >
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
              <div className="rounded-3xl border border-border/40 bg-card/60 p-6 text-center text-muted-foreground backdrop-blur">
                <p className="text-sm">No reviews yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action & Collapsible Tickets Drawer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border/50 z-40 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
        <div className="max-w-md mx-auto w-full">
          {/* Collapsible Header/Toggle */}
          <div
            className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setIsTicketsExpanded(!isTicketsExpanded)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground font-semibold">Tickets & Pricing</span>
              <ChevronUp
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isTicketsExpanded ? "rotate-180" : ""}`}
              />
            </div>
            {!isTicketsExpanded && activeTicketTiers.length > 1 && (
              <span className="text-xs text-primary font-bold">
                Show {activeTicketTiers.length - 1} more options
              </span>
            )}
          </div>

          {/* Tour Stops selection as Tabs inside the bottom sheet (Visible when expanded) */}
          {isTicketsExpanded && tourStops.length > 1 && (
            <div className="mb-4 border-t border-border/40 pt-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Select Tour Stop
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {tourStops.map((stop: any, idx: number) => {
                  const isSelected = selectedStopIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedStopIdx(idx)}
                      className={`relative snap-start flex flex-col items-start min-w-[160px] p-3.5 rounded-2xl border transition-all duration-300 shrink-0 text-left ${
                        isSelected 
                          ? "bg-primary/10 border-primary shadow-[0_4px_20px_rgba(var(--primary),0.15)] ring-1 ring-primary/20" 
                          : "bg-card border-border/40 hover:border-border hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 w-full">
                        <MapPin className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-bold truncate ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                          {stop.venue || stop.city || `Stop ${idx + 1}`}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {stop.date || "TBD"}
                        </span>
                        {stop.time && (
                          <span className="text-[10px] font-medium text-muted-foreground/80 flex items-center gap-1.5 ml-0.5">
                            <Clock className="h-2.5 w-2.5 shrink-0" />
                            {stop.time}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                         <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),1)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tickets List */}
          {isTicketsExpanded && (
            <div className="max-h-[35vh] overflow-y-auto space-y-2.5 pr-1 border-t border-border/40 pt-3 mb-4 scrollbar-hide animate-in slide-in-from-bottom-2 fade-in duration-200">
              {activeTicketTiers.map((t: any) => {
                const cartKey = `${selectedStopIdx}_${t.id}`;
                const itemQty = cart[cartKey] || 0;
                const isSelected = itemQty > 0;

                const isMapped = currentVenueProject?.sections_data?.some((s: any) => s.ticketId === t.id);

                return (
                  <div
                    key={t.id}
                    className={`w-full rounded-2xl border p-3.5 transition-all duration-300 ${isSelected ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"} ${isMapped ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (isMapped) {
                        setActiveTicketIdForMap(t.id);
                        setIsSeatModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="font-bold text-base text-primary">
                        {formatCurrency(t.price, currencyCode)}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {t.perks.join(" · ")}
                    </p>
                    <p className="text-[11px] font-medium text-primary mt-1 mb-3">
                      {t.remaining} left
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                      {isMapped ? (
                        itemQty > 0 && (
                          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {itemQty} Selected
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 shadow-sm border border-border/20" onClick={e => e.stopPropagation()}>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                            onClick={() =>
                              setCart((prev) => ({ ...prev, [cartKey]: Math.max(0, itemQty - 1) }))
                            }
                            disabled={itemQty === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center font-bold text-xs">{itemQty}</span>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                            onClick={() => setCart((prev) => ({ ...prev, [cartKey]: itemQty + 1 }))}
                            disabled={itemQty >= t.remaining}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* If minimized, show exactly one ticket option */}
          {!isTicketsExpanded && activeTicketTiers.length > 0 && (
            <div className="mb-4 border-t border-border/40 pt-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {activeTicketTiers.slice(0, 1).map((t: any) => {
                const cartKey = `${selectedStopIdx}_${t.id}`;
                const itemQty = cart[cartKey] || 0;
                const isSelected = itemQty > 0;
                const isMapped = currentVenueProject?.sections_data?.some((s: any) => s.ticketId === t.id);

                return (
                  <div
                    key={t.id}
                    className={`w-full rounded-2xl border p-3.5 transition-all duration-300 ${isSelected ? "border-primary bg-primary/10" : "border-border/40 bg-card/50"} ${isMapped ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (isMapped) {
                        setActiveTicketIdForMap(t.id);
                        setIsSeatModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="font-bold text-base text-primary">
                        {formatCurrency(t.price, currencyCode)}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {t.perks.join(" · ")}
                    </p>
                    <p className="text-[11px] font-medium text-primary mt-1 mb-3">
                      {t.remaining} left
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                      {isMapped ? (
                        itemQty > 0 && (
                          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {itemQty} Selected
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 shadow-sm border border-border/20" onClick={e => e.stopPropagation()}>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                            onClick={() =>
                              setCart((prev) => ({ ...prev, [cartKey]: Math.max(0, itemQty - 1) }))
                            }
                            disabled={itemQty === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center font-bold text-xs">{itemQty}</span>
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded-full bg-secondary text-foreground disabled:opacity-50"
                            onClick={() => setCart((prev) => ({ ...prev, [cartKey]: itemQty + 1 }))}
                            disabled={itemQty >= t.remaining}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border/30">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Total ({totalTickets} items)
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(total, currencyCode)}
              </span>
            </div>
            <Button
              asChild
              className="flex-1 h-12 rounded-xl text-sm font-bold shadow-[var(--shadow-glow)] tracking-wide"
              style={{
                background:
                  total === 0 && totalTickets > 0 ? "var(--foreground)" : "var(--gradient-primary)",
                opacity: totalTickets === 0 ? 0.5 : 1,
                pointerEvents: totalTickets === 0 ? "none" : "auto",
              }}
              onClick={() => {
                localStorage.setItem(`event_checkout_${ev.id}`, JSON.stringify(cart));
                localStorage.setItem(`event_checkout_seats_${ev.id}`, JSON.stringify(selectedSeatsObj));
              }}
            >
              <Link
                to="/book/$eventId"
                params={{ eventId: ev.id }}
                className="w-full block text-center leading-[48px]"
              >
                {total === 0 && totalTickets > 0 ? "Register for Free" : "Get Tickets"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {currentVenueProject && activeTicketIdForMap && (
        <>
          <Drawer 
            open={isSeatModalOpen} 
            onOpenChange={setIsSeatModalOpen}
            snapPoints={[0.7, 1]}
          >
            <DrawerContent className="h-[95vh] flex flex-col bg-background/95 backdrop-blur-xl px-0 pb-safe border-border/40">
              <DrawerHeader className="border-b border-border/40 flex items-center justify-between p-4 shrink-0 text-left">
                <div>
                  <DrawerTitle className="text-lg font-bold">Select Seats</DrawerTitle>
                  <p className="text-xs text-muted-foreground">
                    For {activeTicketTiers.find((t: any) => t.id === activeTicketIdForMap)?.name}
                  </p>
                </div>
              </DrawerHeader>
              <div className="flex-1 w-full bg-secondary/30 relative overflow-hidden pb-24">
                <VenueSeatSelector
                  venueProject={currentVenueProject}
                  eventTickets={activeTicketTiers}
                  bookedSeats={[]}
                  selectedSeats={selectedSeatsObj.map((s) => s.code)}
                  onSeatSelect={handleSeatSelect}
                  onSeatDeselect={handleSeatDeselect}
                  maxSelectable={10}
                  currency={currencyCode}
                  activeTicketId={activeTicketIdForMap}
                  hideLegend={true}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {isSeatModalOpen && (
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border bg-background flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-[60] pb-safe animate-in slide-in-from-bottom-full duration-300">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  {selectedSeatsObj.length} Seat{selectedSeatsObj.length !== 1 ? 's' : ''} Selected
                </span>
                <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                  {selectedSeatsObj.length > 0 ? selectedSeatsObj.map(s => s.seatName || s.code).join(", ") : "None"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-12 px-6 rounded-2xl text-base font-bold" onClick={() => setIsSeatModalOpen(false)}>
                  Back
                </Button>
                <Button className="h-12 px-8 rounded-2xl text-base font-bold" onClick={() => setIsSeatModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
