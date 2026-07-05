import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRentableVenueById } from "@/api/rentable_venues";
import { getVenueBookings } from "@/api/venue_bookings";
import { ArrowLeft } from "lucide-react";
import type { View } from "react-big-calendar";
import { Suspense, lazy } from "react";
const Calendar = lazy(() => import("@/components/lazy/LazyCalendar"));
import { useState } from "react";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute(
  "/dashboard/$workspaceSlug/venues/$venueId/facilities_/$facilityId/bookings",
)({
  component: FacilityBookingsPage,
});

function FacilityBookingsPage() {
  const { workspaceSlug, venueId, facilityId } = useParams({ strict: false }) as any;

  const [currentView, setCurrentView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => getRentableVenueById({ data: { id: venueId } }),
    enabled: !!venueId,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["venue_bookings", venueId],
    queryFn: () => getVenueBookings({ data: { venue_id: venueId } }),
    enabled: !!venueId,
  });

  const facility = venue?.facilities_data?.find((f: any) => f.id === facilityId);

  const myEvents = bookings
    .filter((b: any) => b.facility_id === facilityId)
    .map((b: any) => {
      return {
        title: b.customer_name,
        start: new Date(b.start_time),
        end: new Date(b.end_time),
        allDay: false,
        data: {
          paymentStatus: b.payment_status,
          status: b.status,
        },
      };
    });

  const CustomEvent = ({ event }: any) => {
    const isPaid = event.data.paymentStatus === "Paid";
    const isBlocked = event.data.status === "Blocked";

    if (isBlocked) {
      return (
        <div className="flex flex-col justify-center h-full gap-0.5 p-1 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
          <span className="font-bold text-xs leading-tight truncate">❌ Blocked</span>
          <span className="text-[10px] truncate">{event.title}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5 p-0.5">
        <span className="font-semibold text-xs leading-tight truncate">{event.title}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-white/20 text-[9px] uppercase tracking-wider font-bold">
            {event.data.status}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-bold ${isPaid ? "bg-green-400/20 text-green-100" : "bg-red-400/20 text-red-100"}`}
          >
            {event.data.paymentStatus}
          </span>
        </div>
      </div>
    );
  };

  if (venueLoading || bookingsLoading)
    return <div className="p-8 text-center text-muted-foreground">Loading facility data...</div>;

  if (!facility)
    return <div className="p-8 text-center text-red-500 font-semibold">Facility not found.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
        <Link to={`/dashboard/${workspaceSlug}/venues/${venueId}/facilities`}>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{facility.name} - Bookings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            View the specific schedule and availability for this sub-venue.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/60 p-6 h-[750px] flex flex-col shadow-sm">
        <div className="flex-1 bg-background/50 rounded-2xl p-4 overflow-hidden border border-border/60 shadow-inner">
          <style>{`
            .rbc-calendar { font-family: inherit; }
            .rbc-btn-group button { 
              color: hsl(var(--muted-foreground)); 
              border-color: hsl(var(--border)/0.6); 
              transition: all 0.2s;
            }
            .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
              background-color: hsl(var(--primary)); 
              color: hsl(var(--primary-foreground)); 
              border-color: hsl(var(--primary));
              box-shadow: 0 4px 12px hsl(var(--primary)/0.3);
            }
            .rbc-toolbar button:hover:not(.rbc-active) { 
              background-color: hsl(var(--secondary)); 
              color: hsl(var(--foreground));
            }
            .rbc-header { 
              padding: 12px 0; 
              font-weight: 600; 
              color: hsl(var(--muted-foreground));
              border-bottom: 1px solid hsl(var(--border)/0.6);
            }
            .rbc-time-header-cell {
              border-left: 1px solid hsl(var(--border)/0.4);
            }
            .rbc-time-view, .rbc-month-view, .rbc-agenda-view {
              border: 1px solid hsl(var(--border)/0.4);
              border-radius: 12px;
              overflow: hidden;
              background-color: hsl(var(--card));
            }
            .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row, .rbc-time-content > * + * > * {
              border-color: hsl(var(--border)/0.4);
            }
            .rbc-timeslot-group { border-color: hsl(var(--border)/0.2); }
            .rbc-time-gutter {
               color: hsl(var(--muted-foreground));
               font-size: 0.8rem;
               background-color: hsl(var(--secondary)/0.3);
               border-right: 1px solid hsl(var(--border)/0.4);
            }
            .rbc-event {
              border-radius: 8px;
              background-color: hsl(var(--primary));
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              border: 1px solid hsl(var(--primary)/0.5);
              transition: transform 0.2s, box-shadow 0.2s;
            }
            .rbc-event:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
              z-index: 10 !important;
            }
            .rbc-off-range-bg {
              background-color: hsl(var(--secondary)/0.5);
            }
            .rbc-today {
              background-color: hsl(var(--primary)/0.05);
            }
            .rbc-current-time-indicator {
              background-color: hsl(var(--primary));
              height: 2px;
            }
            .rbc-current-time-indicator::before {
              content: '';
              position: absolute;
              left: -4px;
              top: -3px;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: hsl(var(--primary));
            }
          `}</style>
          <Suspense fallback={<div className="animate-pulse bg-muted/20 h-96 rounded-xl" />}>
            <Calendar
              events={myEvents}

              startAccessor="start"
              endAccessor="end"
              view={currentView}
              date={currentDate}
              onView={(view) => setCurrentView(view)}
              onNavigate={(date) => setCurrentDate(date)}
              components={{
                event: CustomEvent,
              }}
              formats={{
                eventTimeRangeFormat: () => "",
              }}
              popup
              tooltipAccessor={(e) =>
                `${e.title}\nStatus: ${e.data.status}\nPayment: ${e.data.paymentStatus}`
              }
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
