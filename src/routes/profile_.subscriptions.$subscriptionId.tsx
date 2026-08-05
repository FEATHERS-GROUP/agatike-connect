import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubscriptionById } from "@/api/space_subscriptions";
import { getSpaceResources, getSpaceResourceBookings, createSpaceResourceBooking } from "@/api/space_resources";
import { getSpaceClasses, getSessionBookings } from "@/api/space_classes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CreditCard, MapPin, Receipt, Clock, Info, Loader2 } from "lucide-react";
import { format, addHours, startOfHour } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile_/subscriptions/$subscriptionId")({
  head: () => ({
    meta: [{ title: "Subscriber Portal — Agatike" }],
  }),
  component: SubscriberPortal,
});

function SubscriberPortal() {
  const { subscriptionId } = Route.useParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const [bookingResource, setBookingResource] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [bookingTime, setBookingTime] = useState<string>(format(startOfHour(addHours(new Date(), 1)), "HH:mm"));
  const [bookingDuration, setBookingDuration] = useState<number>(1);

  const createBooking = useMutation({
    mutationFn: (data: any) => createSpaceResourceBooking({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_resource_bookings", spaceId] });
      setBookingResource(null);
      setActiveTab("bookings");
    },
  });

  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: () => getSubscriptionById({ data: { id: subscriptionId, user_id: user?.id, email: user?.email } }),
    enabled: !!user && !!subscriptionId,
  });

  const spaceId = subscription?.space_id;

  const { data: resources, isLoading: isResourcesLoading } = useQuery({
    queryKey: ["space_resources", spaceId],
    queryFn: () => getSpaceResources({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: classes, isLoading: isClassesLoading } = useQuery({
    queryKey: ["space_classes", spaceId],
    queryFn: () => getSpaceClasses({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: resourceBookings, isLoading: isResourceBookingsLoading } = useQuery({
    queryKey: ["space_resource_bookings", spaceId],
    queryFn: () => getSpaceResourceBookings({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  if (isSubLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col pt-24 px-4 max-w-5xl mx-auto w-full gap-4">
          <Skeleton className="w-32 h-10 mb-4" />
          <Skeleton className="w-full h-64 rounded-2xl" />
          <div className="flex gap-4">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
          <Skeleton className="w-full h-40" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-24">
          <p className="text-muted-foreground">Subscription not found or access denied.</p>
          <Button variant="link" onClick={() => navigate({ to: "/profile" })}>
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  const space = subscription.space;
  const myResourceBookings = resourceBookings?.filter((b: any) => b.customer_id === user?.id) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 max-w-6xl mx-auto w-full pt-20 pb-24 px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/profile" })}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
          </Button>

          <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-6 shadow-sm">
            {space?.cover_url ? (
              <img src={space.cover_url} alt={space.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{space?.name}</h1>
              <div className="flex items-center gap-3 text-white/80">
                <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md uppercase tracking-wider">
                  {subscription.status}
                </span>
                <span className="text-sm">{subscription.plan_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-secondary/20 border border-border/40 p-1 rounded-xl flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Book Resources
            </TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Classes & Sessions
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              My Bookings
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Billing Info */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)]">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" /> Subscription Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Plan</p>
                      <p className="font-medium">{subscription.plan_name}</p>
                    </div>
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="font-medium">{subscription.price?.toLocaleString()} {space?.currency || "RWF"} / {subscription.billing_cycle}</p>
                    </div>
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                      <p className="font-medium">{subscription.start_date ? format(new Date(subscription.start_date), "MMM d, yyyy") : "-"}</p>
                    </div>
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/40">
                      <p className="text-sm text-muted-foreground mb-1">Next Billing</p>
                      <p className="font-medium">{subscription.next_billing_date ? format(new Date(subscription.next_billing_date), "MMM d, yyyy") : "-"}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-border/40 flex justify-end">
                    <Button>Renew Subscription</Button>
                  </div>
                </div>

                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)]">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-primary" /> Space Information
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {space?.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Invoices Sidebar */}
              <div className="space-y-6">
                <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)]">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Receipt className="h-5 w-5 text-primary" /> Recent Invoices
                  </h3>
                  {subscription.invoices?.length > 0 ? (
                    <div className="space-y-3">
                      {subscription.invoices.map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border/40">
                          <div>
                            <p className="text-sm font-medium">{inv.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(inv.created_at), "MMM d, yyyy")}</p>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                            {inv.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No invoices yet.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* RESOURCES TAB */}
          <TabsContent value="resources" className="mt-0">
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-semibold mb-2">Book a Resource</h3>
              <p className="text-muted-foreground text-sm mb-6">Reserve meeting rooms, desks, or equipment.</p>
              
              {isResourcesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
              ) : resources?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {resources.map((res: any) => (
                    <div key={res.id} className="border border-border/60 rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{res.name}</h4>
                          <span className="text-xs font-medium bg-secondary/30 px-2 py-0.5 rounded-full">{res.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">Capacity: {res.capacity} people</p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setBookingResource(res)}>
                        Book Resource
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border/60 rounded-xl">
                  <MapPin className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No resources available for booking.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* SESSIONS TAB */}
          <TabsContent value="sessions" className="mt-0">
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-semibold mb-2">Upcoming Classes & Sessions</h3>
              <p className="text-muted-foreground text-sm mb-6">Join scheduled activities in this space.</p>
              
              {isClassesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : classes?.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((cls: any) => (
                    <div key={cls.id} className="border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/40 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cls.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> {cls.duration_minutes} min • {cls.category}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">View Schedule</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border/60 rounded-xl">
                  <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No sessions scheduled.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* MY BOOKINGS TAB */}
          <TabsContent value="bookings" className="mt-0">
             <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-semibold mb-6">My Resource Bookings</h3>
              
              {isResourceBookingsLoading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : myResourceBookings.length > 0 ? (
                <div className="space-y-4">
                  {myResourceBookings.map((b: any) => (
                    <div key={b.id} className="border border-border/60 rounded-xl p-4 flex justify-between items-center bg-secondary/5">
                      <div>
                        <h4 className="font-medium">{b.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{b.resource?.name}</span>
                          <span>•</span>
                          <span>{format(new Date(b.start_time), "MMM d, h:mm a")}</span>
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border/60 rounded-xl">
                  <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">You have no bookings yet.</p>
                  <Button variant="link" onClick={() => setActiveTab("resources")}>Book a resource</Button>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </main>
      <Footer />

      <Dialog open={!!bookingResource} onOpenChange={(open) => !open && setBookingResource(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book {bookingResource?.name}</DialogTitle>
            <DialogDescription>Select date and time for your reservation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (Hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBookingResource(null)}>Cancel</Button>
            <Button 
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
              {createBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
