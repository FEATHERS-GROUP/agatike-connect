import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Ticket, Calendar, ChevronRight, ChevronDown, ChevronUp, Heart, LogOut, User, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { TicketCard } from "./TicketCard";
import { HistoryCard } from "./HistoryCard";
import { SubscriptionCard } from "./SubscriptionCard";
import { ProfileBadges } from "./ProfileBadges";

function HistoryTableRow({ eventGroup, navigate }: { eventGroup: any; navigate: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tickets = eventGroup.tickets || [eventGroup];
  const hasMultiple = tickets.length > 1;
  const hasEventId = !!eventGroup.eventId;

  return (
    <React.Fragment>
      <TableRow 
        className={`group ${hasEventId ? "cursor-pointer hover:bg-secondary/30 transition-colors" : ""}`}
        onClick={() => {
          if (hasMultiple) {
            setIsExpanded(!isExpanded);
          } else if (hasEventId) {
            navigate({ to: '/events/$eventId', params: { eventId: eventGroup.eventId } });
          }
        }}
      >
        <TableCell className="p-3">
          <img
            src={eventGroup.cover || "/placeholder-event.png"}
            alt={eventGroup.title}
            className="w-14 h-14 object-cover rounded-xl shadow-sm"
          />
        </TableCell>
        <TableCell>
          <p className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {eventGroup.title}
          </p>
          {hasMultiple && (
            <p className="text-xs font-semibold text-primary mt-0.5">
              {tickets.length} Tickets
            </p>
          )}
        </TableCell>
        <TableCell className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {eventGroup.date || "Past Event"}
        </TableCell>
        <TableCell className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {eventGroup.city || "Online"}
        </TableCell>
        <TableCell className="text-right p-3">
          <div className="flex items-center justify-end gap-2">
            {hasMultiple && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="h-8 rounded-full text-xs font-bold text-muted-foreground"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                {isExpanded ? "Hide" : "Tickets"}
              </Button>
            )}
            {!eventGroup.rated && (
              <a 
                href={`/f/${eventGroup.eventId}/review`}
                className="inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Rate Event
              </a>
            )}
            {!hasMultiple && hasEventId && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs font-bold text-muted-foreground ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/events/$eventId', params: { eventId: eventGroup.eventId } });
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      
      {isExpanded && hasMultiple && (
        <TableRow className="bg-secondary/10 hover:bg-secondary/10 border-t-0">
          <TableCell colSpan={5} className="p-0 border-b border-border/40 pb-3">
            <div className="px-16 py-2 space-y-2">
              {tickets.map((t: any, idx: number) => (
                <div key={t.id || idx} className="bg-card rounded-xl p-3 flex items-center justify-between border border-border/40 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.seat || "General Admission"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{t.orderId}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${t.ticketType === "VIP" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {t.ticketType || "Standard"}
                  </span>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export function ProfileDesktop({
  user,
  joinDate,
  historyTicketsList,
  followedOrganizers,
  upcomingTicketsList,
  userInterests,
  favoriteCategories,
  setShowLogoutModal,
  subscriptions,
  venueBookingsCount,
}: any) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    if (!name) return "GU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="hidden md:flex flex-col min-h-screen bg-secondary/20 text-foreground">
      <Navbar />
      <div className="flex-1 mx-auto max-w-[1400px] w-full px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="space-y-6">
          
          {/* Header & About Me Card */}
          <div className="bg-card rounded-[24px] border border-border/40 shadow-sm overflow-hidden flex flex-col">
            {/* Banner (Abstract background) */}
            <div className="h-[200px] w-full relative overflow-hidden bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10">
              {/* Abstract decorative shapes */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
              <div className="absolute top-12 -right-24 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-24 left-1/2 w-80 h-80 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Overlapping User Info Card */}
            <div className="px-6 lg:px-8 pb-8 relative z-10 flex-1 flex flex-col">
              <div className="bg-card rounded-[20px] p-4 shadow-md border border-border/60 flex items-center justify-between -mt-14 mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user?.profile ? (
                      <img
                        src={user.profile}
                        alt={user?.username || "User"}
                        className="w-[84px] h-[84px] rounded-[16px] object-cover bg-secondary border-4 border-card"
                      />
                    ) : (
                      <div className="w-[84px] h-[84px] rounded-[16px] bg-secondary flex items-center justify-center border-4 border-card">
                        <span className="text-2xl font-bold text-muted-foreground opacity-50">
                          {getInitials(user?.username)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground leading-tight">{user?.username || "Guest User"}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">@{user?.handle || "guest"}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-xs font-semibold" onClick={() => navigate({ to: "/settings" })}>
                      Edit Profile
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowLogoutModal(true)}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">About me</h2>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    Hi there! I am an active member on Agatike, discovering and attending the best events and spaces around. 
                    I joined the platform on <span className="font-semibold text-foreground">{joinDate}</span> and have since 
                    attended {historyTicketsList.length} events.
                  </p>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li><strong className="font-semibold text-foreground">Event Enthusiast:</strong> I'm always on the lookout for exciting upcoming gatherings and workshops.</li>
                    <li><strong className="font-semibold text-foreground">Community Builder:</strong> Following {followedOrganizers.length} amazing organizers to stay updated on their latest activities.</li>
                  </ol>
                </div>
              </div>

              {/* Badges Section */}
              <div className="pt-4 border-t border-border/40">
                <ProfileBadges 
                  historyCount={historyTicketsList.length} 
                  upcomingCount={upcomingTicketsList.length}
                  followingCount={followedOrganizers.length}
                  subscriptionsCount={subscriptions?.length || 0}
                  venueCount={venueBookingsCount}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[24px] border border-border/40 shadow-sm p-6 lg:p-8">
            <Tabs defaultValue="upcoming" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <TabsList className="bg-secondary/20 border border-border/40 p-1 rounded-xl h-auto">
                  <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" /> Upcoming
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> History
                    </div>
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" className="text-primary font-semibold text-xs rounded-full" onClick={() => navigate({ to: "/events" })}>
                  Browse events <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* UPCOMING TICKETS TAB */}
              <TabsContent value="upcoming" className="mt-0">
                {upcomingTicketsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingTicketsList.map((t: any) => (
                      <TicketCard key={t.id} ticket={t} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                    <p className="text-muted-foreground text-sm">No upcoming tickets or bookings.</p>
                    <Button variant="link" className="text-primary mt-2 h-auto p-0" onClick={() => navigate({ to: "/events" })}>
                      Find events to attend
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* EVENT HISTORY TAB */}
              <TabsContent value="history" className="mt-0">
                {historyTicketsList.length > 0 ? (
                  <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-sm">
                    <Table>
                      <TableHeader className="bg-secondary/20">
                        <TableRow>
                          <TableHead className="w-[80px]">Event</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyTicketsList.map((t: any) => (
                          <HistoryTableRow key={t.id} eventGroup={t} navigate={navigate} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                    <p className="text-muted-foreground text-sm">No past tickets or bookings.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-6">
          
          {/* Following Organizers (Connection Style) */}
          <div className="bg-card rounded-[24px] border border-border/40 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">Following</h2>
              <Link to="/organizers" className="text-xs text-primary font-semibold flex items-center">
                All <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {followedOrganizers.length > 0 ? (
                followedOrganizers.slice(0, 5).map((org: any) => (
                  <div key={org.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {org.image ? (
                        <img src={org.image} alt={org.name} className="h-10 w-10 rounded-full object-cover border border-border/40 shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary border border-border/40 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-muted-foreground">{getInitials(org.name)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{org.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{org.handle}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="h-7 text-[10px] rounded-full px-3 font-semibold shrink-0 text-primary bg-primary/10 hover:bg-primary/20">
                      Following
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Not following anyone yet.</p>
              )}
            </div>
            {followedOrganizers.length > 5 && (
              <Button variant="secondary" className="w-full mt-5 rounded-xl h-10 text-sm font-semibold bg-secondary/50" onClick={() => navigate({ to: "/organizers" })}>
                Show all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {/* More Details */}
          <div className="bg-card rounded-[24px] border border-border/40 shadow-sm p-6">
            <h2 className="text-base font-bold text-foreground mb-5">More Details</h2>
            <div className="space-y-5">
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Phone Number</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.phone || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Interests</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {userInterests.length > 0 ? (
                      userInterests.map((interest: string) => (
                        <span key={interest} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
