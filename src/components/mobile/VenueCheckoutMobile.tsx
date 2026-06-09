import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Calendar, Users, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function VenueCheckoutMobile({ venue }: { venue: any }) {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [tickets, setTickets] = useState(1);
  const [name, setName] = useState("");
  const [idPassport, setIdPassport] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!venue) return null;

  const price = venue.pricing_tiers?.[0]?.amount || 0;
  const total = price * tickets;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      navigate({ to: "/venues" });
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-8 px-4">
          Your ticket for {venue.name} has been secured.
        </p>
        <div className="bg-secondary/30 p-4 rounded-2xl mb-8 flex items-center justify-center gap-2 font-mono text-xl border border-border/40">
          <Ticket className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-widest">
            {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Redirecting to venues...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3 pt-safe-top">
        <div className="flex items-center gap-3">
          <Link
            to="/venues/$venueId"
            params={{ venueId: venue.id }}
            className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="font-bold tracking-tight leading-tight">Checkout</h1>
            <p className="text-xs text-muted-foreground">{venue.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="px-4 pt-6 space-y-6">
        {/* Ticket Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight">Ticket Details</h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date
              </label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 bg-secondary/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                <Users className="w-4 h-4" /> Number of Tickets
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                required
                value={tickets}
                onChange={(e) => setTickets(parseInt(e.target.value))}
                className="h-12 bg-secondary/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Attendee Details */}
        <div className="space-y-4 border-t border-border/40 pt-6">
          <h2 className="text-lg font-bold tracking-tight">Attendee Information</h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Full Name
              </label>
              <Input
                required
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-secondary/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                ID or Passport Number
              </label>
              <Input
                required
                placeholder="Enter ID/Passport"
                value={idPassport}
                onChange={(e) => setIdPassport(e.target.value)}
                className="h-12 bg-secondary/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Nationality
              </label>
              <Input
                required
                placeholder="e.g. Rwandan"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="h-12 bg-secondary/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Phone Number
              </label>
              <Input
                required
                type="tel"
                placeholder="e.g. 0780000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 bg-secondary/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/90 backdrop-blur-xl border-t border-border/40 z-30">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto mb-2">
            <span className="text-sm text-muted-foreground font-medium">Total Price</span>
            <span className="text-xl font-bold text-foreground">
              {price > 0 ? `${venue.currency} ${total.toLocaleString()}` : "Free"}
            </span>
          </div>
          <div className="max-w-md mx-auto">
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-sm font-bold shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
              style={{ background: "var(--gradient-primary)" }}
            >
              Pay & Confirm
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
