import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SessionBookingModal } from "./SessionBookingModal";
import { ResourceBookingModal } from "./ResourceBookingModal";
import { OverviewTab } from "./tabs/OverviewTab";
import { ResourcesTab } from "./tabs/ResourcesTab";
import { SessionsTab } from "./tabs/SessionsTab";
import { BookingsTab } from "./tabs/BookingsTab";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Receipt,
  Clock,
  Info,
  Loader2,
  User,
  Phone,
  Instagram,
  MessageCircle,
  Building2,
} from "lucide-react";
import { format, addHours, startOfHour, isSameDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  createBooking,
}: any) {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingResource, setBookingResource] = useState<any>(null);
  const [bookingTime, setBookingTime] = useState<string>(
    format(startOfHour(addHours(new Date(), 1)), "HH:mm"),
  );
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
              onClick={() => window.history.back()}
              className="w-fit mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
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
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Plan
                    </p>
                    <p className="font-semibold text-lg">{subscription.plan_name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Price
                    </p>
                    <p className="font-semibold text-lg text-primary">
                      {subscription.price?.toLocaleString()}{" "}
                      {space?.workspace?.currency || space?.currency || "RWF"}{" "}
                      <span className="text-xs text-muted-foreground font-medium">
                        / {subscription.billing_cycle}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Start Date
                    </p>
                    <p className="font-semibold text-base">
                      {subscription.start_date
                        ? format(new Date(subscription.start_date), "MMM d, yyyy")
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Next Billing
                    </p>
                    <p className="font-semibold text-base">
                      {subscription.next_billing_date
                        ? format(new Date(subscription.next_billing_date), "MMM d, yyyy")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link to={`/profile/subscriptions/${subscriptionId}/manage`}>
                  <Button className="rounded-2xl px-10 font-bold shadow-md h-14 text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                    Manage Subscription
                  </Button>
                </Link>
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
                  {tab === "sessions"
                    ? "Classes & Sessions"
                    : tab === "bookings"
                      ? "My Bookings"
                      : tab === "resources"
                        ? "Book Resources"
                        : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 outline-none">
              <OverviewTab space={space} subscription={subscription} />
            </TabsContent>

            {/* RESOURCES TAB */}
            <TabsContent value="resources" className="mt-0 outline-none">
              <ResourcesTab resources={resources} onBookResource={setBookingResource} />
            </TabsContent>

            {/* SESSIONS TAB */}
            <TabsContent value="sessions" className="mt-0 outline-none">
              <SessionsTab
                sessions={sessions}
                onBookSession={(session) => setSelectedCalendarEvent({ resource: session })}
                space={space}
              />
            </TabsContent>

            {/* MY BOOKINGS TAB */}
            <TabsContent value="bookings" className="mt-0 outline-none">
              <BookingsTab
                myResourceBookings={myResourceBookings}
                setActiveTab={setActiveTab}
                isLoading={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ResourceBookingModal
        isOpen={!!bookingResource}
        onClose={() => setBookingResource(null)}
        resource={bookingResource}
        space={space}
        user={user}
        onSuccess={() => {
          // Refetch if necessary
        }}
      />

      <SessionBookingModal
        isOpen={!!selectedCalendarEvent}
        onClose={() => setSelectedCalendarEvent(null)}
        session={selectedCalendarEvent?.resource}
        space={space}
        user={user}
      />
    </div>
  );
}
