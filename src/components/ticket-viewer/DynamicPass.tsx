import { Calendar, Building2, MapPin, Ticket as TicketIcon, ShieldCheck, ChevronRight } from "lucide-react";
import QRCode from "react-qr-code";

export function DynamicPass({ ticket }: { ticket: any }) {
  // Shared Barcode Generator
  const Barcode = () => (
    <div className="mt-6 w-full h-16 flex items-center justify-center px-2">
      {Array.from({ length: 45 }).map((_, i) => {
        // Deterministic but varied widths
        const w = (i * 13) % 4 === 0 ? "4px" : (i * 7) % 3 === 0 ? "1px" : "2px";
        const mr = (i * 5) % 2 === 0 ? "2px" : "4px";
        return <div key={i} className="bg-black h-full" style={{ width: w, marginRight: mr }} />;
      })}
    </div>
  );

  // Layout variations
  if (ticket.ticketCategory === "movie") {
    return (
      <div className="ticket-card-inner bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl">
        <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">Moviegoer</p>
        <p className="text-2xl font-bold mb-4">{ticket.passengerName || "Guest"}</p>

        {/* Timeline Component */}
        <div className="flex justify-between items-center mb-6 relative">
          <div className="w-full absolute top-1/2 -translate-y-1/2 flex items-center justify-between px-2 z-0">
            <div className="w-2 h-2 rounded-full bg-black" />
            <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />
            <div className="w-2 h-2 rounded-full bg-black border-2 border-white ring-2 ring-black" />
          </div>
          <div className="w-full flex justify-center z-10">
            <div className="bg-white px-3">
              <Film className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="font-bold text-lg">{ticket.time || ticket.showtimes?.[0] || "18:30"}</p>
            <p className="text-gray-500 text-xs font-medium mt-1">Start Time</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{ticket.duration || "2h 15m"}</p>
            <p className="text-gray-500 text-xs font-medium mt-1">Duration</p>
          </div>
        </div>

        <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
          Booking Reference
        </p>
        <p className="text-xl font-bold tracking-wide mb-4">{ticket.orderId}</p>

        <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-5">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Cinema</p>
            <p className="font-bold text-sm truncate">{ticket.cinema}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs font-medium mb-1">Screen</p>
            <p className="font-bold text-sm truncate">{ticket.screen || "Main Screen"}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-medium mb-1">Quantity</p>
            <p className="font-bold text-sm truncate">
              {ticket.quantity || 1} Ticket{ticket.quantity !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="absolute -left-5 bottom-20 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute -right-5 bottom-20 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute left-6 right-6 bottom-[100px] border-t-2 border-dashed border-gray-200" />

        <Barcode />
      </div>
    );
  }

  if (ticket.ticketCategory === "conference") {
    return (
      <div className="ticket-card-inner bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
              Attendee
            </p>
            <p className="text-2xl font-bold">{ticket.passengerName || "Guest"}</p>
            <p className="text-[#2dd4bf] font-bold text-sm mt-1">
              {ticket.ticketType || "Attendee"}
            </p>
          </div>
          {ticket.passengerProfile ? (
            <img
              src={ticket.passengerProfile}
              alt={ticket.passengerName || "Attendee"}
              className="w-14 h-14 rounded-full border-2 border-gray-100 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-gray-100 bg-secondary flex items-center justify-center text-muted-foreground text-sm font-bold uppercase shrink-0">
              {(ticket.passengerName || "G")[0]}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6 relative">
          <div className="w-full absolute top-1/2 -translate-y-1/2 flex items-center justify-between px-2 z-0">
            <div className="w-2 h-2 rounded-full bg-black" />
            <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />
            <div className="w-2 h-2 rounded-full bg-black border-2 border-white ring-2 ring-black" />
          </div>
          <div className="w-full flex justify-center z-10">
            <div className="bg-white px-3">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="font-bold text-lg">{ticket.venue || ticket.city}</p>
            <p className="text-gray-500 text-xs font-medium mt-1 truncate max-w-[120px]">
              {ticket.venue || "Kigali Arena"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{ticket.date}</p>
            <p className="text-gray-500 text-xs font-medium mt-1">Day 1</p>
          </div>
        </div>

        <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
          Registration ID
        </p>
        <p className="text-xl font-bold tracking-wide mb-4">{ticket.orderId}</p>

        <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-5">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Pass Type</p>
            <p className="font-bold text-sm">All Access</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs font-medium mb-1">Company</p>
            <p className="font-bold text-sm">Agatike</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-medium mb-1">Status</p>
            <p className="font-bold text-sm text-green-600">Verified</p>
          </div>
        </div>

        <div className="absolute -left-5 bottom-20 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute -right-5 bottom-20 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute left-6 right-6 bottom-[100px] border-t-2 border-dashed border-gray-200" />

        <Barcode />
      </div>
    );
  }

  // Default Event Layout (applies to 'event', 'experience', 'free')
  return (
    <div className="ticket-card-inner bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl">
      <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
        {ticket.ticketCategory === "free" ? "Guest" : "Passenger"}
      </p>
      <p className="text-2xl font-bold mb-4">{ticket.passengerName || "Guest"}</p>

      {/* Timeline Component */}
      <div className="flex justify-between items-center mb-6 relative">
        <div className="w-full absolute top-1/2 -translate-y-1/2 flex items-center justify-between px-2 z-0">
          <div className="w-2 h-2 rounded-full bg-black" />
          <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />
          <div className="w-2 h-2 rounded-full bg-black border-2 border-white ring-2 ring-black" />
        </div>
        <div className="w-full flex justify-center z-10">
          <div className="bg-white px-3">
            {ticket.ticketCategory === "experience" ? (
              <MapPin className="w-6 h-6" />
            ) : ticket.ticketCategory === "free" ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <TicketIcon className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="font-bold text-lg max-w-[140px] leading-tight truncate">
            {ticket.venue || ticket.city || "N/A"}
          </p>
          <p className="text-gray-500 text-xs font-medium mt-1">Location</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">
            {["entrance", "venue"].includes(ticket.ticketCategory)
              ? ticket.workingHours || "09:00 - 18:00"
              : ticket.time || "18:00"}
          </p>
          <p className="text-gray-500 text-xs font-medium mt-1">
            {["entrance", "venue"].includes(ticket.ticketCategory) ? "Working Hours" : "Doors Open"}
          </p>
        </div>
      </div>

      <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
        Booking Reference
      </p>
      <p className="text-xl font-bold tracking-wide mb-4">{ticket.orderId}</p>

      <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-5">
        <div>
          <p className="text-gray-500 text-xs font-medium mb-1">Category</p>
          <p className="font-bold text-sm truncate">{ticket.ticketType}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs font-medium mb-1">
            {ticket.ticketCategory === "facility" ? "Facility" : "Gate"}
          </p>
          <p
            className={`font-bold ${["sports", "facility"].includes(ticket.ticketCategory) ? "text-sm truncate max-w-[100px] mx-auto" : "text-[11px]"}`}
          >
            {ticket.ticketCategory === "facility"
              ? ticket.facilityName || ticket.facility || "Facility"
              : ticket.ticketCategory === "sports"
                ? ticket.gate || "Gate 3"
                : "Main Entrance"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs font-medium mb-1">
            {["entrance", "venue"].includes(ticket.ticketCategory) ? "Name" : "Seat"}
          </p>
          <p className="font-bold text-sm truncate max-w-[80px]">{ticket.seat || "GA"}</p>
        </div>
      </div>

      <div className="absolute -left-5 bottom-20 w-10 h-10 bg-gray-100 rounded-full" />
      <div className="absolute -right-5 bottom-20 w-10 h-10 bg-gray-100 rounded-full" />
      <div className="absolute left-6 right-6 bottom-[100px] border-t-2 border-dashed border-gray-200" />

      <Barcode />
    </div>
  );
}
