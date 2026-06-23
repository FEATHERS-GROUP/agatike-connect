import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, Smartphone, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onProceed: (details?: { phone?: string; network?: string }) => void;
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
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");

  const handleProceed = () => {
    if (paymentMethod === "momo") {
      onProceed({ phone, network });
    } else {
      onProceed();
    }
  };

  const isMomoComplete = phone.length >= 9 && network !== "";

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

          <div
            className={`w-full flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
              paymentMethod === "momo"
                ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                : "border-border/60 hover:bg-secondary/40"
            }`}
          >
            <button
              onClick={() => setPaymentMethod("momo")}
              className="w-full flex items-center gap-4 text-left"
            >
              <div className="h-10 w-10 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold">Mobile Money</p>
                <p className="text-xs text-muted-foreground">MTN MoMo, Airtel Money, M-Pesa</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "momo" ? "border-primary" : "border-muted-foreground/30"}`}
              >
                {paymentMethod === "momo" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            </button>

            {paymentMethod === "momo" && (
              <div className="pt-2 pb-1 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs text-muted-foreground">Network Provider</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger className="bg-background border-border/60">
                      <SelectValue placeholder="Select Network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN_MOMO_RWA">MTN Rwanda</SelectItem>
                      <SelectItem value="AIRTEL_OAPI_RWA">Airtel Rwanda</SelectItem>
                      <SelectItem value="MTN_MOMO_UGA">MTN Uganda</SelectItem>
                      <SelectItem value="AIRTEL_OAPI_UGA">Airtel Uganda</SelectItem>
                      <SelectItem value="VODACOM_MPESA_TZA">M-Pesa Tanzania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g. 250788123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="bg-background border-border/60"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Include country code without + (e.g. 250 for Rwanda)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleProceed}
            disabled={isProcessing || isGenerating || (paymentMethod === "momo" && !isMomoComplete)}
            className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isGenerating
              ? "Generating..."
              : isProcessing
                ? "Processing..."
                : `Proceed with ${paymentMethod === "apple" ? "Apple Pay" : paymentMethod === "card" ? "Credit Card" : "Mobile Money"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
