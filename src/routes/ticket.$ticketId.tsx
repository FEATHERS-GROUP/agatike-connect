import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Download,
  Ticket as TicketIcon,
  MapPin,
  Film,
  Calendar,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { upcomingTickets } from "./profile";
import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { PrintableTicket } from "@/components/pdf/PrintableTickets";

export const Route = createFileRoute("/ticket/$ticketId")({
  component: TicketViewer,
});

function TicketViewer() {
  const { ticketId } = Route.useParams();
  const ticket = upcomingTickets.find((t) => t.id === ticketId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const element = document.getElementById("printable-ticket");
      if (!element) throw new Error("Ticket element not found");

      // html-to-image uses the browser's native renderer via SVG foreignObject,
      // which safely supports all modern CSS like oklch variables.
      // cacheBust is critical for preventing blank outputs in WebKit browsers with external images.
      const imgData = await htmlToImage.toPng(element, {
        pixelRatio: 2,
        backgroundColor: "transparent",
        style: {
          opacity: "1",
        },
      });

      // Landscape orientation, A4 size (approx), measuring pixels
      // A typical horizontal ticket is roughly 800x300, which is an 8:3 ratio
      // We will output a custom sized PDF that matches the ticket dimensions
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 300],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 800, 300);
      pdf.save(`agatike-ticket-${ticket?.orderId || ticketId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <p className="text-lg font-bold mb-4">Ticket not found</p>
        <Link to="/profile" className="bg-secondary text-foreground px-6 py-2 rounded-xl font-bold">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      {/* Ambient background — blurred cover image */}
      {ticket.cover && (
        <>
          <img
            src={ticket.cover}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl opacity-60 pointer-events-none select-none"
          />
          {/* Dark gradient scrim so text stays readable */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        </>
      )}

      {/* Page content sits above the ambient bg */}
      <div className="relative z-10 px-5 pt-14 pb-36">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/profile"
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <span className="font-bold text-lg text-white">
            Upcoming{" "}
            {ticket.ticketCategory === "movie"
              ? "Movie"
              : ticket.ticketCategory === "conference"
                ? "Conference"
                : "Event"}
          </span>
          <div className="w-12" />
        </div>

        {/* Event Meta */}
        <div className="mb-6 px-1">
          <p className="text-white/60 text-sm mb-1">
            {ticket.date}, {ticket.time || ticket.showtimes?.[0]}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            {ticket.title}
          </h1>
        </div>

        {/* Dynamic Ticket Card */}
        <DynamicPass ticket={ticket} />
      </div>

      {/* Download Button */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-5 z-50">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-orange-500 text-white font-bold py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:bg-orange-600 transition-colors text-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Download className="w-6 h-6" />
          )}
          {isDownloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      {/* Hidden PDF Printable Layer */}
      <PrintableTicket id="printable-ticket" ticket={ticket} />
    </div>
  );
}

function DynamicPass({ ticket }: { ticket: any }) {
  // Shared Barcode Generator
  const Barcode = () => (
    <div className="mt-14 w-full h-16 flex items-center justify-center px-2">
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
      <div className="bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl">
        <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">Moviegoer</p>
        <p className="text-2xl font-bold mb-8">Alex Doe</p>

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
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="font-bold text-lg">{ticket.showtimes?.[0] || "18:30"}</p>
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
        <p className="text-xl font-bold tracking-wide mb-8">{ticket.orderId}</p>

        <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-10">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Cinema</p>
            <p className="font-bold text-sm truncate">{ticket.cinema}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs font-medium mb-1">Screen</p>
            <p className="font-bold text-sm">IMAX 4</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-medium mb-1">Seat</p>
            <p className="font-bold text-sm">{ticket.seat.split("·")[1]?.trim() || "H4"}</p>
          </div>
        </div>

        <div className="absolute -left-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute -right-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute left-6 right-6 bottom-[132px] border-t-2 border-dashed border-gray-200" />

        <Barcode />
      </div>
    );
  }

  if (ticket.ticketCategory === "conference") {
    return (
      <div className="bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
              Attendee
            </p>
            <p className="text-2xl font-bold">Alex Doe</p>
            <p className="text-[#2dd4bf] font-bold text-sm mt-1">Frontend Engineer</p>
          </div>
          <img
            src="https://i.pravatar.cc/150?u=me"
            alt="Alex Doe"
            className="w-14 h-14 rounded-full border-2 border-gray-100"
          />
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
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="font-bold text-lg">{ticket.city || "Kigali"}</p>
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
        <p className="text-xl font-bold tracking-wide mb-8">{ticket.orderId}</p>

        <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-10">
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

        <div className="absolute -left-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute -right-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full" />
        <div className="absolute left-6 right-6 bottom-[132px] border-t-2 border-dashed border-gray-200" />

        <Barcode />
      </div>
    );
  }

  // Default Event Layout (applies to 'event', 'experience', 'free')
  return (
    <div className="bg-white text-black rounded-[2rem] p-7 relative overflow-hidden pb-8 shadow-2xl">
      <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
        {ticket.ticketCategory === "free" ? "Guest" : "Passenger"}
      </p>
      <p className="text-2xl font-bold mb-8">Alex Doe</p>

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
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="font-bold text-lg max-w-[140px] leading-tight truncate">
            {ticket.city || ticket.venue || "Kigali"}
          </p>
          <p className="text-gray-500 text-xs font-medium mt-1">Location</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{ticket.time || "18:00"}</p>
          <p className="text-gray-500 text-xs font-medium mt-1">Doors Open</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
        Booking Reference
      </p>
      <p className="text-xl font-bold tracking-wide mb-8">{ticket.orderId}</p>

      <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-10">
        <div>
          <p className="text-gray-500 text-xs font-medium mb-1">Category</p>
          <p className="font-bold text-sm truncate">{ticket.ticketType}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs font-medium mb-1">Gate</p>
          <p className="font-bold text-sm">G-12</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs font-medium mb-1">Seat</p>
          <p className="font-bold text-sm truncate max-w-[80px]">{ticket.seat || "GA"}</p>
        </div>
      </div>

      <div className="absolute -left-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full" />
      <div className="absolute -right-5 bottom-28 w-10 h-10 bg-gray-100 rounded-full" />
      <div className="absolute left-6 right-6 bottom-[132px] border-t-2 border-dashed border-gray-200" />

      <Barcode />
    </div>
  );
}
