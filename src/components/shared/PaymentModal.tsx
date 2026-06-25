import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, Smartphone, ArrowRightLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceWallet } from "@/api/wallet";
import { getExchangeRate } from "@/api/pawapay";

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onProceed: (details?: {
    phone?: string;
    network?: string;
    currency?: string;
    convertedAmount?: number;
  }) => void;
  isProcessing: boolean;
  isGenerating: boolean;
  workspaceId: string;
  baseAmount: number;
  quantity?: number;
  subtotal?: number;
  itemLabel?: string;
  baseCurrency?: string;
  userPhone?: string;
}

const ALL_NETWORKS = [
  { label: "MTN Rwanda", value: "MTN_MOMO_RWA", curr: "RWF", code: "250", maxLen: 9 },
  { label: "Airtel Rwanda", value: "AIRTEL_OAPI_RWA", curr: "RWF", code: "250", maxLen: 9 },
  { label: "MTN Uganda", value: "MTN_MOMO_UGA", curr: "UGX", code: "256", maxLen: 9 },
  { label: "Airtel Uganda", value: "AIRTEL_OAPI_UGA", curr: "UGX", code: "256", maxLen: 9 },
  {
    label: "Safaricom M-Pesa Kenya",
    value: "SAFARICOM_M_PESA_KEN",
    curr: "KES",
    code: "254",
    maxLen: 9,
  },
  { label: "MTN Zambia", value: "MTN_MOMO_ZMB", curr: "ZMW", code: "260", maxLen: 9 },
  { label: "Airtel Zambia", value: "AIRTEL_OAPI_ZMB", curr: "ZMW", code: "260", maxLen: 9 },
  { label: "MTN Cameroon", value: "MTN_MOMO_CMR", curr: "XAF", code: "237", maxLen: 9 },
  { label: "MTN Cote d'Ivoire", value: "MTN_MOMO_CIV", curr: "XOF", code: "225", maxLen: 10 },
  { label: "Orange Cote d'Ivoire", value: "ORANGE_CIV", curr: "XOF", code: "225", maxLen: 10 },
  { label: "Airtel DRC", value: "AIRTEL_OAPI_COD", curr: "CDF", code: "243", maxLen: 9 },
  { label: "Orange DRC", value: "ORANGE_COD", curr: "CDF", code: "243", maxLen: 9 },
  { label: "Vodacom DRC", value: "VODACOM_MPESA_COD", curr: "CDF", code: "243", maxLen: 9 },
  { label: "Airtel Gabon", value: "AIRTEL_OAPI_GAB", curr: "XAF", code: "241", maxLen: 8 },
  {
    label: "Airtel Republic of the Congo",
    value: "AIRTEL_OAPI_COG",
    curr: "XAF",
    code: "242",
    maxLen: 9,
  },
  {
    label: "MTN Republic of the Congo",
    value: "MTN_MOMO_COG",
    curr: "XAF",
    code: "242",
    maxLen: 9,
  },
  { label: "Free Senegal", value: "FREE_SEN", curr: "XOF", code: "221", maxLen: 9 },
  { label: "Orange Senegal", value: "ORANGE_SEN", curr: "XOF", code: "221", maxLen: 9 },
  { label: "Orange Sierra Leone", value: "ORANGE_SLE", curr: "SLE", code: "232", maxLen: 8 },
  { label: "Moov Benin", value: "MOOV_BEN", curr: "XOF", code: "229", maxLen: 8 },
  { label: "MTN Benin", value: "MTN_MOMO_BEN", curr: "XOF", code: "229", maxLen: 8 },
];

export function PaymentModal({
  isOpen,
  onOpenChange,
  paymentMethod,
  setPaymentMethod,
  onProceed,
  isProcessing,
  isGenerating,
  workspaceId,
  baseAmount,
  quantity,
  subtotal,
  itemLabel,
  baseCurrency: propsBaseCurrency,
  userPhone,
}: PaymentModalProps) {
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");

  // Fetch Wallet to get base currency and supported networks
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["wallet", workspaceId],
    queryFn: () => getWorkspaceWallet({ data: { workspace_id: workspaceId } } as any),
    enabled: isOpen && !!workspaceId,
  });

  const baseCurrency = propsBaseCurrency || wallet?.currency || "RWF";
  const supportedNetworks = wallet?.supported_networks || [];

  const availableNetworks = useMemo(() => {
    if (!supportedNetworks || supportedNetworks.length === 0) return ALL_NETWORKS;
    return ALL_NETWORKS.filter((n) => supportedNetworks.includes(n.value));
  }, [supportedNetworks]);

  const selectedNetworkObj = useMemo(
    () => availableNetworks.find((n) => n.value === network),
    [network, availableNetworks],
  );
  const targetCurrency =
    paymentMethod === "momo" ? selectedNetworkObj?.curr || baseCurrency : baseCurrency;

  // Fetch FX Rate
  const { data: fxData, isLoading: isFxLoading } = useQuery({
    queryKey: ["fx", baseCurrency, targetCurrency],
    queryFn: () => getExchangeRate({ data: { base: baseCurrency, target: targetCurrency } } as any),
    enabled: !!baseCurrency && !!targetCurrency && baseCurrency !== targetCurrency,
  });

  // Calculate final amount
  const markupRate = fxData?.markupRate || 1;
  const convertedAmount = Math.ceil(baseAmount * markupRate);

  // Set default network if none selected and available exists
  useEffect(() => {
    if (isOpen && !network && availableNetworks.length > 0) {
      setNetwork(availableNetworks[0].value);
    }
  }, [isOpen, availableNetworks, network]);

  const handleProceed = () => {
    if (paymentMethod === "momo") {
      const fullPhone = selectedNetworkObj ? `${selectedNetworkObj.code}${phone}` : phone;
      onProceed({ phone: fullPhone, network, currency: targetCurrency, convertedAmount });
    } else {
      onProceed();
    }
  };

  const isMomoComplete = phone.length >= (selectedNetworkObj?.maxLen || 8) && network !== "";

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
        className="max-w-[95vw] md:max-w-3xl p-0 overflow-hidden rounded-3xl bg-background/95 backdrop-blur-xl border-border/60"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Column: Payment Methods */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-bold text-left">Payment Method</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              {/* Temporarily hidden Apple Pay & Credit Card per request
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
              */}

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
                    {paymentMethod === "momo" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>

                {paymentMethod === "momo" && (
                  <div className="pt-2 pb-1 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs text-muted-foreground">Network Provider</Label>
                      {isWalletLoading ? (
                        <div className="h-10 w-full animate-pulse bg-secondary rounded-lg" />
                      ) : (
                        <Select value={network} onValueChange={setNetwork}>
                          <SelectTrigger className="bg-background border-border/60 h-11">
                            <SelectValue placeholder="Select Network" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {availableNetworks.map((net) => (
                              <SelectItem key={net.value} value={net.value}>
                                {net.label} ({net.curr})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Phone Number</Label>
                        {userPhone && phone !== userPhone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const cleanPhone = userPhone.replace(/\D/g, "");
                              const max = selectedNetworkObj?.maxLen || 15;
                              // If cleanPhone starts with country code, we might want to strip it,
                              // but let's just use the last maxLen characters if it's too long,
                              // or just let them edit it.
                              const val = cleanPhone.length > max ? cleanPhone.slice(-max) : cleanPhone;
                              setPhone(val);
                            }}
                            className="text-[10px] font-medium text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-full transition-colors"
                          >
                            Use my saved number
                          </button>
                        )}
                      </div>
                      <div className="flex h-11 bg-background border border-border/60 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                        {selectedNetworkObj && (
                          <div className="flex items-center px-3 bg-secondary/30 border-r border-border/60 text-sm text-muted-foreground font-medium">
                            +{selectedNetworkObj.code}
                          </div>
                        )}
                        <Input
                          type="tel"
                          placeholder={
                            selectedNetworkObj
                              ? `e.g. ${"7".padEnd(selectedNetworkObj.maxLen, "0")}`
                              : "e.g. 788123456"
                          }
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const max = selectedNetworkObj?.maxLen || 15;
                            if (val.length <= max) setPhone(val);
                          }}
                          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Receipt / Summary */}
          <div className="md:w-80 bg-secondary/30 border-t md:border-t-0 md:border-l border-border/60 p-6 flex flex-col">
            <h3 className="font-bold text-lg mb-6">Order Summary</h3>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                {quantity && subtotal && (
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      {quantity} x {itemLabel || "Item(s)"} @ {baseCurrency}{" "}
                      {subtotal.toLocaleString()}
                    </span>
                    <span>
                      {baseCurrency} {(quantity * subtotal).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-semibold">
                    {baseCurrency} {baseAmount.toLocaleString()}
                  </span>
                </div>

                {paymentMethod === "momo" && baseCurrency !== targetCurrency && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <ArrowRightLeft className="w-3 h-3 text-primary" />
                      Currency Conversion
                    </div>

                    {isFxLoading ? (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching live rates...
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Live Rate</span>
                          <span className="font-mono">
                            1 {baseCurrency} = {markupRate.toFixed(4)} {targetCurrency}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60">
              <div className="flex justify-between items-end mb-6">
                <span className="font-bold">Total to Pay</span>
                <div className="text-right">
                  {isFxLoading && paymentMethod === "momo" && baseCurrency !== targetCurrency ? (
                    <div className="h-8 w-24 animate-pulse bg-secondary rounded-lg" />
                  ) : (
                    <span className="text-2xl font-black text-primary">
                      {paymentMethod === "momo" ? targetCurrency : baseCurrency}{" "}
                      {convertedAmount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={handleProceed}
                disabled={
                  isProcessing ||
                  isGenerating ||
                  (paymentMethod === "momo" && (!isMomoComplete || isFxLoading))
                }
                className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isGenerating
                  ? "Generating..."
                  : isProcessing
                    ? "Processing..."
                    : `Pay ${paymentMethod === "momo" ? targetCurrency : baseCurrency} ${convertedAmount.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
