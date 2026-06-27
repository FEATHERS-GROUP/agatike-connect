import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPricingPlans, getPromotionalRules, upgradeSubscription, PricingPlan } from "@/api/billing";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing/subscriptions/checkout/$planId")({
  component: CheckoutPage,
});

// A simple mock currency converter for demonstration purposes.
// In a real app, you would use an external API like ExchangeRate-API or OpenExchangeRates.
const getExchangeRate = (from: string, to: string) => {
  const rates: Record<string, number> = {
    USD_RWF: 1250,
    USD_EUR: 0.92,
    USD_KES: 130,
    USD_UGX: 3800,
  };
  return rates[`${from}_${to}`] || 1;
};

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  
  // Calculate pricing
  const [finalUSDPrice, setFinalUSDPrice] = useState(0);
  const [localPrice, setLocalPrice] = useState(0);
  const userCurrency = activeWorkspace?.currency || "RWF";

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [plans, rules] = await Promise.all([
          getPricingPlans(),
          getPromotionalRules(),
        ]);
        
        const selectedPlan = plans.find(p => p.id === planId);
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
        
        if (basePrice > 0 && launchPromo && launchPromo.applies_to_cycles.includes(isAnnually ? "annually" : "monthly")) {
          if (isAnnually) {
            const monthlyEquivalent = basePrice / 12;
            calculatedPrice = (monthlyEquivalent * 0.5 * 3) + (monthlyEquivalent * 9);
          } else {
            calculatedPrice = basePrice * (1 - launchPromo.discount_percentage / 100);
          }
        }
        
        setFinalUSDPrice(calculatedPrice);
        setLocalPrice(calculatedPrice * getExchangeRate("USD", userCurrency));
        
      } catch (e) {
        console.error(e);
        toast.error("Error loading checkout details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDetails();
  }, [planId, isAnnually, activeWorkspace]);

  const handlePayment = async () => {
    if (!activeWorkspace?.orgnizer_id || !plan) return;
    
    if (paymentMethod === "pawapay" && !phoneNumber) {
      toast.error("Please enter your mobile money number");
      return;
    }
    if (paymentMethod === "card" && !cardNumber) {
      toast.error("Please enter your card number");
      return;
    }

    setIsProcessing(true);
    try {
      // Here you would normally call your payment gateway (e.g. PawaPay or Stripe API).
      // We are simulating a successful payment response.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update our database
      await upgradeSubscription({
        data: {
          organizer_id: activeWorkspace.orgnizer_id,
          plan_id: plan.id,
          amount: finalUSDPrice
        }
      });
      
      toast.success(`Successfully subscribed to ${plan.name}!`);
      navigate({ to: "/dashboard/billing/subscriptions" });
      
    } catch (error) {
      console.error(error);
      toast.error("Payment failed. Please try again.");
    } finally {
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
              <CardDescription>
                Billed {isAnnually ? "Annually" : "Monthly"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price ({isAnnually ? "Year" : "Month"})</span>
                <span>${(isAnnually ? plan.price * 12 : plan.price).toFixed(2)}</span>
              </div>
              
              {isAnnually && plan.price > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Annual Discount (20%)</span>
                  <span>-${((plan.price * 12) * 0.2).toFixed(2)}</span>
                </div>
              )}

              {finalUSDPrice < (isAnnually ? plan.price * 12 * 0.8 : plan.price) && (
                <div className="flex justify-between text-sm text-primary font-medium">
                  <span>Launch Promo (50% off first 3 mos)</span>
                  <span>Applied</span>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4 flex flex-col gap-1">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total (USD)</span>
                  <span>${finalUSDPrice.toFixed(2)}</span>
                </div>
                {userCurrency !== "USD" && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Local Currency Equivalent</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(localPrice)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
          <Card>
            <CardContent className="pt-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                
                <div className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'pawapay' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="pawapay" id="pawapay" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="pawapay" className="font-semibold text-base flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" /> Mobile Money (PawaPay)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Pay securely using MTN MoMo, Airtel Money, or M-Pesa.</p>
                    {paymentMethod === 'pawapay' && (
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs">Mobile Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="e.g. 250788000000" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex items-start space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="card" id="card" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="card" className="font-semibold text-base flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" /> Credit / Debit Card
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Pay securely with Visa or Mastercard.</p>
                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="cc" className="text-xs">Card Number</Label>
                          <Input 
                            id="cc" 
                            placeholder="0000 0000 0000 0000" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="exp" className="text-xs">Expiry Date</Label>
                            <Input id="exp" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv" className="text-xs">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </RadioGroup>
            </CardContent>
            <CardFooter className="bg-muted/50 rounded-b-xl border-t p-6">
              <Button 
                onClick={handlePayment} 
                disabled={isProcessing || finalUSDPrice === 0} 
                className="w-full h-12 text-lg shadow-lg"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(localPrice)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
