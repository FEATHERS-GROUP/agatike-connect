import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, Smartphone, ArrowRightLeft, Loader2, ChevronLeft, MoreVertical, Shield } from "lucide-react";
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
import { getProfitableNetworks } from "@/api/pawapay";
import { simulateTransaction } from "@/api/simulation";

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
    shortfall?: number;
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
  themeColor?: string;
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
  { label: "Credit/Debit Card", value: "AGATIKE_CARD", curr: "ALL", code: "", maxLen: 0 },
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
  themeColor,
}: PaymentModalProps) {
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [cardCurrency, setCardCurrency] = useState("");

  const CARD_CURRENCIES = [
    { label: "Rwanda (RWF)", value: "RWF" },
    { label: "Kenya (KES)", value: "KES" },
    { label: "Uganda (UGX)", value: "UGX" },
    { label: "Tanzania (TZS)", value: "TZS" },
    { label: "Zambia (ZMW)", value: "ZMW" },
    { label: "United States (USD)", value: "USD" },
    { label: "Europe (EUR)", value: "EUR" },
    { label: "United Kingdom (GBP)", value: "GBP" },
  ];

  // Fetch Wallet to get base currency and supported networks
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["wallet", workspaceId],
    queryFn: () => getWorkspaceWallet({ data: { workspace_id: workspaceId } } as any),
    enabled: isOpen && !!workspaceId,
  });

  const baseCurrency = propsBaseCurrency || wallet?.currency || "RWF";
  const supportedNetworks =
    wallet?.supported_networks?.length > 0
      ? wallet.supported_networks
      : ALL_NETWORKS.map((n) => n.value);

  // Fetch profitability check for all supported networks
  const { data: profitableNetworksData, isLoading: isProfitableLoading } = useQuery({
    queryKey: ["profitableNetworks", workspaceId, baseAmount, supportedNetworks],
    queryFn: () =>
      getProfitableNetworks({
        data: { workspaceId, baseAmount: baseAmount || 1, networks: supportedNetworks },
      } as any),
    enabled: isOpen && !!workspaceId && supportedNetworks.length > 0,
  });

  const availableNetworks = useMemo(() => {
    if (!supportedNetworks || supportedNetworks.length === 0) return [];
    // If profitability data loaded, filter to profitable networks; otherwise show all supported
    if (profitableNetworksData) {
      return ALL_NETWORKS.filter((n) => profitableNetworksData.includes(n.value));
    }
    return ALL_NETWORKS.filter((n) => supportedNetworks.includes(n.value));
  }, [supportedNetworks, profitableNetworksData]);

  const selectedNetworkObj = useMemo(
    () => availableNetworks.find((n) => n.value === network),
    [network, availableNetworks],
  );
  const targetCurrency =
    paymentMethod === "momo"
      ? selectedNetworkObj?.curr || baseCurrency
      : cardCurrency || baseCurrency;

  const countryCode = selectedNetworkObj
    ? selectedNetworkObj.value.split("_").pop() || "RWA"
    : "RWA";

  // Simulation Engine (Pre-flight check)
  const activeNetwork = paymentMethod === "card" ? "AGATIKE_CARD" : network;
  const { data: simulation, isLoading: isSimulating } = useQuery({
    queryKey: [
      "simulate",
      baseAmount,
      workspaceId,
      activeNetwork,
      countryCode,
      baseCurrency,
      targetCurrency,
    ],
    queryFn: () =>
      simulateTransaction({
        data: {
          basePrice: baseAmount,
          workspaceId,
          network: activeNetwork || "UNKNOWN",
          countryCode,
          transactionId: crypto.randomUUID(),
          baseCurrency,
          targetCurrency,
        },
      } as any),
    enabled:
      isOpen &&
      !!workspaceId &&
      !!baseAmount &&
      ((paymentMethod === "momo" && !!network) || paymentMethod === "card"),
    retry: false,
    staleTime: 60000,
  });

  // Calculate final amount
  const markupRate = simulation?.markupRate || 1;
  const simulatedAmount = simulation?.totalCustomerCharge || baseAmount;
  const convertedAmount = simulatedAmount;

  // Set default network if none selected and available exists
  useEffect(() => {
    if (isOpen && !network && availableNetworks.length > 0) {
      setNetwork(availableNetworks[0].value);
    }
    if (isOpen && !cardCurrency && baseCurrency) {
      // Default card currency to base currency if it's in the list, otherwise USD or RWF
      const exists = CARD_CURRENCIES.find((c) => c.value === baseCurrency);
      setCardCurrency(exists ? baseCurrency : "USD");
    }
  }, [isOpen, availableNetworks, network, baseCurrency, cardCurrency]);

  const handleProceed = () => {
    if (paymentMethod === "momo") {
      const fullPhone = selectedNetworkObj ? `${selectedNetworkObj.code}${phone}` : phone;
      onProceed({
        phone: fullPhone,
        network,
        currency: targetCurrency,
        convertedAmount,
        shortfall: simulation?.shortfall || 0,
      });
    } else if (paymentMethod === "card") {
      onProceed({
        network: "AGATIKE_CARD",
        currency: targetCurrency,
        convertedAmount,
        shortfall: simulation?.shortfall || 0,
      });
    } else {
      onProceed();
    }
  };

  const isMomoComplete = phone.length >= (selectedNetworkObj?.maxLen || 8) && network !== "";
  const isBlocked = simulation?.decision === "blocked";

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
        className="w-full h-[100dvh] max-w-full m-0 p-0 rounded-none sm:h-auto sm:max-w-[95vw] md:max-w-4xl lg:max-w-5xl sm:rounded-3xl overflow-hidden bg-background/95 backdrop-blur-xl border-0 sm:border border-border/60 flex flex-col"
      >
        {/* Desktop View */}
        <div className="hidden md:flex flex-col md:flex-row flex-1 overflow-hidden h-full">
          {/* Left Column: Payment Methods */}
          <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-bold text-left">Payment Method</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              {/* Temporarily hidden Apple Pay
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
              */}

              {supportedNetworks.includes("AGATIKE_CARD") && (
                <div
                  className={`w-full flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                      : "border-border/60 hover:bg-secondary/40"
                  }`}
                >
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className="w-full flex items-center gap-4 text-left"
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
                      {paymentMethod === "card" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>

                  {paymentMethod === "card" && (
                    <div className="pt-2 pb-1 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs text-muted-foreground">Billing Currency</Label>
                        <Select value={cardCurrency} onValueChange={setCardCurrency}>
                          <SelectTrigger className="bg-background border-border/60 h-11">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {CARD_CURRENCIES.map((curr) => (
                              <SelectItem key={curr.value} value={curr.value}>
                                {curr.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`w-full flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
                  paymentMethod === "momo"
                    ? "border-orange-500/50 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                    : "border-border/60 hover:bg-secondary/40"
                }`}
              >
                <button
                  onClick={() => setPaymentMethod("momo")}
                  className="w-full flex items-center gap-4 text-left"
                >
                  <div className="relative h-12 w-12 rounded-[14px] bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 ring-1 ring-white/20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent)]" />
                    <Smartphone className="h-6 w-6 relative z-10" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[15px] text-foreground">Pay with Phone</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Mobile Money & Wallets</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "momo" ? "border-orange-500" : "border-muted-foreground/30"}`}
                  >
                    {paymentMethod === "momo" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                </button>

                {paymentMethod === "momo" && (
                  <div className="pt-2 pb-1 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs text-muted-foreground">Network Provider</Label>
                      {isWalletLoading || isProfitableLoading ? (
                        <div className="h-10 w-full animate-pulse bg-secondary rounded-lg" />
                      ) : availableNetworks.length === 0 ? (
                        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-medium">
                          The organizer has not configured any payment networks yet. Please contact
                          them so they can enable payments.
                        </div>
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
                    {availableNetworks.length > 0 && (
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
                                let val = cleanPhone;
                                if (selectedNetworkObj && val.startsWith(selectedNetworkObj.code)) {
                                  val = val.slice(selectedNetworkObj.code.length);
                                }
                                if (val.startsWith("0")) {
                                  val = val.slice(1);
                                }
                                if (val.length > max) {
                                  val = val.slice(-max);
                                }
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
                              let val = e.target.value.replace(/\D/g, "");
                              const max = selectedNetworkObj?.maxLen || 15;
                              if (val.startsWith("0") && val.length > 1) {
                                val = val.slice(1);
                              }
                              if (val.length <= max) setPhone(val);
                            }}
                            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-96 lg:w-[420px] bg-secondary/30 md:bg-primary border-t md:border-t-0 md:border-l border-border/60 p-6 md:p-10 lg:p-12 flex flex-col md:text-primary-foreground relative overflow-hidden">
            {/* Subtle Gradient Overlay on Desktop */}
            <div className="hidden md:block absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none"></div>

            <h3 className="font-bold text-lg md:text-xl mb-6 md:mb-8 relative z-10 md:text-primary-foreground/90">
              Order Summary
            </h3>

            <div className="flex-1 space-y-6 relative z-10">
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
                <div className="flex justify-between text-sm pt-4 border-t border-border/40 md:border-primary-foreground/20">
                  <span className="text-muted-foreground md:text-primary-foreground/70">
                    Base Price
                  </span>
                  <span className="font-semibold">
                    {baseCurrency} {baseAmount.toLocaleString()}
                  </span>
                </div>

                {baseCurrency !== targetCurrency && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <ArrowRightLeft className="w-3 h-3 text-primary" />
                      Currency Conversion
                    </div>

                    {isSimulating ? (
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
                  {isSimulating ? (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground md:text-primary-foreground/70">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Calculating exact fees...</span>
                    </div>
                  ) : simulation && (paymentMethod === "momo" || paymentMethod === "card") ? (
                    <div className="space-y-1 w-full text-sm">
                      <div className="flex justify-between text-muted-foreground md:text-primary-foreground/70">
                        <span>Base Ticket</span>
                        <span>
                          {simulation.convertedBasePrice?.toLocaleString() || baseAmount}{" "}
                          {targetCurrency}
                        </span>
                      </div>
                      {simulation.serviceFee > 0 && (
                        <div className="flex justify-between text-muted-foreground md:text-primary-foreground/70">
                          <span>Service Fee</span>
                          <span>
                            {simulation.serviceFee.toFixed(2)} {targetCurrency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-end font-medium text-foreground md:text-primary-foreground border-t border-border/40 md:border-primary-foreground/20 pt-1">
                        <span>
                          {simulation.totalCustomerCharge.toLocaleString()} {targetCurrency}
                        </span>
                      </div>
                      {isBlocked && simulation.structuredError ? (
                        <div className="mt-4 p-3 bg-red-500/10 text-red-500 text-xs rounded border border-red-500/20 space-y-2">
                          <div className="font-bold text-red-600 dark:text-red-400">
                            {simulation.structuredError.title}
                          </div>
                          <p>{simulation.structuredError.description}</p>

                          {"details" in simulation.structuredError &&
                            simulation.structuredError.details && (
                              <div className="bg-background/50 p-2 rounded border border-red-500/20 font-mono text-[10px] text-muted-foreground">
                                <div>
                                  Customer Fee:{" "}
                                  {simulation.structuredError.details.customerServiceFee}
                                </div>
                                <div>
                                  Organizer Contribution:{" "}
                                  {simulation.structuredError.details.organizerContribution}
                                </div>
                                <div>
                                  Total Network Cost: {simulation.structuredError.details.totalCost}
                                </div>
                                <div className="mt-1 text-red-600 font-semibold">
                                  {simulation.structuredError.details.message}
                                </div>
                                <div className="mt-1">
                                  Shortfall: {simulation.structuredError.details.shortfall}
                                </div>
                              </div>
                            )}

                          {"recommendation" in simulation.structuredError &&
                            simulation.structuredError.recommendation && (
                              <div className="mt-2 pt-2 border-t border-red-200">
                                <div className="font-bold text-red-700 mb-1">
                                  System Recommendation
                                </div>
                                <ul className="list-disc pl-4 space-y-1">
                                  {simulation.structuredError.recommendation.map(
                                    (rec: string, i: number) => (
                                      <li key={i}>{rec}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ) : (
                        isBlocked && (
                          <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                            This transaction cannot be processed at this time due to high external
                            network fees. Please try another payment method.
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <span className="font-semibold text-lg text-foreground md:text-primary-foreground">
                      Total: {convertedAmount.toLocaleString()} {targetCurrency}
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Button */}
              <Button
                onClick={handleProceed}
                disabled={
                  isProcessing ||
                  isGenerating ||
                  isSimulating ||
                  isBlocked ||
                  (paymentMethod === "momo" && (!isMomoComplete || availableNetworks.length === 0))
                }
                className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-orange-500/20 font-bold tracking-wide bg-orange-500 text-white hover:bg-orange-600 block md:hidden"
              >
                {isGenerating
                  ? "Generating..."
                  : isProcessing
                    ? "Processing..."
                    : `Pay ${targetCurrency} ${convertedAmount.toLocaleString()}`}
              </Button>

              {/* Desktop Button */}
              <Button
                onClick={handleProceed}
                disabled={
                  isProcessing ||
                  isGenerating ||
                  isSimulating ||
                  isBlocked ||
                  (paymentMethod === "momo" && (!isMomoComplete || availableNetworks.length === 0))
                }
                className="w-full h-14 rounded-2xl text-lg shadow-[var(--shadow-glow)] font-bold tracking-wide hover:opacity-90 md:shadow-xl hidden md:block"
                style={{ backgroundColor: "#ffffff", color: themeColor || "var(--primary)" }}
              >
                {isGenerating
                  ? "Generating..."
                  : isProcessing
                    ? "Processing..."
                    : `Pay ${targetCurrency} ${convertedAmount.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex md:hidden flex-col h-full bg-[#f4f5f7] dark:bg-background overflow-hidden relative font-sans">
           {/* Mobile Header */}
           <div className="px-5 py-4 flex items-center justify-between sticky top-0 bg-[#f4f5f7] dark:bg-background z-30 pt-safe-top">
              <button onClick={() => onOpenChange(false)} className="h-10 w-10 flex items-center justify-center bg-white dark:bg-secondary rounded-full shadow-sm text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="font-bold text-[17px] tracking-tight">Payment Method</h1>
              <button className="h-10 w-10 flex items-center justify-center bg-white dark:bg-secondary rounded-full shadow-sm text-foreground">
                <MoreVertical className="h-5 w-5" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto px-5 py-2 pb-32 space-y-6">
               {/* Premium Top Card */}
               <div className="bg-primary text-primary-foreground p-6 rounded-3xl relative overflow-hidden shadow-xl shadow-primary/20">
                  <div className="absolute -top-4 -right-4 p-4 opacity-[0.08]">
                     <Wallet className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                     <p className="text-primary-foreground/80 text-[13px] font-medium mb-1 tracking-wide uppercase">Total to Pay</p>
                     <h2 className="text-3xl font-bold tracking-tight">{convertedAmount.toLocaleString()} <span className="text-xl font-medium text-primary-foreground/80">{targetCurrency}</span></h2>
                     
                     {isSimulating ? (
                        <div className="mt-5 flex items-center gap-2 text-xs text-primary-foreground">
                           <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating precise fees...
                        </div>
                     ) : (
                         <div className="mt-5 flex items-center gap-1.5 text-[11px] text-primary bg-background font-bold tracking-wider uppercase w-fit px-3 py-1.5 rounded-full shadow-sm">
                           <Shield className="h-3.5 w-3.5" /> 100% Secure Payment
                         </div>
                     )}
                     
                     {!isSimulating && simulation && (paymentMethod === "momo" || paymentMethod === "card") && (
                        <div className="mt-4 pt-4 border-t border-primary-foreground/20 space-y-2 text-sm text-primary-foreground/90">
                           <div className="flex justify-between">
                              <span>Base Ticket</span>
                              <span>{simulation.convertedBasePrice?.toLocaleString() || baseAmount} {targetCurrency}</span>
                           </div>
                           {simulation.serviceFee > 0 && (
                             <div className="flex justify-between">
                                <span>Service Fee</span>
                                <span>{simulation.serviceFee.toFixed(2)} {targetCurrency}</span>
                             </div>
                           )}
                           {baseCurrency !== targetCurrency && (
                              <div className="flex justify-between pt-2 border-t border-primary-foreground/20 text-xs text-primary-foreground/80">
                                 <span>Live Rate</span>
                                 <span className="font-mono">
                                    1 {baseCurrency} = {markupRate.toFixed(4)} {targetCurrency}
                                 </span>
                              </div>
                           )}
                        </div>
                     )}
                     
                     {isBlocked && (
                         <div className="mt-3 p-2 bg-red-500/20 text-red-400 text-[11px] rounded-lg border border-red-500/30">
                           Transaction blocked due to high network fees.
                         </div>
                     )}
                  </div>
               </div>

               {/* Payment Options */}
               <div className="space-y-4">
                 {/* Mobile Money */}
                 <div className={`bg-white dark:bg-card p-4 rounded-3xl shadow-sm border-[2px] transition-colors ${paymentMethod === 'momo' ? 'border-primary' : 'border-transparent'}`}>
                    <button onClick={() => setPaymentMethod("momo")} className="w-full flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-secondary/50 rounded-2xl flex items-center justify-center">
                            <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-[15px]">Mobile Money</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Pay with Phone</p>
                          </div>
                       </div>
                       <div className={`h-[22px] w-[22px] rounded-full border-[2px] flex items-center justify-center ${paymentMethod === 'momo' ? 'border-primary' : 'border-border/60'}`}>
                          {paymentMethod === 'momo' && <div className="h-3 w-3 rounded-full bg-primary" />}
                       </div>
                    </button>
                    {paymentMethod === "momo" && (
                        <div className="mt-4 pt-4 border-t border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2">
                           <div className="space-y-1.5 text-left">
                              <Label className="text-[11px] text-muted-foreground px-1">Network Provider</Label>
                              {isWalletLoading || isProfitableLoading ? (
                                <div className="h-11 w-full animate-pulse bg-secondary rounded-xl" />
                              ) : availableNetworks.length === 0 ? (
                                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium">
                                  No networks configured.
                                </div>
                              ) : (
                                <Select value={network} onValueChange={setNetwork}>
                                  <SelectTrigger className="bg-secondary/30 border-0 h-11 rounded-xl focus:ring-1 focus:ring-amber-500/50 font-medium text-sm">
                                    <SelectValue placeholder="Select Network" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-64 rounded-xl">
                                    {availableNetworks.map((net) => (
                                      <SelectItem key={net.value} value={net.value} className="rounded-lg">
                                        {net.label} ({net.curr})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            
                            {availableNetworks.length > 0 && (
                              <div className="space-y-1.5 text-left">
                                <div className="flex items-center justify-between px-1">
                                  <Label className="text-[11px] text-muted-foreground">Phone Number</Label>
                                  {userPhone && phone !== userPhone && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const cleanPhone = userPhone.replace(/\D/g, "");
                                        const max = selectedNetworkObj?.maxLen || 15;
                                        let val = cleanPhone;
                                        if (selectedNetworkObj && val.startsWith(selectedNetworkObj.code)) {
                                          val = val.slice(selectedNetworkObj.code.length);
                                        }
                                        if (val.startsWith("0")) {
                                          val = val.slice(1);
                                        }
                                        if (val.length > max) {
                                          val = val.slice(-max);
                                        }
                                        setPhone(val);
                                      }}
                                      className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full"
                                    >
                                      Use my saved number
                                    </button>
                                  )}
                                </div>
                                <div className="flex h-11 bg-secondary/30 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
                                  {selectedNetworkObj && (
                                    <div className="flex items-center px-4 bg-black/5 dark:bg-white/5 text-[15px] font-medium border-r border-border/40">
                                      +{selectedNetworkObj.code}
                                    </div>
                                  )}
                                  <Input
                                    type="tel"
                                    placeholder={selectedNetworkObj ? `e.g. ${"7".padEnd(selectedNetworkObj.maxLen, "0")}` : "e.g. 788123456"}
                                    value={phone}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/\D/g, "");
                                      const max = selectedNetworkObj?.maxLen || 15;
                                      if (val.startsWith("0") && val.length > 1) {
                                        val = val.slice(1);
                                      }
                                      if (val.length <= max) setPhone(val);
                                    }}
                                    className="flex-1 border-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none text-[15px] font-medium"
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                    )}
                 </div>

                 {/* Credit Card */}
                 {supportedNetworks.includes("AGATIKE_CARD") && (
                 <div className={`bg-white dark:bg-card p-4 rounded-3xl shadow-sm border-[2px] transition-colors ${paymentMethod === 'card' ? 'border-primary' : 'border-transparent'}`}>
                    <button onClick={() => setPaymentMethod("card")} className="w-full flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-secondary/50 rounded-2xl flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-[15px]">Credit Card</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Visa, Mastercard</p>
                          </div>
                       </div>
                       <div className={`h-[22px] w-[22px] rounded-full border-[2px] flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-border/60'}`}>
                          {paymentMethod === 'card' && <div className="h-3 w-3 rounded-full bg-primary" />}
                       </div>
                    </button>
                    {paymentMethod === "card" && (
                        <div className="mt-4 pt-4 border-t border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2">
                           <div className="space-y-1.5 text-left">
                              <Label className="text-[11px] text-muted-foreground px-1">Billing Currency</Label>
                              <Select value={cardCurrency} onValueChange={setCardCurrency}>
                                <SelectTrigger className="bg-secondary/30 border-0 h-11 rounded-xl focus:ring-1 focus:ring-amber-500/50 font-medium text-sm">
                                  <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64 rounded-xl">
                                  {CARD_CURRENCIES.map((curr) => (
                                    <SelectItem key={curr.value} value={curr.value} className="rounded-lg">
                                      {curr.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                        </div>
                    )}
                 </div>
                 )}
               </div>
           </div>

           {/* Mobile Footer */}
           <div className="fixed bottom-0 left-0 right-0 px-5 py-4 pb-safe bg-[#f4f5f7]/90 dark:bg-background/90 backdrop-blur-md z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <Button
                onClick={handleProceed}
                disabled={isProcessing || isGenerating || isSimulating || isBlocked || (paymentMethod === "momo" && (!isMomoComplete || availableNetworks.length === 0))}
                className="w-full h-[52px] rounded-full text-[17px] font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                {isGenerating ? "Generating..." : isProcessing ? "Processing..." : `Pay ${targetCurrency} ${convertedAmount.toLocaleString()}`}
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
