import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Ticket, Calendar, ChevronRight, Heart, LogOut, User, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { TicketCard } from "./TicketCard";
import { HistoryCard } from "./HistoryCard";
import { SubscriptionCard } from "./SubscriptionCard";

export function ProfileDesktop({
  user,
  joinDate,
  historyTicketsList,
  followedOrganizers,
  upcomingTicketsList,
  userInterests,
  favoriteCategories,
  setShowLogoutModal,
  mockSubscriptions,
}: any) {
  const navigate = useNavigate();

  return (
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
                    (c: any) => c.label.toLowerCase() === interest.toLowerCase(),
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
                {upcomingTicketsList.map((t: any) => (
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
                {historyTicketsList.map((t: any) => (
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
              {mockSubscriptions.map((sub: any) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
