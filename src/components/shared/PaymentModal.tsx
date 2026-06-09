import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Smartphone } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onProceed: () => void;
  isProcessing: boolean;
  isGenerating: boolean;
}

export function PaymentModal({
  isOpen,
  onOpenChange,
  paymentMethod,
  setPaymentMethod,
  onProceed,
  isProcessing,
  isGenerating,
}: PaymentModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && (isProcessing || isGenerating)) return;
        onOpenChange(open);
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[95vw] sm:max-w-md rounded-3xl bg-background/95 backdrop-blur-xl border-border/60 p-5"
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold text-left">Payment Method</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setPaymentMethod("apple")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              paymentMethod === "apple"
                ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                : "border-border/60 hover:bg-secondary/40"
            }`}
          >
            <div className="h-10 w-10 bg-foreground text-background rounded-full flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold">Apple Pay</p>
              <p className="text-xs text-muted-foreground">Fast, secure checkout</p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "apple" ? "border-primary" : "border-muted-foreground/30"}`}
            >
              {paymentMethod === "apple" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod("card")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              paymentMethod === "card"
                ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                : "border-border/60 hover:bg-secondary/40"
            }`}
          >
            <div className="h-10 w-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold">Credit Card</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-muted-foreground/30"}`}
            >
              {paymentMethod === "card" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod("momo")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              paymentMethod === "momo"
                ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                : "border-border/60 hover:bg-secondary/40"
            }`}
          >
            <div className="h-10 w-10 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold">Mobile Money</p>
              <p className="text-xs text-muted-foreground">MTN MoMo, Airtel Money</p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground/30"}`}
            >
              {paymentMethod === "momo" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={onProceed}
            disabled={isProcessing || isGenerating}
            className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isGenerating
              ? "Generating Tickets..."
              : isProcessing
                ? "Processing..."
                : `Proceed with ${paymentMethod === "apple" ? "Apple Pay" : paymentMethod === "card" ? "Credit Card" : "Mobile Money"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
