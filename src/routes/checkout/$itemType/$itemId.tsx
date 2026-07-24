import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { getProduct, createProductOrders, checkProductOrderStatus } from "@/api/products";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Lock, Smartphone, CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentModal } from "@/components/shared/PaymentModal";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";
import { toast } from "sonner";
import { useUserAuth } from "@/contexts/UserAuthContext";

export const Route = createFileRoute("/checkout/$itemType/$itemId")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { itemType, itemId } = Route.useParams();
  const searchParams = Route.useSearch() as any;
  const router = useRouter();
  const { user } = useUserAuth();

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

  // 2. Fetch Real Product
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", itemId],
    queryFn: () => getProduct({ data: { id: itemId } } as any),
    enabled: itemType === "product" && !!itemId,
  });

  const qty = parseInt(searchParams.qty || "1");
  const size = searchParams.size;
  const color = searchParams.color;

  const price = product?.price || 0;
  const total = price * qty;

  // 3. Payment Processing Mutation
  const paymentMutation = useMutation({
    mutationFn: async (paymentDetails: any) => {
      if (!workspaceId || !product) throw new Error("Missing required data for checkout.");

      const isPawaPay = paymentDetails?.network && paymentDetails?.phone;
      if (!isPawaPay) throw new Error("Currently only mobile money is supported.");

      const newBookingRef = crypto.randomUUID();

      // Create Product Order (Pending)
      const variantString = [size, color].filter(Boolean).join(" - ");
      const encodedSize = variantString
        ? `${variantString} | email:${buyerEmail}`
        : `email:${buyerEmail}`;
      const qrBase = Math.random().toString(36).substring(2, 10).toUpperCase();

      await createProductOrders({
        data: {
          objects: [
            {
              product_id: product.id,
              qty: qty.toString(),
              status: "Pending Payment",
              amount_paid: total,
              phone: buyerPhone,
              decrptions: newBookingRef, // Maps to booking_ref in webhook
              qr_code_string: `${qrBase}-${product.id.substring(0, 4).toUpperCase()}-0`,
              ticket_id: null,
              buyer_id: user?.id || null, // Guest logic
              picked: false,
              size: encodedSize,
            },
          ],
        },
      } as any);

      // Initiate PawaPay
      const baseAmount = total;
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
          reason: `Buy ${product.name} (Qty: ${qty})`,
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
          // Absolute DB Confirmation
          setIsPollingPawaPay(false);
          setPaymentSuccess(true);
          toast.success("Payment successful! Your order is confirmed.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPollingPawaPay, pawapayDepositId, bookingRef]);

  if (isProductLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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
            Thank you, {buyerName || "Guest"}! Your order for{" "}
            <span className="font-semibold text-foreground">
              {qty}x {product?.name}
            </span>{" "}
            has been confirmed.
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
          payment of <strong>RWF {(actualCharge || total).toLocaleString()}</strong>.
        </p>
        <div className="flex gap-3 mb-10 justify-center">
          <div
            className="h-3 w-3 rounded-full animate-bounce"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="h-3 w-3 rounded-full animate-bounce delay-75"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="h-3 w-3 rounded-full animate-bounce delay-150"
            style={{ backgroundColor: themeColor }}
          />
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
      className="min-h-[100dvh] w-full flex flex-col-reverse md:flex-row bg-background"
      style={{ fontFamily: `${fontFamily}, sans-serif` }}
    >
      {/* Left Column - Checkout Form */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Store
            </button>
            <img
              src={logoUrl || "/src/assets/logo/Agatike%20Icon.png"}
              alt="Brand Logo"
              className="w-10 h-10 rounded-lg object-contain"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="space-y-8">
              <section className="space-y-5">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="h-12 rounded-xl bg-secondary/20 border-border/60"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        placeholder="you@example.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="h-12 rounded-xl bg-secondary/20 border-border/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        placeholder="+250 700 000 000"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="h-12 rounded-xl bg-secondary/20 border-border/60"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    We will use this to send you your receipt and order updates.
                  </p>
                </div>
              </section>

              <section className="space-y-5 pt-6 border-t border-border/40">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <RadioGroup
                  value={selectedPaymentGroup}
                  onValueChange={setSelectedPaymentGroup}
                  className="space-y-3"
                >
                  <div
                    className={`flex items-center space-x-3 border p-5 rounded-2xl cursor-pointer transition-colors ${selectedPaymentGroup === "momo" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/20"}`}
                    onClick={() => setSelectedPaymentGroup("momo")}
                  >
                    <RadioGroupItem
                      value="momo"
                      id="momo"
                      style={selectedPaymentGroup === "momo" ? { color: themeColor } : {}}
                    />
                    <Label
                      htmlFor="momo"
                      className="flex flex-1 items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-3 font-medium text-base">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        Mobile Money
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        MTN / Airtel
                      </span>
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-3 border p-5 rounded-2xl cursor-pointer transition-colors ${selectedPaymentGroup === "card" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary/20"}`}
                    onClick={() => setSelectedPaymentGroup("card")}
                  >
                    <RadioGroupItem
                      value="card"
                      id="card"
                      style={selectedPaymentGroup === "card" ? { color: themeColor } : {}}
                    />
                    <Label
                      htmlFor="card"
                      className="flex flex-1 items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-3 font-medium text-base">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        Credit / Debit Card
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Visa / MC
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </section>

              <Button
                className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl mt-8 gap-3 transition-transform active:scale-[0.98]"
                style={{ backgroundColor: themeColor, color: "#fff" }}
                onClick={handlePayClick}
                disabled={paymentMutation.isPending}
              >
                <Lock className="w-5 h-5" />
                {paymentMutation.isPending ? "Processing..." : `Pay RWF ${total.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-secondary/20 p-6 md:p-12 border-b md:border-b-0 md:border-l border-border/40 shrink-0">
        <div className="max-w-sm mx-auto space-y-8 sticky top-12">
          <h2 className="text-xl font-semibold hidden md:block">Order Summary</h2>

          <div className="flex gap-5">
            <div className="w-24 h-24 bg-secondary rounded-2xl border border-border/60 overflow-hidden shrink-0 relative shadow-sm">
              {product?.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  Image
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg line-clamp-2 leading-tight">
                {product?.name || "Product"}
              </h3>
              <div className="space-y-1 mt-2">
                {size && (
                  <p className="text-sm text-muted-foreground">
                    Size: <span className="font-medium text-foreground">{size}</span>
                  </p>
                )}
                {color && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    Color:
                    <span
                      className="w-3 h-3 rounded-full border border-border shadow-sm inline-block"
                      style={{ backgroundColor: color }}
                    />
                  </p>
                )}
              </div>
            </div>
            <div className="font-bold text-lg pt-1">RWF {price.toLocaleString()}</div>
          </div>

          <div className="pt-8 border-t border-border/40 space-y-4 text-base">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (x{qty})</span>
              <span className="font-medium text-foreground">RWF {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes & Fees</span>
              <span className="font-medium text-foreground">Calculated next step</span>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="text-3xl font-black">RWF {total.toLocaleString()}</span>
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
          baseAmount={total}
          quantity={qty}
          itemLabel={`Buy ${product?.name}`}
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
