import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  Lock,
  User,
  Phone,
  FileText,
  Mail,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockBusTrips } from "@/lib/mock-bus-data";

export const Route = createFileRoute("/buses/$tripId")({
  component: BusTripDetails,
});

type Step = "seats" | "details" | "payment";

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport: string;
}

const emptyPassenger = (): PassengerInfo => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  passport: "",
});

function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const methods = [
    {
      id: "momo",
      label: "Mobile Money",
      sub: "MTN MoMo, Airtel Money",
      icon: <Smartphone className="h-5 w-5" />,
      bg: "bg-yellow-500 text-yellow-950",
    },
    {
      id: "card",
      label: "Credit Card",
      sub: "Visa, Mastercard, Amex",
      icon: <CreditCard className="h-5 w-5" />,
      bg: "bg-secondary text-foreground",
    },
    {
      id: "wallet",
      label: "Digital Wallet",
      sub: "Fast, secure checkout",
      icon: <Wallet className="h-5 w-5" />,
      bg: "bg-foreground text-background",
    },
  ];
  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${value === m.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/40"}`}
        >
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${m.bg}`}
          >
            {m.icon}
          </div>
          <div className="flex-1">
            <p className="font-bold">{m.label}</p>
            <p className="text-xs text-muted-foreground">{m.sub}</p>
          </div>
          <div
            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${value === m.id ? "border-primary" : "border-muted-foreground"}`}
          >
            {value === m.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
          </div>
        </button>
      ))}
      {value === "card" && (
        <div className="p-5 rounded-2xl bg-secondary/30 border border-border/40 grid gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1.5">
            <Label>Card Number</Label>
            <Input placeholder="0000 0000 0000 0000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Expiry</Label>
              <Input placeholder="MM/YY" />
            </div>
            <div className="space-y-1.5">
              <Label>CVC</Label>
              <Input placeholder="123" />
            </div>
          </div>
        </div>
      )}
      {value === "momo" && (
        <div className="p-5 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1.5">
            <Label>Mobile Money Number</Label>
            <Input placeholder="+250 788 000 000" />
          </div>
        </div>
      )}
    </div>
  );
}

function BusTripDetails() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = mockBusTrips.find((t) => t.id === tripId);

  const [step, setStep] = useState<Step>("seats");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [expandedPassenger, setExpandedPassenger] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [processing, setProcessing] = useState(false);
  const [passenger, setPassenger] = useState<PassengerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    passport: "", // kept for legacy compat
  });

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Trip not found</h2>
          <Link to="/buses/mobile" className="text-primary hover:underline mt-4 inline-block">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const { layout } = trip;
  const totalSeats = layout.seats.length;
  const bookedSeatsCount = layout.seats.filter((s) => s.isBooked).length;
  const isBusFull = totalSeats === bookedSeatsCount;
  const totalPrice = selectedSeats.length * trip.price;

  // Sync passengers array length whenever seats change
  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId],
    );
    setPassengers((prev) => {
      const next = selectedSeats.includes(seatId)
        ? prev.slice(0, prev.length - 1)
        : [...prev, emptyPassenger()];
      return next;
    });
  };

  const selectedSeatNumbers = selectedSeats
    .map((id) => layout.seats.find((s) => s.id === id)?.number)
    .filter(Boolean);

  // Update a single passenger field
  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const rows = useMemo(() => {
    const r = [];
    let seatIndex = 0;
    for (let i = 0; i < layout.rows; i++) {
      const rowItems = [];
      for (const itemType of layout.pattern) {
        if (itemType === "seat") {
          rowItems.push(layout.seats[seatIndex]);
          seatIndex++;
        } else {
          rowItems.push(null);
        }
      }
      r.push(rowItems);
    }
    return r;
  }, [layout]);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => navigate({ to: "/wallet" }), 1500);
  };

  const detailsValid =
    passengers.length === selectedSeats.length &&
    passengers.every((p) => p.firstName && p.lastName && p.phone && p.passport);

  // ── SEAT MAP (shared between mobile and desktop) ──────────────────────────
  const SeatMap = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const btnSize =
      size === "sm" ? "w-9 h-9 text-[9px]" : "w-11 h-11 text-[10px] md:w-12 md:h-12 md:text-xs";
    const gap = size === "sm" ? "gap-3" : "gap-3 md:gap-4";
    return (
      <div className={`flex flex-col ${gap}`}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex ${gap} justify-center relative z-10`}>
            {row.map((seat, colIndex) => {
              if (seat === null)
                return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-6 md:w-8" />;
              const isSelected = selectedSeats.includes(seat.id);
              let cls = "bg-secondary/40 border-border hover:border-primary/40 hover:bg-primary/10";
              let textCls = "text-foreground/60";
              if (seat.isBooked) {
                cls = "bg-secondary border-border/60 cursor-not-allowed opacity-50";
                textCls = "text-muted-foreground";
              } else if (isSelected) {
                cls = "bg-primary border-primary shadow-md shadow-primary/30";
                textCls = "text-primary-foreground font-bold";
              }
              return (
                <button
                  key={seat.id}
                  disabled={seat.isBooked || step !== "seats"}
                  onClick={() => toggleSeat(seat.id)}
                  className={`${btnSize} rounded-xl border-2 flex flex-col items-center justify-center transition-all leading-none ${cls} ${isSelected ? "scale-110" : "active:scale-95"}`}
                >
                  <span className={`${textCls} leading-none`}>{seat.number}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // ── LEGEND ────────────────────────────────────────────────────────────────
  const Legend = () => (
    <div className="flex items-center justify-center gap-6 text-xs font-semibold">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-secondary border border-border/60" />
        <span className="text-muted-foreground">Booked</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-secondary/30 border border-border" />
        <span>Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-primary" />
        <span className="text-primary">Selected</span>
      </div>
    </div>
  );

  // ── PASSENGER FORM (one per seat) ────────────────────────────────────────
  const PassengersForm = () => (
    <div className="space-y-4">
      {selectedSeats.map((seatId, idx) => {
        const seatNum = layout.seats.find((s) => s.id === seatId)?.number;
        const p = passengers[idx] ?? emptyPassenger();
        const isOpen = expandedPassenger === idx;
        const isComplete = p.firstName && p.lastName && p.phone && p.passport;
        return (
          <div
            key={seatId}
            className={`rounded-2xl border overflow-hidden transition-all ${
              isComplete ? "border-primary/40 bg-primary/5" : "border-border/60 bg-card"
            }`}
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setExpandedPassenger(isOpen ? -1 : idx)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <div>
                  <p className="font-bold text-sm">
                    Passenger {idx + 1} — Seat #{seatNum}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isComplete ? `${p.firstName} ${p.lastName}` : "Fill in details"}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {/* Accordion Body */}
            {isOpen && (
              <div className="px-5 pb-5 space-y-3 border-t border-border/40 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      First Name *
                    </Label>
                    <Input
                      placeholder="John"
                      value={p.firstName}
                      onChange={(e) => updatePassenger(idx, "firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Last Name *
                    </Label>
                    <Input
                      placeholder="Doe"
                      value={p.lastName}
                      onChange={(e) => updatePassenger(idx, "lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={p.email}
                    onChange={(e) => updatePassenger(idx, "email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number *
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+250 788 000 000"
                    value={p.phone}
                    onChange={(e) => updatePassenger(idx, "phone", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Passport / National ID *
                  </Label>
                  <Input
                    placeholder="e.g. P12345678"
                    value={p.passport}
                    onChange={(e) => updatePassenger(idx, "passport", e.target.value)}
                  />
                </div>
                {idx < selectedSeats.length - 1 && (
                  <button
                    type="button"
                    className="text-xs text-primary font-semibold mt-1 hover:underline"
                    onClick={() => setExpandedPassenger(idx + 1)}
                  >
                    Next passenger →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── BOOKING SUMMARY CARD ──────────────────────────────────────────────────
  const BookingSummary = ({ compact = false }: { compact?: boolean }) => (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">Route</span>
        <span className="font-semibold">
          {trip.origin.split(",")[0]} → {trip.destination.split(",")[0]}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">Agency</span>
        <span className="font-semibold">{trip.agency}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">Date</span>
        <span className="font-semibold">{trip.date}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">Departure</span>
        <span className="font-semibold">{trip.departureTime}</span>
      </div>
      <div className="flex justify-between text-sm items-start gap-2">
        <span className="text-muted-foreground font-medium shrink-0">Seats</span>
        <div className="flex flex-wrap gap-1 justify-end">
          {selectedSeatNumbers.map((n) => (
            <span
              key={n}
              className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20"
            >
              #{n}
            </span>
          ))}
        </div>
      </div>
      {!compact && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Price/seat</span>
          <span className="font-semibold">
            {trip.currency} {trip.price.toLocaleString()}
          </span>
        </div>
      )}
      <div className="pt-3 border-t border-border/60 flex justify-between items-center">
        <span className="font-bold text-base">Total</span>
        <span className="text-xl font-black text-primary">
          {trip.currency} {totalPrice.toLocaleString()}
        </span>
      </div>
    </div>
  );

  // ── STEP INDICATOR ────────────────────────────────────────────────────────
  const steps: { id: Step; label: string }[] = [
    { id: "seats", label: "Select Seats" },
    { id: "details", label: "Passenger Info" },
    { id: "payment", label: "Payment" },
  ];
  const StepBar = () => (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const stepIdx = steps.findIndex((x) => x.id === step);
        const done = i < stepIdx;
        const active = s.id === step;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-0.5 rounded-full ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/20 text-foreground font-sans relative">
      {/* ================================================================== */}
      {/* MOBILE VIEW */}
      {/* ================================================================== */}
      <div className="block md:hidden pb-28">
        {/* Mobile Header */}
        <div
          className="relative pt-12 pb-20 px-4 rounded-b-[2rem] z-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-center justify-between mb-4">
            {step === "seats" ? (
              <Link to="/buses/mobile" className="flex items-center gap-2 text-primary-foreground">
                <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span className="font-semibold">Back</span>
              </Link>
            ) : (
              <button
                onClick={() => setStep(step === "payment" ? "details" : "seats")}
                className="flex items-center gap-2 text-primary-foreground"
              >
                <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span className="font-semibold">Back</span>
              </button>
            )}
            <div className="text-center">
              <p className="text-primary-foreground/80 text-xs font-medium">
                {step === "seats"
                  ? "Select Seats"
                  : step === "details"
                    ? "Passenger Info"
                    : "Payment"}
              </p>
              <div className="flex items-center justify-center gap-4 text-lg font-bold text-primary-foreground mt-0.5">
                <span>{trip.origin.split(",")[0]}</span>
                <ArrowLeftRight className="h-4 w-4 opacity-80" />
                <span>{trip.destination.split(",")[0]}</span>
              </div>
            </div>
            <div className="w-8 h-8" />
          </div>
          <div className="flex justify-center mt-3">
            <StepBar />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="mx-4 relative z-10 -mt-8 space-y-4">
          {step === "seats" && (
            <>
              {/* Trip details card */}
              <div className="bg-card rounded-2xl shadow-lg border border-border/40 p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{trip.agency}</p>
                  <p className="text-xs text-muted-foreground">{trip.busType}</p>
                  <p className="text-sm font-semibold mt-1">
                    {trip.departureTime} – {trip.arrivalTime}
                  </p>
                  <p className="text-xs text-emerald-500 font-bold mt-0.5">
                    {totalSeats - bookedSeatsCount} seats left
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-primary">
                    {trip.currency} {trip.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">per seat</p>
                </div>
              </div>

              {/* Seat map card */}
              <div className="bg-card border border-border/40 rounded-3xl p-5 shadow-sm">
                <Legend />
                <div className="mt-6 relative mx-auto bg-card border-[3px] border-border/50 rounded-[3rem] pt-16 pb-8 px-4 w-fit overflow-hidden">
                  {/* Bus front */}
                  <div className="absolute top-0 left-0 right-0 h-14 bg-secondary/30 rounded-t-[2.5rem] border-b border-border/30 flex items-center justify-end px-5">
                    <div className="w-7 h-7 rounded-full border border-border bg-background flex items-center justify-center mt-3">
                      <div className="w-2 h-2 rounded-full bg-border" />
                    </div>
                  </div>
                  {/* Aisle label */}
                  <div className="absolute inset-y-14 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                    <span className="text-border text-lg font-bold tracking-[0.4em] -rotate-90 whitespace-nowrap opacity-40">
                      AISLE
                    </span>
                  </div>
                  <SeatMap size="sm" />
                </div>
              </div>
            </>
          )}

          {step === "details" && (
            <div className="bg-card border border-border/40 rounded-3xl p-5 shadow-sm space-y-5">
              <div>
                <h2 className="font-bold text-lg mb-1">Passenger Details</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected — fill
                  in details for each passenger.
                </p>
              </div>
              <PassengersForm />
              <div className="bg-secondary/40 rounded-2xl p-4 border border-border/40 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Trip Summary
                </p>
                <BookingSummary compact />
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-card border border-border/40 rounded-3xl p-5 shadow-sm space-y-5">
              <div>
                <h2 className="font-bold text-lg mb-1">Payment Method</h2>
                <p className="text-xs text-muted-foreground">Select how you'd like to pay.</p>
              </div>
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              <div className="bg-secondary/40 rounded-2xl p-4 border border-border/40 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Order Summary
                </p>
                <BookingSummary compact />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-background/95 backdrop-blur-xl border-t border-border/60 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            {step === "seats" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total</p>
                    <p className="text-2xl font-black text-primary">
                      {trip.currency} {totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {selectedSeats.length} {selectedSeats.length === 1 ? "Seat" : "Seats"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedSeatNumbers.length > 0
                        ? `#${selectedSeatNumbers.join(", #")}`
                        : "None selected"}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full rounded-2xl h-14 text-base font-bold shadow-lg active:scale-[0.98] transition-transform"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={selectedSeats.length === 0 || isBusFull}
                  onClick={() => setStep("details")}
                >
                  {isBusFull
                    ? "Trip Fully Booked"
                    : selectedSeats.length === 0
                      ? "Select a Seat"
                      : "Continue →"}
                </Button>
              </>
            )}
            {step === "details" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Seats:{" "}
                    <span className="text-foreground font-bold">
                      #{selectedSeatNumbers.join(", #")}
                    </span>
                  </p>
                  <p className="font-black text-primary">
                    {trip.currency} {totalPrice.toLocaleString()}
                  </p>
                </div>
                <Button
                  className="w-full rounded-2xl h-14 text-base font-bold shadow-lg active:scale-[0.98] transition-transform"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={!detailsValid}
                  onClick={() => setStep("payment")}
                >
                  Continue to Payment →
                </Button>
              </>
            )}
            {step === "payment" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">Total to pay</p>
                  <p className="font-black text-xl text-primary">
                    {trip.currency} {totalPrice.toLocaleString()}
                  </p>
                </div>
                <Button
                  className="w-full rounded-2xl h-14 text-base font-bold shadow-lg active:scale-[0.98] transition-transform"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={processing}
                  onClick={handlePay}
                >
                  {processing
                    ? "Processing…"
                    : `Pay ${trip.currency} ${totalPrice.toLocaleString()}`}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Secure encrypted checkout
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DESKTOP VIEW */}
      {/* ================================================================== */}
      <div className="hidden md:flex flex-col min-h-screen bg-background">
        <Navbar />

        {/* Desktop Header */}
        <div className="border-b border-border/60 bg-secondary/10">
          <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {step === "seats" ? (
                <Link
                  to="/buses"
                  className="h-11 w-11 bg-background border border-border/60 shadow-sm flex items-center justify-center rounded-2xl hover:bg-secondary transition-colors shrink-0 group"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                </Link>
              ) : (
                <button
                  onClick={() => setStep(step === "payment" ? "details" : "seats")}
                  className="h-11 w-11 bg-background border border-border/60 shadow-sm flex items-center justify-center rounded-2xl hover:bg-secondary transition-colors shrink-0 group"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-4 text-2xl font-bold tracking-tight">
                  <span>{trip.origin.split(",")[0]}</span>
                  <ArrowLeftRight className="h-5 w-5 text-muted-foreground/60" />
                  <span>{trip.destination.split(",")[0]}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5 bg-background border border-border/40 shadow-sm px-2.5 py-1 rounded-full text-foreground text-xs">
                    <img src={trip.agencyLogo} alt={trip.agency} className="w-4 h-4 rounded-full" />
                    {trip.agency}
                  </span>
                  <span>•</span>
                  <span>
                    {trip.date} at {trip.departureTime}
                  </span>
                  <span>•</span>
                  <span className="text-primary font-bold">
                    {trip.currency} {trip.price.toLocaleString()} / seat
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StepBar />
              {isBusFull ? (
                <span className="inline-flex items-center gap-1.5 text-destructive font-semibold text-sm bg-destructive/10 px-3 py-1.5 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                  Fully Booked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-4 w-4" />
                  {totalSeats - bookedSeatsCount} Available
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="mx-auto max-w-6xl w-full px-6 py-10 grid grid-cols-[1fr_380px] gap-10 items-start flex-1">
          {/* Left: Seat Map or Form */}
          <div>
            {step === "seats" && (
              <div className="bg-card border border-border/60 rounded-3xl p-10 shadow-sm">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold">Select Your Seats</h2>
                  <p className="text-muted-foreground mt-1.5">
                    Click any available seat to add it to your booking.
                  </p>
                </div>
                <Legend />
                <div className="mt-10 relative mx-auto bg-background border-4 border-border/50 rounded-[4rem] rounded-b-[2rem] pt-24 pb-12 px-8 w-fit shadow-inner overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-20 bg-secondary/30 rounded-t-[3.5rem] border-b border-border/40 flex items-center justify-end px-8">
                    <div className="w-10 h-10 rounded-full border-2 border-border/60 bg-background flex items-center justify-center mt-6">
                      <div className="w-3 h-3 rounded-full bg-border" />
                    </div>
                  </div>
                  <div className="absolute inset-y-20 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                    <span className="text-border text-2xl font-bold tracking-[0.5em] -rotate-90 whitespace-nowrap opacity-40">
                      LOWER DECK
                    </span>
                  </div>
                  <SeatMap size="md" />
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="bg-card border border-border/60 rounded-3xl p-10 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">Passenger Details</h2>
                <p className="text-muted-foreground mb-8">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected — fill
                  in details for each passenger. Fields marked * are required.
                </p>
                <PassengersForm />
              </div>
            )}

            {step === "payment" && (
              <div className="bg-card border border-border/60 rounded-3xl p-10 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
                <p className="text-muted-foreground mb-8">
                  All transactions are encrypted and secure.
                </p>
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>
            )}
          </div>

          {/* Right: Sticky Summary */}
          <div className="sticky top-24">
            <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] overflow-hidden border border-border/60">
              <div className="bg-secondary/30 p-6 border-b border-border/60">
                <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
                <BookingSummary />
              </div>

              <div className="p-6 space-y-4">
                {step === "seats" && (
                  <Button
                    className="w-full rounded-2xl h-14 text-base font-bold shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={selectedSeats.length === 0 || isBusFull}
                    onClick={() => setStep("details")}
                  >
                    {isBusFull
                      ? "Trip Fully Booked"
                      : selectedSeats.length === 0
                        ? "Select Seats First"
                        : "Continue →"}
                  </Button>
                )}
                {step === "details" && (
                  <Button
                    className="w-full rounded-2xl h-14 text-base font-bold shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={!detailsValid}
                    onClick={() => setStep("payment")}
                  >
                    Continue to Payment →
                  </Button>
                )}
                {step === "payment" && (
                  <Button
                    className="w-full rounded-2xl h-14 text-base font-bold shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
                    style={{ background: "var(--gradient-primary)" }}
                    disabled={processing}
                    onClick={handlePay}
                  >
                    {processing
                      ? "Processing…"
                      : `Pay ${trip.currency} ${totalPrice.toLocaleString()}`}
                  </Button>
                )}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> SSL Encrypted · Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
