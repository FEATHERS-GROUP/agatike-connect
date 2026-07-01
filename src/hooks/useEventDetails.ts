import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventFeedbackPublic } from "@/api/feedback";
import { checkUserAttendance, getEventAttendees } from "@/api/attendees";
import { getEventVenueProjects } from "@/api/venues";
import { getEventStaff } from "@/api/staff";
import {
  events,
  experiences,
  movies,
  ticketTiers,
  merch,
  experienceCategories,
} from "@/lib/mock-data";
import { getDistanceFromLatLonInKm } from "@/lib/utils";

export function useEventDetails(eventId: string, initialEvent?: any) {
  const ev = useMemo(() => {
    return (
      initialEvent ||
      events.find((e) => e.id === eventId) ||
      experiences.find((x) => x.id === eventId) ||
      movies.find((m) => m.id === eventId) ||
      events[0]
    );
  }, [eventId, initialEvent]);

  const isMock = !!ev.organizer || !!ev.host || !!ev.cinema;
  const category = ev.category || ev.genre || "Event";
  const isExperience =
    ev.event_type === "experience" ||
    ev.eventType === "experience" ||
    category.toLowerCase() === "experience" ||
    experienceCategories.includes(category);

  const spots = isMock
    ? ev.spots || 0
    : ev.event_tickets?.reduce(
        (acc: number, t: any) => acc + parseInt(t.remaining || "0", 10),
        0,
      ) || 0;

  const primaryDateStr = isMock ? ev.date : ev.event_requency?.date || ev.date || "TBD";

  const schedules = isExperience
    ? [
        ...(primaryDateStr && primaryDateStr !== "TBD"
          ? [
              {
                id: `primary-${ev.id}`,
                date: primaryDateStr,
                total_spots: spots,
                spots_filled:
                  ev.event_tickets?.reduce((acc: number, t: any) => acc + Number(t.sold || 0), 0) ||
                  0,
              },
            ]
          : []),
        ...(Array.isArray(ev.schedules) ? ev.schedules : []),
      ]
    : [];

  const tourStops =
    Array.isArray(ev.tour_stops) && ev.tour_stops.length > 0
      ? ev.tour_stops
      : ev.tour_stops && typeof ev.tour_stops === "object" && !Array.isArray(ev.tour_stops)
        ? [ev.tour_stops]
        : [{ city: ev.city, venue: ev.venue, date: ev.date, time: ev.time }];

  const [selectedStopIdx, setSelectedStopIdx] = useState(0);
  const [hasSelectedStop, setHasSelectedStop] = useState(
    isExperience ? schedules.length <= 1 : tourStops.length <= 1,
  );

  const currentStop = tourStops[selectedStopIdx] || tourStops[0];
  const isUpcoming = currentStop?.is_upcoming === true;
  const timerDate = currentStop?.timer_date;
  const waitlistUrl = currentStop?.waitlist_url;

  const dateStr = isMock ? ev.date : currentStop.date || "TBD";
  const date = isUpcoming
    ? timerDate
      ? `Drops ${new Date(timerDate).toLocaleDateString("en-US")}`
      : "Coming Soon"
    : dateStr;
  const time = isMock ? ev.time || ev.duration : currentStop.time || "";
  const venue = isMock ? ev.venue || ev.cinema : currentStop.venue || "";
  const city = isMock ? ev.city : currentStop.venue || currentStop.city || "";

  const rawLat = isMock ? ev.lat : currentStop.latitude || currentStop.lat;
  const rawLng = isMock ? ev.lng : currentStop.longitude || currentStop.lng;
  let lat = rawLat ? parseFloat(rawLat) : -1.9441;
  let lng = rawLng ? parseFloat(rawLng) : 30.0619;
  if (isNaN(lat)) lat = -1.9441;
  if (isNaN(lng)) lng = 30.0619;

  const organizerName = isMock
    ? ev.organizer || ev.host || ev.cinema
    : ev.workspaces?.organizer?.name || ev.workspaces?.name || "Organizer";
  const organizerHandle = isMock ? ev.organizerHandle : ev.workspaces?.organizer?.handle || "host";
  const organizerId = ev.workspaces?.organizer?.id || ev.workspaces?.orgnizer_id || ev.workspace_id;

  const currencyCode = isMock ? ev.currency : ev.workspaces?.currency;
  const description = ev.description || ev.synopsis || "";
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

  let itinerary: any[] = [];
  if (isExperience) {
    if (Array.isArray(ev.itinerary) && ev.itinerary.length > 0) {
      itinerary = ev.itinerary;
    } else if (
      ev.tour_stops &&
      Array.isArray(ev.tour_stops.itinerary) &&
      ev.tour_stops.itinerary.length > 0
    ) {
      itinerary = ev.tour_stops.itinerary;
    } else if (
      Array.isArray(ev.tour_stops) &&
      ev.tour_stops[0]?.itinerary &&
      Array.isArray(ev.tour_stops[0].itinerary) &&
      ev.tour_stops[0].itinerary.length > 0
    ) {
      itinerary = ev.tour_stops[0].itinerary;
    }
  }

  const totalDistance = useMemo(() => {
    let distance = 0;
    const validStops = itinerary.filter(
      (stop: any) =>
        stop.lat != null &&
        stop.lng != null &&
        !isNaN(Number(stop.lat)) &&
        !isNaN(Number(stop.lng)),
    );
    validStops.forEach((stop: any, i: number) => {
      if (i > 0) {
        const prev = validStops[i - 1];
        distance += getDistanceFromLatLonInKm(
          Number(prev.lat),
          Number(prev.lng),
          Number(stop.lat),
          Number(stop.lng),
        );
      }
    });
    return distance.toFixed(1);
  }, [itinerary]);

  const included = isExperience
    ? Array.isArray(ev.included) && ev.included.length > 0
      ? ev.included
      : ev.tour_stops?.included || []
    : [];

  const polylinePositions: [number, number][] = itinerary
    .filter(
      (stop: any) =>
        stop.lat != null &&
        stop.lng != null &&
        !isNaN(Number(stop.lat)) &&
        !isNaN(Number(stop.lng)),
    )
    .map((stop: any) => [Number(stop.lat), Number(stop.lng)] as [number, number]);

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
          name: t.name || t.type,
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
    const rightStop = isExperience
      ? true
      : t.tour_stop_idx === selectedStopIdx || tourStops.length <= 1;
    // Hide sold-out tiers
    const hasInventory = t.remaining > 0;
    // Hide expired tiers
    const isNotExpired = !t.sale_ends_at || new Date(t.sale_ends_at) > new Date();

    return rightStop && hasInventory && isNotExpired;
  });

  const isPastEvent = useMemo(() => {
    if (!date || date === "TBD") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    return !isNaN(eventDate.getTime()) && eventDate < today;
  }, [date]);

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
  const [isSectionActive, setIsSectionActive] = useState(false);
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

  const { data: staffData = [] } = useQuery({
    queryKey: ["event-staff", eventId],
    queryFn: async () => {
      if (isMock) return [];
      const res = await getEventStaff({ data: { event_id: eventId } } as any);
      return res || [];
    },
    enabled: !!eventId && !isMock,
  });

  const staffList = useMemo(() => {
    if (isMock) return lineup;
    return staffData.map((s: any) => {
      const isUnregistered = !s.user_id && (s.first_name || s.last_name);
      const displayName = isUnregistered
        ? `${s.first_name || ""} ${s.last_name || ""}`.trim()
        : `User ${s.user_id?.substring(0, 6) || "Unknown"}`;
      return {
        id: s.id,
        name: displayName,
        role: s.role,
        avatar: s.profile_image,
      };
    });
  }, [staffData, lineup, isMock]);

  const { data: attendeeRecord } = useQuery({
    queryKey: ["check-attendance", eventId],
    queryFn: () => checkUserAttendance({ data: { event_id: eventId } } as any),
  });

  const { data: eventVenueProjects } = useQuery({
    queryKey: ["event-venues", eventId],
    queryFn: () => getEventVenueProjects({ data: { event_id: eventId } } as any),
  });

  const currentVenueProject = eventVenueProjects?.find(
    (p: any) => p.tour_stop_idx === selectedStopIdx,
  );

  const { data: rawAttendeesList = [] } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => getEventAttendees({ data: { event_id: eventId } } as any),
  });

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

  return {
    ev,
    isPastEvent,
    isMock,
    isExperience,
    category,
    schedules,
    tourStops,
    selectedStopIdx,
    setSelectedStopIdx,
    hasSelectedStop,
    setHasSelectedStop,
    currentStop,
    date,
    time,
    venue,
    city,
    lat,
    lng,
    organizerName,
    organizerHandle,
    organizerId,
    currencyCode,
    description,
    attendeesCount,
    lineup,
    itinerary,
    totalDistance,
    included,
    polylinePositions,
    mapCenter,
    bounds,
    activeTicketTiers,
    activeMerch,
    cart,
    setCart,
    selectedSeatsObj,
    setSelectedSeatsObj,
    isSeatModalOpen,
    setIsSeatModalOpen,
    isSectionActive,
    setIsSectionActive,
    activeTicketIdForMap,
    setActiveTicketIdForMap,
    handleSeatSelect,
    handleSeatDeselect,
    total,
    totalTickets,
    feedbackData,
    staffData,
    staffList,
    attendeeRecord,
    eventVenueProjects,
    currentVenueProject,
    rawAttendeesList,
    attendeesList,
    reviews,
    avgRating,
    isUpcoming,
    timerDate,
    waitlistUrl,
  };
}
