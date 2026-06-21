import React from "react";
import { MapPin, Star } from "lucide-react";

export function HistoryCard({ ticket }: { ticket: any }) {
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
