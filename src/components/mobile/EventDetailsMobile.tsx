import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Share2, MapPin, Navigation, Calendar, Clock, Star, Users } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { useEventDetails } from "@/hooks/useEventDetails";
import { EventOrganizerInfo } from "@/components/shared/event-details/EventOrganizerInfo";
import { EventAttendees } from "@/components/shared/event-details/EventAttendees";
import { EventLineup } from "@/components/shared/event-details/EventLineup";
import { EventMerch } from "@/components/shared/event-details/EventMerch";
import { EventIncluded } from "@/components/shared/event-details/EventIncluded";
import { EventReviews } from "@/components/shared/event-details/EventReviews";
import { EventCheckoutDrawer } from "./EventCheckoutDrawer";
import { VenueSeatSelector } from "@/components/shared/VenueSeatSelector";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const VenueMap = lazy(() => import("@/components/site/VenueMap"));
const ExperienceMap = lazy(() => import("@/components/desktop/ExperienceMap"));

export function EventDetailsMobile({
  eventId,
  event: initialEvent,
}: {
  eventId: string;
  event?: any;
}) {
  const [isClient, setIsClient] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const d = useEventDetails(eventId, initialEvent);

  return (
    <div className="min-h-screen bg-background text-foreground pb-[140px] md:pb-24">
      {/* Sticky Top Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full ${isScrolled ? "bg-secondary text-foreground" : "bg-black/20 text-white backdrop-blur-md"}`}
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-full ${isScrolled ? "bg-secondary text-foreground" : "bg-black/20 text-white backdrop-blur-md"}`}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={d.ev.cover}
          alt={d.ev.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-5">
          <span className="w-fit rounded-full bg-background/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md text-white border border-white/20">
            {d.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white drop-shadow-md">
            {d.ev.title}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-8">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex flex-col gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold mt-1">{d.date || "Today"}</span>
            <span className="text-[11px] text-muted-foreground">{d.time || "All day"}</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-3.5 flex flex-col gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold mt-1 truncate">
              {d.venue || d.city || "TBD"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">{d.city}</span>
          </div>
        </div>

        <EventOrganizerInfo
          organizerName={d.organizerName}
          organizerHandle={d.organizerHandle}
          organizerId={d.organizerId}
          cover={d.ev.cover}
          image={d.ev.workspaces?.organizer?.image}
          eventId={d.ev.id}
        />

        <div>
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {d.description} Expect curated sound, immersive lighting and a crowd that brings the
            energy. Doors open one hour before showtime — bring an ID and your good vibes.
          </p>
        </div>

        <EventAttendees attendeesList={d.attendeesList} attendeesCount={d.attendeesCount} />

        <EventLineup staffList={d.staffList} isExperience={d.isExperience} />

        <EventMerch activeMerch={d.activeMerch} currencyCode={d.currencyCode} />

        <EventIncluded isExperience={d.isExperience} included={d.included} />

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">{d.isExperience ? "Route & Schedule" : "Venue"}</h2>
            {d.isExperience && Number(d.totalDistance) > 0 && (
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20 w-fit">
                <Navigation className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  {d.totalDistance} km total route
                </span>
              </div>
            )}
          </div>

          {d.isExperience && d.itinerary.length > 0 ? (
            <div className="mt-4 flex flex-col gap-6 w-full">
              {d.polylinePositions.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-border/60 h-[300px] relative z-10">
                  {isClient ? (
                    <Suspense
                      fallback={
                        <div className="h-full w-full bg-secondary flex items-center justify-center">
                          Loading map...
                        </div>
                      }
                    >
                      <ExperienceMap
                        itinerary={d.itinerary}
                        bounds={d.bounds}
                        mapCenter={d.mapCenter}
                        polylinePositions={d.polylinePositions}
                      />
                    </Suspense>
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      Loading map...
                    </div>
                  )}
                </div>
              )}
              <div className="w-full pl-2 pr-2">
                {d.itinerary.map((stop: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  const isLast = idx === d.itinerary.length - 1;

                  return (
                    <div key={stop.id} className="relative mb-6">
                      <div className="relative z-10 flex flex-col p-4 rounded-2xl border border-border/60 bg-card shadow-sm w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <h4 className="font-bold text-sm truncate pr-2">{stop.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">
                            {stop.time}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1 ml-8">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-tight">{stop.address}</span>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="absolute -bottom-8 left-0 right-0 h-10 w-full flex justify-center overflow-hidden pointer-events-none z-0">
                          <svg
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 40"
                            className="text-border"
                          >
                            <path
                              d={
                                isEven
                                  ? "M 20 0 Q 20 20 50 20 T 80 40"
                                  : "M 80 0 Q 80 20 50 20 T 20 40"
                              }
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-4 aspect-square overflow-hidden rounded-2xl border border-border/60 bg-secondary relative z-0">
              {isClient ? (
                <Suspense
                  fallback={
                    <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground">
                      Loading map...
                    </div>
                  }
                >
                  <VenueMap
                    lat={d.lat}
                    lng={d.lng}
                    venue={d.venue}
                    city={d.city}
                    tourStops={d.tourStops}
                    selectedStopIdx={d.selectedStopIdx}
                  />
                </Suspense>
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,oklch(0.95_0.02_60),oklch(0.85_0.05_50))] flex items-center justify-center text-muted-foreground">
                  <MapPin className="mr-2 h-5 w-5" /> {d.venue ? `${d.venue}, ` : ""}
                  {d.city}
                </div>
              )}
            </div>
          )}
        </div>

        <EventReviews
          eventId={eventId}
          feedbackData={d.feedbackData}
          avgRating={d.avgRating}
          reviews={d.reviews}
          attendeeRecord={d.attendeeRecord}
        />
      </div>

      <EventCheckoutDrawer
        ev={d.ev}
        isExperience={d.isExperience}
        schedules={d.schedules}
        tourStops={d.tourStops}
        selectedStopIdx={d.selectedStopIdx}
        setSelectedStopIdx={d.setSelectedStopIdx}
        hasSelectedStop={d.hasSelectedStop}
        setHasSelectedStop={d.setHasSelectedStop}
        isTicketsExpanded={isTicketsExpanded}
        setIsTicketsExpanded={setIsTicketsExpanded}
        isSeatModalOpen={d.isSeatModalOpen}
        setIsSeatModalOpen={d.setIsSeatModalOpen}
        activeTicketTiers={d.activeTicketTiers}
        currencyCode={d.currencyCode}
        cart={d.cart}
        setCart={d.setCart}
        currentVenueProject={d.currentVenueProject}
        setActiveTicketIdForMap={d.setActiveTicketIdForMap}
        total={d.total}
        totalTickets={d.totalTickets}
        selectedSeatsObj={d.selectedSeatsObj}
      />

      {d.currentVenueProject && d.activeTicketIdForMap && (
        <>
          <Drawer open={d.isSeatModalOpen} onOpenChange={d.setIsSeatModalOpen}>
            <DrawerContent className="h-[95vh] flex flex-col bg-background/95 backdrop-blur-xl px-0 pb-safe border-border/40">
              {!d.isSectionActive && (
                <DrawerHeader className="border-b border-border/40 flex items-center justify-between p-4 shrink-0 text-left">
                  <div>
                    <DrawerTitle className="text-lg font-bold">Select Seats</DrawerTitle>
                    <p className="text-xs text-muted-foreground">
                      For {d.activeTicketTiers.find((t: any) => t.id === d.activeTicketIdForMap)?.name}
                    </p>
                  </div>
                </DrawerHeader>
              )}
              <div className="flex-1 w-full bg-secondary/30 relative overflow-hidden pb-24">
                <VenueSeatSelector
                  venueProject={d.currentVenueProject}
                  eventTickets={d.activeTicketTiers}
                  bookedSeats={
                    d.rawAttendeesList
                      ?.filter((a: any) => a.custom_fields?.tour_stop_idx === d.selectedStopIdx)
                      .map((a: any) => a.custom_fields?.seat)
                      .filter(Boolean) || []
                  }
                  selectedSeats={d.selectedSeatsObj.map((s) => s.code)}
                  onSeatSelect={d.handleSeatSelect}
                  onSeatDeselect={d.handleSeatDeselect}
                  maxSelectable={0}
                  currency={d.currencyCode}
                  activeTicketId={d.activeTicketIdForMap}
                  hideLegend={true}
                  onSectionActive={d.setIsSectionActive}
                />
              </div>

              <div className="mt-auto p-4 border-t border-border bg-background flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.12)] pb-safe shrink-0">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {d.selectedSeatsObj.length} Seat{d.selectedSeatsObj.length !== 1 ? "s" : ""}{" "}
                    Selected
                  </span>
                  <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {d.selectedSeatsObj.length > 0
                      ? d.selectedSeatsObj.map((s) => s.seatName || s.code).join(", ")
                      : "None"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-2xl text-base font-bold"
                    onClick={() => d.setIsSeatModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-12 px-6 rounded-2xl text-base font-bold shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                    onClick={() => d.setIsSeatModalOpen(false)}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
