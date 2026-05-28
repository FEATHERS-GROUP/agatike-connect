import { Link } from "@tanstack/react-router";
import { feedPosts, events, experiences, movies } from "@/lib/mock-data";
import { FeedCard } from "@/components/site/FeedCard";
import { Camera, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeMobile() {
  const items = feedPosts;

  return (
    <div className="h-full w-full bg-background text-foreground pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background z-30 border-b border-border/40 pt-safe-top">
        <button className="text-foreground">
          <Camera className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'cursive', fontStyle: 'italic' }}>
          Agatike
        </h1>
        <button className="text-foreground" style={{ transform: 'rotate(15deg) translateY(-2px)' }}>
          <Send className="h-6 w-6" />
        </button>
      </div>

      {/* Top Stories Row */}
      <div className="flex gap-4 px-4 py-3 overflow-x-auto hide-scrollbar border-b border-border/40">
        <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-transparent p-0.5" style={{ background: "linear-gradient(white, white) padding-box, var(--gradient-primary) border-box" }}>
              <img src="https://i.pravatar.cc/150?u=me" alt="Your Story" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <span className="text-[14px] text-primary-foreground font-bold leading-none mb-0.5">+</span>
            </div>
          </div>
          <span className="text-xs text-foreground font-medium">Your story</span>
        </div>

        {events.slice(0, 8).map((event, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
            <div className="h-16 w-16 rounded-full border-2 border-transparent p-0.5" style={{ background: "linear-gradient(white, white) padding-box, var(--gradient-warm) border-box" }}>
              <img src={event.cover} alt={event.organizer} className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="text-xs text-foreground font-medium truncate w-16 text-center">
              {event.organizerHandle || "user"}
            </span>
          </div>
        ))}
      </div>

      {/* Popular Organizers */}
      <div className="pt-5 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Popular Organizers</h2>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {events.slice(0, 6).map(e => (
            <div key={e.id} className="w-36 shrink-0 rounded-2xl p-4 bg-card border border-border/40 shadow-sm flex flex-col items-center text-center">
              <img src={e.cover} alt={e.organizer} className="w-16 h-16 rounded-full object-cover mb-3" />
              <p className="font-semibold text-sm leading-tight line-clamp-1">{e.organizer}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">@{e.organizerHandle}</p>
              <Button size="sm" className="mt-3 w-full rounded-full h-7 text-[10px] font-bold uppercase tracking-wider">Follow</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Horizontal Scroll */}
      <div className="pt-5 pb-3">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Upcoming Events</h2>
          <Link to="/explore" className="text-sm font-bold text-primary">See all</Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {events.map(event => (
            <Link key={event.id} to="/events/$eventId" params={{ eventId: event.id }} className="w-60 shrink-0 rounded-3xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95">
              <div className="aspect-[4/3] relative">
                <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                  {event.currency || '$'}{event.price}
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{event.title}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">{event.date}</span>
                  <span>•</span>
                  <span className="truncate">{event.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Experiences Horizontal Scroll */}
      <div className="pt-5 pb-3">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Discover Experiences</h2>
          <Link to="/explore" className="text-sm font-bold text-primary">See all</Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {experiences.map(x => (
            <Link key={x.id} to="/events/$eventId" params={{ eventId: x.id }} className="w-56 shrink-0 rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm block transition-transform active:scale-95">
              <div className="aspect-[4/3] relative">
                <img src={x.cover} alt={x.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                  {x.currency || '$'}{x.price}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm leading-tight line-clamp-1">{x.title}</h3>
                <p className="text-muted-foreground text-xs mt-1">{x.host}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Movies Horizontal Scroll */}
      <div className="pt-2 pb-3">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Now Showing</h2>
          <Link to="/movies" className="text-sm font-bold text-primary">See all</Link>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar pb-2">
          {movies.map(m => (
            <Link key={m.id} to="/movies" className="w-32 shrink-0 block transition-transform active:scale-95">
              <div className="aspect-[2/3] relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm mb-2">
                <img src={m.cover} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                  {m.rating}
                </div>
              </div>
              <h3 className="font-bold text-sm leading-tight line-clamp-1">{m.title}</h3>
              <p className="text-muted-foreground text-[10px] mt-0.5">{m.genre}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="w-full pt-2 pb-24">
        {items.map((item, index) => (
          <FeedCard key={`${item.id}-${index}`} post={item} />
        ))}
      </div>
      
      {/* CSS to hide scrollbars */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
