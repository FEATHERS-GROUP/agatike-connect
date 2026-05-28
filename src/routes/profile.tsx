import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Settings, Ticket, Star, MapPin, Calendar, ChevronRight,
  Heart, QrCode, Clock, Bell, Trophy, Flame, Zap,
} from "lucide-react";
import { events, organizers } from "@/lib/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Agatike" },
      { name: "description", content: "Your Agatike profile, tickets and event history." },
    ],
  }),
  component: ProfilePage,
});

const upcomingTickets = events.slice(0, 2).map((e, i) => ({
  ...e,
  ticketType: i === 0 ? "VIP" : "General",
  seat: i === 0 ? "Section A · Row 3 · Seat 12" : "Standing",
  orderId: `AGT-${1000 + i}`,
}));

const pastEvents = events.slice(2, 6).map((e, i) => ({
  ...e,
  histRating: 3 + (i % 3),
  rated: i % 2 === 0,
}));

const badges = [
  { icon: Flame, label: "Early Bird", color: "text-orange-400", bg: "bg-orange-400/10" },
  { icon: Trophy, label: "Super Fan", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { icon: Zap, label: "VIP Club", color: "text-primary", bg: "bg-primary/10" },
  { icon: Star, label: "Top Rater", color: "text-blue-400", bg: "bg-blue-400/10" },
];

type Tab = "upcoming" | "history" | "following";

/* ─── Shared sub-components ─── */
function TicketCard({ ticket }: { ticket: typeof upcomingTickets[0] }) {
  return (
    <Link to="/events/$eventId" params={{ eventId: ticket.id }} className="block rounded-3xl overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
      <div className="relative h-40">
        <img src={ticket.cover} alt={ticket.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute bottom-3 left-4 text-white font-bold text-sm leading-tight">{ticket.title}</span>
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${ticket.ticketType === "VIP" ? "bg-primary text-primary-foreground" : "bg-white/20 text-white backdrop-blur-sm"}`}>{ticket.ticketType}</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{ticket.date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{ticket.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{ticket.seat}</p>
            <p className="text-xs font-mono text-primary mt-0.5">{ticket.orderId}</p>
          </div>
          <Button size="sm" className="h-8 px-3 rounded-full text-xs font-bold" style={{ background: "var(--gradient-primary)" }}>
            <QrCode className="h-3.5 w-3.5 mr-1" />Show
          </Button>
        </div>
      </div>
    </Link>
  );
}

function HistoryCard({ event }: { event: typeof pastEvents[0] }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex gap-3 p-3">
      <img src={event.cover} alt={event.title} className="w-20 h-20 object-cover rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">{event.title}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`h-3.5 w-3.5 ${s <= event.histRating ? "text-yellow-400 fill-yellow-400" : "text-border"}`} />
            ))}
          </div>
          {!event.rated && <button className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Rate</button>}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
function ProfilePage() {
  const [tab, setTab] = useState<Tab>("upcoming");

  /* ── Desktop ── */
  const desktop = (
    <div className="hidden md:flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex-1 mx-auto max-w-7xl w-full px-6 py-10 grid grid-cols-[300px_1fr] gap-8 items-start">

        {/* Sidebar */}
        <aside className="sticky top-24 space-y-5">
          <div className="rounded-3xl border border-border/60 bg-card p-6 flex flex-col items-center text-center shadow-[var(--shadow-card)]">
            <div className="h-24 w-24 rounded-2xl p-[3px] shadow-lg mb-4" style={{ background: "var(--gradient-primary)" }}>
              <img src="https://i.pravatar.cc/150?u=me" alt="Alex Doe" className="h-full w-full rounded-[14px] object-cover" />
            </div>
            <h2 className="font-bold text-xl">Alex Doe</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" /> Kigali, Rwanda</p>
            <p className="text-xs text-muted-foreground mt-1">Member since Jan 2024</p>
            <div className="grid grid-cols-3 gap-3 w-full mt-5">
              {[{ v: "24", l: "Attended" }, { v: "8", l: "Following" }, { v: "3", l: "Upcoming" }].map(({ v, l }) => (
                <div key={l} className="bg-secondary/60 rounded-xl p-2.5 text-center">
                  <p className="font-bold text-base">{v}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 w-full mt-4">
              <Button variant="secondary" className="flex-1 h-9 text-sm font-semibold rounded-xl">Edit Profile</Button>
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shrink-0"><Settings className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="font-bold text-sm mb-4">Achievements</p>
            <div className="grid grid-cols-2 gap-2">
              {badges.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-2 rounded-xl p-2.5 ${bg}`}>
                  <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Following */}
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-sm">Following</p>
              <Link to="/organizers" className="text-xs text-primary font-bold">See all</Link>
            </div>
            <div className="space-y-3">
              {organizers.slice(0, 4).map(org => (
                <div key={org.id} className="flex items-center gap-3">
                  <img src={org.avatar} alt={org.name} className="h-9 w-9 rounded-full object-cover border border-border/40" />
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
              <h2 className="text-xl font-bold flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Upcoming Tickets</h2>
              <Link to="/events" className="text-sm text-primary font-bold flex items-center gap-1">Browse events <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {upcomingTickets.map(t => <TicketCard key={t.id} ticket={t} />)}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Event History</h2>
            <div className="grid grid-cols-2 gap-4">
              {pastEvents.map(e => <HistoryCard key={e.id} event={e} />)}
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
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-lg tracking-tight">My Profile</h1>
          <div className="flex items-center gap-2">
            <Link to="/scanner" className="p-2 rounded-full hover:bg-secondary transition-colors">
              <QrCode className="h-5 w-5" />
            </Link>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors"><Bell className="h-5 w-5" /></button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors"><Settings className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {/* Profile Hero */}
      <div className="relative px-4 pt-6 pb-4">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-20 w-20 rounded-2xl p-[2px] shadow-lg shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <img src="https://i.pravatar.cc/150?u=me" alt="Alex Doe" className="h-full w-full rounded-[14px] object-cover bg-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-xl tracking-tight">Alex Doe</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> Kigali, Rwanda</p>
            <p className="text-xs text-muted-foreground mt-1">Member since Jan 2024</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[{ value: "24", label: "Events Attended" }, { value: "8", label: "Following" }, { value: "3", label: "Upcoming" }].map(({ value, label }) => (
            <div key={label} className="bg-card rounded-2xl border border-border/40 p-3 text-center shadow-sm">
              <p className="font-bold text-xl">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" className="flex-1 h-9 text-sm font-semibold rounded-xl">Edit Profile</Button>
          <Button variant="secondary" className="flex-1 h-9 text-sm font-semibold rounded-xl">Share</Button>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 mb-1">
        <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Achievements</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {badges.map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className={`shrink-0 flex flex-col items-center gap-1.5 rounded-2xl border border-border/40 p-3 w-20 text-center ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
              <span className="text-[10px] font-semibold leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 mt-4 px-4 gap-1">
        {(["upcoming", "history", "following"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-bold capitalize transition-all rounded-t-lg ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {t === "upcoming" && <><Ticket className="h-4 w-4" /> Upcoming</>}
              {t === "history" && <><Calendar className="h-4 w-4" /> History</>}
              {t === "following" && <><Heart className="h-4 w-4" /> Following</>}
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {tab === "upcoming" && (
          <div className="space-y-3">
            {upcomingTickets.map(t => (
              <Link key={t.id} to="/events/$eventId" params={{ eventId: t.id }} className="block">
                <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
                  <div className="relative h-28 overflow-hidden">
                    <img src={t.cover} alt={t.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white font-bold text-base leading-tight">{t.title}</span>
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${t.ticketType === "VIP" ? "bg-primary text-primary-foreground shadow-lg" : "bg-white/20 text-white backdrop-blur-sm"}`}>{t.ticketType}</span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {t.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{t.seat}</p>
                        <p className="text-xs font-mono text-primary mt-0.5">{t.orderId}</p>
                      </div>
                      <Button size="sm" className="h-8 px-3 rounded-full text-xs font-bold shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
                        <QrCode className="h-3.5 w-3.5 mr-1" /> Show Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link to="/events" className="flex items-center justify-center gap-1 text-sm font-bold text-primary py-3">
              Browse more events <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {pastEvents.map(event => <HistoryCard key={event.id} event={event} />)}
          </div>
        )}

        {tab === "following" && (
          <div className="space-y-3">
            {organizers.slice(0, 5).map(org => (
              <div key={org.id} className="bg-card border border-border/40 rounded-2xl flex items-center gap-3 p-3 shadow-sm">
                <img src={org.avatar} alt={org.name} className="h-12 w-12 rounded-full object-cover shrink-0 border border-border/40" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{org.name}</p>
                  <p className="text-xs text-muted-foreground">@{org.handle} · {(org.followers / 1000).toFixed(1)}k followers</p>
                </div>
                <Button variant="secondary" size="sm" className="shrink-0 h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-primary text-primary" /> Following
                </Button>
              </div>
            ))}
            <Link to="/organizers" className="flex items-center justify-center gap-1 text-sm font-bold text-primary py-3">
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

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
