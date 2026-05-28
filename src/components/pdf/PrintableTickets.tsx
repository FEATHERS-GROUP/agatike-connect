import React from "react";
import { Ticket as TicketIcon, Film, MapPin, Briefcase, User } from "lucide-react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

export function PrintableTicket({ ticket, id }: { ticket: any; id: string }) {
  return (
    <div
      id={id}
      className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none bg-white text-black w-[800px] h-[300px] overflow-hidden shadow-none flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <DynamicPrintablePass ticket={ticket} />
    </div>
  );
}

function DynamicPrintablePass({ ticket }: { ticket: any }) {
  if (ticket.ticketCategory === "movie") {
    return (
      <div className="w-full h-full flex bg-[#dc2626] text-white">
        {/* Left Side: Main Info */}
        <div className="flex-1 flex flex-col justify-between p-8 border-r-2 border-dashed border-white/50 relative">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-4xl font-serif italic uppercase tracking-wider mb-1 leading-tight">
                {ticket.title}
              </h1>
              <p className="text-base uppercase tracking-widest text-white/80">{ticket.cinema}</p>
            </div>
            <Film className="w-10 h-10 text-white/30 flex-shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">Date</p>
              <p className="text-base font-bold">{ticket.date}</p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">Time</p>
              <p className="text-base font-bold">{ticket.showtimes?.[0] || "18:30"}</p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">Screen</p>
              <p className="text-base font-bold">IMAX 4</p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">Seat</p>
              <p className="text-base font-bold">{ticket.seat?.split("·")[1]?.trim() || "H4"}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Tear-off Stub */}
        <div className="w-[200px] bg-[#b91c1c] p-6 flex flex-col justify-between items-center text-center relative">
          {/* Perforation Cutouts */}
          <div className="absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full" />
          <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full" />

          <p className="text-2xl font-bold tracking-[0.3em] uppercase -rotate-90 absolute left-4 top-1/2 -translate-y-1/2 text-white/20 whitespace-nowrap">
            Admit One
          </p>

          <div className="z-10 ml-8 w-full flex flex-col items-center">
            <p className="text-xs uppercase tracking-widest mb-1 text-white">Booking Ref</p>
            <p className="text-sm font-mono font-bold mb-4 text-white">{ticket.orderId}</p>
            <div className="bg-white p-2 rounded-lg flex flex-col items-center gap-2">
              <QRCode value={ticket.orderId} size={60} />
              <div className="scale-75 origin-top">
                <Barcode
                  value={ticket.orderId}
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

  if (ticket.ticketCategory === "conference") {
    return (
      <div className="w-full h-full flex bg-[#0ea5e9] text-white">
        <div className="flex-1 p-8 border-r-2 border-dashed border-white/50 flex flex-col justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400">
              <User className="w-12 h-12" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-white/80 mb-1">Attendee</p>
              <h2 className="text-4xl font-bold mb-1">Alex Doe</h2>
              <p className="text-xl text-yellow-300 font-medium">Frontend Engineer @ Agatike</p>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-bold mb-1">{ticket.title}</h3>
              <p className="text-white/80 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {ticket.venue || ticket.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-white/70">Access Level</p>
              <p className="text-2xl font-black tracking-widest uppercase">ALL ACCESS</p>
            </div>
          </div>
        </div>

        <div className="w-[200px] bg-white text-black p-6 flex flex-col justify-between items-center text-center relative">
          <div className="absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full shadow-inner" />
          <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full shadow-inner" />

          <Briefcase className="w-8 h-8 text-[#0ea5e9] mb-2" />
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Registration</p>
          <p className="text-xs font-mono font-bold mb-auto">{ticket.orderId}</p>

          <div className="w-full mt-4 flex flex-col items-center gap-2">
            <QRCode value={ticket.orderId} size={64} />
            <div className="scale-[0.8] origin-top">
              <Barcode
                value={ticket.orderId}
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

  // Default Event / Experience Layout
  return (
    <div className="w-full h-full flex bg-[#1a1a1a] text-white">
      {/* Left side: QR Code and Barcode */}
      <div className="w-[120px] bg-white text-black flex flex-col items-center justify-between py-6 border-r-2 border-dashed border-gray-400">
        <QRCode value={ticket.orderId} size={70} />

        <div className="flex-1 flex items-center justify-center -rotate-90">
          <Barcode
            value={ticket.orderId}
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
        {ticket.cover && (
          <img
            src={ticket.cover}
            alt="Event"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

        <div className="relative z-10 p-8 flex flex-col justify-between h-full">
          <div>
            <p className="text-orange-500 font-bold tracking-[0.3em] uppercase text-sm mb-2">
              Live Performance
            </p>
            <h1 className="text-6xl font-black uppercase leading-none drop-shadow-lg max-w-[400px]">
              {ticket.title}
            </h1>
          </div>

          <div className="flex gap-6 items-end drop-shadow-md bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3">
            <div>
              <p className="text-[9px] text-white/70 uppercase tracking-widest mb-0.5">Location</p>
              <p className="text-xs font-bold text-white">{ticket.city}</p>
              <p className="text-xs text-white/80">{ticket.venue}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/70 uppercase tracking-widest mb-0.5">Date</p>
              <p className="text-xs font-bold text-white">{ticket.date}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/70 uppercase tracking-widest mb-0.5">Time</p>
              <p className="text-xs font-bold text-orange-400">{ticket.time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tear-off Stub */}
      <div className="w-[160px] bg-white text-black p-4 flex flex-col justify-center items-center relative border-l-2 border-dashed border-gray-400">
        <div className="absolute -left-4 -top-4 w-8 h-8 bg-black rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-black rounded-full" />

        {ticket.ticketCategory === "experience" ? (
          <div className="w-full text-center space-y-5">
            <div>
              <p className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">
                Date
              </p>
              <p className="text-sm font-black leading-tight">{ticket.date}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">
                Time
              </p>
              <p className="text-sm font-black text-orange-600">{ticket.time}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">
                Location
              </p>
              <p className="text-xs font-bold leading-tight">{ticket.city}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{ticket.venue}</p>
            </div>
          </div>
        ) : (
          <div className="w-full text-center space-y-6">
            <div>
              <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">Gate</p>
              <p className="text-2xl font-black">12</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">Row</p>
              <p className="text-2xl font-black">24</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">Seat</p>
              <p className="text-lg font-black text-orange-600 leading-tight px-1">
                {ticket.seat || "36"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
