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

// Stubbed mock data
const events: any[] = [];
const organizers: any[] = [];
const movies: any[] = [];
const experiences: any[] = [];

const mockSubscriptions = [
  {
    id: "sub_1",
    title: "Premium Gym Access",
    venue: "Fit & Flex Center",
    type: "Monthly",
    status: "Active",
    nextBilling: "2026-07-14",
    price: "$50.00",
    cover:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "sub_2",
    title: "Gold Swimming Session",
    venue: "Aqua Oasis",
    type: "Monthly",
    status: "Expiring Soon",
    nextBilling: "2026-06-20",
    price: "$30.00",
    cover:
      "https://images.unsplash.com/photo-1519315901367-f34f9274ceb3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "sub_3",
    title: "Dedicated Workspace",
    venue: "Kigali Tech Hub",
    type: "Monthly",
    status: "Active",
    nextBilling: "2026-07-01",
    price: "$150.00",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop",
  },
];

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Agatike" },
      { name: "description", content: "Your Agatike profile, tickets and event history." },
    ],
  }),
  component: ProfilePage,
});

export const upcomingTickets = [
  {
    ...events[0],
    id: "t1",
    ticketCategory: "event",
    ticketType: "VIP",
    seat: "Section A · Row 3 · Seat 12",
    orderId: "AGT-1000",
  },
  {
    ...movies[0],
    id: "t2",
    ticketCategory: "movie",
    ticketType: "Standard",
    seat: "Row H · Seat 4",
    orderId: "AGT-1001",
  },
  {
    ...experiences[0],
    id: "t3",
    ticketCategory: "experience",
    ticketType: "Pass",
    seat: "General Admission",
    orderId: "AGT-1002",
  },
  {
    ...events[2], // "Africa Tech Summit"
    id: "t4",
    ticketCategory: "conference",
    ticketType: "Attendee",
    seat: "All Access",
    orderId: "AGT-1003",
  },
  {
    ...events[4], // Free Fest
    id: "t5",
    price: 0,
    ticketCategory: "free",
    ticketType: "Guest",
    seat: "RSVP",
    orderId: "AGT-1004",
  },
] as any[];

const pastEvents = events.slice(2, 6).map((e, i) => ({
  ...e,
  histRating: 3 + (i % 3),
  rated: i % 2 === 0,
}));

// Mock user favorite categories
const favoriteCategories = [
  {
    label: "Music",
    icon: Music,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    label: "Sports",
    icon: Trophy,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Cinema",
    icon: Film,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    label: "Conferences",
    icon: Mic,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

type Tab = "upcoming" | "history" | "following" | "subscriptions";

/* ─── Ticket Components ─── */
function TicketCard({ ticket }: { ticket: any }) {
  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startDate = new Date(ticket.eventDate || ticket.date);
    if (isNaN(startDate.getTime())) {
      startDate.setTime(Date.now());
    }
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const title = ticket.title || "Agatike Event";
    const location = ticket.venueName
      ? `${ticket.venueName}, ${ticket.city || ""}`
      : ticket.city || "";

    const formatDateForCal = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${formatDateForCal(startDate)}\nDTEND:${formatDateForCal(endDate)}\nSUMMARY:${title}\nLOCATION:${location}\nEND:VEVENT\nEND:VCALENDAR`;
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const url = new URL("https://calendar.google.com/calendar/render");
      url.searchParams.append("action", "TEMPLATE");
      url.searchParams.append("text", title);
      url.searchParams.append(
        "dates",
        `${formatDateForCal(startDate)}/${formatDateForCal(endDate)}`,
      );
      if (location) url.searchParams.append("location", location);
      window.open(url.toString(), "_blank");
    }
  };

  return (
    <Link
      to="/ticket/$ticketId"
      params={{ ticketId: ticket.id }}
      className="block rounded-3xl overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform"
    >
      <div className="relative h-32">
        <img src={ticket.cover} alt={ticket.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute bottom-3 left-4 text-white font-bold text-sm leading-tight">
          {ticket.title}
        </span>
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${ticket.ticketType === "VIP" ? "bg-primary text-primary-foreground" : "bg-white/20 text-white backdrop-blur-sm"}`}
        >
          {ticket.ticketType}
        </span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {ticket.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {ticket.time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{ticket.seat}</p>
            <p className="text-xs font-mono text-primary mt-0.5">{ticket.orderId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-transparent hover:bg-secondary border-border/60"
              onClick={handleAddToCalendar}
              title="Add to Calendar"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 rounded-full text-xs font-bold"
              style={{ background: "var(--gradient-primary)" }}
            >
              <QrCode className="h-3.5 w-3.5 mr-1" />
              Show
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── History Card ─── */
function HistoryCard({ ticket }: { ticket: any }) {
  const rating = ticket.histRating || 5;
  const isRated = ticket.rated ?? true;
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex gap-3 p-3">
      <img
        src={ticket.cover}
        alt={ticket.title}
        className="w-20 h-20 object-cover rounded-xl shrink-0"
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">{ticket.title}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {ticket.city || "Online"}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-border"}`}
              />
            ))}
          </div>
          {!isRated && (
            <button className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Rate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Subscription Card ─── */
function SubscriptionCard({ sub }: { sub: any }) {
  const isExpiring = sub.status === "Expiring Soon";
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
        <div
          className="flex gap-3 p-3 border-b border-border/40 cursor-pointer hover:bg-secondary/20 transition-colors"
          onClick={() => setShowQR(true)}
        >
          <img
            src={sub.cover}
            alt={sub.title}
            className="w-16 h-16 object-cover rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex justify-between items-start">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{sub.title}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isExpiring ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}
                >
                  {sub.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {sub.venue}
              </p>
            </div>
            <div className="text-xs font-semibold text-primary mt-1">
              {sub.price} <span className="text-muted-foreground font-normal">/ {sub.type}</span>
            </div>
          </div>
        </div>
        <div className="bg-secondary/20 p-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Next billing: <span className="font-semibold text-foreground">{sub.nextBilling}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg px-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowInvoice(true);
              }}
            >
              Invoice
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs rounded-lg px-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                setShowRenew(true);
              }}
            >
              Renew
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Recent Invoice</DialogTitle>
            <DialogDescription>
              {sub.title} at {sub.venue}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold">{sub.price}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">14 May 2026</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-500 font-bold">Paid</span>
            </div>
            <Button className="w-full mt-4 rounded-xl" onClick={() => setShowInvoice(false)}>
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>You are renewing {sub.title} for another month.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-secondary/40 p-4 rounded-2xl flex justify-between items-center">
              <span className="font-medium">Total Due</span>
              <span className="text-xl font-bold text-primary">{sub.price}</span>
            </div>
            <Button
              className="w-full h-12 rounded-xl text-base font-bold"
              onClick={() => {
                setShowRenew(false);
                // mock success toast here normally
              }}
            >
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Scan Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-xs rounded-3xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-center">{sub.title}</DialogTitle>
            <DialogDescription className="text-center">Show this at {sub.venue}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">ID: {sub.id.toUpperCase()}-X9</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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

  if (isLoading || isLoadingTickets || isLoadingOrganizers) {
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

  /* ── Desktop ── */
  const desktop = (
    <div className="hidden md:flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex-1 mx-auto max-w-7xl w-full px-6 py-10 grid grid-cols-[300px_1fr] gap-8 items-start">
        {/* Sidebar */}
        <aside className="sticky top-24 space-y-5">
          <div className="rounded-3xl border border-border/60 bg-card p-6 flex flex-col items-center text-center shadow-[var(--shadow-card)]">
            <div
              className="h-24 w-24 rounded-2xl p-[3px] mb-4 relative"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl -z-10" />
              {user?.profile ? (
                <img
                  src={user.profile}
                  alt={user?.username || "User"}
                  className="h-full w-full rounded-[14px] object-cover bg-card"
                />
              ) : (
                <div className="h-full w-full rounded-[14px] bg-secondary flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            <h2 className="font-bold text-xl">{user?.username || "Guest User"}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              @{user?.handle || "guest"}
            </p>
            {user?.phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                {user.phone}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Member since {joinDate}</p>
            <div className="grid grid-cols-3 gap-3 w-full mt-5">
              {[
                { v: String(historyTicketsList.length), l: "Attended" },
                { v: String(followedOrganizers.length), l: "Following" },
                { v: String(upcomingTicketsList.length), l: "Upcoming" },
              ].map(({ v, l }) => (
                <div key={l} className="bg-secondary/60 rounded-xl p-2.5 text-center">
                  <p className="font-bold text-base">{v}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 w-full mt-4">
              <Button
                variant="secondary"
                className="flex-1 h-9 text-sm font-semibold rounded-xl"
                onClick={() => navigate({ to: "/settings" })}
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => setShowLogoutModal(true)}
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Favorite Categories */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="font-bold text-sm mb-4">Interests</p>
            <div className="flex flex-wrap gap-2">
              {userInterests.length > 0 ? (
                userInterests.map((interest: string) => {
                  const cat = favoriteCategories.find(
                    (c) => c.label.toLowerCase() === interest.toLowerCase(),
                  );
                  const bg = cat?.bg || "bg-primary/10";
                  const color = cat?.color || "text-primary";
                  const border = cat?.border || "border-primary/20";
                  return (
                    <span
                      key={interest}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${bg} ${border} ${color}`}
                    >
                      {cat?.icon && <cat.icon className="h-3.5 w-3.5" />}
                      {interest}
                    </span>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No interests added yet.</p>
              )}
            </div>
          </div>

          {/* Following */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm">Following</p>
              <Link to="/organizers" className="text-xs text-primary font-bold">
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {followedOrganizers.slice(0, 4).map((org: any) => (
                <div key={org.id} className="flex items-center gap-3">
                  <img
                    src={org.image || "https://placehold.co/100"}
                    alt={org.name}
                    className="h-9 w-9 rounded-full object-cover border border-border/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{org.name}</p>
                    <p className="text-xs text-muted-foreground">@{org.handle}</p>
                  </div>
                  <Heart className="h-4 w-4 fill-primary text-primary shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" /> Upcoming Tickets
              </h2>
              <Link to="/events" className="text-sm text-primary font-bold flex items-center gap-1">
                Browse events <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {upcomingTicketsList.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {upcomingTicketsList.map((t) => (
                  <TicketCard key={t.id} ticket={t} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-border/60 rounded-3xl bg-card">
                <p className="text-muted-foreground text-sm">No upcoming tickets or bookings.</p>
                <Link
                  to="/events"
                  className="text-primary text-sm font-bold mt-2 inline-block hover:underline"
                >
                  Browse events
                </Link>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Event History
            </h2>
            {historyTicketsList.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {historyTicketsList.map((t) => (
                  <HistoryCard key={t.id} ticket={t} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-border/60 rounded-3xl bg-card">
                <p className="text-muted-foreground text-sm">No past tickets or bookings.</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" /> Active Subscriptions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSubscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );

  /* ── Mobile ── */
  const mobile = (
    <div className="md:hidden min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/40 backdrop-blur-2xl border-none pt-safe-top relative">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="flex items-center justify-between px-4 py-3 relative z-10">
          <h1 className="font-bold text-lg tracking-tight">My Profile</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="p-2 rounded-full hover:bg-secondary/80 transition-colors"
            >
              <ScanLine className="h-5 w-5" />
            </Link>
            <button className="p-2 rounded-full hover:bg-secondary/80 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Hero */}
      <div className="relative px-4 pt-4 pb-4">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent pointer-events-none -mt-4" />

        {/* Top Row: Avatar & Stats */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div
            className="h-20 w-20 rounded-full p-[2px] shrink-0 relative"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full -z-10" />
            {user?.profile ? (
              <img
                src={user.profile}
                alt={user?.username || "User"}
                className="h-full w-full rounded-full object-cover bg-card border-2 border-background"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>

          <div className="flex flex-1 justify-around ml-4">
            {[
              { value: String(historyTicketsList.length), label: "Attended" },
              { value: String(followedOrganizers.length), label: "Following" },
              { value: String(upcomingTicketsList.length), label: "Upcoming" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="font-bold text-lg leading-tight">{value}</span>
                <span className="text-[12px] text-foreground/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Details */}
        <div className="relative z-10 mb-5">
          <h2 className="font-bold text-base leading-tight">{user?.username || "Guest User"}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">@{user?.handle || "guest"}</p>
          {user?.phone && <p className="text-sm mt-1 text-foreground/90">{user.phone}</p>}
          <p className="text-xs text-muted-foreground mt-1">Member since {joinDate}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 relative z-10">
          <Button
            variant="secondary"
            className="flex-1 h-8 text-[13px] font-bold rounded-lg bg-secondary/80 hover:bg-secondary text-foreground"
            onClick={() => navigate({ to: "/settings" })}
          >
            Edit profile
          </Button>
          <Button
            variant="secondary"
            className="flex-1 h-8 text-[13px] font-bold rounded-lg bg-secondary/80 hover:bg-secondary text-foreground"
          >
            Share profile
          </Button>
        </div>
      </div>

      {/* Favorite Categories */}
      <div className="px-4 mb-1 mt-5">
        <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
          Interests
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {userInterests.length > 0 ? (
            userInterests.map((interest: string) => {
              const cat = favoriteCategories.find(
                (c) => c.label.toLowerCase() === interest.toLowerCase(),
              );
              const bg = cat?.bg || "bg-primary/10";
              const color = cat?.color || "text-primary";
              const border = cat?.border || "border-primary/20";
              return (
                <span
                  key={interest}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${bg} ${border} ${color}`}
                >
                  {cat?.icon && <cat.icon className="h-4 w-4" />}
                  {interest}
                </span>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground px-1">No interests added yet.</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 mt-4 px-4 gap-1 overflow-x-auto hide-scrollbar">
        {(["upcoming", "history", "following"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 min-w-[90px] py-2.5 text-xs font-bold capitalize transition-all rounded-t-lg ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {t === "upcoming" && (
                <>
                  <Ticket className="h-4 w-4" /> Upcoming
                </>
              )}
              {t === "history" && (
                <>
                  <Calendar className="h-4 w-4" /> History
                </>
              )}
              {t === "following" && (
                <>
                  <Heart className="h-4 w-4" /> Following
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {tab === "upcoming" && (
          <div className="space-y-4">
            {upcomingTicketsList.length > 0 ? (
              upcomingTicketsList.map((t) => <TicketCard key={t.id} ticket={t} />)
            ) : (
              <div className="text-center py-10 border border-dashed border-border/60 rounded-3xl bg-card">
                <p className="text-muted-foreground text-sm">No upcoming tickets or bookings.</p>
              </div>
            )}

            <Link
              to="/events"
              className="flex items-center justify-center gap-1 text-sm font-bold text-primary py-3"
            >
              Browse more events <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {historyTicketsList.length > 0 ? (
              historyTicketsList.map((t) => <HistoryCard key={t.id} ticket={t} />)
            ) : (
              <div className="text-center py-10 border border-dashed border-border/60 rounded-3xl bg-card">
                <p className="text-muted-foreground text-sm">No past tickets or bookings.</p>
              </div>
            )}
          </div>
        )}

        {tab === "following" && (
          <div className="space-y-3">
            {followedOrganizers.slice(0, 5).map((org: any) => (
              <div
                key={org.id}
                className="bg-card border border-border/40 rounded-2xl flex items-center gap-3 p-3 shadow-sm"
              >
                <img
                  src={org.image || "https://placehold.co/100"}
                  alt={org.name}
                  className="h-12 w-12 rounded-full object-cover shrink-0 border border-border/40"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{org.name}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-2 md:text-base">
                    @{org.handle} ·{" "}
                    {org.followers >= 1000
                      ? (org.followers / 1000).toFixed(1) + "k"
                      : org.followers}{" "}
                    {org.followers === 1 ? "follower" : "followers"}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1"
                >
                  <Heart className="h-3 w-3 fill-primary text-primary" /> Following
                </Button>
              </div>
            ))}
            <Link
              to="/organizers"
              className="flex items-center justify-center gap-1 text-sm font-bold text-primary py-3"
            >
              Discover more organizers <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );

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
      {desktop}
      {mobile}
      {logoutModal}
    </>
  );
}
