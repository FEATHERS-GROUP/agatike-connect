import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Calendar, Users, MapPin, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useState } from "react";

export function VenueCheckoutDesktop({ venue }: { venue: any }) {
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Select Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 bg-secondary/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Number of Tickets
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={tickets}
                    onChange={(e) => setTickets(parseInt(e.target.value))}
                    className="h-12 bg-secondary/40"
                  />
                </div>
              </div>

              <div className="border-t border-border/40 pt-6">
                <h3 className="text-xl font-semibold mb-4">Attendee Information</h3>

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

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-[var(--shadow-glow)] transition-transform active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Pay {price > 0 ? `${venue.currency} ${total.toLocaleString()}` : "Free"}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets</span>
                  <span>
                    {tickets} x {venue.currency} {price}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between items-end">
                <span className="text-muted-foreground font-semibold">Total</span>
                <span className="text-3xl font-bold text-primary">
                  {price > 0 ? `${venue.currency} ${total.toLocaleString()}` : "Free"}
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
