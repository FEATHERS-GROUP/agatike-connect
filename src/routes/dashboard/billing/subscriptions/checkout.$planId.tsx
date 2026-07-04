import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPricingPlans,
  getPromotionalRules,
  upgradeSubscription,
  PricingPlan,
} from "@/api/billing";
import {
  getPawaPayNetworks,
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  getExchangeRate,
} from "@/api/pawapay";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { COUNTRIES } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing/subscriptions/checkout/$planId")({
  component: CheckoutPage,
});

// Removed mock getExchangeRate

function CheckoutPage() {
  const { planId } = Route.useParams();
  const search: any = Route.useSearch();
  const isAnnually = search.cycle === "annually";

  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const [plan, setPlan] = useState<PricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("pawapay");
  const [paymentStep, setPaymentStep] = useState(1);
  const [mobileNetwork, setMobileNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+250");
  const [cardNumber, setCardNumber] = useState("");
  const [pawaPayNetworks, setPawaPayNetworks] = useState<
    { id: string; name: string; currency: string; country: string }[]
  >([]);

  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);

  // Calculate pricing
  const [finalUSDPrice, setFinalUSDPrice] = useState(0);
  const userCurrency = activeWorkspace?.currency || "RWF";
  const [selectedCurrency, setSelectedCurrency] = useState(userCurrency);

  // Available currencies
  const availableCurrencies = Array.from(new Set([userCurrency, "USD", "EUR"]));

  // Fetch live FX Rate
  const { data: fxData, isLoading: isFxLoading } = useQuery({
    queryKey: ["fx", "USD", selectedCurrency],
    queryFn: () => getExchangeRate({ data: { base: "USD", target: selectedCurrency } } as any),
    enabled: !!selectedCurrency && selectedCurrency !== "USD",
  });

  const getConvertedAmount = (usdAmount: number) => {
    if (selectedCurrency === "USD") return usdAmount;
    const markupRate = fxData?.markupRate || 1;
    return usdAmount * markupRate;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: selectedCurrency }).format(
      amount,
    );
  };

  useEffect(() => {
    setSelectedCurrency(activeWorkspace?.currency || "RWF");
  }, [activeWorkspace?.currency]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [plans, rules, networks] = await Promise.all([
          getPricingPlans(),
          getPromotionalRules(),
          getPawaPayNetworks(),
        ]);

        setPawaPayNetworks(networks);

        const selectedPlan = plans.find((p) => p.id === planId);
        if (!selectedPlan) {
          toast.error("Plan not found");
          navigate({ to: "/dashboard/billing/subscriptions/pricingplans" });
          return;
        }

        setPlan(selectedPlan);

        // Calculate price based on rules
        let basePrice = selectedPlan.price;
        if (isAnnually && basePrice > 0) {
          basePrice = basePrice * 0.8 * 12;
        }

        const launchPromo = rules.find((r) => r.name === "Launch Promo");
        let calculatedPrice = basePrice;

        if (
          basePrice > 0 &&
          launchPromo &&
          launchPromo.applies_to_cycles.includes(isAnnually ? "annually" : "monthly")
        ) {
          if (isAnnually) {
            const monthlyEquivalent = basePrice / 12;
            calculatedPrice = monthlyEquivalent * 0.5 * 3 + monthlyEquivalent * 9;
          } else {
            calculatedPrice = basePrice * (1 - launchPromo.discount_percentage / 100);
          }
        }

        setFinalUSDPrice(calculatedPrice);
      } catch (e) {
        console.error(e);
        toast.error("Error loading checkout details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [planId, isAnnually, activeWorkspace]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPollingPawaPay && pawapayDepositId) {
      interval = setInterval(async () => {
        try {
          const status = await getPawaPayDepositStatus({
            data: { depositId: pawapayDepositId },
          } as any);
          if (status?.status === "completed") {
            setIsPollingPawaPay(false);

            await upgradeSubscription({
              data: {
                organizer_id: activeWorkspace!.orgnizer_id,
                plan_id: plan!.id,
                amount: finalUSDPrice,
              },
            });

            toast.success(`Successfully subscribed to ${plan!.name}!`);
            navigate({ to: "/dashboard/billing/subscriptions" });
          } else if (status?.status === "failed") {
            setIsPollingPawaPay(false);
            toast.error("Payment failed or was cancelled.");
            setIsProcessing(false);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPollingPawaPay, pawapayDepositId, activeWorkspace, plan, finalUSDPrice, navigate]);

  const handlePayment = async () => {
    if (!activeWorkspace?.orgnizer_id || !plan) return;

    if (paymentMethod === "pawapay" && (!phoneNumber || !mobileNetwork)) {
      toast.error("Please enter your mobile network and number");
      return;
    }
    if (paymentMethod === "card" && !cardNumber) {
      toast.error("Please enter your card number");
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === "pawapay") {
        let cleanCode = countryCode.replace(/\D/g, "");
        let cleanPhone = phoneNumber.replace(/\D/g, "");
        if (cleanPhone.startsWith("0")) {
          cleanPhone = cleanPhone.substring(1);
        }
        let formattedPhone = cleanCode + cleanPhone;

        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: Math.round(getConvertedAmount(finalUSDPrice)),
            baseAmount: finalUSDPrice,
            baseCurrency: "USD",
            phone: formattedPhone,
            network: mobileNetwork,
            currency: selectedCurrency,
            type: "subscription",
            referenceId: plan.id,
            workspaceId: activeWorkspace.id,
            reason: `Sub: ${plan.name}`,
            shortfall: 0,
          },
        } as any);
        setPawapayDepositId(pawaRes.depositId);
        setIsPollingPawaPay(true);
        // Keep processing true while polling
        return;
      }

      // Mock for card payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update our database
      await upgradeSubscription({
        data: {
          organizer_id: activeWorkspace.orgnizer_id,
          plan_id: plan.id,
          amount: finalUSDPrice,
        },
      });

      toast.success(`Successfully subscribed to ${plan.name}!`);
      navigate({ to: "/dashboard/billing/subscriptions" });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <img src="/agatike-logo.svg" alt="Agatike" className="h-8 w-auto object-contain" />
        <Button variant="ghost" asChild>
          <Link to="/dashboard/billing/subscriptions/pricingplans">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <Card className="bg-secondary/20 border-border/50">
            <CardHeader>
              <CardTitle>{plan.name} Plan</CardTitle>
              <CardDescription>Billed {isAnnually ? "Annually" : "Monthly"}</CardDescription>
              {plan.name.toLowerCase().includes("basic") && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary font-medium">
                  <span className="block font-bold mb-1">🎁 14-Day Free Trial</span>
                  Get 14 days of full access to all premium modules (limit 1 creation per module).
                  After 14 days, premium features are locked until you upgrade.
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Base Price ({isAnnually ? "Year" : "Month"})
                </span>
                <span>
                  {formatCurrency(getConvertedAmount(isAnnually ? plan.price * 12 : plan.price))}
                </span>
              </div>

              {isAnnually && plan.price > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Annual Discount (20%)</span>
                  <span>-{formatCurrency(getConvertedAmount(plan.price * 12 * 0.2))}</span>
                </div>
              )}

              {finalUSDPrice < (isAnnually ? plan.price * 12 * 0.8 : plan.price) && (
                <div className="flex justify-between text-sm text-primary font-medium">
                  <span>Launch Promo (50% off first 3 mos)</span>
                  <span>Applied</span>
                </div>
              )}

              <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(getConvertedAmount(finalUSDPrice))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
          <Card>
            {paymentStep === 1 ? (
              <>
                <CardContent className="pt-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    <div
                      className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === "pawapay" ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <RadioGroupItem value="pawapay" id="pawapay" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="pawapay"
                          className="font-semibold text-base flex items-center gap-2 cursor-pointer"
                        >
                          <Smartphone className="h-4 w-4" /> Mobile Money (PawaPay)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-1">
                          Pay securely using MTN, Airtel, M-Pesa, Orange, Tigo & more.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="card"
                          className="font-semibold text-base flex items-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4" /> Credit / Debit Card
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-1">
                          Pay securely with Visa or Mastercard.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
                <CardFooter className="bg-muted/50 rounded-b-xl border-t p-6">
                  <Button
                    onClick={() => setPaymentStep(2)}
                    className="w-full h-12 text-lg shadow-lg"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Continue to Details
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPaymentStep(1)}
                      className="-ml-2 h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    {paymentMethod === "pawapay" ? "Mobile Money Details" : "Card Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentMethod === "pawapay" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Select Network</Label>
                        <Select value={mobileNetwork} onValueChange={setMobileNetwork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your network" />
                          </SelectTrigger>
                          <SelectContent>
                            {pawaPayNetworks
                              .filter((net) => net.currency === selectedCurrency)
                              .map((net) => (
                                <SelectItem key={net.id} value={net.id}>
                                  {net.name} ({net.country})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs">
                          Mobile Number
                        </Label>
                        <div className="flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.filter(c => c.dialCode).map((c) => (
                                <SelectItem key={c.code} value={c.dialCode}>
                                  {String.fromCodePoint(...c.code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)))} {c.dialCode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id="phone"
                            className="flex-1"
                            placeholder="788 000 000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cc" className="text-xs">
                          Card Number
                        </Label>
                        <Input
                          id="cc"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exp" className="text-xs">
                            Expiry Date
                          </Label>
                          <Input id="exp" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className="text-xs">
                            CVV
                          </Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 rounded-b-xl border-t p-6 flex-col items-stretch gap-4">
                  {isPollingPawaPay && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-medium flex items-start gap-3 w-full">
                      <Smartphone className="h-5 w-5 animate-bounce mt-0.5 shrink-0" />
                      <p className="text-left">
                        <span className="block font-bold text-base mb-1">Check your phone!</span>A
                        payment prompt has been sent to your mobile. Please enter your PIN to
                        confirm the subscription.
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handlePayment}
                    disabled={
                      isProcessing ||
                      isFxLoading ||
                      finalUSDPrice === 0 ||
                      (paymentMethod === "pawapay" ? !phoneNumber || !mobileNetwork : !cardNumber)
                    }
                    className="w-full h-12 text-lg shadow-lg"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isProcessing || isPollingPawaPay ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        {isPollingPawaPay ? "Waiting for payment..." : "Processing..."}
                      </>
                    ) : (
                      `Pay ${formatCurrency(getConvertedAmount(finalUSDPrice))}`
                    )}
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Display Currency:</span>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
