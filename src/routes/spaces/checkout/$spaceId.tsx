import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { createSpaceSubscription } from "@/api/space_subscriptions";
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionInvoiceEmail,
  sendCompanyRosterEmail,
  sendMemberWelcomeEmail,
} from "@/api/email";
import { createInvoiceRecord } from "@/api/invoices";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { Smartphone } from "lucide-react";
import { initiatePawaPayDeposit, getPawaPayDepositStatus } from "@/api/pawapay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  CheckCircle2,
  Building2,
  CreditCard,
  Loader2,
  Plus,
  Trash2,
  Users,
  ChevronUp,
} from "lucide-react";
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
    name: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    address: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Pre-fill form if user data loads later
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.username || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        gender: prev.gender || user.gender || "",
      }));
    }
  }, [user]);

  const [step, setStep] = useState(1);
  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [teamMembers, setTeamMembers] = useState([
    { name: "", email: "", phone: "", gender: "", handle: "" },
  ]);

  const [sendMemberEmails, setSendMemberEmails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);

  const planName = search.plan || "Custom Plan";
  const planPrice = search.price || "Contact for price";
  const billingCycle = search.cycle || "Monthly";
  const currency = space?.currency || "RWF";

  // Calculate price dynamically based on group size
  const parsedPrice = parseInt(planPrice.replace(/[^0-9]/g, "")) || 0;
  const numMembers = bookingType === "group" ? Math.max(1, teamMembers.length) : 1;
  const finalPriceNum = parsedPrice * numMembers;
  const finalPriceString =
    finalPriceNum > 0 ? `${currency} ${finalPriceNum.toLocaleString()}` : planPrice;

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { name: "", email: "", phone: "", gender: "", handle: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: string, value: string) => {
    const newMembers = [...teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setTeamMembers(newMembers);
  };

  const handlePayment = async (paymentDetails?: { phone?: string; network?: string; currency?: string; convertedAmount?: number }) => {
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.phone || !formData.startDate) {
      setErrorMsg("Please fill in all details including the start date.");
      return;
    }

    setIsProcessing(true);

    try {
      const isPawaPay = finalPriceNum > 0 && paymentMethod === "momo" && paymentDetails?.phone && paymentDetails?.network;

      // 1. Save Subscription to Database (with membership IDs generated server-side)
      const subscription = await createSpaceSubscription({
        data: {
          space_id: spaceId,
          user_id: bookingType === "individual" ? user?.id : null,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_gender: bookingType === "individual" ? formData.gender : undefined,
          customer_address: bookingType === "group" ? formData.address : undefined,
          plan_name: planName,
          price: finalPriceNum.toString(),
          billing_cycle: billingCycle,
          start_date: formData.startDate,
          booking_type: bookingType,
          team_members: bookingType === "group" ? teamMembers : [],
          status: isPawaPay ? "pending" : "active"
        },
      } as any);

      if (isPawaPay) {
        const pawaRes = await initiatePawaPayDeposit({
          data: {
            amount: paymentDetails?.convertedAmount || finalPriceNum,
            baseAmount: finalPriceNum,
            baseCurrency: currency,
            phone: paymentDetails!.phone,
            network: paymentDetails!.network,
            currency: paymentDetails?.currency || currency,
            type: "space_subscription",
            referenceId: subscription?.id,
            workspaceId: space?.workspace_id,
          }
        } as any);
        setPawapayDepositId(pawaRes.depositId);
        setIsPollingPawaPay(true);
        setIsPaymentModalOpen(false);
        return; // Don't send emails or redirect yet
      }

      // Members now have membership_ids assigned by the server
      const savedMembers: any[] = subscription?.team_members || [];
      const invoiceDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const groupPlanName =
        bookingType === "group" ? `${planName} (Group of ${teamMembers.length})` : planName;

      const invoice = await createInvoiceRecord({
        data: {
          spaceName: space?.name || "Our Space",
          customerName: formData.name,
          customerEmail: formData.email,
          planName: groupPlanName,
          amount: finalPriceString.replace(`${currency} `, ""),
          currency,
          billingCycle,
          startDate: formData.startDate,
          spaceId,
          referenceId: subscription?.id,
        },
      } as any);

      const invoiceNumber = invoice?.invoiceNumber || `AGT-${Date.now()}`;
      const pdfBase64 = invoice?.pdfBase64 || null;

      const formattedStart = formData.startDate
        ? new Date(formData.startDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : formData.startDate;

      if (bookingType === "group") {
        // Send one company email with details
        await sendCompanyRosterEmail({
          data: {
            to: formData.email,
            companyName: formData.name,
            spaceName: space?.name || "Our Space",
            planName: groupPlanName,
            price: finalPriceString,
            billingCycle,
            startDate: formattedStart,
            invoiceNumber,
            invoiceDate,
            memberCount: savedMembers.length,
            members: savedMembers,
            pdfBase64, // attach invoice PDF
          },
        } as any);

        // Optionally send individual welcome emails to each member sequentially
        if (sendMemberEmails) {
          for (const m of savedMembers) {
            if (m.email) {
              await sendMemberWelcomeEmail({
                data: {
                  to: m.email,
                  memberName: m.name,
                  companyName: formData.name,
                  spaceName: space?.name || "Our Space",
                  planName,
                  startDate: formattedStart,
                  membershipId: m.membership_id || "—",
                },
              } as any);
            }
          }
        }
      } else {
        // Individual booking — send confirmation + invoice sequentially
        await sendSubscriptionConfirmationEmail({
          data: {
            to: formData.email,
            customerName: formData.name,
            spaceName: space?.name || "Our Space",
            planName,
            price: finalPriceString,
            billingCycle,
            startDate: formData.startDate,
          },
        } as any);

        await sendSubscriptionInvoiceEmail({
          data: {
            to: formData.email,
            customerName: formData.name,
            spaceName: space?.name || "Our Space",
            planName,
            price: finalPriceString,
            billingCycle,
            invoiceDate,
            invoiceNumber,
            startDate: formData.startDate,
            pdfBase64, // attach invoice PDF
          },
        } as any);
      }

      // 3. Redirect to Success only after all emails are successfully sent
      navigate({ to: `/spaces/success/${spaceId}`, search: { email: formData.email } });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong during checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPollingPawaPay && pawapayDepositId) {
      interval = setInterval(async () => {
        try {
          const status = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
          if (status?.status === "completed") {
            setIsPollingPawaPay(false);
            navigate({ to: `/spaces/success/${spaceId}`, search: { email: formData.email } });
          } else if (status?.status === "failed") {
            setIsPollingPawaPay(false);
            setErrorMsg("Payment failed or was cancelled.");
            setIsProcessing(false);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPollingPawaPay, pawapayDepositId, spaceId, formData.email, navigate]);

  const validateAndNext = () => {
    if (step === 1) {
      handleNext();
      return;
    }
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone || !formData.startDate) {
        setErrorMsg("Please fill in all your details to continue.");
        return;
      }
      if (bookingType === "group") {
        const hasEmpty = teamMembers.some((m) => !m.name || !m.email || !m.phone);
        if (hasEmpty) {
          setErrorMsg("Please fill in all required team member details.");
          return;
        }
      }
      setErrorMsg("");
      setIsPaymentModalOpen(true);
    }
  };

  const [summaryExpanded, setSummaryExpanded] = useState(false);

  if (spaceLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pb-28 lg:pb-0">
        <Navbar hideOnMobile />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Back button skeleton */}
          <div className="w-24 h-6 bg-secondary/60 animate-pulse rounded-md mb-8" />

          {/* Stepper skeleton */}
          <div className="mb-12 flex items-center justify-between max-w-lg mx-auto relative px-2">
            <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-secondary/60 animate-pulse rounded-full -z-10"></div>
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 relative z-10 w-24">
                <div className="w-10 h-10 rounded-full bg-secondary/60 animate-pulse ring-4 ring-background" />
                <div className="w-16 h-3 bg-secondary/60 animate-pulse rounded mt-1" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-48 h-8 bg-secondary/60 animate-pulse rounded-md" />
                <div className="w-full max-w-md h-4 bg-secondary/60 animate-pulse rounded-md" />
              </div>
              <div className="w-full h-96 bg-secondary/40 animate-pulse rounded-2xl" />
            </div>
            <div className="hidden lg:block w-full h-80 bg-secondary/40 animate-pulse rounded-2xl" />
          </div>
        </main>
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

  const STEPS = [
    { id: 1, title: "Booking Type" },
    { id: 2, title: "Details" },
    { id: 3, title: "Payment" },
  ];

  const OrderSummaryContent = () => (
    <>
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/40">
        {space.cover_url ? (
          <img
            src={space.cover_url}
            alt={space.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        )}
        <div>
          <h3 className="font-semibold">{space.name}</h3>
          <p className="text-sm text-muted-foreground">
            {space.locations?.[0]?.city || "Space Booking"}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium text-right max-w-[200px] truncate">{planName}</span>
        </div>
        {bookingType === "group" && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium">{teamMembers.length}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Base Price</span>
          <span className="font-medium">
            {currency} {planPrice}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Cycle</span>
          <span className="font-medium">{billingCycle}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Start Date</span>
          <span className="font-medium">{formData.startDate || "Not selected"}</span>
        </div>

        <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
          <span className="font-semibold">Total Due Today</span>
          <span className="text-xl font-bold text-primary">{finalPriceString}</span>
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 bg-card p-4 rounded-xl border border-border/40">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Your booking is protected by Agatike Guarantee. You will receive an email confirmation and
          invoice immediately after payment.
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28 lg:pb-0">
      <Navbar hideOnMobile />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <button
          onClick={() => {
            if (step > 1) {
              handleBack();
            } else {
              navigate({ to: `/spaces/${spaceId}` });
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {step > 1 ? "Back" : "Back to Space"}
        </button>

        {/* Stepper Progress */}
        <div className="mb-12 flex items-center justify-between max-w-lg mx-auto relative px-2">
          <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-secondary rounded-full -z-10"></div>
          <div
            className={`absolute top-5 left-[10%] h-1 bg-primary rounded-full transition-all duration-500 -z-10`}
            style={{ width: `${((step - 1) / 2) * 80}%` }}
          ></div>

          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ring-4 ring-background ${step >= s.id ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] scale-110" : "bg-secondary text-muted-foreground border border-border"}`}
              >
                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap transition-colors ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Column: Form Steps */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your details to secure your booking at {space.name}.
              </p>
            </div>

            <form id="checkout-form" onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* STEP 1: Booking Type */}
              {step === 1 && (
                <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      1
                    </span>
                    Booking Type
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button
                      type="button"
                      onClick={() => setBookingType("individual")}
                      className={`flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${bookingType === "individual" ? "border-primary bg-primary/5 text-primary scale-[1.02]" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                    >
                      <CheckCircle2
                        className={`w-8 h-8 ${bookingType === "individual" ? "text-primary" : "opacity-50"}`}
                      />
                      <span className="font-semibold text-lg">Individual Booking</span>
                      <span className="text-sm font-normal opacity-80">
                        Book a spot for yourself
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType("group")}
                      className={`flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${bookingType === "group" ? "border-primary bg-primary/5 text-primary scale-[1.02]" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                    >
                      <Users
                        className={`w-8 h-8 ${bookingType === "group" ? "text-primary" : "opacity-50"}`}
                      />
                      <span className="font-semibold text-lg">Company / Group</span>
                      <span className="text-sm font-normal opacity-80">Book for your team</span>
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={validateAndNext}
                    className="hidden lg:flex w-full h-12 text-md"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* STEP 2: Details */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">
                        2
                      </span>
                      {bookingType === "group" ? "Company / Group Details" : "Your Details"}
                    </h2>

                    {/* ── INDIVIDUAL FORM ── */}
                    {bookingType === "individual" && (
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
                              onChange={(e) =>
                                setFormData({ ...formData, startDate: e.target.value })
                              }
                              min={new Date().toISOString().split("T")[0]}
                              required
                              className="bg-secondary/50 w-full"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your billing cycle will renew relative to your chosen start date.
                        </p>
                      </div>
                    )}

                    {/* ── COMPANY / GROUP FORM ── */}
                    {bookingType === "group" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Company / Group Name</Label>
                          <Input
                            id="name"
                            placeholder="Acme Inc."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-secondary/50"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Company Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="billing@company.com"
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
                        <div className="space-y-2 pt-2 border-t border-border/40">
                          <Label htmlFor="address">Company Address</Label>
                          <Input
                            id="address"
                            placeholder="123 Business Ave, Kigali"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-secondary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startDate">When do you want to start?</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startDate: e.target.value })
                            }
                            min={new Date().toISOString().split("T")[0]}
                            required
                            className="bg-secondary/50 w-full"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Invoices will be billed to the company email above. Your billing cycle
                          renews relative to the start date.
                        </p>
                      </div>
                    )}
                  </div>

                  {bookingType === "group" && (
                    <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Team Members
                        </h2>
                        <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                          {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-6">
                        {teamMembers.map((member, index) => (
                          <div
                            key={index}
                            className="p-4 bg-secondary/30 border border-border/50 rounded-xl relative"
                          >
                            {teamMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(index)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                              Member {index + 1}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                  value={member.name}
                                  onChange={(e) => updateMember(index, "name", e.target.value)}
                                  required
                                  className="bg-background"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                  type="email"
                                  value={member.email}
                                  onChange={(e) => updateMember(index, "email", e.target.value)}
                                  required
                                  className="bg-background"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input
                                  type="tel"
                                  value={member.phone}
                                  onChange={(e) => updateMember(index, "phone", e.target.value)}
                                  required
                                  className="bg-background"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Gender</Label>
                                <select
                                  value={member.gender}
                                  onChange={(e) => updateMember(index, "gender", e.target.value)}
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                  <option value="">Select Gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>Agatike Handle (Optional)</Label>
                                <Input
                                  placeholder="@username"
                                  value={member.handle}
                                  onChange={(e) => updateMember(index, "handle", e.target.value)}
                                  className="bg-background font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                  If they have an Agatike account, this connects the booking to
                                  their profile.
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddMember}
                          className="w-full border-dashed"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Another Member
                        </Button>

                        {/* Email toggle */}
                        <div
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${sendMemberEmails ? "border-primary/50 bg-primary/5" : "border-border/50 bg-secondary/20"}`}
                          onClick={() => setSendMemberEmails((v) => !v)}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${sendMemberEmails ? "border-primary bg-primary" : "border-border"}`}
                          >
                            {sendMemberEmails && (
                              <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                                <path
                                  d="M1 5l3.5 3.5L11 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              Also send welcome emails to each team member
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Each member will receive their personal Membership ID by email. By
                              default, only the company email receives the invoice + full member
                              roster.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={validateAndNext}
                    className="hidden lg:flex w-full h-12 text-md"
                  >
                    Continue to Payment
                  </Button>
                  {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
                </div>
              )}

              {/* Step 3 replaced by PaymentModal */}
            </form>
          </div>

          {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block bg-secondary/30 border border-border/40 rounded-3xl p-8 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <OrderSummaryContent />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)] transition-transform duration-300">
        <div className="max-w-md mx-auto p-4">
          {/* Collapsible Order Summary */}
          <div
            className="flex items-center justify-between gap-4 mb-3 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setSummaryExpanded(!summaryExpanded)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground font-semibold">Order Summary</span>
              <ChevronUp
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${summaryExpanded ? "rotate-180" : ""}`}
              />
            </div>
            {!summaryExpanded && (
              <span className="font-bold text-primary text-sm">{finalPriceString}</span>
            )}
          </div>

          {/* Expanded Summary */}
          {summaryExpanded && (
            <div className="mb-4 text-sm animate-in slide-in-from-bottom-2 fade-in duration-200 border-t border-border/40 pt-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
              <OrderSummaryContent />
            </div>
          )}

          <Button
            type="button"
            disabled={isProcessing}
            className="w-full h-12 text-md font-bold rounded-xl shadow-[var(--shadow-glow)]"
            onClick={validateAndNext}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              step === 2 ? `Proceed to Payment` : "Continue"
            )}
          </Button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onProceed={handlePayment}
        isProcessing={isProcessing}
        isGenerating={false}
        workspaceId={space?.workspace_id || ""}
        baseAmount={finalPriceNum}
      />

      {isPollingPawaPay && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <Smartphone className="h-16 w-16 text-primary mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-3">Check Your Phone</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            We've sent a payment request to your mobile number. Please enter your PIN to confirm the payment.
          </p>
          <div className="flex gap-2 mb-8 justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
          </div>
          <Button variant="outline" onClick={() => { setIsPollingPawaPay(false); setIsProcessing(false); }} className="rounded-2xl h-12 px-8">
            Cancel Payment
          </Button>
        </div>
      )}
    </div>
  );
}
