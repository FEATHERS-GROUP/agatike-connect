import { Link } from "@tanstack/react-router";
import { Star, MapPin, Users } from "lucide-react";
import type { Event } from "@/lib/mock-data";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group relative block overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={event.cover}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-dark)" }} />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          <Star className="h-3 w-3 fill-primary text-primary" /> {event.rating}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs uppercase tracking-wider opacity-80">
            {event.date} · {event.time}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight line-clamp-2">{event.title}</h3>
          <div className="mt-2 flex items-center justify-between text-xs opacity-90">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {event.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> People going · {(event.attendees || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-xs text-muted-foreground">
          by <span className="text-foreground font-medium">{event.organizer}</span>
        </div>
        <div className="text-sm font-semibold">
          {event.price === 0 ? "Free" : `from ${event.currency || "$"}${event.price}`}
        </div>
      </div>
    </Link>
  );
}
