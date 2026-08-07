import React from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, QrCode, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TicketCard({ ticket }: { ticket: any }) {
  const isMultiple = ticket.tickets && ticket.tickets.length > 1;
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
      params={{ ticketId: ticket.eventId || ticket.id }}
      className="block rounded-3xl overflow-hidden border border-border/60 bg-card shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform"
    >
      <div className="relative h-32">
        <img src={ticket.cover} alt={ticket.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute bottom-3 left-4 text-white font-bold text-sm leading-tight">
          {ticket.title}
        </span>
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isMultiple || ticket.ticketType === "VIP"
              ? "bg-primary text-primary-foreground"
              : "bg-white/20 text-white backdrop-blur-sm"
          }`}
        >
          {isMultiple ? `${ticket.tickets.length} Tickets` : ticket.ticketType}
        </span>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ticket.date}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ticket.time}</span>
          </span>
          <span className="flex items-center gap-1 col-span-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {ticket.venueName ? `${ticket.venueName}, ${ticket.city}` : ticket.city || "Online"}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
          <div>
            <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
              {isMultiple ? "Multiple Tickets" : ticket.passengerName}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {isMultiple ? "Multiple Seats" : ticket.seat}
            </p>
            <p className="text-[10px] font-mono text-primary mt-0.5">
              {isMultiple ? "View Details" : ticket.orderId}
            </p>
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
