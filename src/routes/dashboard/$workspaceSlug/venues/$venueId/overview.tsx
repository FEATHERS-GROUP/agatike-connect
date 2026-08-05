import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Plus, Clock, User, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getRentableVenueById } from "@/api/rentable_venues";
import { getVenueBookings } from "@/api/venue_bookings";
import { ManualBookingDialog } from "@/components/desktop/dashboard/ManualBookingDialog";
import { BlockDateDialog } from "@/components/desktop/dashboard/BlockDateDialog";
import { SponsoredVouchersPanel } from "@/components/shared/SponsoredVouchersPanel";
import { getVenueSponsoredVoucherBatches } from "@/api/vouchers";
import { useNextCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import { format } from "date-fns";
import "temporal-polyfill/global";

// Stubbed mock data
const rentableVenues: any[] = [];

// Removed react-big-calendar localizer

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/overview")({
  component: VenueOverviewPage,
});

function VenueOverviewPage() {
  const { venueId, workspaceSlug } = useParams({ strict: false }) as any;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [facilityFilter, setFacilityFilter] = useState<string>("ALL");

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [isBlockDateOpen, setIsBlockDateOpen] = useState(false);

  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["venue_bookings", venueId],
    queryFn: () => getVenueBookings({ data: { venue_id: venueId } }),
    enabled: !!venueId,
  });

  const myEvents = useMemo(() => {
    return bookings
      .filter((b: any) => {
        if (facilityFilter === "ALL") return true;
        if (facilityFilter === "GENERAL") return !b.facility_id;
        return b.facility_id === facilityFilter;
      })
      .map((b: any) => {
        const startDate = new Date(b.start_time);
        const endDate = new Date(b.end_time);
        return {
          id: String(b.id || b.customer_name + b.start_time),
          title: b.customer_name || 'Booking',
          start: (window as any).Temporal.ZonedDateTime.from(startDate.toISOString().replace(/\.\d{3}/, '') + '[UTC]'),
          end: (window as any).Temporal.ZonedDateTime.from(endDate.toISOString().replace(/\.\d{3}/, '') + '[UTC]'),
          data: {
            paymentStatus: b.payment_status,
            status: b.status,
            customerName: b.customer_name,
            customerEmail: b.customer_email,
            customerPhone: b.customer_phone,
            date: b.date || format(new Date(b.start_time), 'yyyy-MM-dd'),
            timeStart: b.timeStart || format(new Date(b.start_time), 'HH:mm'),
            timeEnd: b.timeEnd || format(new Date(b.end_time), 'HH:mm'),
            isAllDay: false,
          },
        };
      });
  }, [bookings, facilityFilter]);

  const CustomEvent = ({ calendarEvent }: any) => {
    const isPaid = calendarEvent.data?.paymentStatus === "Paid";
    const isBlocked = calendarEvent.data?.status === "Blocked";

    if (isBlocked) {
      return (
        <div className="flex flex-col justify-center h-full gap-0.5 p-1 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 w-full">
          <span className="font-bold text-xs leading-tight truncate">❌ Blocked</span>
          <span className="text-[10px] truncate">{calendarEvent.title}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5 p-1 w-full h-full overflow-hidden text-white" style={{ background: "var(--gradient-primary)", borderRadius: "4px" }}>
        <span className="font-semibold text-xs leading-tight truncate">{calendarEvent.title}</span>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-white/20 text-[9px] uppercase tracking-wider font-bold">
            {calendarEvent.data?.status}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-bold ${isPaid ? "bg-green-400/20 text-green-100" : "bg-red-400/20 text-red-100"}`}
          >
            {calendarEvent.data?.paymentStatus}
          </span>
        </div>
      </div>
    );
  };

  console.log("overview.tsx render myEvents:", myEvents);
  
  const [eventsService] = useState(() => createEventsServicePlugin());

  const calendar = useNextCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: myEvents,
    defaultView: 'month-grid',
    callbacks: {
      onEventClick: (event) => setSelectedEvent(event)
    },
    plugins: [eventsService],
  });

  console.log("overview.tsx calendar instance:", calendar);

  // Re-sync events to calendar state if they change
  useEffect(() => {
    if (myEvents) {
       console.log("overview.tsx calling eventsService.set with:", myEvents);
       eventsService.set(myEvents);
    }
  }, [myEvents, eventsService]);

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading venue details...</div>;
  if (!venue)
    return <div className="p-8 text-center text-red-500 font-semibold">Venue not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage availability and upcoming reservations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-full shadow-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
            onClick={() => setIsBlockDateOpen(true)}
          >
            Block Dates
          </Button>
          <Button
            className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
            onClick={() => setIsManualBookingOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Manual Booking
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top: Big Calendar */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 h-[700px] flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-semibold text-lg">Booking Calendar</h3>
            {venue?.facilities_data?.length > 0 && (
              <select
                className="h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
              >
                <option value="ALL">All Bookings</option>
                <option value="GENERAL">Main Venue / General</option>
                {venue.facilities_data.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden shadow-inner sx-react-calendar-wrapper" style={{ minHeight: "500px" }}>
            <ScheduleXCalendar 
              calendarApp={calendar} 
              customComponents={{
                timeGridEvent: CustomEvent,
                dateGridEvent: CustomEvent,
                monthGridEvent: CustomEvent
              }}
            />
          </div>
        </div>

        {/* Bottom: Stats & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl border border-border/60 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-secondary/50">
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <span className="font-bold">{bookings.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-secondary/50">
                <span className="text-sm text-muted-foreground">Pending Requests</span>
                <span className="font-bold text-orange-500">{venue.pendingRequests}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-secondary/50">
                <span className="text-sm text-muted-foreground">Est. Revenue</span>
                <span className="font-bold text-green-500">
                  {venue.currency}
                  {(bookings.length * venue.pricePerDay).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/60 p-6">
            <h3 className="font-semibold mb-4">Upcoming This Week</h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3 rounded-2xl border border-border/60">
                    <p className="font-medium text-sm truncate">{b.customerName}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {b.timeStart}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming bookings.
              </p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6 mt-4">
              <div className="space-y-4 bg-secondary/20 p-4 rounded-2xl border border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedEvent.data.customerName}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                      Customer
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {selectedEvent.data.customerEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" /> {selectedEvent.data.customerPhone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Date
                  </span>
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" /> {selectedEvent.data.date}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Time
                  </span>
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {selectedEvent.data.isAllDay
                      ? "All Day"
                      : `${selectedEvent.data.timeStart} - ${selectedEvent.data.timeEnd}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Booking Status
                  </span>
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        selectedEvent.data.status === "Confirmed"
                          ? "bg-green-500/10 text-green-500"
                          : selectedEvent.data.status === "Pending"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {selectedEvent.data.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Payment Status
                  </span>
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        selectedEvent.data.paymentStatus === "Paid"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {selectedEvent.data.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <Link
                  to="/dashboard/$workspaceSlug/venues/$venueId/bookings"
                  params={{ workspaceSlug, venueId: venue.id || "" }}
                >
                  <Button className="w-full rounded-xl gap-2" variant="outline">
                    View in Bookings List <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ManualBookingDialog
        open={isManualBookingOpen}
        onOpenChange={setIsManualBookingOpen}
        venue={venue}
      />
      <BlockDateDialog open={isBlockDateOpen} onOpenChange={setIsBlockDateOpen} venue={venue} />

      <div className="mt-6">
        <SponsoredVouchersPanel
          entityId={venueId}
          entityType="venue"
          fetchBatches={() =>
            getVenueSponsoredVoucherBatches({ data: { venue_id: venueId } } as any)
          }
          queryKey={["venue-sponsored-voucher-batches", venueId]}
          entityTickets={(venue?.pricing_tiers || []).map((t: any) => ({
            id: t.id || t.name,
            name: t.name || t.label,
            cost: t.price || t.amount || 0,
          }))}
        />
      </div>
    </div>
  );
}
