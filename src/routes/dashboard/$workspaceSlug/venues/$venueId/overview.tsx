import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Plus, Clock, User, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rentableVenues, venueBookings } from "@/lib/mock-data";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
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

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/overview")({
  component: VenueOverviewPage,
});

function VenueOverviewPage() {
  const { venueId, workspaceSlug } = useParams({ strict: false }) as any;
  const [currentView, setCurrentView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const venue = rentableVenues.find((v) => v.id === venueId);
  const bookings = venueBookings.filter((b) => b.venueId === venueId);

  const myEvents = bookings.map((b) => {
    const [startY, startM, startD] = b.date.split("-");
    const [startHr, startMin] = b.timeStart.split(":");
    const [endHr, endMin] = b.timeEnd.split(":");
    return {
      title: b.customerName,
      start: new Date(
        Number(startY),
        Number(startM) - 1,
        Number(startD),
        Number(startHr),
        Number(startMin),
      ),
      end: new Date(
        Number(startY),
        Number(startM) - 1,
        Number(startD),
        Number(endHr),
        Number(endMin),
      ),
      allDay: b.isAllDay,
      data: b,
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

  if (!venue) return <div>Venue not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage availability and upcoming reservations.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> Add Manual Booking
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto sm:max-w-md bg-card border-border/60">
            <SheetHeader className="mb-6">
              <SheetTitle>Manual Booking</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Block out dates or manually add a customer's reservation.
              </p>
            </SheetHeader>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer">Customer Booking</TabsTrigger>
                <TabsTrigger value="block">Block Dates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Customer / Organization Name</Label>
                      <Input
                        placeholder="e.g. John Doe or Tech Summit"
                        className="h-10 rounded-xl bg-secondary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="customer@example.com"
                          className="h-10 rounded-xl bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          placeholder="+1 234 567 8900"
                          className="h-10 rounded-xl bg-secondary/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="space-y-1.5">
                      <Label>Booking Date</Label>
                      <Input type="date" className="h-10 rounded-xl bg-secondary/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Start Time</Label>
                        <Input type="time" className="h-10 rounded-xl bg-secondary/50" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Time</Label>
                        <Input type="time" className="h-10 rounded-xl bg-secondary/50" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="space-y-1.5">
                      <Label>Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {venue.currency}
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-8 h-10 rounded-xl bg-secondary/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Booking Status</Label>
                        <select className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Payment Status</Label>
                        <select className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    className="flex-1 rounded-xl"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="block">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Reason for Blocking</Label>
                      <Input
                        placeholder="e.g. Maintenance, Private Event, Emergency Closure"
                        className="h-10 rounded-xl bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Start Date</Label>
                        <Input type="date" className="h-10 rounded-xl bg-secondary/50" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Date</Label>
                        <Input type="date" className="h-10 rounded-xl bg-secondary/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Start Time</Label>
                        <Input type="time" defaultValue="00:00" className="h-10 rounded-xl bg-secondary/50" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Time</Label>
                        <Input type="time" defaultValue="23:59" className="h-10 rounded-xl bg-secondary/50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                  >
                    Block Dates
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-6">
        {/* Top: Big Calendar */}
        <div className="bg-card rounded-3xl border border-border/60 p-6 h-[700px] flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Booking Calendar</h3>
          </div>
          <div className="flex-1 bg-background/50 rounded-2xl p-4 overflow-hidden border border-border/60 shadow-inner">
            {/* Custom styles to make react-big-calendar match our premium theme */}
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
                padding: 12px 8px; 
                font-weight: 600; 
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: hsl(var(--muted-foreground));
                border-bottom: 1px solid hsl(var(--border)/0.6); 
                border-left: 1px solid hsl(var(--border)/0.6); 
              }
              .rbc-month-view, .rbc-time-view, .rbc-agenda-view { 
                border: 1px solid hsl(var(--border)/0.6); 
                border-radius: 12px; 
                overflow: hidden; 
                background: hsl(var(--card));
              }
              .rbc-month-row, .rbc-day-bg, .rbc-time-header-content { 
                border-color: hsl(var(--border)/0.6); 
              }
              .rbc-off-range-bg { background: hsl(var(--secondary)/0.1); }
              .rbc-today { background: hsl(var(--primary)/0.05); }
              .rbc-event { 
                background: var(--gradient-primary, linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)))); 
                border: none;
                border-radius: 8px; 
                padding: 4px; 
                box-shadow: 0 2px 4px hsl(var(--primary)/0.2);
              }
              .rbc-event.rbc-selected {
                background: var(--gradient-primary);
                filter: brightness(1.1);
              }
              .rbc-date-cell { padding: 4px 8px; font-weight: 500; font-size: 0.9rem; }
              
              /* Day/Week Time View Enhancements */
              .rbc-time-view .rbc-header { border-bottom: none; }
              .rbc-time-content { border-top: 1px solid hsl(var(--border)/0.6); }
              .rbc-timeslot-group { border-bottom: 1px solid hsl(var(--border)/0.3); min-height: 60px; }
              .rbc-time-gutter .rbc-timeslot-group { border-right: 1px solid hsl(var(--border)/0.6); background: hsl(var(--secondary)/0.1); }
              .rbc-time-header-content { border-left: 1px solid hsl(var(--border)/0.6); }
              .rbc-allday-cell { background: hsl(var(--secondary)/0.2); border-bottom: 1px solid hsl(var(--border)/0.6); }
              .rbc-day-slot .rbc-events-container { margin-right: 8px; }
              .rbc-day-slot .rbc-event { border: 1px solid hsl(var(--card)); }
              
              /* Agenda View Premium Styling */
              .rbc-agenda-view table.rbc-agenda-table { 
                border-collapse: separate; 
                border-spacing: 0; 
              }
              .rbc-agenda-view table.rbc-agenda-table thead > tr > th { 
                padding: 16px; 
                text-align: left; 
                background: hsl(var(--secondary)/0.3); 
                border-bottom: 2px solid hsl(var(--border)/0.6);
                font-size: 0.8rem;
              }
              .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { 
                padding: 16px; 
                border-bottom: 1px solid hsl(var(--border)/0.3);
                vertical-align: middle;
              }
              .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover > td {
                background: hsl(var(--secondary)/0.1);
              }
              .rbc-agenda-date-cell { font-weight: 600; color: hsl(var(--foreground)); width: 15%; }
              .rbc-agenda-time-cell { font-weight: 500; color: hsl(var(--muted-foreground)); width: 20%; }
              .rbc-agenda-event-cell { font-weight: 500; }
            `}</style>
            <Calendar
              localizer={localizer}
              events={myEvents}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={(view) => setCurrentView(view)}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              onSelectEvent={(event) => setSelectedEvent(event)}
              views={["month", "week", "day", "agenda"]}
              style={{ height: "100%" }}
              components={{
                event: CustomEvent,
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
    </div>
  );
}
