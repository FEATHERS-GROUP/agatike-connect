import { Lock, CalendarDays, Clock, MapPin, User, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  event: any;
  cart: Record<string, number>;
  total: number;
  currency: string;
  issuedTicketsLength: number;
  isGenerating: boolean;
  isCheckingOut: boolean;
  isFormValid: boolean;
  getTierDetails: (tierId: string) => any;
  eventProducts?: any[];
  onRetryGeneration: () => void;
  onPay: () => void;
}

export function OrderSummary({
  event,
  cart,
  total,
  currency,
  issuedTicketsLength,
  isGenerating,
  isCheckingOut,
  isFormValid,
  getTierDetails,
  eventProducts = [],
  onRetryGeneration,
  onPay,
}: OrderSummaryProps) {
  const date = (event as any).date || event.tour_stops?.[0]?.date || "";
  const time = (event as any).time || event.tour_stops?.[0]?.time || "";
  const venue = (event as any).venue || event.tour_stops?.[0]?.venue || "";
  const city = (event as any).city || event.tour_stops?.[0]?.city || "";
  const location = [venue, city].filter(Boolean).join(", ");
  const organizer = event.workspaces?.organizer?.name || event.workspaces?.name || "";
  const category = event.category || "";

  return (
    <div className="sticky top-24 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-xl font-semibold mb-5">Order Summary</h2>

      {/* Event cover */}
      <div className="relative rounded-2xl overflow-hidden mb-5 aspect-[16/7] w-full">
        <img
          src={event.cover}
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow">{event.title}</h3>
          {category && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
              <Tag className="h-2.5 w-2.5" />{category}
            </span>
          )}
        </div>
      </div>

      {/* Event meta */}
      <div className="space-y-2.5 mb-5">
        {date && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-foreground font-medium">{date}</span>
          </div>
        )}
        {time && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-foreground font-medium">{time}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-foreground font-medium">{location}</span>
          </div>
        )}
        {organizer && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span>Hosted by <span className="text-foreground font-medium">{organizer}</span></span>
          </div>
        )}
      </div>

      <div className="space-y-4 text-sm border-y border-border/60 py-4 mb-4">
        {Object.entries(cart).map(([cartKey, qty]) => {
          if (qty <= 0) return null;

          if (cartKey.startsWith("merch_")) {
            const parts = cartKey.split("_");
            const productId = parts[1];
            const variantInfo = parts.slice(2).join(" · ");
            const merch = eventProducts.find((p: any) => p.id === productId);
            const lineTotal = merch ? parseFloat(merch.price || 0) * qty : 0;
            return (
              <div key={cartKey} className="flex justify-between items-start">
                <span className="flex flex-col">
                  <span>{qty}x {merch?.name || "Merchandise"}</span>
                  {variantInfo && (
                    <span className="text-[11px] text-muted-foreground">{variantInfo}</span>
                  )}
                </span>
                <span className="font-medium">
                  {formatCurrency(lineTotal, currency)}
                </span>
              </div>
            );
          }

          const [, tierId] = cartKey.split("_");
          const tier = getTierDetails(tierId);
          if (!tier) return null;
          return (
            <div key={cartKey} className="flex justify-between items-center">
              <span>
                {qty}x {tier.type}
              </span>
              <span className="font-medium">
                {formatCurrency(parseFloat(tier.cost || tier.price || 0) * qty, currency)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-end mb-8">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold">{formatCurrency(total, currency)}</span>
      </div>

      {issuedTicketsLength > 0 ? (
        <Button
          onClick={onRetryGeneration}
          disabled={isGenerating}
          className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide mb-4"
          style={{ background: "var(--gradient-primary)" }}
        >
          Retry Ticket Generation
        </Button>
      ) : (
        <Button
          onClick={onPay}
          disabled={!isFormValid || isCheckingOut || isGenerating}
          className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide mb-4"
          style={{ background: "var(--gradient-primary)" }}
        >
          Pay {formatCurrency(total, currency)}
        </Button>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" /> SSL Encrypted Checkout
      </div>
    </div>
  );
}
