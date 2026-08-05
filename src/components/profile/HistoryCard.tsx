import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Star, Calendar } from "lucide-react";

export function HistoryCard({ ticket }: { ticket: any }) {
  const rating = ticket.histRating || 5;
  const isRated = ticket.rated ?? false;
  
  // Try to use eventId if available, fallback to a disabled-looking div if no ID.
  const hasEventId = !!ticket.eventId;

  const CardContent = (
    <div className={`bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row gap-4 p-4 transition-all duration-200 ${hasEventId ? 'hover:-translate-y-1 hover:shadow-md hover:border-primary/40' : ''}`}>
      <div className="relative w-full sm:w-28 h-32 sm:h-28 shrink-0 rounded-2xl overflow-hidden">
        <img
          src={ticket.cover || "/placeholder-event.png"}
          alt={ticket.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <p className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {ticket.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              {ticket.date || "Past Event"}
            </p>
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              {ticket.city || "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 sm:mt-0 pt-2 border-t border-border/30 sm:border-t-0 sm:pt-0">
          <div className="flex gap-1 items-center bg-secondary/50 px-2 py-1 rounded-full">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-border/60"}`}
              />
            ))}
          </div>
          {!isRated && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (ticket.eventId) {
                  window.location.href = `/f/${ticket.eventId}/review`;
                }
              }} 
              className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full transition-colors"
            >
              Rate Event
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (hasEventId) {
    return (
      <Link
        to="/events/$eventId"
        params={{ eventId: ticket.eventId }}
        className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
      >
        {CardContent}
      </Link>
    );
  }

  return <div className="block group opacity-90">{CardContent}</div>;
}
