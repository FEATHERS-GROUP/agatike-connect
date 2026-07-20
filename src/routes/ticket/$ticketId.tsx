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
import { getBookingProductOrders } from "@/api/products";
import { useUserAuth } from "@/contexts/UserAuthContext";
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
  const { user } = useUserAuth();

  const { data: productOrders = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["booking-products", user?.id],
    queryFn: () => getBookingProductOrders({ data: { buyer_id: user?.id } }),
    enabled: !!user?.id,
  });

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
    <div className="relative min-h-screen font-sans flex flex-col text-foreground bg-[#0a0a0a] overflow-x-hidden selection:bg-primary/30">
      {/* Ambient background — blurred cover image with richer overlay */}
      {ticket.cover && (
        <div className="fixed inset-0 z-0 flex items-center justify-center">
          <img
            src={ticket.cover}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-[100px] opacity-40 saturate-150 pointer-events-none select-none"
          />
          {/* Noise texture and radial gradient for premium feel */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-black/60 to-black pointer-events-none" />
        </div>
      )}

      {/* Scrollable Container */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-5 py-8 flex flex-col gap-8 pb-40">
        {/* Header */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to="/profile"
            className="w-11 h-11 bg-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            <ChevronLeft className="w-5 h-5 text-white/90" />
          </Link>
          <span className="font-bold text-[13px] tracking-[0.2em] text-white/60 uppercase">
            {ticket.ticketCategory === "movie"
              ? "Movie"
              : ticket.ticketCategory === "conference"
                ? "Conference"
                : ticket.ticketCategory === "entrance"
                  ? "Entrance Pass"
                  : ticket.ticketCategory === "venue"
                    ? "Venue Booking"
                    : "Event Ticket"}
          </span>
          <div className="w-11" />
        </div>

        {/* Event Meta */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-4 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
              {ticket.date}, {ticket.time || ticket.showtimes?.[0]}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-2xl leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            {ticket.title}
          </h1>
        </div>

        {/* Ticket Card */}
        <div className="flex justify-center w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both perspective-[1000px]">
          <div className="w-full max-w-[360px] mx-auto hover:rotate-x-[2deg] hover:rotate-y-[-2deg] hover:scale-[1.02] transition-transform duration-500 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <DynamicPass ticket={ticket} />
          </div>
        </div>

        {/* Sections Wrapper with Staggered Animation */}
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {/* Product Orders Section */}
          <div className="group bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-2xl rounded-[1.5rem] p-5 border border-white/[0.08] shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white/90 font-semibold text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                Merch & Add-ons
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {isProductsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                </div>
              ) : productOrders.length > 0 ? (
                productOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/[0.05]"
                  >
                    {order.product?.image_url ? (
                      <img
                        src={order.product.image_url}
                        alt={order.product.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                        <Briefcase className="w-5 h-5 text-white/40" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white/90 text-sm line-clamp-1">
                        {order.product?.name || "Product"}
                      </p>
                      <p className="text-[13px] text-white/50 mt-0.5">
                        Qty: {order.qty} {order.size ? `· Size: ${order.size}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.picked ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          Picked Up
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/[0.05]">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                    <Briefcase className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <p className="font-medium text-white/90 text-sm">No items purchased</p>
                    <p className="text-[13px] text-white/50 mt-0.5">
                      Explore the shop for exclusive merch.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gift Cards Section */}
          <div className="group bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-2xl rounded-[1.5rem] p-5 border border-white/[0.08] shadow-xl transition-all duration-300">
            <h2 className="text-white/90 font-semibold text-base mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <TicketIcon className="w-4 h-4" />
              </div>
              Gift Cards & Vouchers
            </h2>
            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/[0.05]">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                <TicketIcon className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <p className="font-medium text-white/90 text-sm">No active vouchers</p>
                <p className="text-[13px] text-white/50 mt-0.5">
                  Any claimed gifts will appear here.
                </p>
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div className="group bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-2xl rounded-[1.5rem] p-5 border border-white/[0.08] shadow-xl transition-all duration-300">
            <h2 className="text-white/90 font-semibold text-base mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-white/50 text-[13px] font-medium">Order Reference</span>
                <span className="text-white/90 font-mono text-sm tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
                  {ticket.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/50 text-[13px] font-medium">Status</span>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-semibold text-[13px]">Confirmed</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/50 text-[13px] font-medium">Purchased On</span>
                <span className="text-white/90 font-medium text-[13px]">
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button - Fixed at bottom with gorgeous glass floating bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-safe-bottom">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none h-40 bottom-0 top-auto" />
        <div className="max-w-[420px] mx-auto px-5 pb-6 pointer-events-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group relative w-full overflow-hidden bg-primary text-primary-foreground font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(var(--primary)_/_0.4)] hover:shadow-[0_8px_40px_rgb(var(--primary)_/_0.6)] hover:-translate-y-1 transition-all duration-300 text-[15px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <div className="relative flex items-center gap-2">
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isDownloading ? "Generating PDF..." : "Save PDF Ticket"}
            </div>
          </button>
        </div>
      </div>

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
