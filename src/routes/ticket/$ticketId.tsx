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
    <div className="relative min-h-screen font-sans flex flex-col text-foreground bg-[#0a0a0a] overflow-x-hidden selection:bg-primary/30">
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

        {/* Sections Wrapper with Staggered Animation */}
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {/* Popular Now & Order Meta */}
          <div className="group bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-2xl rounded-[1.5rem] p-5 border border-white/[0.08] shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-white/90 font-semibold text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                Purchases
              </h2>
            </div>

            <div className="flex flex-col gap-1.5 px-1">
              {isProductsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                </div>
              ) : physicalOrders.length > 0 ? (
                physicalOrders.map((order: any, idx: number) => (
                  <div
                    key={order.id || idx}
                    className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 group/item"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-white/10 group-hover/item:scale-105 transition-transform">
                      {order.product?.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Briefcase className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white/90 text-sm truncate">
                        {order.product?.name || "Product"}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5 truncate uppercase tracking-wider font-semibold">
                        Qty: {order.qty || 1} • {order.size || "Standard"}
                      </p>
                    </div>
                    <div className="h-8 w-px border-l-2 border-dashed border-white/10 mx-2" />
                    <div className="text-right shrink-0">
                      <p className="font-mono text-white/90 text-[13px]">{order.amount_paid} RWF</p>
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${order.status === "Confirmed" ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 text-white/40 text-[13px] italic">
                  No additional items purchased.
                </div>
              )}

              <div className="h-px w-full bg-white/5 my-3" />

              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/50 text-[13px] font-medium">Order Reference</span>
                <span className="text-white/90 font-mono text-sm tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
                  {primaryTicket.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/50 text-[13px] font-medium">Status</span>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-semibold text-[13px]">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Selected Card Details (Acts as own page on mobile) */}
        {selectedCard && (
          <div className="flex flex-col w-full flex-1 md:sticky md:top-12 animate-in fade-in slide-in-from-right-8 duration-500 items-center justify-start">
            {/* Mobile Back Button */}
            <div className="md:hidden flex items-center mb-6 w-full">
              <button
                onClick={() => setSelectedCard(null)}
                className="w-10 h-10 bg-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/[0.15] border border-white/10"
              >
                <ChevronLeft className="w-5 h-5 text-white/90" />
              </button>
              <span className="ml-4 font-bold text-lg text-white">
                {selectedCard.type === "ticket" ? "Ticket Details" : "Voucher Details"}
              </span>
            </div>
            
            <div className="hidden md:flex w-full justify-center mb-8">
              <h2 className="text-white text-3xl font-black tracking-tight drop-shadow-md">
                {selectedCard.type === "ticket" ? "Ticket Details" : "Voucher Details"}
              </h2>
            </div>

            <div className="flex flex-col items-center w-full max-w-[380px]">
              {selectedCard.type === "ticket" ? (
                <div className="w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] transform transition-transform hover:scale-[1.02]">
                  <DynamicPass ticket={selectedCard.data} />
                </div>
              ) : selectedCard.type === "voucher" ? (
                <div
                  id={`voucher-${selectedCard.id}`}
                  className={`relative w-[280px] h-[360px] rounded-[2rem] shadow-2xl ${selectedCard.color} flex flex-col items-center p-6 text-white overflow-hidden border border-white/10`}
                >
                  <div
                    className="absolute left-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
                    style={{ boxShadow: "inset -3px 0px 5px rgba(0,0,0,0.5)" }}
                  />
                  <div
                    className="absolute right-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
                    style={{ boxShadow: "inset 3px 0px 5px rgba(0,0,0,0.5)" }}
                  />
                  <div className="absolute left-6 right-6 top-[60%] border-t-2 border-dashed border-white/30 translate-y-[15px]" />

                  <div className="flex flex-col items-center justify-center flex-1 w-full pb-8">
                    {selectedCard.icon}
                    <p
                      className={`tracking-[0.2em] text-[10px] font-bold uppercase mb-1 opacity-90 ${selectedCard.isSponsored ? "text-yellow-200" : ""}`}
                    >
                      {selectedCard.brand}
                    </p>
                    
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-3xl font-black">
                        {Number(selectedCard.value).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold opacity-80">RWF</span>
                    </div>
                    {Number(selectedCard.price) > 0 && (
                      <p className="text-[10px] opacity-75 font-medium mb-1">
                        Purchased for {Number(selectedCard.price).toLocaleString()} RWF
                      </p>
                    )}

                    {selectedCard.total > 1 && (
                      <p className="text-[10px] opacity-70 mb-4 font-mono mt-1">
                        Item {selectedCard.index} of {selectedCard.total}
                      </p>
                    )}

                    <div className="mt-2 w-full h-12 flex items-center justify-center px-4">
                      {Array.from({ length: 35 }).map((_, i) => {
                        const w = (i * 13) % 4 === 0 ? "4px" : (i * 7) % 3 === 0 ? "1px" : "2px";
                        const mr = (i * 5) % 2 === 0 ? "1px" : "3px";
                        return (
                          <div
                            key={i}
                            className="h-full bg-white opacity-90"
                            style={{ width: w, marginRight: mr }}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[10px] tracking-widest font-mono opacity-80 break-all px-4 text-center">
                      {selectedCard.qrCode}
                    </p>
                  </div>

                  <div className="absolute bottom-6 w-full px-8">
                    <div
                      className={`w-full backdrop-blur-sm font-bold py-3.5 rounded-full text-[13px] border text-center uppercase tracking-widest ${selectedCard.isSponsored ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-white/10 text-white border-white/20 shadow-sm"}`}
                    >
                      {selectedCard.isSponsored ? "Sponsored Gift" : "Gift Card"}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 w-full max-w-[380px]">
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
                  {isDownloading ? "Generating PDF..." : "Save PDF"}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden PDF Printable Layer */}
      <PrintableTicket id="printable-ticket" ticket={selectedCard?.type === "ticket" ? selectedCard.data : primaryTicket} />
    </div>
  );
}

function CarouselStack({ tickets, vouchers, onCardClick, isCompressed }: { tickets: any[]; vouchers: any[]; onCardClick: (card: any) => void; isCompressed?: boolean }) {
  // Map tickets and vouchers to a single cards array.
  // Tickets are placed first, vouchers last so tickets render on top initially (since activeIndex starts at 0).
  const cards = [
    ...tickets.map((t, i) => ({
      id: t.id || `t-${i}`,
      type: "ticket",
      data: t,
    })),
    ...vouchers.flatMap((v, i) => {
      const qty = v.qty || 1;
      return Array.from({ length: qty }).map((_, j) => {
        const isSponsored = (v.product?.name || "").toLowerCase().includes("sponsored");
        return {
          id: `${v.id || `v-${i}`}-${j}`,
          type: "voucher",
          color: isSponsored ? "bg-orange-600" : "bg-orange-500",
          brand: v.product?.name || "Voucher",
          icon: v.product?.image_url ? (
            <img
              src={v.product.image_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20 mb-3"
            />
          ) : (
            <TicketIcon className="w-10 h-10 text-white mb-3" />
          ),
          qrCode: v.qr_code_string || v.id,
          data: v,
          index: j + 1,
          total: qty,
          isSponsored,
          value: Number(v.product?.value_amount) || Number(v.product?.price) || (Number(v.amount_paid) / Number(qty)) || 0,
          price: Number(v.product?.price) || (Number(v.amount_paid) / Number(qty)) || 0,
        };
      });
    }),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
      <div className={`relative w-full h-[380px] flex justify-center items-end perspective-[1000px] mb-8 mt-2 pb-6 transition-all duration-500 origin-bottom ${isCompressed ? "scale-75 opacity-70" : "scale-100 opacity-100"}`}>
        {cards.map((card, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 3;

          if (!isVisible) return null;

          // Fan-out effect: Rotate Z and translate slightly to create a spread hand of cards
          const rotateZ = offset * 12; // Spread degrees
          const translateY = Math.abs(offset) * 15; // Push sides down slightly
          const translateX = offset * 10; // Push sides outward slightly
          const scale = 1 - absOffset * 0.05;
          const zIndex = 20 - absOffset;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (activeIndex === index) {
                  onCardClick(card);
                } else {
                  setActiveIndex(index);
                }
              }}
              className="absolute bottom-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotateZ(${rotateZ}deg) scale(${scale})`,
                transformOrigin: "50% 120%", // Pivot point near the bottom
                zIndex,
                opacity: absOffset > 2 ? 0 : 1,
                pointerEvents: absOffset > 2 ? "none" : "auto",
              }}
            >
              {card.type === "voucher" ? (
                <div
                  className={`relative w-[280px] h-[360px] rounded-[2rem] shadow-2xl ${card.color} flex flex-col items-center p-6 text-white overflow-hidden border border-white/10`}
                >
                  {/* Punch holes matched to dark ambient background color */}
                  <div
                    className="absolute left-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
                    style={{ boxShadow: "inset -3px 0px 5px rgba(0,0,0,0.5)" }}
                  />
                  <div
                    className="absolute right-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
                    style={{ boxShadow: "inset 3px 0px 5px rgba(0,0,0,0.5)" }}
                  />
                  <div className="absolute left-6 right-6 top-[60%] border-t-2 border-dashed border-white/30 translate-y-[15px]" />

                  {/* Content */}
                  <div className="flex flex-col items-center justify-center flex-1 w-full pb-8">
                    {card.icon}
                    <p
                      className={`tracking-[0.2em] text-[10px] font-bold uppercase mb-1 opacity-90 ${card.isSponsored ? "text-yellow-200" : ""}`}
                    >
                      {card.brand}
                    </p>
                    
                    {/* Value and Price */}
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-3xl font-black">
                        {Number(card.value).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold opacity-80">RWF</span>
                    </div>
                    {Number(card.price) > 0 && (
                      <p className="text-[10px] opacity-75 font-medium mb-1">
                        Purchased for {Number(card.price).toLocaleString()} RWF
                      </p>
                    )}

                    {card.total > 1 && (
                      <p className="text-[10px] opacity-70 mb-4 font-mono mt-1">
                        Item {card.index} of {card.total}
                      </p>
                    )}

                    <div className="mt-2 w-full h-12 flex items-center justify-center px-4">
                      {Array.from({ length: 35 }).map((_, i) => {
                        const w = (i * 13) % 4 === 0 ? "4px" : (i * 7) % 3 === 0 ? "1px" : "2px";
                        const mr = (i * 5) % 2 === 0 ? "1px" : "3px";
                        return (
                          <div
                            key={i}
                            className="h-full bg-white opacity-90"
                            style={{ width: w, marginRight: mr }}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[10px] tracking-widest font-mono opacity-80 break-all px-4 text-center">
                      {card.qrCode}
                    </p>
                  </div>

                  <div className="absolute bottom-6 w-full px-8">
                    <div
                      className={`w-full backdrop-blur-sm font-bold py-3.5 rounded-full text-[13px] border text-center uppercase tracking-widest ${card.isSponsored ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-white/10 text-white border-white/20 shadow-sm"}`}
                    >
                      {card.isSponsored ? "Sponsored Gift" : "Gift Card"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[340px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem]">
                  <DynamicPass ticket={card.data} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === idx ? "w-8 bg-white" : "w-4 bg-white/30"
            }`}
          />
        ))}
      </div>
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
