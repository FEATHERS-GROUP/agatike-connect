import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, CreditCard, Shield, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { events, experiences } from "@/lib/mock-data";

export function BookingMobile({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const event =
    events.find((e) => e.id === eventId) || experiences.find((x) => x.id === eventId) || events[0];
  const [paymentMethod, setPaymentMethod] = useState("apple");
  const [processing, setProcessing] = useState(false);

  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate({ to: "/wallet" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30 pt-safe-top border-b border-border/40">
        <Link to="/events/$eventId" params={{ eventId }} className="p-2 -ml-2 text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-bold text-lg tracking-tight">Checkout</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="flex gap-4 bg-card/60 rounded-3xl p-4 border border-border/40 backdrop-blur">
            <img src={event.cover} className="h-24 w-20 rounded-xl object-cover" />
            <div className="flex flex-col flex-1 py-1">
              <h3 className="font-bold text-base leading-tight mb-1">{event.title}</h3>
              <p className="text-xs text-muted-foreground mb-auto">
                {(event as any).date} • {(event as any).venue || (event as any).city}
              </p>
              <div className="flex justify-between items-end mt-2">
                <span className="text-sm font-medium">1x General Admission</span>
                <span className="font-medium">
                  {formatCurrency(event.price || 25, event.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-lg font-bold mb-4">Payment Method</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("apple")}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                paymentMethod === "apple"
                  ? "border-primary bg-primary/10"
                  : "border-border/40 bg-card/50"
              }`}
            >
              <div className="h-10 w-10 bg-foreground text-background rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold">Apple Pay</p>
                <p className="text-xs text-muted-foreground">Fast, secure checkout</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "apple" ? "border-primary" : "border-muted-foreground"}`}
              >
                {paymentMethod === "apple" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/10"
                  : "border-border/40 bg-card/50"
              }`}
            >
              <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold">Credit Card</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-muted-foreground"}`}
              >
                {paymentMethod === "card" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("momo")}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                paymentMethod === "momo"
                  ? "border-primary bg-primary/10"
                  : "border-border/40 bg-card/50"
              }`}
            >
              <div className="h-10 w-10 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold">Mobile Money</p>
                <p className="text-xs text-muted-foreground">MTN MoMo, Airtel Money</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground"}`}
              >
                {paymentMethod === "momo" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-40 pb-safe">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-sm font-medium text-muted-foreground">Total to pay</span>
          <span className="text-xl font-bold">
            {formatCurrency((event.price || 25) + 2.5, event.currency)}
          </span>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full h-14 rounded-full text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
          style={{ background: "var(--gradient-primary)" }}
        >
          {processing
            ? "Processing..."
            : `Pay ${formatCurrency((event.price || 25) + 2.5, event.currency)}`}
        </Button>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" /> Secure encrypted checkout
        </div>
      </div>
    </div>
  );
}
