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
        <div className="flex flex-col justify-center h-full w-full p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg border border-red-500/20 shadow-sm backdrop-blur-sm transition-all hover:bg-red-500/20">
          <span className="font-semibold text-xs leading-tight truncate">❌ Blocked</span>
          <span className="text-[10px] truncate opacity-80 mt-0.5">{event.title}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full w-full p-2 bg-primary text-primary-foreground rounded-lg border border-primary/20 shadow-sm hover:shadow-md transition-all hover:brightness-110">
        <span className="font-semibold text-xs leading-tight truncate">{event.title}</span>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="px-1.5 py-0.5 rounded-md bg-background/20 text-[9px] uppercase tracking-wider font-bold backdrop-blur-md">
            {event.data.status}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-bold backdrop-blur-md ${isPaid ? "bg-green-400/30 text-green-50" : "bg-orange-400/30 text-orange-50"}`}
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
        <Link
          to="/dashboard/$workspaceSlug/venues/$venueId/facilities"
          params={{ workspaceSlug, venueId }}
        >
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
            /* Reset calendar font */
            .rbc-calendar { 
              font-family: inherit; 
              color: hsl(var(--foreground));
            }
            
            /* Toolbar styling */
            .rbc-toolbar {
              margin-bottom: 24px;
              gap: 16px;
              flex-wrap: wrap;
            }
            .rbc-toolbar-label {
              font-size: 1.125rem;
              font-weight: 600;
              color: hsl(var(--foreground));
            }
            .rbc-btn-group {
              display: flex;
              gap: 4px;
            }
            .rbc-btn-group button { 
              color: hsl(var(--muted-foreground)); 
              background: hsl(var(--secondary)/0.5);
              border: 1px solid hsl(var(--border)); 
              border-radius: 8px !important;
              padding: 6px 16px;
              font-size: 0.875rem;
              font-weight: 500;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .rbc-btn-group button:hover {
              background: hsl(var(--secondary));
              color: hsl(var(--foreground));
            }
            .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
              background-color: hsl(var(--primary)) !important; 
              color: hsl(var(--primary-foreground)) !important; 
              border-color: hsl(var(--primary)) !important;
              box-shadow: 0 4px 12px hsl(var(--primary)/0.25);
            }
            
            /* Header and Grid styling */
            .rbc-header { 
              padding: 16px 8px; 
              font-weight: 600;
              font-size: 0.875rem; 
              color: hsl(var(--muted-foreground));
              border-bottom: 1px solid hsl(var(--border));
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .rbc-time-header-cell {
              border-left: 1px solid hsl(var(--border)/0.5);
            }
            .rbc-time-view, .rbc-month-view, .rbc-agenda-view {
              border: 1px solid hsl(var(--border));
              border-radius: 16px;
              overflow: hidden;
              background-color: hsl(var(--card));
              box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row, .rbc-time-content > * + * > * {
              border-color: hsl(var(--border)/0.5);
            }
            .rbc-timeslot-group { 
              border-color: hsl(var(--border)/0.3); 
              min-height: 48px;
            }
            .rbc-time-gutter {
               color: hsl(var(--muted-foreground));
               font-size: 0.75rem;
               font-weight: 500;
               background-color: hsl(var(--secondary)/0.3);
               border-right: 1px solid hsl(var(--border)/0.5);
               padding: 0 8px;
            }
            
            /* Event styling - remove default backgrounds to let Tailwind handle it */
            .rbc-event {
              background: transparent !important;
              border: none !important;
              padding: 2px !important;
            }
            .rbc-event-content {
              height: 100%;
            }
            .rbc-event.rbc-selected {
              background: transparent !important;
            }
            
            /* Time indicator */
            .rbc-current-time-indicator {
              background-color: hsl(var(--primary));
              height: 2px;
              z-index: 3;
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
            
            /* Today highlight */
            .rbc-today {
              background-color: hsl(var(--primary)/0.03);
            }
            .rbc-off-range-bg {
              background-color: hsl(var(--secondary)/0.3);
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
              tooltipAccessor={(e: any) =>
                `${e.title}\nStatus: ${e.data.status}\nPayment: ${e.data.paymentStatus}`
              }
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
