import React, { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CreditCard, MapPin, Receipt, Clock, Info, Loader2, User, Phone, Instagram, MessageCircle, Building2 } from "lucide-react";
import { format, addHours, startOfHour } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { todayHours, summarizeHours } from "@/lib/hours";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LazyCalendar from "@/components/lazy/LazyCalendar";

export function SubscriberPortalDesktop({
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

  const myResourceBookings = resourceBookings?.filter((b: any) => b.customer_id === user?.id) || [];

  return (
    <div className="hidden md:flex min-h-screen flex-col bg-background/50">
      <Navbar />
      
      <main className="flex-1 w-full pb-24 animate-in fade-in duration-700">
        {/* Header Hero */}
        <div className="relative w-full h-[55vh] min-h-[450px] shadow-sm">
          {space?.cover_url ? (
            <img src={space.cover_url} alt={space.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10" />
          
          <div className="absolute inset-0 max-w-6xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/profile" })}
              className="w-fit mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight drop-shadow-md">
                  {space?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                    {subscription.status}
                  </span>
                </div>
                
                {/* Subscription Details in Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 bg-background/50 backdrop-blur-md border border-border/30 p-6 rounded-3xl max-w-3xl shadow-sm">
                   <div className="space-y-1.5">
                     <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Plan</p>
                     <p className="font-semibold text-lg">{subscription.plan_name}</p>
                   </div>
                   <div className="space-y-1.5">
                     <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Price</p>
                     <p className="font-semibold text-lg text-primary">{subscription.price?.toLocaleString()} {space?.currency || "RWF"} <span className="text-xs text-muted-foreground font-medium">/ {subscription.billing_cycle}</span></p>
                   </div>
                   <div className="space-y-1.5">
                     <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Start Date</p>
                     <p className="font-semibold text-base">{subscription.start_date ? format(new Date(subscription.start_date), "MMM d, yyyy") : "-"}</p>
                   </div>
                   <div className="space-y-1.5">
                     <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Next Billing</p>
                     <p className="font-semibold text-base">{subscription.next_billing_date ? format(new Date(subscription.next_billing_date), "MMM d, yyyy") : "-"}</p>
                   </div>
                </div>
              </div>
              
              <div className="shrink-0">
                <Button className="rounded-2xl px-10 font-bold shadow-md h-14 text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                  Manage Subscription
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 bg-transparent border-b border-border/40 p-0 flex h-auto gap-8 w-full justify-start rounded-none overflow-x-auto overflow-y-hidden hide-scrollbar">
              {["overview", "resources", "sessions", "bookings"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-0 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors capitalize tracking-wide whitespace-nowrap"
                >
                  {tab === "sessions" ? "Classes & Sessions" : tab === "bookings" ? "My Bookings" : tab === "resources" ? "Book Resources" : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 outline-none animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Space Info */}
                <div className="md:col-span-2 space-y-8">

                  <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      Space Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-muted-foreground text-sm leading-loose whitespace-pre-wrap">
                          {space?.description || "No description provided."}
                        </p>
                      </div>

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
                  </div>
                </div>

                {/* Invoices Sidebar */}
                <div className="space-y-8">
                  <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold flex items-center gap-3 mb-6">
                      <div className="p-2 bg-secondary rounded-xl text-foreground">
                        <Receipt className="h-4 w-4" />
                      </div>
                      Recent Invoices
                    </h3>
                    {subscription.invoices?.length > 0 ? (
                      <div className="space-y-4">
                        {subscription.invoices.map((inv: any) => (
                          <div key={inv.id} className="group flex items-center justify-between p-4 rounded-2xl bg-secondary/10 hover:bg-secondary/30 border border-transparent hover:border-border/60 transition-all cursor-pointer">
                            <div>
                              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{inv.invoice_number}</p>
                              <p className="text-xs text-muted-foreground mt-1">{format(new Date(inv.created_at), "MMM d, yyyy")}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 shadow-sm">
                              {inv.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-secondary/10 rounded-2xl border border-dashed border-border/40">
                        <p className="text-sm text-muted-foreground font-medium">No invoices yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Overview Calendar */}
              <div className="mt-8 bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 max-w-xl">
                  <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Space Schedule
                  </h3>
                  <p className="text-muted-foreground text-sm">View upcoming classes, sessions, and resource bookings going on at {space?.name}.</p>
                </div>
                <div className="h-[550px] w-full rounded-2xl overflow-hidden border border-border/40 bg-background/50 p-4">
                  <React.Suspense fallback={<Skeleton className="w-full h-full rounded-xl" />}>
                    <LazyCalendar
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      views={["month", "week", "day"]}
                      defaultView="week"
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
            </TabsContent>

            {/* RESOURCES TAB */}
            <TabsContent value="resources" className="mt-0 outline-none animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm">
                <div className="mb-8 max-w-xl">
                  <h3 className="text-2xl font-bold mb-2">Book a Resource</h3>
                  <p className="text-muted-foreground leading-relaxed">Reserve meeting rooms, desks, or specialized equipment available at this space.</p>
                </div>
                
                {false ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                  </div>
                ) : resources?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {resources.map((res: any) => (
                      <div key={res.id} className="group border border-border/40 bg-secondary/5 rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 hover:shadow-md hover:bg-card transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{res.name}</h4>
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">{res.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <span className="font-medium">Up to {res.capacity} people</span>
                          </div>
                        </div>
                        <Button className="w-full rounded-xl font-bold" onClick={() => setBookingResource(res)}>
                          Select Time
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/40 max-w-2xl mx-auto">
                    <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-semibold text-lg">No resources available for booking.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Check back later or contact the space manager.</p>
                  </div>
                )}
              </div>
            </TabsContent>

          {/* SESSIONS TAB */}
          <TabsContent value="sessions" className="mt-0 outline-none animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm">
              <div className="mb-8 max-w-xl">
                <h3 className="text-2xl font-bold mb-2">Classes & Sessions</h3>
                <p className="text-muted-foreground leading-relaxed">Join scheduled activities, workshops, or fitness classes available to members.</p>
              </div>
              
              {false ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
              ) : classes?.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((cls: any) => (
                    <div key={cls.id} className="group border border-border/40 bg-secondary/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-primary/50 hover:shadow-md hover:bg-card transition-all">
                      <div className="flex gap-5 items-center w-full sm:w-auto">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{cls.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center gap-1 bg-secondary/40 px-2 py-0.5 rounded-md">
                              <Clock className="h-3.5 w-3.5" /> {cls.duration_minutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              • {cls.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full sm:w-auto rounded-xl font-bold px-6 shadow-sm">View Schedule</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/40 max-w-2xl mx-auto">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-semibold text-lg">No sessions scheduled.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">There are no upcoming classes at this time.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* MY BOOKINGS TAB */}
          <TabsContent value="bookings" className="mt-0 outline-none animate-in slide-in-from-bottom-4 fade-in duration-500">
             <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm">
              <div className="mb-8 max-w-xl">
                <h3 className="text-2xl font-bold mb-2">My Resource Bookings</h3>
                <p className="text-muted-foreground leading-relaxed">Manage your upcoming reservations and past bookings for this space.</p>
              </div>
              
              {false ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
              ) : myResourceBookings.length > 0 ? (
                <div className="space-y-4">
                  {myResourceBookings.map((b: any) => (
                    <div key={b.id} className="group border border-border/40 bg-secondary/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 hover:shadow-md hover:bg-card transition-all">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        <div>
                          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{b.title}</h4>
                          <p className="text-sm font-medium text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="bg-secondary/40 px-2.5 py-1 rounded-md text-foreground">{b.resource?.name}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> {format(new Date(b.start_time), "MMM d")}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> {format(new Date(b.start_time), "h:mm a")}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 shadow-sm uppercase tracking-wider">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/40 max-w-2xl mx-auto">
                  <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-semibold text-lg">You have no bookings yet.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1 mb-6">Secure your workspace or equipment for your next visit.</p>
                  <Button className="rounded-xl font-bold px-8" onClick={() => setActiveTab("resources")}>Book a Resource</Button>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
        </div>
      </main>

      <Dialog open={!!bookingResource} onOpenChange={(open) => !open && setBookingResource(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
               <Calendar className="h-6 w-6 text-primary" />
               Book {bookingResource?.name}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
               Select a date, time, and duration for your reservation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="h-12 rounded-xl border-border/60 bg-secondary/10 focus-visible:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="h-12 rounded-xl border-border/60 bg-secondary/10 focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Duration (Hrs)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(Number(e.target.value))}
                  className="h-12 rounded-xl border-border/60 bg-secondary/10 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => setBookingResource(null)}>Cancel</Button>
            <Button 
              className="h-12 rounded-xl px-8 font-bold shadow-sm"
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
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCalendarEvent} onOpenChange={(open) => !open && setSelectedCalendarEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
               {selectedCalendarEvent?.type === 'session' ? <Calendar className="h-6 w-6 text-primary" /> : <Clock className="h-6 w-6 text-primary" />}
               {selectedCalendarEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="space-y-1">
               <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Start</p>
               <p className="font-semibold text-foreground">{selectedCalendarEvent?.start ? format(new Date(selectedCalendarEvent.start.epochMilliseconds ?? selectedCalendarEvent.start), "MMMM d, yyyy h:mm a") : ""}</p>
             </div>
             <div className="space-y-1">
               <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">End</p>
               <p className="font-semibold text-foreground">{selectedCalendarEvent?.end ? format(new Date(selectedCalendarEvent.end.epochMilliseconds ?? selectedCalendarEvent.end), "MMMM d, yyyy h:mm a") : ""}</p>
             </div>
             {selectedCalendarEvent?.resource?.resource?.name && (
               <div className="space-y-1">
                 <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Resource</p>
                 <p className="font-semibold text-foreground">{selectedCalendarEvent.resource.resource.name}</p>
               </div>
             )}
             {selectedCalendarEvent?.resource?.class?.name && (
               <div className="space-y-1">
                 <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Class</p>
                 <p className="font-semibold text-foreground">{selectedCalendarEvent.resource.class.name}</p>
               </div>
             )}
          </div>
          <div className="flex justify-end pt-4 border-t border-border/40">
            <Button className="h-12 rounded-xl px-8 font-bold shadow-sm" onClick={() => setSelectedCalendarEvent(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
