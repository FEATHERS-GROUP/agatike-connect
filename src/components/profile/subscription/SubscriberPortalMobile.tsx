import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, addHours, startOfHour } from "date-fns";
import { Info, Calendar, Layers, Ticket, MapPin, Receipt, Clock, User, Phone, Instagram, MessageCircle, Building2, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { todayHours, summarizeHours } from "@/lib/hours";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LazyCalendar from "@/components/lazy/LazyCalendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SubscriberPortalMobile({
  subscriptionId,
  user,
  subscription,
  space,
  spaceId,
  resources,
  classes,
  resourceBookings,
  sessions,
  calendarEvents,
  createBooking
}: any) {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingResource, setBookingResource] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [bookingTime, setBookingTime] = useState<string>(format(startOfHour(addHours(new Date(), 1)), "HH:mm"));
  const [bookingDuration, setBookingDuration] = useState<number>(1);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<any>(null);
  const navigate = useNavigate();

  const tabs = [
    { id: "overview", icon: Info, label: "Overview" },
    { id: "sessions", icon: Calendar, label: "Schedule" },
    { id: "resources", icon: Layers, label: "Resources" },
    { id: "bookings", icon: Ticket, label: "Bookings" },
  ];

  const myResourceBookings = resourceBookings?.filter((b: any) => b.customer_id === user?.id) || [];

  return (
    <div className="md:hidden min-h-screen bg-secondary/30 flex flex-col pb-20">
      {/* Top Header Section (Orange theme like design) */}
      <div className="bg-primary pt-6 pb-10 px-6 rounded-b-[40px] text-primary-foreground shadow-sm relative">
        <button 
          onClick={() => navigate({ to: "/profile" })} 
          className="p-2 -ml-2 mb-4 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex items-center justify-center w-fit"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarImage src={space?.cover_url} className="object-cover" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                  {space?.name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{space?.name}</h1>
              <p className="text-primary-foreground/80 font-medium text-xs mt-1 mb-2">
                {space?.locations?.[0]?.city ? `${space.locations[0].city}, ` : ''}{subscription?.plan_name}
              </p>
              
              {space?.locations && space.locations.length > 0 && space.locations[0]?.opening_hours && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors w-fit text-left">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{space.locations.length} {space.locations.length === 1 ? 'Loc' : 'Locs'}</span>
                      <span className="opacity-50">·</span>
                      <Clock className="h-3 w-3 shrink-0 ml-0.5" />
                      <span className="truncate max-w-[100px]">Today: {todayHours(space.locations[0].opening_hours) || "See hours"}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 opacity-70 ml-0.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-32px)] p-4 rounded-2xl shadow-xl border-border/40 mx-4 max-h-[60vh] overflow-y-auto" align="start">
                    <div className="space-y-4">
                      {space.locations.map((loc: any, i: number) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-bold flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{[loc.name, loc.address, loc.city, loc.country].filter(Boolean).join(", ")}</span>
                          </h4>
                          {loc.opening_hours && (
                            <div className="pl-6 space-y-1">
                              {summarizeHours(loc.opening_hours).map((line: string, j: number) => {
                                const [days, hours] = line.split(": ");
                                return (
                                  <div key={j} className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{days}</span>
                                    <span className="font-medium text-foreground">{hours}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {i < space.locations.length - 1 && <div className="border-b border-border/40 my-3 pt-2" />}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {space?.description && (
                <p className="text-primary-foreground/60 text-[10px] mt-2 line-clamp-2 leading-snug max-w-[200px]">
                  {space.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5 text-primary-foreground/90 text-sm font-semibold bg-primary-foreground/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="uppercase tracking-wider text-[10px]">{subscription?.status}</span>
          </div>
          <Link to={`/profile/subscriptions/${subscriptionId}/manage`}>
            <Button className="bg-background text-primary hover:bg-background/90 rounded-full px-6 font-bold text-sm shadow-md h-10">
              Manage
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 border-t border-primary-foreground/20 pt-6">
          <div className="text-center">
            <p className="text-xl font-bold">{subscription?.price?.toLocaleString() || "0"}</p>
            <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/70 mt-1">
              {space?.currency || "RWF"} / {subscription?.billing_cycle?.substring(0, 3)}
            </p>
          </div>
          <div className="text-center border-l border-r border-primary-foreground/20 px-2">
            <p className="text-lg font-bold mt-1">{subscription?.start_date ? format(new Date(subscription.start_date), "MMM d") : "-"}</p>
            <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/70 mt-1">Start</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold mt-1">{subscription?.next_billing_date ? format(new Date(subscription.next_billing_date), "MMM d") : "-"}</p>
            <p className="text-[9px] uppercase tracking-wider font-bold text-primary-foreground/70 mt-1">Next Bill</p>
          </div>
        </div>

        {/* Hexagonal Tabs (Simplified as rounded highly-squircular buttons) */}
        <div className="flex items-center justify-center gap-4 mt-6 pb-2 pt-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center justify-center w-14 h-14 rounded-[20px] shadow-sm transition-all snap-center ${
                  isActive ? "bg-background text-primary scale-110 shadow-md" : "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-primary-foreground"}`} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 mt-6 relative z-10 space-y-4">
        {activeTab === "overview" && (
          <>
            <div className="bg-background rounded-[32px] p-6 shadow-sm border border-border/40">
               <h3 className="text-lg font-bold mb-4">Space Information</h3>
               <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap mb-6">
                 {space?.description || "No description provided."}
               </p>

               {space?.type && (
                 <div className="pt-4 border-t border-border/40">
                   <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">Facility Type</h4>
                   <div className="flex items-center gap-2 text-sm font-medium">
                     <Building2 className="h-4 w-4 text-primary" />
                     <span className="capitalize">{space.type.replace(/_/g, " ")}</span>
                   </div>
                 </div>
               )}

               {space?.locations && space.locations.length > 0 && (
                 <div className="pt-4 border-t border-border/40">
                   <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">Locations</h4>
                   <div className="space-y-3">
                     {space.locations.map((loc: any, i: number) => (
                       <div key={i} className="flex items-start gap-2 text-sm font-medium">
                         <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                         <span>{[loc.address, loc.city, loc.country].filter(Boolean).join(", ")}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {space?.socials && Object.keys(space.socials).length > 0 && (
                 <div className="pt-4 border-t border-border/40">
                   <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">Contact & Socials</h4>
                   <div className="flex flex-wrap gap-4">
                     {space.socials.phone && (
                       <div className="flex items-center gap-2 text-sm font-medium">
                         <Phone className="h-4 w-4 text-primary" />
                         <span>{space.socials.phone}</span>
                       </div>
                     )}
                     {space.socials.whatsapp && (
                       <div className="flex items-center gap-2 text-sm font-medium">
                         <MessageCircle className="h-4 w-4 text-primary" />
                         <span>{space.socials.whatsapp}</span>
                       </div>
                     )}
                     {space.socials.instagram && (
                       <div className="flex items-center gap-2 text-sm font-medium">
                         <Instagram className="h-4 w-4 text-primary" />
                         <span>{space.socials.instagram}</span>
                       </div>
                     )}
                   </div>
                 </div>
               )}
            </div>

            <div className="bg-background rounded-[32px] p-6 shadow-sm border border-border/40">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Receipt className="h-4 w-4 text-primary" />
                Recent Invoices
              </h3>
              {subscription.invoices?.length > 0 ? (
                <div className="space-y-4">
                  {subscription.invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-transparent">
                      <div>
                        <p className="text-sm font-bold text-foreground">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(inv.created_at), "MMM d, yyyy")}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 shadow-sm">
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-secondary/10 rounded-2xl">
                  <p className="text-sm text-muted-foreground font-medium">No invoices yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "sessions" && (
          <div className="bg-background rounded-[32px] p-4 shadow-sm border border-border/40">
             <div className="h-[600px] w-full rounded-2xl overflow-hidden sx-mobile-calendar">
                <React.Suspense fallback={<div className="w-full h-full bg-secondary/20 animate-pulse rounded-xl" />}>
                  <LazyCalendar
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month", "week", "day", "agenda"]}
                    defaultView="agenda"
                    className="text-sm font-medium"
                    eventPropGetter={() => ({
                      className: "border-none shadow-sm font-bold text-xs rounded-md px-2",
                      style: { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                    })}
                    onSelectEvent={(event) => setSelectedCalendarEvent(event)}
                  />
                </React.Suspense>
             </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-4">
             {resources?.length > 0 ? (
                resources.map((res: any) => (
                  <div key={res.id} className="bg-background rounded-[32px] p-5 shadow-sm border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        {res.type === "desk" ? <User className="h-6 w-6 text-primary" /> : <Building2 className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{res.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize mt-1 font-medium">{res.type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <Button 
                      className="rounded-xl px-5 h-10 font-bold shadow-sm"
                      onClick={() => { setBookingResource(res); setBookingDate(format(new Date(), "yyyy-MM-dd")); setBookingTime(format(startOfHour(addHours(new Date(), 1)), "HH:mm")); }}
                    >
                      Book
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-background rounded-[32px] border border-border/40">
                  <p className="text-muted-foreground font-semibold">No resources available.</p>
                </div>
              )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
              {myResourceBookings.length > 0 ? (
                myResourceBookings.map((b: any) => (
                  <div key={b.id} className="bg-background rounded-[32px] p-5 shadow-sm border border-border/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-foreground text-lg">{b.title}</h4>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 uppercase tracking-wider">
                        {b.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                         <MapPin className="h-4 w-4" />
                         <span>{b.resource?.name}</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                         <Calendar className="h-4 w-4" />
                         <span>{format(new Date(b.start_time), "MMM d, yyyy")}</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                         <Clock className="h-4 w-4" />
                         <span>{format(new Date(b.start_time), "h:mm a")} - {format(new Date(b.end_time), "h:mm a")}</span>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-background rounded-[32px] border border-border/40">
                  <Ticket className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-semibold">No bookings yet.</p>
                  <Button className="mt-4 rounded-xl px-6" onClick={() => setActiveTab("resources")}>Book a Resource</Button>
                </div>
              )}
          </div>
        )}
      </div>

      <Dialog open={!!bookingResource} onOpenChange={(open) => !open && setBookingResource(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 w-[90vw] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
               <Calendar className="h-5 w-5 text-primary" />
               Book {bookingResource?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="h-12 rounded-xl bg-secondary/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Duration (Hrs)</Label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(Number(e.target.value))}
                  className="h-12 rounded-xl bg-secondary/10"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              className="h-12 rounded-xl font-bold shadow-sm w-full"
              onClick={() => {
                if (!bookingResource) return;
                const start = new Date(`${bookingDate}T${bookingTime}`);
                const end = addHours(start, bookingDuration);
                createBooking.mutate({
                  object: {
                    resource_id: bookingResource.id,
                    customer_id: user?.id,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    status: "confirmed",
                    title: `Booking by ${user?.name || "Member"}`
                  }
                });
              }}
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Confirm
            </Button>
            <Button variant="ghost" className="h-12 rounded-xl w-full" onClick={() => setBookingResource(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCalendarEvent} onOpenChange={(open) => !open && setSelectedCalendarEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 w-[90vw] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
               {selectedCalendarEvent?.type === 'session' ? <Calendar className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-primary" />}
               {selectedCalendarEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4 text-sm">
             <div>
               <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Start</p>
               <p className="font-semibold">{selectedCalendarEvent?.start ? format(new Date(selectedCalendarEvent.start.epochMilliseconds ?? selectedCalendarEvent.start), "MMM d, yyyy h:mm a") : ""}</p>
             </div>
             <div>
               <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">End</p>
               <p className="font-semibold">{selectedCalendarEvent?.end ? format(new Date(selectedCalendarEvent.end.epochMilliseconds ?? selectedCalendarEvent.end), "MMM d, yyyy h:mm a") : ""}</p>
             </div>
          </div>
          <Button className="h-12 rounded-xl font-bold shadow-sm w-full mt-2" onClick={() => setSelectedCalendarEvent(null)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
