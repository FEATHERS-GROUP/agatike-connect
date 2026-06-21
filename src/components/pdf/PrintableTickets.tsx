import React from "react";
import { Ticket as TicketIcon, Film, MapPin, Briefcase, User } from "lucide-react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import { TicketPreview } from "@/components/desktop/dashboard/ticket-designer/TicketPreview";
import { DEFAULT_TERMS_HTML } from "@/components/desktop/dashboard/ticket-designer/templates/types";

export type TicketTemplateConfig = {
  layout?: "movie" | "conference" | "default";
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  labels?: {
    date?: string;
    time?: string;
    location?: string;
    screen?: string;
    seat?: string;
    admitOne?: string;
    bookingRef?: string;
    attendee?: string;
    accessLevel?: string;
    gate?: string;
    row?: string;
  };
};

export function getCustomTemplateHeight(template: string): number {
  if (template === "entrance-1" || template === "entrance") return 260;
  if (template === "entrance-2") return 250;
  if (template === "concert-1" || template === "concert") return 230;
  if (template === "concert-2") return 250;
  if (template === "conference-1" || template === "conference") return 280;
  if (template === "conference-2") return 250;
  if (template === "movie-1" || template === "movie") return 240;
  if (template === "movie-2") return 220;
  if (template === "experience-1" || template === "experience") return 260;
  if (template === "experience-2") return 250;
  return 250;
}

export function PrintableTicket({
  ticket,
  id,
  config,
}: {
  ticket: any;
  id: string;
  config?: TicketTemplateConfig;
}) {
  const isCustomDesign = !!ticket.design;
  const width = isCustomDesign ? "720px" : "800px";
  const height = isCustomDesign ? `${getCustomTemplateHeight(ticket.design.template)}px` : "300px";

  return (
    <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none flex flex-col gap-4">
      {/* Front Side */}
      <div
        id={`${id}-front`}
        className="overflow-hidden shadow-none flex"
        style={{
          fontFamily: isCustomDesign ? undefined : "'Inter', sans-serif",
          width,
          height,
        }}
      >
        {isCustomDesign ? (
          <TicketPreview
            template={ticket.design.template}
            palette={ticket.design.palette || { from: "#1f2937", to: "#111827", name: "Dark" }}
            font={ticket.design.font || { css: "sans-serif", name: "Modern" }}
            tier={ticket.ticketType || "Standard"}
            title={ticket.title}
            subtitle={ticket.venueName || ticket.city || ""}
            date={ticket.date}
            time={ticket.time}
            seat={ticket.passengerName}
            price={ticket.price?.toString() || "0"}
            currency={ticket.isVenueBooking ? ticket.currency || "RWF" : "RWF"}
            cover={ticket.design.coverImage || ticket.cover || ""}
            logoText={ticket.design.logoText || "Agatike"}
            logoImage={ticket.design.logoImage}
            logoScale={ticket.design.logoScale || 24}
            logoOpacity={ticket.design.logoOpacity ?? 1}
            logoColorMode={ticket.design.logoColorMode || "original"}
            orderId={ticket.orderId}
            qrValue={`${window.location.origin}/v/${ticket.orderId}`}
            previewMode="Front"
            layout={
              ticket.design.layout || {
                titleSize: 30,
                subtitleSize: 14,
                metaSize: 11,
                titleAlign: "left",
                titleOffsetY: 0,
                subtitleOffsetY: 0,
                metaOffsetY: 0,
              }
            }
            back={
              ticket.design.back || {
                backText: "",
                backImage: "",
                backImageOpacity: 0.3,
              }
            }
          />
        ) : (
          <DynamicPrintablePass ticket={ticket} config={config} />
        )}
      </div>

      {/* Back Side */}
      <div
        id={`${id}-back`}
        className="overflow-hidden shadow-none flex"
        style={{
          fontFamily: isCustomDesign ? undefined : "'Inter', sans-serif",
          width,
          height,
        }}
      >
        {isCustomDesign ? (
          <TicketPreview
            template={ticket.design.template}
            palette={ticket.design.palette || { from: "#1f2937", to: "#111827", name: "Dark" }}
            font={ticket.design.font || { css: "sans-serif", name: "Modern" }}
            tier={ticket.ticketType || "Standard"}
            title={ticket.title}
            subtitle={ticket.venueName || ticket.city || ""}
            date={ticket.date}
            time={ticket.time}
            seat={ticket.passengerName}
            price={ticket.price?.toString() || "0"}
            currency={ticket.isVenueBooking ? ticket.currency || "RWF" : "RWF"}
            cover={ticket.design.coverImage || ticket.cover || ""}
            logoText={ticket.design.logoText || "Agatike"}
            logoImage={ticket.design.logoImage}
            logoScale={ticket.design.logoScale || 24}
            logoOpacity={ticket.design.logoOpacity ?? 1}
            logoColorMode={ticket.design.logoColorMode || "original"}
            orderId={ticket.orderId}
            qrValue={`${window.location.origin}/v/${ticket.orderId}`}
            previewMode="Back"
            layout={
              ticket.design.layout || {
                titleSize: 30,
                subtitleSize: 14,
                metaSize: 11,
                titleAlign: "left",
                titleOffsetY: 0,
                subtitleOffsetY: 0,
                metaOffsetY: 0,
              }
            }
            back={
              ticket.design.back || {
                backText: "",
                backImage: "",
                backImageOpacity: 0.3,
              }
            }
          />
        ) : (
          <DynamicPrintablePassBack ticket={ticket} config={config} />
        )}
      </div>
    </div>
  );
}

function DynamicPrintablePassBack({
  ticket,
  config,
}: {
  ticket: any;
  config?: TicketTemplateConfig;
}) {
  const bgColor = config?.bgColor || "#1a1a1a";
  const textColor = config?.textColor || "#ffffff";
  const accentColor = config?.accentColor || "#ea580c";

  return (
    <div className="w-full h-full flex" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Left stub: similar to front but styled for back */}
      <div className="w-[120px] bg-white text-black flex flex-col items-center justify-between py-6 border-r-2 border-dashed border-gray-400">
        <div className="rounded bg-gray-100 p-2 flex flex-col items-center gap-1.5">
          <QRCode value={ticket.orderId || "TIX-001"} size={70} />
        </div>
        <p className="text-[9px] uppercase tracking-wider text-center text-gray-500 font-bold px-1">
          Scan to Verify
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col p-8 justify-between">
        {ticket.cover && !config?.bgColor && (
          <img
            src={ticket.cover}
            alt="Event"
            className="absolute inset-0 w-full h-full object-cover opacity-10 -scale-x-100"
          />
        )}
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50 mb-3">
            Terms & Conditions
          </p>
          <div
            className="ticket-back-content text-[11px] text-white/80 leading-relaxed max-w-[420px]"
            dangerouslySetInnerHTML={{ __html: DEFAULT_TERMS_HTML }}
          />
        </div>

        <div className="relative z-10 text-[10px] opacity-60 flex justify-between border-t border-white/10 pt-3">
          <p>Organized by Agatike Connect Partners</p>
          <p>Support: support@agatike.com</p>
        </div>
      </div>

      {/* Right stub matching the standard front tear-off stub */}
      <div className="w-[160px] bg-white text-black p-6 flex flex-col justify-between items-center text-center relative border-l-2 border-dashed border-gray-400">
        <div className="absolute -left-4 -top-4 w-8 h-8 bg-black rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-black rounded-full" />

        <div className="w-full text-center space-y-4">
          <p className="text-sm font-black tracking-wider" style={{ color: accentColor }}>
            Agatike
          </p>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">
              Reference
            </p>
            <p className="text-xs font-mono font-bold mt-1">{ticket.orderId}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">
              Pass Type
            </p>
            <p className="text-xs font-bold mt-0.5">{ticket.ticketType || "General Entry"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrintableTicketPreview({
  ticket,
  config,
}: {
  ticket: any;
  config?: TicketTemplateConfig;
}) {
  return (
    <div
      className="w-[800px] h-[300px] overflow-hidden flex shadow-2xl rounded-2xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <DynamicPrintablePass ticket={ticket} config={config} />
    </div>
  );
}

function DynamicPrintablePass({ ticket, config }: { ticket: any; config?: TicketTemplateConfig }) {
  const layout = config?.layout || ticket?.ticketCategory || "default";
  const bgColor = config?.bgColor;
  const textColor = config?.textColor || "#ffffff";
  const accentColor = config?.accentColor;
  const labels = config?.labels || {};

  if (layout === "movie") {
    return (
      <div
        className="w-full h-full flex"
        style={{ backgroundColor: bgColor || "#dc2626", color: textColor }}
      >
        {/* Left Side: Main Info */}
        <div className="flex-1 flex flex-col justify-between p-8 border-r-2 border-dashed border-white/50 relative">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-4xl font-serif italic uppercase tracking-wider mb-1 leading-tight">
                {ticket.title}
              </h1>
              <p className="text-base uppercase tracking-widest opacity-80">
                {ticket.cinema || ticket.venue}
              </p>
            </div>
            <Film className="w-10 h-10 opacity-30 flex-shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">
                {labels.date || "Date"}
              </p>
              <p className="text-base font-bold">{ticket.date}</p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">
                {labels.time || "Time"}
              </p>
              <p className="text-base font-bold">
                {ticket.time || ticket.showtimes?.[0] || "18:30"}
              </p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">
                {labels.screen || "Screen"}
              </p>
              <p className="text-base font-bold truncate">{ticket.screen || "Main Screen"}</p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">
                Quantity
              </p>
              <p className="text-base font-bold">{ticket.quantity || 1} Ticket{ticket.quantity !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Tear-off Stub */}
        <div
          className="w-[200px] p-6 flex flex-col justify-between items-center text-center relative"
          style={{ backgroundColor: accentColor || "#b91c1c" }}
        >
          {/* Perforation Cutouts */}
          <div className="absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full" />
          <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full" />

          <p className="text-2xl font-bold tracking-[0.3em] uppercase -rotate-90 absolute left-4 top-1/2 -translate-y-1/2 opacity-20 whitespace-nowrap">
            {labels.admitOne || "Admit One"}
          </p>

          <div className="z-10 ml-8 w-full flex flex-col items-center">
            <p className="text-xs uppercase tracking-widest mb-1">
              {labels.bookingRef || "Booking Ref"}
            </p>
            <p className="text-sm font-mono font-bold mb-4">{ticket.orderId || "ORD-12345"}</p>
            <div className="bg-white p-2 rounded-lg flex flex-col items-center gap-2">
              <QRCode value={ticket.orderId || "ORD-12345"} size={60} />
              <div className="scale-75 origin-top text-black">
                <Barcode
                  value={ticket.orderId || "ORD-12345"}
                  displayValue={false}
                  height={30}
                  width={1.5}
                  background="transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layout === "conference") {
    return (
      <div
        className="w-full h-full flex"
        style={{ backgroundColor: bgColor || "#0ea5e9", color: textColor }}
      >
        <div className="flex-1 p-8 border-r-2 border-dashed border-white/50 flex flex-col justify-between">
          <div className="flex items-center gap-6">
            {ticket.passengerProfile ? (
              <img
                src={ticket.passengerProfile}
                alt={ticket.passengerName || "Attendee"}
                className="w-24 h-24 rounded-full border-4 border-white object-cover shrink-0 animate-fade-in"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                <User className="w-12 h-12" />
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-widest opacity-80 mb-1">
                {labels.attendee || "Attendee"}
              </p>
              <h2 className="text-4xl font-bold mb-1">{ticket.passengerName || "Guest"}</h2>
              <p className="text-xl font-medium" style={{ color: accentColor || "#fde047" }}>
                {ticket.ticketType || "Attendee"}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold mb-1">{ticket.title}</h3>
              <p className="opacity-80 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {ticket.venue || ticket.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest opacity-70">
                {labels.accessLevel || "Access Level"}
              </p>
              <p className="text-2xl font-black tracking-widest uppercase">ALL ACCESS</p>
            </div>
          </div>
        </div>

        <div className="w-[200px] bg-white text-black p-6 flex flex-col justify-between items-center text-center relative">
          <div className="absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full shadow-inner" />
          <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full shadow-inner" />

          <Briefcase className="w-8 h-8 mb-2" style={{ color: bgColor || "#0ea5e9" }} />
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            {labels.bookingRef || "Registration"}
          </p>
          <p className="text-xs font-mono font-bold mb-auto">{ticket.orderId || "REG-98765"}</p>

          <div className="w-full mt-4 flex flex-col items-center gap-2">
            <QRCode value={ticket.orderId || "REG-98765"} size={64} />
            <div className="scale-[0.8] origin-top">
              <Barcode
                value={ticket.orderId || "REG-98765"}
                displayValue={false}
                height={40}
                width={2}
                background="transparent"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Event Layout
  return (
    <div
      className="w-full h-full flex"
      style={{ backgroundColor: bgColor || "#1a1a1a", color: textColor }}
    >
      {/* Left side: QR Code and Barcode */}
      <div className="w-[120px] bg-white text-black flex flex-col items-center justify-between py-6 border-r-2 border-dashed border-gray-400">
        <QRCode value={ticket.orderId || "TIX-001"} size={70} />

        <div className="flex-1 flex items-center justify-center -rotate-90">
          <Barcode
            value={ticket.orderId || "TIX-001"}
            displayValue={true}
            height={40}
            width={1.5}
            fontSize={14}
            background="transparent"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {ticket.cover && !bgColor && (
          <img
            src={ticket.cover}
            alt="Event"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 p-8 flex flex-col justify-between h-full">
          <div>
            <p
              className="font-bold tracking-[0.3em] uppercase text-sm mb-2"
              style={{ color: accentColor || "#f97316" }}
            >
              Live Performance
            </p>
            <h1 className="text-6xl font-black uppercase leading-none drop-shadow-lg max-w-[400px]">
              {ticket.title}
            </h1>
          </div>

          <div className="flex gap-6 items-end drop-shadow-md bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3">
            <div>
              <p className="text-[9px] opacity-70 uppercase tracking-widest mb-0.5">
                {labels.location || "Location"}
              </p>
              <p className="text-xs font-bold">{ticket.city}</p>
              <p className="text-xs opacity-80">{ticket.venue}</p>
            </div>
            <div>
              <p className="text-[9px] opacity-70 uppercase tracking-widest mb-0.5">
                {labels.date || "Date"}
              </p>
              <p className="text-xs font-bold">{ticket.date}</p>
            </div>
            <div>
              <p className="text-[9px] opacity-70 uppercase tracking-widest mb-0.5">
                {labels.time || "Time"}
              </p>
              <p className="text-xs font-bold" style={{ color: accentColor || "#fb923c" }}>
                {ticket.time}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tear-off Stub */}
      <div className="w-[160px] bg-white text-black p-4 flex flex-col justify-center items-center relative border-l-2 border-dashed border-gray-400">
        <div className="absolute -left-4 -top-4 w-8 h-8 bg-black rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-black rounded-full" />

        <div className="w-full text-center space-y-6">
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">
              {labels.gate || "Gate"}
            </p>
            <p
              className={`font-black ${ticket.ticketCategory === "sports" ? "text-2xl" : "text-xs"}`}
            >
              {ticket.ticketCategory === "sports" ? ticket.gate || "Gate 3" : "Main Entrance"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">
              {labels.row || "Row"}
            </p>
            <p className="text-2xl font-black">24</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">
              {labels.seat || "Seat"}
            </p>
            <p
              className="text-lg font-black leading-tight px-1"
              style={{ color: accentColor || "#ea580c" }}
            >
              {ticket.seat || "36"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
