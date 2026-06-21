import { Lock } from "lucide-react";
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
  onRetryGeneration,
  onPay,
}: OrderSummaryProps) {
  return (
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
        {Object.entries(cart).map(([cartKey, qty]) => {
          if (qty <= 0) return null;
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
