import { createFileRoute } from "@tanstack/react-router";
import { Ticket, QrCode, Clock, Share } from "lucide-react";

// Stubbed mock data
const events: any[] = [];

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

function WalletPage() {
  const activeTicket = events[0]; // mock active ticket

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe-top md:pb-8 md:max-w-md md:mx-auto md:border-x md:border-border/40 md:min-h-[100dvh] shadow-xl">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Wallet</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border/40 pb-2 mb-6">
          <button className="text-primary font-bold border-b-2 border-primary pb-2 px-1">
            Upcoming
          </button>
          <button className="text-muted-foreground font-medium pb-2 px-1">Past</button>
          <button className="text-muted-foreground font-medium pb-2 px-1">Passes</button>
        </div>

        {/* Active Ticket Card */}
        <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl mb-8 group">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-background opacity-90 group-hover:scale-105 transition-transform duration-700" />

          <div className="relative flex flex-col items-center p-6 text-white text-center">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              VIP Pass
            </span>
            <img
              src={activeTicket.cover}
              alt="Event"
              className="h-20 w-20 rounded-2xl object-cover border-2 border-white/20 mb-3 shadow-lg"
            />

            <h2 className="text-2xl font-bold leading-tight mb-1">{activeTicket.title}</h2>
            <p className="text-white/80 text-sm mb-6">
              {activeTicket.date} • {activeTicket.time}
            </p>

            {/* QR Code Section */}
            <div className="bg-white p-4 rounded-3xl shadow-inner mb-6">
              <div className="w-48 h-48 bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
                <QrCode className="h-32 w-32 text-white" />
                {/* Scanner sweep animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-transparent h-full w-full animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>

            <div className="w-full border-t border-dashed border-white/30 pt-4 flex justify-between text-left">
              <div>
                <p className="text-white/60 text-[10px] uppercase font-bold">Venue</p>
                <p className="font-semibold text-sm">{activeTicket.venue}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase font-bold">Order ID</p>
                <p className="font-semibold text-sm">#TXN-9842A</p>
              </div>
            </div>
          </div>

          {/* Perforated edges effect */}
          <div className="absolute top-1/2 -left-3 h-6 w-6 bg-background rounded-full -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 h-6 w-6 bg-background rounded-full -translate-y-1/2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground font-bold py-3.5 rounded-full hover:bg-secondary/80 transition-colors">
            <Share className="h-4 w-4" /> Transfer
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-full shadow-[var(--shadow-glow)] hover:bg-primary/90 transition-colors">
            Apple Wallet
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
