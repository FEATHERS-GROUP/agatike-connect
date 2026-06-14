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
import { useQuery } from "@tanstack/react-query";
import { getUserAllTickets } from "@/api/user_tickets";
import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { PrintableTicket, getCustomTemplateHeight } from "@/components/pdf/PrintableTickets";

export const Route = createFileRoute("/ticket/$ticketId")({
  component: TicketViewer,
});

function TicketViewer() {
  const { ticketId } = Route.useParams();
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["user-tickets"],
    queryFn: () => getUserAllTickets(),
  });

  const ticket = tickets.find((t: any) => t.id === ticketId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const elementFront = document.getElementById("printable-ticket-front");
      const elementBack = document.getElementById("printable-ticket-back");
      if (!elementFront || !elementBack) throw new Error("Ticket elements not found");

      const isCustomDesign = !!ticket?.design;
      const width = isCustomDesign ? 720 : 800;
      const height = isCustomDesign ? getCustomTemplateHeight(ticket.design.template) : 300;

      // Capture front
      const imgDataFront = await htmlToImage.toPng(elementFront, {
        pixelRatio: 2,
        backgroundColor: "transparent",
        style: {
          opacity: "1",
        },
      });

      // Capture back
      const imgDataBack = await htmlToImage.toPng(elementBack, {
        pixelRatio: 2,
        backgroundColor: "transparent",
        style: {
          opacity: "1",
        },
      });

      // Landscape orientation, measuring pixels
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [width, height],
      });

      // Page 1: Front
      pdf.addImage(imgDataFront, "PNG", 0, 0, width, height);

      // Page 2: Back
      pdf.addPage([width, height], "landscape");
      pdf.addImage(imgDataBack, "PNG", 0, 0, width, height);

      pdf.save(`agatike-ticket-${ticket?.orderId || ticketId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          Loading ticket details...
        </p>
      </div>
    );
  }

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
    <div className="relative h-screen h-[100dvh] font-sans overflow-hidden flex flex-col items-center justify-between text-foreground">
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

      {/* Centered responsive container */}
      <div className="relative z-10 w-full max-w-md px-4 flex flex-col justify-between h-full max-h-screen max-h-[100dvh] py-4 md:py-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between flex-none">
          <Link
            to="/profile"
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <span className="font-bold text-sm text-white tracking-wide">
            Upcoming{" "}
            {ticket.ticketCategory === "movie"
              ? "Movie"
              : ticket.ticketCategory === "conference"
                ? "Conference"
                : ticket.ticketCategory === "entrance"
                  ? "Entrance Pass"
                  : ticket.ticketCategory === "venue"
                    ? "Venue Booking"
                    : "Event"}
          </span>
          <div className="w-10" />
        </div>

        {/* Content area: Title + Pass card */}
        <div className="flex-1 flex flex-col justify-center min-h-0 my-2 overflow-hidden">
          {/* Event Meta */}
          <div className="mb-2 text-center flex-none">
            <p className="text-white/75 text-xs font-semibold uppercase tracking-wider mb-0.5">
              {ticket.date}, {ticket.time || ticket.showtimes?.[0]}
            </p>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-md line-clamp-1 leading-tight">
              {ticket.title}
            </h1>
          </div>

          {/* Dynamic Ticket Card */}
          <div className="ticket-card-wrapper flex-1 flex items-center justify-center min-h-0 relative overflow-hidden">
            <div className="ticket-card-scaler origin-center transition-transform">
              <DynamicPass ticket={ticket} />
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="w-full flex-none mt-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-orange-500 text-white font-bold py-3.5 px-6 rounded-2xl w-full flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:bg-orange-600 transition-colors text-base disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isDownloading ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Styles for dynamic card height and width scaling */}
      <style>{`
        .ticket-card-scaler {
          transform: scale(1);
          transform-origin: center center;
          transition: transform 0.15s ease-out;
          width: 350px;
          max-width: 100%;
        }
        
        /* Height-based scaling */
        @media (max-height: 850px) { .ticket-card-scaler { transform: scale(0.95); } }
        @media (max-height: 800px) { .ticket-card-scaler { transform: scale(0.90); } }
        @media (max-height: 750px) { .ticket-card-scaler { transform: scale(0.85); } }
        @media (max-height: 700px) {
          .ticket-card-scaler { transform: scale(0.80); }
          .ticket-card-inner {
            padding: 1.25rem !important; /* p-5 */
            padding-bottom: 1.5rem !important; /* pb-6 */
          }
          .ticket-card-inner .mb-6 { margin-bottom: 1rem !important; }
          .ticket-card-inner .mb-4 { margin-bottom: 0.75rem !important; }
          .ticket-card-inner .mt-6 { margin-top: 1rem !important; }
          .ticket-card-inner .pb-5 { padding-bottom: 0.75rem !important; }
        }
        @media (max-height: 650px) { .ticket-card-scaler { transform: scale(0.72); } }
        @media (max-height: 600px) { .ticket-card-scaler { transform: scale(0.65); } }
        @media (max-height: 550px) {
          .ticket-card-scaler { transform: scale(0.58); }
          .ticket-card-inner {
            padding: 1rem !important; /* p-4 */
            padding-bottom: 1.25rem !important; /* pb-5 */
          }
          .ticket-card-inner .mb-6 { margin-bottom: 0.75rem !important; }
          .ticket-card-inner .mb-4 { margin-bottom: 0.5rem !important; }
          .ticket-card-inner .mt-6 { margin-top: 0.75rem !important; }
          .ticket-card-inner .pb-5 { padding-bottom: 0.5rem !important; }
        }
        @media (max-height: 500px) { .ticket-card-scaler { transform: scale(0.50); } }
        @media (max-height: 450px) { .ticket-card-scaler { transform: scale(0.45); } }

        /* Width-based scaling (to prevent horizontal overflow on narrow screens) */
        @media (max-width: 380px) {
          .ticket-card-scaler { transform: scale(0.9); }
          @media (max-height: 700px) { .ticket-card-scaler { transform: scale(0.75); } }
          @media (max-height: 650px) { .ticket-card-scaler { transform: scale(0.68); } }
          @media (max-height: 600px) { .ticket-card-scaler { transform: scale(0.60); } }
        }
        @media (max-width: 340px) {
          .ticket-card-scaler { transform: scale(0.8); }
          @media (max-height: 700px) { .ticket-card-scaler { transform: scale(0.68); } }
          @media (max-height: 650px) { .ticket-card-scaler { transform: scale(0.60); } }
          @media (max-height: 600px) { .ticket-card-scaler { transform: scale(0.55); } }
        }
      `}</style>

      {/* Hidden PDF Printable Layer */}
      <PrintableTicket id="printable-ticket" ticket={ticket} />
    </div>
  );
}

function DynamicPass({ ticket }: { ticket: any }) {
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
        <p className="text-xl font-bold tracking-wide mb-4">{ticket.orderId}</p>

        <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-5">
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
            <p className="font-bold text-lg">{ticket.venue || ticket.city || "Kigali"}</p>
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
            {ticket.venue || ticket.city || "Kigali"}
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
      <p className="text-xl font-bold tracking-wide mb-4">{ticket.orderId}</p>

      <div className="grid grid-cols-3 gap-4 border-b border-dashed border-gray-200 pb-5">
        <div>
          <p className="text-gray-500 text-xs font-medium mb-1">Category</p>
          <p className="font-bold text-sm truncate">{ticket.ticketType}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs font-medium mb-1">Gate</p>
          <p
            className={`font-bold ${ticket.ticketCategory === "sports" ? "text-sm" : "text-[11px]"}`}
          >
            {ticket.ticketCategory === "sports" ? ticket.gate || "Gate 3" : "Main Entrance"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs font-medium mb-1">Seat</p>
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
