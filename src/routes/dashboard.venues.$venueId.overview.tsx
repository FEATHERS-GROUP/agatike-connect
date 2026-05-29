import { createFileRoute, useParams } from "@tanstack/react-router";
import { CalendarDays, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rentableVenues, venueBookings } from "@/lib/mock-data";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const Route = createFileRoute("/dashboard/venues/$venueId/overview")({
  component: VenueOverviewPage,
});

function VenueOverviewPage() {
  const { venueId } = useParams({ strict: false });
  const venue = rentableVenues.find(v => v.id === venueId);
  const bookings = venueBookings.filter(b => b.venueId === venueId);
  
  const myEvents = bookings.map(b => {
    const [startY, startM, startD] = b.date.split("-");
    const [startHr, startMin] = b.timeStart.split(":");
    const [endHr, endMin] = b.timeEnd.split(":");
    return {
      title: `${b.customerName} (${b.status})`,
      start: new Date(Number(startY), Number(startM) - 1, Number(startD), Number(startHr), Number(startMin)),
      end: new Date(Number(startY), Number(startM) - 1, Number(startD), Number(endHr), Number(endMin)),
    };
  });

  if (!venue) return <div>Venue not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage availability and upcoming reservations.</p>
        </div>
        <Button className="rounded-full gap-2 shadow-md">
          <Plus className="h-4 w-4" /> Add Manual Booking
        </Button>
      </div>

      <div className="space-y-6">
        {/* Top: Big Calendar */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 h-[700px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Booking Calendar</h3>
          </div>
          <div className="flex-1 bg-background rounded-xl p-4 overflow-hidden border border-border/60">
            {/* Custom styles to make react-big-calendar match our theme */}
            <style>{`
              .rbc-calendar { font-family: inherit; }
              .rbc-btn-group button { color: inherit; border-color: hsl(var(--border)); }
              .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
                background-color: hsl(var(--secondary)); color: hsl(var(--foreground)); border-color: hsl(var(--border));
              }
              .rbc-toolbar button:hover { background-color: hsl(var(--secondary)/0.5); }
              .rbc-header { padding: 8px; font-weight: 600; border-bottom: 1px solid hsl(var(--border)); border-left: 1px solid hsl(var(--border)); }
              .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden; }
              .rbc-month-row, .rbc-day-bg, .rbc-time-header-content { border-color: hsl(var(--border)); }
              .rbc-off-range-bg { background: hsl(var(--secondary)/0.2); }
              .rbc-today { background: hsl(var(--secondary)/0.5); }
              .rbc-event { background-color: hsl(var(--primary)); border-radius: 6px; padding: 4px 8px; }
            `}</style>
            <Calendar
              localizer={localizer}
              events={myEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              style={{ height: "100%" }}
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
                <span className="font-bold text-green-500">{venue.currency}{(bookings.length * venue.pricePerDay).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/60 p-6">
            <h3 className="font-semibold mb-4">Upcoming This Week</h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 3).map(b => (
                  <div key={b.id} className="p-3 rounded-2xl border border-border/60">
                    <p className="font-medium text-sm truncate">{b.customerName}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.timeStart}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming bookings.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
