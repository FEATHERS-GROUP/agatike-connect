import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { createProductOrders, checkProductOrderStatus } from "@/api/products";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Lock, Smartphone, CheckCircle, ShoppingCart } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentModal } from "@/components/shared/PaymentModal";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";
import { toast } from "sonner";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/checkout/cart")({
  component: CartCheckoutPage,
});

function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useUserAuth();
  const { items, cartTotal, clearCart } = useCart();

  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [selectedPaymentGroup, setSelectedPaymentGroup] = useState("momo");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [actualCharge, setActualCharge] = useState<number | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    if (parts.length > 2 || (hostname.includes("localhost") && parts.length > 1)) {
      const potentialSlug = parts[0];
      if (potentialSlug !== "www") {
        setSubdomainSlug(potentialSlug);
      }
    }
  }, []);

  // 1. Fetch Workspace Page for Theming
  const { data: pageData } = useQuery({
    queryKey: ["workspace-page-by-slug", subdomainSlug],
    queryFn: () => getWorkspacePageBySlug({ data: { slug: subdomainSlug! } } as any),
    enabled: !!subdomainSlug,
  });

  const settingsBlock = pageData?.components?.find((c: any) => c.type === "page_settings");
  const themeColor = settingsBlock?.themeColor || pageData?.theme_color || "#000000";
  const fontFamily = settingsBlock?.fontFamily || "Inter";
  const workspaceId = pageData?.workspace_id;
  const logoUrl = pageData?.logo_url;

  // 3. Payment Processing Mutation
  const paymentMutation = useMutation({
    mutationFn: async (paymentDetails: any) => {
      if (!workspaceId || items.length === 0) throw new Error("Missing required data for checkout.");

      const isPawaPay = paymentDetails?.network && paymentDetails?.phone;
      if (!isPawaPay) throw new Error("Currently only mobile money is supported.");

      const newBookingRef = crypto.randomUUID();

      // Map cart items to Product Order objects
      const orderObjects = items.map(item => {
         const variantString = [item.size, item.color].filter(Boolean).join(" - ");
         const encodedSize = variantString
           ? `${variantString} | email:${buyerEmail}`
           : `email:${buyerEmail}`;
         const qrBase = Math.random().toString(36).substring(2, 10).toUpperCase();
         
         return {
            product_id: item.product.id,
            qty: item.qty.toString(),
            status: "Pending Payment",
            amount_paid: (item.product.price || 0) * item.qty,
            phone: buyerPhone,
            decrptions: newBookingRef, // Shared booking ref links them!
            qr_code_string: `${qrBase}-${item.product.id.substring(0, 4).toUpperCase()}-0`,
            ticket_id: null,
            buyer_id: user?.id || null,
            picked: false,
            size: encodedSize,
         };
      });

      // Create all Product Orders at once (Pending)
      await createProductOrders({
        data: {
          objects: orderObjects,
        },
      } as any);

      // Initiate PawaPay with total sum
      const baseAmount = cartTotal;
      const finalAmount = paymentDetails.convertedAmount || baseAmount;
      setActualCharge(finalAmount);

      const pawaRes = await initiatePawaPayDeposit({
        data: {
          amount: finalAmount,
          baseAmount: baseAmount,
          baseCurrency: "RWF",
          phone: paymentDetails.phone,
          network: paymentDetails.network,
          currency: paymentDetails.currency || "RWF",
          type: "page_builder_checkout",
          referenceId: newBookingRef,
          workspaceId: workspaceId,
          reason: `Buy ${items.length} items`,
          shortfall: paymentDetails.shortfall || 0,
        },
      } as any);

      return { isPawaPay: true, depositId: pawaRes.depositId, bookingRef: newBookingRef };
    },
    onSuccess: (data) => {
      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setBookingRef(data.bookingRef);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
      }
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to initiate payment.");
    },
  });

  // 4. Polling for Completion
  useEffect(() => {
    if (!isPollingPawaPay || !pawapayDepositId || !bookingRef) return;

    const intervalId = setInterval(async () => {
      try {
        const [pawaRes, orderStatus] = await Promise.all([
          getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any),
          checkProductOrderStatus({ data: { bookingRef } } as any),
        ]);

        if (pawaRes?.status?.toLowerCase() === "failed") {
          setIsPollingPawaPay(false);
          toast.error("Mobile Money payment failed or was cancelled.");
        } else if (orderStatus && orderStatus !== "Pending Payment") {
          setIsPollingPawaPay(false);
          setPaymentSuccess(true);
          clearCart(); // Clear the cart upon successful payment
          toast.success("Payment successful! Your order is confirmed.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPollingPawaPay, pawapayDepositId, bookingRef, clearCart]);

  if (items.length === 0 && !paymentSuccess) {
    return (
       <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background space-y-6">
          <ShoppingCart className="w-20 h-20 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Button onClick={() => window.history.back()} variant="outline">
            Return to Store
          </Button>
       </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div
        className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-6"
        style={{ fontFamily: `${fontFamily}, sans-serif` }}
      >
        <div className="max-w-md w-full bg-secondary/30 border border-border/40 p-8 rounded-3xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you, {buyerName || "Guest"}! Your order has been confirmed.
          </p>
          <p className="text-sm text-muted-foreground">
            We've sent a receipt to {buyerEmail || buyerPhone}.
          </p>
          <Button
            className="w-full h-12 rounded-xl mt-4 font-bold"
            style={{ backgroundColor: themeColor, color: "#fff" }}
            onClick={() => window.history.back()}
          >
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  if (isPollingPawaPay) {
    return (
      <div
        className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 text-center"
        style={{ fontFamily: `${fontFamily}, sans-serif` }}
      >
        <Smartphone
          className="h-20 w-20 text-primary mb-8 animate-pulse"
          style={{ color: themeColor }}
        />
        <h1 className="text-3xl font-bold mb-4">Check Your Phone</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-sm mx-auto">
          We've sent a payment request to your mobile number. Please enter your PIN to confirm the
          payment of <strong>RWF {(actualCharge || cartTotal).toLocaleString()}</strong>.
        </p>
        <div className="flex gap-3 mb-10 justify-center">
          <div className="h-3 w-3 rounded-full animate-bounce" style={{ backgroundColor: themeColor }} />
          <div className="h-3 w-3 rounded-full animate-bounce delay-75" style={{ backgroundColor: themeColor }} />
          <div className="h-3 w-3 rounded-full animate-bounce delay-150" style={{ backgroundColor: themeColor }} />
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            setIsPollingPawaPay(false);
            if (pawapayDepositId) {
              try {
                await cancelPendingPayment({ data: { depositId: pawapayDepositId } } as any);
              } catch (e) {
                console.error("Cancel cleanup failed:", e);
              }
            }
          }}
          className="rounded-2xl h-14 px-10 font-bold"
        >
          Cancel Payment
        </Button>
      </div>
    );
  }

  const handlePayClick = () => {
    if (!buyerName || (!buyerEmail && !buyerPhone)) {
      toast.error("Please provide your name and contact info.");
      return;
    }
    if (selectedPaymentGroup === "momo") {
      setIsPaymentModalOpen(true);
    } else {
      toast.error("Credit card payments are temporarily unavailable.");
    }
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-background"
      style={{ fontFamily: `${fontFamily}, sans-serif` }}
    >
      {/* Left Column - Order Summary */}
      <div 
        className="w-full md:w-1/2 lg:w-[45%] p-6 md:p-12 lg:p-20 flex flex-col justify-between shrink-0 text-white relative overflow-hidden"
        style={{ backgroundColor: themeColor || "#0B3B24" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        
        <div className="relative z-10 space-y-8 max-w-md w-full ml-auto mr-auto md:ml-auto md:mr-8">
          <div className="flex items-center gap-3">
             <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <span className="font-semibold text-lg">{pageData?.title || "Checkout"}</span>
          </div>

          <div className="pt-6">
            <h3 className="text-white/80 text-base mb-2">Pay for Order</h3>
            <div className="flex items-baseline gap-2 mb-4">
               <span className="text-4xl md:text-5xl font-bold tracking-tight">RWF {cartTotal.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-4 pt-6">
            {/* Cart Items List */}
            <div className="space-y-3 mb-6">
               {items.map(item => (
                 <div key={item.id} className="bg-white/10 rounded-xl p-4 flex gap-4">
                   {item.product.image_url && (
                     <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                   )}
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <span className="font-medium text-sm line-clamp-1">{item.product.name}</span>
                       <span className="font-medium text-sm">RWF {((item.product.price || 0) * item.qty).toLocaleString()}</span>
                     </div>
                     <div className="text-white/70 text-xs mt-1">
                       Qty: {item.qty} {item.size ? `• Size: ${item.size}` : ''}
                     </div>
                   </div>
                 </div>
               ))}
            </div>

            <div className="flex justify-between items-center text-white/80 pb-4 border-b border-white/10">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium text-white">RWF {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-white/80 pb-4 border-b border-white/10">
              <span className="text-sm">Taxes</span>
              <span className="font-medium text-white">RWF 0.00</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-base">Total due today</span>
              <span className="text-xl font-bold">RWF {cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-16 text-xs text-white/50 max-w-md w-full ml-auto mr-auto md:ml-auto md:mr-8 flex items-center gap-4">
           <span>© {new Date().getFullYear()} All rights reserved</span>
           <a href="#" className="hover:text-white transition-colors">Terms</a>
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </div>

      {/* Right Column - Checkout Form */}
      <div className="w-full md:w-1/2 lg:w-[55%] bg-background p-6 md:p-12 lg:p-20 overflow-y-auto relative">
        {/* Top Right Logo */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 lg:top-10 lg:right-12 flex items-center gap-3">
           <img
              src={logoUrl || "/src/assets/logo/Agatike%20Icon.png"}
              alt="Brand Logo"
              className="w-10 h-10 rounded-full bg-background object-contain shadow-sm border border-border p-0.5"
            />
        </div>

        <div className="max-w-md w-full mx-auto md:mx-0 md:ml-8 space-y-8 mt-12 md:mt-0">
          <h1 className="text-2xl font-bold text-foreground">Payment Details</h1>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email address</Label>
                <Input
                  placeholder="example@gmail.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="h-12 rounded-lg bg-background border-border shadow-sm focus-visible:ring-1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Full name</Label>
                <Input
                  placeholder="John Smith"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="h-12 rounded-lg bg-background border-border shadow-sm focus-visible:ring-1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone number</Label>
                <Input
                  placeholder="+250 700 000 000"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="h-12 rounded-lg bg-background border-border shadow-sm focus-visible:ring-1"
                />
              </div>
            </section>

            <section className="space-y-4 pt-2">
              <h2 className="text-sm font-medium">Payment Method</h2>
              <RadioGroup
                value={selectedPaymentGroup}
                onValueChange={setSelectedPaymentGroup}
                className="space-y-3"
              >
                <div
                  className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedPaymentGroup === "momo" ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" : "border-border hover:border-foreground/20 shadow-sm"}`}
                  onClick={() => setSelectedPaymentGroup("momo")}
                  style={selectedPaymentGroup === "momo" && themeColor ? { borderColor: themeColor, backgroundColor: `${themeColor}0A`, ringColor: themeColor } : {}}
                >
                  <RadioGroupItem
                    value="momo"
                    id="momo"
                    style={selectedPaymentGroup === "momo" && themeColor ? { color: themeColor, borderColor: themeColor } : {}}
                  />
                  <Label
                    htmlFor="momo"
                    className="flex flex-1 items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-3 font-medium text-sm">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      Mobile Money
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      MTN / Airtel
                    </span>
                  </Label>
                </div>
                
                 <div
                  className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedPaymentGroup === "card" ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" : "border-border hover:border-foreground/20 shadow-sm"}`}
                  onClick={() => setSelectedPaymentGroup("card")}
                  style={selectedPaymentGroup === "card" && themeColor ? { borderColor: themeColor, backgroundColor: `${themeColor}0A`, ringColor: themeColor } : {}}
                >
                  <RadioGroupItem
                    value="card"
                    id="card"
                    style={selectedPaymentGroup === "card" && themeColor ? { color: themeColor, borderColor: themeColor } : {}}
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-1 items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-3 font-medium text-sm">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      Credit / Debit Card
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Visa / MC
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </section>

            <Button
              className="w-full h-14 rounded-xl text-base font-semibold shadow-md mt-6 transition-transform active:scale-[0.98]"
              style={themeColor ? { backgroundColor: themeColor, color: "#fff" } : { color: "#fff" }}
              onClick={handlePayClick}
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending ? "Processing..." : `Pay RWF ${cartTotal.toLocaleString()}`}
            </Button>
            
            <p className="text-[11px] text-center text-muted-foreground mt-4 leading-relaxed max-w-sm mx-auto">
              By confirming your payment, you allow us to charge your selected method for this payment in accordance with terms. You can always cancel before confirmation.
            </p>
          </div>
        </div>
      </div>

      {workspaceId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          paymentMethod="momo"
          setPaymentMethod={() => {}}
          workspaceId={workspaceId}
          baseAmount={cartTotal}
          quantity={items.length}
          itemLabel={`Buy ${items.length} items`}
          baseCurrency="RWF"
          userPhone={buyerPhone}
          isProcessing={paymentMutation.isPending}
          isGenerating={false}
          onProceed={(details) => paymentMutation.mutate(details)}
          themeColor={themeColor || undefined}
        />
      )}
    </div>
  );
}
