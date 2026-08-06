import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubscriptionById } from "@/api/space_subscriptions";
import {
  getSpaceResources,
  getSpaceResourceBookings,
  createSpaceResourceBooking,
} from "@/api/space_resources";
import { getSpaceClasses, getSessionBookings, getSpaceSessions } from "@/api/space_classes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { format, addHours, startOfHour } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LazyCalendar from "@/components/lazy/LazyCalendar";
import "temporal-polyfill/global";
import { SubscriberPortalDesktop } from "@/components/profile/subscription/SubscriberPortalDesktop";
import { SubscriberPortalMobile } from "@/components/profile/subscription/SubscriberPortalMobile";

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
  const [bookingTime, setBookingTime] = useState<string>(
    format(startOfHour(addHours(new Date(), 1)), "HH:mm"),
  );
  const [bookingDuration, setBookingDuration] = useState<number>(1);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<any>(null);

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
    queryFn: () =>
      getSubscriptionById({ data: { id: subscriptionId, user_id: user?.id, email: user?.email } }),
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

  const { data: sessions } = useQuery({
    queryKey: ["space_sessions", spaceId],
    queryFn: () => getSpaceSessions({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const calendarEvents = React.useMemo(() => {
    const getLocalZdt = (dateStr: string) => {
      const instant = (window as any).Temporal.Instant.from(new Date(dateStr).toISOString());
      return instant.toZonedDateTimeISO((window as any).Temporal.Now.timeZoneId());
    };

    const evts: any[] = [];
    if (sessions) {
      sessions.forEach((s: any) => {
        evts.push({
          id: String(s.id),
          title: `Class: ${s.class?.name || "Session"}`,
          start: getLocalZdt(s.start_time),
          end: getLocalZdt(s.end_time),
          allDay: false,
          calendarId: "session",
          resource: s,
          type: "session",
        });
      });
    }
    if (resourceBookings) {
      resourceBookings.forEach((b: any) => {
        const isMine = b.customer_id === user?.id;
        evts.push({
          id: String(b.id),
          title: isMine
            ? `My Booking: ${b.resource?.name || "Resource"}`
            : `Booked: ${b.resource?.name || "Resource"}`,
          start: getLocalZdt(b.start_time),
          end: getLocalZdt(b.end_time),
          allDay: false,
          calendarId: isMine ? "my-booking" : "other-booking",
          resource: b,
          type: "booking",
        });
      });
    }
    return evts;
  }, [sessions, resourceBookings, user?.id]);

  if (
    isSubLoading ||
    isResourcesLoading ||
    isClassesLoading ||
    isResourceBookingsLoading ||
    !sessions
  ) {
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
    <>
      <SubscriberPortalDesktop
        subscriptionId={subscriptionId}
        user={user}
        subscription={subscription}
        space={space}
        spaceId={spaceId}
        resources={resources}
        classes={classes}
        resourceBookings={resourceBookings}
        sessions={sessions}
        calendarEvents={calendarEvents}
        createBooking={createBooking}
      />
      <SubscriberPortalMobile
        subscriptionId={subscriptionId}
        user={user}
        subscription={subscription}
        space={space}
        spaceId={spaceId}
        resources={resources}
        classes={classes}
        resourceBookings={resourceBookings}
        sessions={sessions}
        calendarEvents={calendarEvents}
        createBooking={createBooking}
      />
    </>
  );
}
