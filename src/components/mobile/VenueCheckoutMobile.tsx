import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Calendar, Users, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export function VenueCheckoutMobile({ venue }: { venue: any }) {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [ticketsData, setTicketsData] = useState<Record<string, number>>({});
  const [attendees, setAttendees] = useState<{ name: string; id_document: string }[]>([]);
  const [name, setName] = useState("");
  const [idPassport, setIdPassport] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);

  if (!venue) return null;

  const totalTickets = Object.values(ticketsData).reduce((a, b) => a + (Number(b) || 0), 0) || 0;
  const isStep1Valid = date !== "" && totalTickets > 0;
  
  const total = (venue.pricing_tiers?.length > 0 ? venue.pricing_tiers : [{ name: "Standard Entry", amount: 0 }]).reduce((acc: number, tier: any) => {
    const qty = ticketsData[tier.name || "Standard Entry"] || 0;
    return acc + qty * (Number(tier.amount) || 0);
  }, 0) || 0;

  useEffect(() => {
    const requiredAttendees = Math.max(0, totalTickets - 1);
    setAttendees((prev) => {
      if (prev.length === requiredAttendees) return prev;
      if (prev.length > requiredAttendees) return prev.slice(0, requiredAttendees);
      const newAttendees = [...prev];
      while (newAttendees.length < requiredAttendees) {
        newAttendees.push({ name: "", id_document: "" });
      }
      return newAttendees;
    });
  }, [totalTickets]);

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
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>1</div>
          <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Ticket Details</h2>

            <div className="space-y-4">
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
            
            <div className="pt-2">
              <label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Select Tickets
              </label>
              <div className="space-y-3">
                {(venue?.pricing_tiers?.length > 0 ? venue.pricing_tiers : [{ name: "Standard Entry", amount: 0 }]).map((tier: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden flex justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border/40"
                  >
                    <div>
                      <p className="font-bold text-sm tracking-tight">{tier.name || "Standard Entry"}</p>
                      <p className="text-sm font-semibold text-primary">
                        {tier.amount > 0 ? `${venue.currency} ${Number(tier.amount).toLocaleString()}` : "Free"}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={ticketsData[tier.name || "Standard Entry"] || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setTicketsData((p) => ({ ...p, [tier.name || "Standard Entry"]: val }));
                      }}
                      className="w-20 h-10 text-center font-bold bg-background border-transparent"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="w-full h-12 rounded-xl text-sm font-bold shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
            >
              Continue to Details
            </Button>
          </div>
        </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">Primary Attendee</h2>
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs text-muted-foreground">Edit Tickets</Button>
              </div>

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

        {/* Additional Attendees */}
        {totalTickets > 1 && (
          <div className="space-y-4 border-t border-border/40 pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold tracking-tight">Additional Attendees</h2>
              <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                {totalTickets - 1} left
              </span>
            </div>

            <div className="space-y-6">
              {attendees.map((att, idx) => (
                <div key={idx} className="space-y-3 bg-secondary/10 p-4 rounded-xl border border-border/20">
                  <div className="font-medium text-sm border-b border-border/40 pb-2 mb-2">
                    Attendee {idx + 2}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                    <Input
                      required
                      placeholder="Full Name"
                      value={att.name}
                      onChange={(e) => {
                        const newArr = [...attendees];
                        newArr[idx].name = e.target.value;
                        setAttendees(newArr);
                      }}
                      className="h-10 text-sm bg-secondary/40 border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">ID / Passport (Optional)</label>
                    <Input
                      placeholder="Optional"
                      value={att.id_document}
                      onChange={(e) => {
                        const newArr = [...attendees];
                        newArr[idx].id_document = e.target.value;
                        setAttendees(newArr);
                      }}
                      className="h-10 text-sm bg-secondary/40 border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Fixed Bottom Action Bar */}
        {step === 2 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-background/90 backdrop-blur-xl border-t border-border/40 z-30">
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto mb-2">
              <span className="text-sm text-muted-foreground font-medium">Total Price</span>
              <span className="text-xl font-bold text-foreground">
                {total > 0 ? `${venue.currency} ${total.toLocaleString()}` : (totalTickets > 0 ? "Free" : `${venue.currency} 0`)}
              </span>
            </div>
            <div className="max-w-md mx-auto">
              <Button
                type="submit"
                disabled={totalTickets === 0}
                className="w-full h-12 rounded-xl text-sm font-bold shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
                style={{ background: "var(--gradient-primary)" }}
              >
                Pay & Confirm
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
