import { Link } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventDetails } from "@/hooks/useEventDetails";
import { VenueSeatSelector } from "@/components/shared/VenueSeatSelector";

import { EventBannerDesktop } from "./EventBannerDesktop";
import { EventCheckoutSidebar } from "./EventCheckoutSidebar";
import { EventOrganizerInfo } from "@/components/shared/event-details/EventOrganizerInfo";
import { EventAttendees } from "@/components/shared/event-details/EventAttendees";
import { EventLineup } from "@/components/shared/event-details/EventLineup";
import { EventMerch } from "@/components/shared/event-details/EventMerch";
import { EventIncluded } from "@/components/shared/event-details/EventIncluded";
import { EventReviews } from "@/components/shared/event-details/EventReviews";

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

  const d = useEventDetails(eventId, initialEvent);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <EventBannerDesktop
        cover={d.ev.cover}
        title={d.ev.title}
        category={d.category}
        date={d.date}
        time={d.time}
        venue={d.venue}
        city={d.city}
        avgRating={d.avgRating}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1fr_400px]">
        {/* Left */}
        <div className="space-y-10">
          <EventOrganizerInfo
            organizerName={d.organizerName}
            organizerHandle={d.organizerHandle}
            organizerId={d.organizerId}
            cover={d.ev.cover}
            image={d.ev.workspaces?.organizer?.image}
            eventId={d.ev.id}
          />

          <div>
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
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
              <h2 className="text-xl font-semibold">
                {d.isExperience ? "Route & Schedule" : "Venue"}
              </h2>
              {d.isExperience && Number(d.totalDistance) > 0 && (
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                  <Navigation className="h-4 w-4" />
                  <span className="font-semibold text-sm">{d.totalDistance} km total route</span>
                </div>
              )}
            </div>

            {d.isExperience && d.itinerary.length > 0 ? (
              <div className="mt-4 flex flex-col gap-8 w-full">
                {d.polylinePositions.length > 0 && (
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
                <div className="space-y-0 relative before:absolute before:top-0 before:bottom-0 before:left-5 before:-ml-px before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-2">
                  {d.itinerary.map((stop: any) => (
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

        <EventCheckoutSidebar
          ev={d.ev}
          isPastEvent={d.isPastEvent}
          isExperience={d.isExperience}
          schedules={d.schedules}
          tourStops={d.tourStops}
          selectedStopIdx={d.selectedStopIdx}
          setSelectedStopIdx={d.setSelectedStopIdx}
          activeTicketTiers={d.activeTicketTiers}
          currencyCode={d.currencyCode}
          cart={d.cart}
          setCart={d.setCart}
          currentVenueProject={d.currentVenueProject}
          setActiveTicketIdForMap={d.setActiveTicketIdForMap}
          setIsSeatModalOpen={d.setIsSeatModalOpen}
          total={d.total}
          totalTickets={d.totalTickets}
          selectedSeatsObj={d.selectedSeatsObj}
          attendeesCount={d.attendeesCount}
        />
      </div>

      <Footer />

      {d.isSeatModalOpen && d.currentVenueProject && d.activeTicketIdForMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
            {!d.isSectionActive && (
              <div className="p-4 border-b flex items-center justify-between bg-card shrink-0">
                <div>
                  <h2 className="text-xl font-bold">Select Seats</h2>
                  <p className="text-sm text-muted-foreground">
                    Pick your seats for{" "}
                    {d.activeTicketTiers.find((t: any) => t.id === d.activeTicketIdForMap)?.name}
                  </p>
                </div>
              </div>
            )}
            <div className="flex-1 bg-secondary/20 p-4 overflow-hidden relative">
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
            {!d.isSectionActive && (
              <div className="p-4 border-t flex items-center justify-between bg-background shrink-0">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-foreground">
                    {d.selectedSeatsObj.length} Seat{d.selectedSeatsObj.length !== 1 ? "s" : ""}{" "}
                    Selected
                  </span>
                  <span className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {d.selectedSeatsObj.length > 0
                      ? d.selectedSeatsObj.map((s) => s.seatName || s.code).join(", ")
                      : "None"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => d.setIsSeatModalOpen(false)}>
                    Back
                  </Button>
                  <Button onClick={() => d.setIsSeatModalOpen(false)}>Confirm Selection</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
