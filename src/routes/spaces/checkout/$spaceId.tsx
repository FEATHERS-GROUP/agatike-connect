import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { createSpaceSubscription } from "@/api/space_subscriptions";
import { sendSubscriptionConfirmationEmail, sendSubscriptionInvoiceEmail } from "@/api/email";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CheckCircle2, Building2, CreditCard, Loader2 } from "lucide-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { z } from "zod";

const checkoutSearchSchema = z.object({
  plan: z.string().optional(),
  price: z.string().optional(),
  cycle: z.string().optional(),
});

export const Route = createFileRoute("/spaces/checkout/$spaceId")({
  component: CheckoutPage,
  validateSearch: checkoutSearchSchema,
});

function CheckoutPage() {
  const { spaceId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data: space, isLoading: spaceLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const { user } = useUserAuth();

  const [formData, setFormData] = useState({
    name: user?.name || user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Pre-fill form if user data loads later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || user.username || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        gender: prev.gender || user.gender || "",
      }));
    }
  }, [user]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const planName = search.plan || "Custom Plan";
  const planPrice = search.price || "Contact for price";
  const billingCycle = search.cycle || "Monthly";
  const currency = space?.currency || "RWF";

  const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.phone || !formData.startDate) {
      setErrorMsg("Please fill in all details including the start date.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Save Subscription to Database
      const subscription = await createSpaceSubscription({
        data: {
          space_id: spaceId,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_gender: formData.gender,
          plan_name: planName,
          price: planPrice,
          billing_cycle: billingCycle,
          start_date: formData.startDate,
        }
      });

      // 2. Send Confirmation Email
      await sendSubscriptionConfirmationEmail({
        data: {
          to: formData.email,
          customerName: formData.name,
          spaceName: space?.name || "Our Space",
          planName,
          price: planPrice,
          billingCycle,
        }
      });

      // 3. Send Invoice Email
      await sendSubscriptionInvoiceEmail({
        data: {
          to: formData.email,
          customerName: formData.name,
          spaceName: space?.name || "Our Space",
          planName,
          price: planPrice,
          billingCycle,
          invoiceDate: new Date().toLocaleDateString(),
          invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        }
      });

      // 4. Redirect to Success
      navigate({ to: `/spaces/success/${spaceId}`, search: { email: formData.email } });

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong during checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  if (spaceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Space Not Found</h2>
        <Button onClick={() => navigate({ to: "/venues" })}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar hideOnMobile />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <button
          onClick={() => navigate({ to: `/spaces/${spaceId}` })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Space
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form & Payment */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
              <p className="text-muted-foreground">Complete your details to secure your booking at {space.name}.</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-8">
              
              {/* Customer Details */}
              <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Your Details
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 788 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-secondary/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">When do you want to start?</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="bg-secondary/50 w-full"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Your billing cycle will renew relative to your chosen start date.</p>
                </div>
              </div>

              {/* Payment Mock */}
              <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Payment
                </h2>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-4 mb-6">
                  <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-600 dark:text-orange-400">Mobile Money</h3>
                    <p className="text-sm text-muted-foreground">Pay securely with Momo.</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-[var(--shadow-glow)]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    `Pay ${currency} ${planPrice}`
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  By clicking "Pay", you agree to the Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-secondary/30 border border-border/40 rounded-3xl p-6 lg:p-8 lg:sticky lg:top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/40">
              {space.cover_url ? (
                <img src={space.cover_url} alt={space.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{space.name}</h3>
                <p className="text-sm text-muted-foreground">{space.locations?.[0]?.city || "Space Booking"}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-border/40">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium">{billingCycle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{currency} {planPrice}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Due</span>
              <span className="text-primary">{currency} {planPrice}</span>
            </div>
            
            <div className="mt-8 flex items-start gap-3 bg-card p-4 rounded-xl border border-border/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Your booking is protected by Agatike Guarantee. You will receive an email confirmation and invoice immediately after payment.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
