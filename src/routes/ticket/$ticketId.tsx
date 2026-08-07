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
import QRCode from "react-qr-code";
import { CarouselStack } from "@/components/ticket-viewer/CarouselStack";
import { DynamicPass } from "@/components/ticket-viewer/DynamicPass";
import { PrintableTicket, getCustomTemplateHeight } from "@/components/pdf/PrintableTickets";
import { SelectedCardView } from "@/components/ticket-viewer/SelectedCardView";
import { PurchasesList } from "@/components/ticket-viewer/PurchasesList";
import { generateFallbackReceipt } from "@/lib/pdf-receipt";

export const Route = createFileRoute("/ticket/$ticketId")({
  component: TicketViewer,
});

function TicketViewer() {
  const { ticketId } = Route.useParams();
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["user-tickets"],
    queryFn: () => getUserAllTickets(),
  });

  // Try to find the ticket by the URL param (in case a ticket ID like TKT-293NDGIR was passed)
  const exactTicket = tickets.find(
    (t: any) => String(t.id) === String(ticketId) || String(t.orderId) === String(ticketId),
  );

  // The event ID is either the eventId of the ticket we found, or the param itself (if an event ID was passed)
  const resolvedEventId = exactTicket ? exactTicket.eventId : ticketId;

  // Now find ALL related tickets for the stack
  const eventTickets = tickets.filter((t: any) => String(t.eventId) === String(resolvedEventId));

  const primaryTicket = exactTicket || eventTickets[0];
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const { user } = useUserAuth();

  const { data: productOrders = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["booking-products", user?.id],
    queryFn: () => getBookingProductOrders({ data: { buyer_id: user?.id } }),
    enabled: !!user?.id,
  });

  const eventTicketOrderIds = eventTickets.map((t: any) => String(t.orderId));

  // Find product orders for this specific event or matched by any ticket's order ID
  const eventProductOrders = primaryTicket
    ? productOrders.filter((o: any) => {
        const prod = o.product || {};
        const prodEventId =
          prod.event?.id || prod.event_id || prod.specs?.eventId || prod.specs?.event_id;

        const isEventMatch =
          String(prodEventId) === String(primaryTicket.eventId) ||
          prod.specs?.linked_assets?.some((a: any) => String(a.id) === String(primaryTicket.eventId));
          
        const isOrderMatch =
          (o.qr_code_string && eventTicketOrderIds.includes(String(o.qr_code_string))) ||
          (o.decrptions && eventTicketOrderIds.includes(String(o.decrptions)));

        return isEventMatch || isOrderMatch;
      })
    : [];

  const vouchers = eventProductOrders.filter((o: any) => o.product?.type === "voucher");
  // Anything that isn't a voucher is considered a physical product / merch
  const physicalOrders = eventProductOrders.filter((o: any) => o.product?.type !== "voucher");

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (selectedCard?.type === "voucher") {
        // Simple download for voucher
        const element = document.getElementById(`voucher-${selectedCard.id}`);
        if (!element) throw new Error("Voucher element not found");
        const imgData = await htmlToImage.toPng(element, {
          pixelRatio: 2,
          backgroundColor: "#0a0a0a",
          style: { opacity: "1" },
        });
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [400, 500] });
        pdf.addImage(imgData, "PNG", 0, 0, 400, 500);
        pdf.save(`agatike-voucher-${selectedCard.data.qr_code_string || selectedCard.id}.pdf`);
        return;
      }

      const elementFront = document.getElementById("printable-ticket-front");
      const elementBack = document.getElementById("printable-ticket-back");
      if (!elementFront || !elementBack) throw new Error("Ticket elements not found");

      const ticketToPrint = selectedCard?.type === "ticket" ? selectedCard.data : primaryTicket;

      if (ticketToPrint?.ticketCategory === "facility") {
        const receipt = await generateFallbackReceipt({
          entityName: ticketToPrint.venueName || ticketToPrint.title || "Facility",
          ticket: ticketToPrint,
          bookingRef: ticketToPrint.orderId,
          customerName: ticketToPrint.passengerName,
          dateStr: ticketToPrint.date || ticketToPrint.eventDate,
          timeStr: ticketToPrint.time || ticketToPrint.workingHours,
          locationStr: ticketToPrint.city,
          tierName: ticketToPrint.facilityName || ticketToPrint.ticketType,
          quantity: 1,
          type: "facility"
        });

        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${receipt.content}`;
        link.download = receipt.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const isCustomDesign = !!ticketToPrint?.design;
      const width = isCustomDesign ? 720 : 800;
      const height = isCustomDesign ? getCustomTemplateHeight(ticketToPrint.design.template) : 300;

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

      pdf.save(`agatike-ticket-${ticketToPrint?.orderId || ticketId}.pdf`);
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

  if (!primaryTicket) {
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
    <div className="relative min-h-[100dvh] font-sans flex flex-col text-foreground bg-[#0a0a0a] overflow-x-hidden selection:bg-primary/30 -mb-[96px] pb-[96px] md:mb-0 md:pb-0">
      {/* Ambient background — blurred cover image with richer overlay */}
      {primaryTicket.cover && (
        <div className="fixed inset-0 z-0 flex items-center justify-center">
          <img
            src={primaryTicket.cover}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-[100px] opacity-40 saturate-150 pointer-events-none select-none"
          />
          {/* Noise texture and radial gradient for premium feel */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-black/60 to-black pointer-events-none" />
        </div>
      )}

      {/* Content Container */}
      <div
        className={`relative z-10 w-full mx-auto px-5 py-8 flex pb-40 transition-all duration-500 ${
          selectedCard ? "max-w-[1000px] flex-col md:flex-row items-start md:gap-16" : "max-w-[420px] flex-col gap-8"
        }`}
      >
        {/* Left Side: Event Details & Carousel (Hidden on mobile if card is selected) */}
        <div className={`flex flex-col gap-8 w-full ${selectedCard ? "hidden md:flex md:w-[420px] shrink-0" : "flex"}`}>
          {/* Header */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            to="/profile"
            className="w-11 h-11 bg-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/[0.15] hover:scale-105 active:scale-95 transition-all border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            <ChevronLeft className="w-5 h-5 text-white/90" />
          </Link>
          <span className="font-bold text-[13px] tracking-[0.2em] text-white/60 uppercase">
            {primaryTicket.ticketCategory === "movie"
              ? "Movie"
              : primaryTicket.ticketCategory === "conference"
                ? "Conference"
                : primaryTicket.ticketCategory === "entrance"
                  ? "Entrance Pass"
                  : primaryTicket.ticketCategory === "venue"
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
              {primaryTicket.date}, {primaryTicket.time || primaryTicket.showtimes?.[0]}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-2xl leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            {primaryTicket.title}
          </h1>
        </div>

        {/* Carousel Stack */}
        <CarouselStack tickets={eventTickets} vouchers={vouchers} onCardClick={setSelectedCard} isCompressed={!!selectedCard} />

        <PurchasesList
          isProductsLoading={isProductsLoading}
          physicalOrders={physicalOrders}
          primaryTicket={primaryTicket}
          setSelectedCard={setSelectedCard}
        />
      </div>

      <SelectedCardView
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        handleDownload={handleDownload}
        isDownloading={isDownloading}
      />
      </div>

      {/* Hidden PDF Printable Layer */}
      <PrintableTicket id="printable-ticket" ticket={selectedCard?.type === "ticket" ? selectedCard.data : primaryTicket} />
    </div>
  );
}

