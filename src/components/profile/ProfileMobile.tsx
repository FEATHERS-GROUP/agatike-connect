import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Ticket,
  Calendar,
  ChevronRight,
  Heart,
  LogOut,
  User,
  Bell,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketCard } from "./TicketCard";
import { HistoryCard } from "./HistoryCard";

export function ProfileMobile({
  user,
  joinDate,
  historyTicketsList,
  followedOrganizers,
  upcomingTicketsList,
  userInterests,
  favoriteCategories,
  setShowLogoutModal,
  tab,
  setTab,
}: any) {
  const navigate = useNavigate();

  return (
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
                (c: any) => c.label.toLowerCase() === interest.toLowerCase(),
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
        {(["upcoming", "history", "following"] as any[]).map((t) => (
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
              upcomingTicketsList.map((t: any) => <TicketCard key={t.id} ticket={t} />)
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
              historyTicketsList.map((t: any) => <HistoryCard key={t.id} ticket={t} />)
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
}
