import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, CreditCard, Shield, Smartphone, Wallet, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { events, experiences } from "@/lib/mock-data";

export function BookingDesktop({ eventId }: { eventId: string }) {
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/events/$eventId"
          params={{ eventId }}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to event
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Left Column: Form & Payment */}
          <div className="space-y-10">
            <div>
              <h1 className="text-3xl font-bold mb-6">Checkout</h1>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="alex@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" placeholder="+250 788 123 456" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/40">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

              <div className="grid gap-4">
                <button
                  onClick={() => setPaymentMethod("apple")}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === "apple"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="h-12 w-12 bg-foreground text-background rounded-full flex items-center justify-center shrink-0">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Apple Pay</p>
                    <p className="text-sm text-muted-foreground">Fast, secure checkout</p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "apple" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "apple" && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Credit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "card" && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                {paymentMethod === "card" && (
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-border/40 grid gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVC</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setPaymentMethod("momo")}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === "momo"
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="h-12 w-12 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center shrink-0">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Mobile Money</p>
                    <p className="text-sm text-muted-foreground">MTN MoMo, Airtel Money</p>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {paymentMethod === "momo" && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className="sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="flex gap-4 mb-6">
                <img src={event.cover} className="h-24 w-20 rounded-xl object-cover" />
                <div className="flex flex-col">
                  <h3 className="font-semibold leading-tight">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(event as any).date} • {(event as any).venue || (event as any).city}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm border-y border-border/60 py-4 mb-4">
                <div className="flex justify-between items-center">
                  <span>1x General Admission</span>
                  <span className="font-medium">
                    {event.currency || "$"}
                    {event.price || 25}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Service Fee</span>
                  <span>$2.50</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {event.currency || "$"}
                  {(event.price || 25) + 2.5}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide mb-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                {processing
                  ? "Processing..."
                  : `Pay ${event.currency || "$"}${(event.price || 25) + 2.5}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" /> SSL Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
