import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Calendar, Users, MapPin, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useState, useEffect } from "react";

export function VenueCheckoutDesktop({ venue }: { venue: any }) {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [ticketsData, setTicketsData] = useState<Record<string, number>>({});
  const [attendees, setAttendees] = useState<{ name: string; id_document: string }[]>([]);
  const [name, setName] = useState("");
  const [idPassport, setIdPassport] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!venue) return null;

  const totalTickets = Object.values(ticketsData).reduce((a, b) => a + (Number(b) || 0), 0) || 0;
  
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
      <div className="min-h-screen bg-secondary/20 flex flex-col items-center justify-center p-4">
        <div className="bg-card p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-border/50">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <Link
          to="/venues/$venueId"
          params={{ venueId: venue.id }}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-8">Secure your tickets</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Form */}
          <div className="flex-1 bg-card rounded-3xl p-8 border border-border/50 shadow-[var(--shadow-card)]">
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Select Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 bg-secondary/40 max-w-sm"
                  />
                </div>
              </div>

              <div className="border-t border-border/40 pt-6">
                <h3 className="text-xl font-semibold mb-4">Select Tickets</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {(venue?.pricing_tiers?.length > 0 ? venue.pricing_tiers : [{ name: "Standard Entry", amount: 0 }]).map((tier: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden flex justify-between items-center bg-secondary/30 p-5 rounded-2xl border-2 border-border/50 border-dashed"
                    >
                      <Ticket className="absolute -right-4 -bottom-4 h-24 w-24 text-muted-foreground/5 rotate-[-15deg] pointer-events-none" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Ticket className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold tracking-tight">{tier.name || "Standard Entry"}</p>
                          <p className="text-sm font-semibold text-muted-foreground">
                            {tier.amount > 0 ? `${venue.currency} ${Number(tier.amount).toLocaleString()}` : "Free"}
                          </p>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <Input
                          type="number"
                          min="0"
                          value={ticketsData[tier.name || "Standard Entry"] || ""}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setTicketsData((p) => ({ ...p, [tier.name || "Standard Entry"]: val }));
                          }}
                          className="w-20 h-12 text-center font-bold text-lg rounded-xl border-2"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-6">
                <h3 className="text-xl font-semibold mb-4">Primary Attendee</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <Input
                      required
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-secondary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      ID or Passport Number
                    </label>
                    <Input
                      required
                      placeholder="Enter ID/Passport"
                      value={idPassport}
                      onChange={(e) => setIdPassport(e.target.value)}
                      className="h-12 bg-secondary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    <Input
                      required
                      placeholder="e.g. Rwandan"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="h-12 bg-secondary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. 0780000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 bg-secondary/40"
                    />
                  </div>
                </div>
              </div>

              {totalTickets > 1 && (
                <div className="border-t border-border/40 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Additional Attendees</h3>
                    <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                      {totalTickets - 1} ticket{totalTickets - 1 !== 1 ? "s" : ""} left to assign
                    </span>
                  </div>

                  <div className="space-y-4">
                    {attendees.map((att, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-sm font-medium text-muted-foreground">Attendee {idx + 2} Name</label>
                          <Input
                            required
                            placeholder="Full Name"
                            value={att.name}
                            onChange={(e) => {
                              const newArr = [...attendees];
                              newArr[idx].name = e.target.value;
                              setAttendees(newArr);
                            }}
                            className="h-12 rounded-xl bg-secondary/40"
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="text-sm font-medium text-muted-foreground">ID / Passport</label>
                          <Input
                            placeholder="Optional"
                            value={att.id_document}
                            onChange={(e) => {
                              const newArr = [...attendees];
                              newArr[idx].id_document = e.target.value;
                              setAttendees(newArr);
                            }}
                            className="h-12 rounded-xl bg-secondary/40"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={totalTickets === 0}
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Pay {total > 0 ? `${venue.currency} ${total.toLocaleString()}` : "Free"}
              </Button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-24 rounded-3xl border border-border/50 bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-xl font-bold tracking-tight mb-6">Order Summary</h3>

              <div className="flex gap-4 mb-6 pb-6 border-b border-border/40">
                <img
                  src={venue.cover_url}
                  alt={venue.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{venue.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {venue.city || venue.address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm font-medium mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{date ? date : "Not selected"}</span>
                </div>
                {Object.entries(ticketsData).filter(([_, qty]) => qty > 0).map(([name, qty], i) => {
                   const tier = venue.pricing_tiers?.find((t: any) => t.name === name) || { amount: 0 };
                   return (
                     <div key={i} className="flex justify-between">
                       <span className="text-muted-foreground">{name} x {qty}</span>
                       <span>{tier.amount > 0 ? `${venue.currency} ${(qty * tier.amount).toLocaleString()}` : "Free"}</span>
                     </div>
                   );
                })}
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between items-end">
                <span className="text-muted-foreground font-semibold">Total</span>
                <span className="text-3xl font-bold text-primary">
                  {total > 0 ? `${venue.currency} ${total.toLocaleString()}` : "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
