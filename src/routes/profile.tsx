import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Settings,
  Ticket,
  Star,
  MapPin,
  Calendar,
  ChevronRight,
  Heart,
  QrCode,
  Clock,
  Bell,
  Trophy,
  Flame,
  Zap,
  Music,
  Film,
  Mic,
  ScanLine,
  LogOut,
  User,
  Repeat,
  CreditCard,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getUserAllTickets } from "@/api/user_tickets";
import { getFollowedOrganizers, getOrganizersByIds } from "@/api/organizers";
import { getUserSubscriptions } from "@/api/space_subscriptions";

import { TicketCard } from "@/components/profile/TicketCard";
import { HistoryCard } from "@/components/profile/HistoryCard";
import { favoriteCategories } from "@/components/profile/mockData";
import { ProfileDesktop } from "@/components/profile/ProfileDesktop";
import { ProfileMobile } from "@/components/profile/ProfileMobile";

type Tab = "upcoming" | "history" | "following" | "subscriptions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Agatike" },
      { name: "description", content: "Your Agatike profile, tickets and event history." },
    ],
  }),
  component: ProfilePage,
});

/* ─── Main Page ─── */
function ProfilePage() {
  const { user, signOut, refresh, isLoading } = useUserAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ["user-tickets", user?.id],
    queryFn: () => getUserAllTickets(),
    enabled: !!user,
  });

  const { data: followedIds = [] } = useQuery({
    queryKey: ["user-followed-organizers", user?.id],
    queryFn: () => getFollowedOrganizers(),
    enabled: !!user,
  });

  const { data: followedOrganizers = [], isLoading: isLoadingOrganizers } = useQuery({
    queryKey: ["user-followed-organizers-profiles", followedIds],
    queryFn: () => getOrganizersByIds({ data: { ids: followedIds } }),
    enabled: followedIds.length > 0,
  });

  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["user-subscriptions", user?.id],
    queryFn: () => getUserSubscriptions({ data: { user_id: user?.id, email: user?.email } }),
    enabled: !!user,
  });

  const parseDateInsensitively = (dateInput: any) => {
    if (!dateInput) return new Date();
    if (typeof dateInput === "string") {
      const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      }
    }
    return new Date(dateInput);
  };

  const upcomingTicketsList = tickets.filter((t: any) => {
    if (t.status === "Cancelled") return false;
    const eventDate = parseDateInsensitively(t.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const historyTicketsList = tickets.filter((t: any) => {
    if (t.status === "Cancelled") return true;
    const eventDate = parseDateInsensitively(t.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/signin" });
  };

  const joinDate = user?.created_at
    ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
        new Date(user.created_at),
      )
    : "Jan 2024";

  let userInterests: string[] = [];
  try {
    userInterests = Array.isArray(user?.interests)
      ? user.interests
      : typeof user?.interests === "string"
        ? JSON.parse(user.interests)
        : [];
  } catch (e) {
    userInterests = [];
  }

  if (isLoading || isLoadingTickets || isLoadingOrganizers || isLoadingSubscriptions) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar hideOnMobile />
        <div className="flex-1 flex flex-col items-center justify-center p-6 mt-10 md:mt-20">
          <Skeleton className="h-24 w-24 rounded-full mb-6" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-10" />
          <div className="flex gap-4 w-full max-w-md">
            <Skeleton className="flex-1 h-24 rounded-2xl" />
            <Skeleton className="flex-1 h-24 rounded-2xl" />
            <Skeleton className="flex-1 h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const logoutModal = showLogoutModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border/60 shadow-xl rounded-3xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <LogOut className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold">Sign Out</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Are you sure you want to log out of your account? You will need to sign back in to
            access your tickets.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl h-11"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ProfileDesktop
        user={user}
        joinDate={joinDate}
        historyTicketsList={historyTicketsList}
        followedOrganizers={followedOrganizers}
        upcomingTicketsList={upcomingTicketsList}
        userInterests={userInterests}
        favoriteCategories={favoriteCategories}
        setShowLogoutModal={setShowLogoutModal}
        subscriptions={subscriptions}
      />
      <ProfileMobile
        user={user}
        joinDate={joinDate}
        historyTicketsList={historyTicketsList}
        followedOrganizers={followedOrganizers}
        upcomingTicketsList={upcomingTicketsList}
        userInterests={userInterests}
        favoriteCategories={favoriteCategories}
        setShowLogoutModal={setShowLogoutModal}
        subscriptions={subscriptions}
        tab={tab}
        setTab={setTab}
      />
      {logoutModal}
    </>
  );
}
