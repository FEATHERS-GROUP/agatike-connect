import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Star, Calendar, ChevronDown, ChevronUp, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HistoryCard({ ticket: eventGroup }: { ticket: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  const rating = eventGroup.histRating || 5;
  const isRated = eventGroup.rated ?? false;
  const hasEventId = !!eventGroup.eventId;
  const tickets = eventGroup.tickets || [eventGroup];
  const hasMultiple = tickets.length > 1;

  const handleRateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (eventGroup.eventId) {
      navigate({ to: `/f/$eventId/review`, params: { eventId: eventGroup.eventId } });
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const CardContent = (
    <div className={`bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm flex flex-col p-4 transition-all duration-200 ${hasEventId ? 'hover:-translate-y-1 hover:shadow-md hover:border-primary/40' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-28 h-32 sm:h-28 shrink-0 rounded-2xl overflow-hidden">
          <img
            src={eventGroup.cover || "/placeholder-event.png"}
            alt={eventGroup.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <p className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {eventGroup.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                {eventGroup.date || "Past Event"}
              </p>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary/70" />
                {eventGroup.city || "Online"}
              </p>
            </div>
            {hasMultiple && (
              <p className="text-xs font-semibold text-primary mt-2">
                {tickets.length} Tickets
              </p>
            )}
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
            <div className="flex items-center gap-2">
              {hasMultiple && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExpandClick}
                  className="h-8 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  {isExpanded ? "Hide" : "Tickets"}
                </Button>
              )}
              {!isRated && (
                <button 
                  onClick={handleRateClick}
                  className="inline-block text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full transition-colors"
                >
                  Rate Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Tickets Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/40 space-y-2" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Your Tickets</p>
          {tickets.map((t: any, idx: number) => (
            <div key={t.id || idx} className="bg-secondary/20 rounded-xl p-3 flex items-center justify-between border border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <TicketIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.seat || "General Admission"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{t.orderId}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${t.ticketType === "VIP" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {t.ticketType || "Standard"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (hasEventId) {
    return (
      <div
        onClick={() => navigate({ to: "/events/$eventId", params: { eventId: eventGroup.eventId } })}
        className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl cursor-pointer"
      >
        {CardContent}
      </div>
    );
  }

  return <div className="block group opacity-90">{CardContent}</div>;
}
