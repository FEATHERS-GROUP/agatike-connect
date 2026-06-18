import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { createSpaceSubscription } from "@/api/space_subscriptions";
import { sendSubscriptionConfirmationEmail, sendSubscriptionInvoiceEmail } from "@/api/email";
import { createInvoiceAndGeneratePdf } from "@/api/invoices";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CheckCircle2, Building2, CreditCard, Loader2, Plus, Trash2, Users } from "lucide-react";
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
    address: "",
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

  const [step, setStep] = useState(1);
  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "", phone: "", gender: "", handle: "" }]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const planName = search.plan || "Custom Plan";
  const planPrice = search.price || "Contact for price";
  const billingCycle = search.cycle || "Monthly";
  const currency = space?.currency || "RWF";

  // Calculate price dynamically based on group size
  const parsedPrice = parseInt(planPrice.replace(/[^0-9]/g, "")) || 0;
  const numMembers = bookingType === "group" ? Math.max(1, teamMembers.length) : 1;
  const finalPriceNum = parsedPrice * numMembers;
  const finalPriceString = finalPriceNum > 0 ? `${currency} ${finalPriceNum.toLocaleString()}` : planPrice;

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
          user_id: user?.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_gender: formData.gender,
          plan_name: planName,
          price: finalPriceString,
          billing_cycle: billingCycle,
          start_date: formData.startDate,
          booking_type: bookingType,
          team_members: bookingType === "group" ? teamMembers : [],
        }
      });

      // 2. Fire and forget the heavy PDF/Email tasks in the background
      (async () => {
        try {
          const invoice = await createInvoiceAndGeneratePdf({
            data: {
              spaceName: space?.name || "Our Space",
              customerName: formData.name,
              customerEmail: formData.email,
              planName: bookingType === "group" ? `${planName} (Group of ${teamMembers.length})` : planName,
              amount: finalPriceString.replace(`${currency} `, ""),
              currency,
              billingCycle,
              startDate: formData.startDate,
              spaceId,
              referenceId: subscription?.id,
            }
          });

          const invoiceNumber = invoice?.invoiceNumber || `AGT-${Date.now()}`;
          const pdfBase64 = invoice?.pdfBase64 || null;

          // Send emails concurrently to save time
          await Promise.all([
            sendSubscriptionConfirmationEmail({
              data: {
                to: formData.email,
                customerName: formData.name,
                spaceName: space?.name || "Our Space",
                planName: bookingType === "group" ? `${planName} (Group of ${teamMembers.length})` : planName,
                price: finalPriceString,
                billingCycle,
                startDate: formData.startDate,
              }
            }),
            sendSubscriptionInvoiceEmail({
              data: {
                to: formData.email,
                customerName: formData.name,
                spaceName: space?.name || "Our Space",
                planName: bookingType === "group" ? `${planName} (Group of ${teamMembers.length})` : planName,
                price: finalPriceString,
                billingCycle,
                invoiceDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
                invoiceNumber,
                pdfBase64,
              }
            })
          ]);
        } catch (bgErr) {
          console.error("Background processing failed:", bgErr);
        }
      })();

      // 3. Redirect immediately to Success (frontend feels instant)
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
        <div className="mb-8 flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className={`absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-500 ${step >= s ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-secondary text-muted-foreground border border-border"}`}>
              {s}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form Steps */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
              <p className="text-muted-foreground">Complete your details to secure your booking at {space.name}.</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-8">
              
              {/* STEP 1: Booking Type */}
              {step === 1 && (
                <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Booking Type
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button
                      type="button"
                      onClick={() => setBookingType("individual")}
                      className={`flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${bookingType === "individual" ? "border-primary bg-primary/5 text-primary scale-[1.02]" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                    >
                      <CheckCircle2 className={`w-8 h-8 ${bookingType === "individual" ? "text-primary" : "opacity-50"}`} />
                      <span className="font-semibold text-lg">Individual Booking</span>
                      <span className="text-sm font-normal opacity-80">Book a spot for yourself</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType("group")}
                      className={`flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${bookingType === "group" ? "border-primary bg-primary/5 text-primary scale-[1.02]" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                    >
                      <Users className={`w-8 h-8 ${bookingType === "group" ? "text-primary" : "opacity-50"}`} />
                      <span className="font-semibold text-lg">Company / Group</span>
                      <span className="text-sm font-normal opacity-80">Book for your team</span>
                    </button>
                  </div>
                  <Button type="button" onClick={handleNext} className="w-full h-12 text-md">Continue</Button>
                </div>
              )}

              {/* STEP 2: Details */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
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
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              min={new Date().toISOString().split("T")[0]}
                              required
                              className="bg-secondary/50 w-full"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Your billing cycle will renew relative to your chosen start date.</p>
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
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                            required
                            className="bg-secondary/50 w-full"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Invoices will be billed to the company email above. Your billing cycle renews relative to the start date.</p>
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
                          {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-6">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="p-4 bg-secondary/30 border border-border/50 rounded-xl relative">
                            {teamMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(index)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <h3 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wider">Member {index + 1}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} required className="bg-background" />
                              </div>
                              <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" value={member.email} onChange={(e) => updateMember(index, "email", e.target.value)} required className="bg-background" />
                              </div>
                              <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input type="tel" value={member.phone} onChange={(e) => updateMember(index, "phone", e.target.value)} required className="bg-background" />
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
                                <p className="text-xs text-muted-foreground">If they have an Agatike account, this connects the booking to their profile.</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button type="button" variant="outline" onClick={handleAddMember} className="w-full border-dashed">
                          <Plus className="w-4 h-4 mr-2" /> Add Another Member
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="button" 
                    onClick={() => {
                      if (!formData.name || !formData.email || !formData.phone || !formData.startDate) {
                        setErrorMsg("Please fill in all your details to continue.");
                        return;
                      }
                      if (bookingType === "group") {
                        const hasEmpty = teamMembers.some(m => !m.name || !m.email || !m.phone);
                        if (hasEmpty) {
                          setErrorMsg("Please fill in all required team member details.");
                          return;
                        }
                      }
                      setErrorMsg("");
                      handleNext();
                    }} 
                    className="w-full h-12 text-md"
                  >
                    Continue to Payment
                  </Button>
                  {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
                </div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Payment Option
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
                      `Pay ${finalPriceString}`
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    By clicking "Pay", you agree to the Terms of Service and Privacy Policy.
                  </p>
                </div>
              )}

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-secondary/30 border border-border/40 rounded-3xl p-6 lg:p-8 lg:sticky lg:top-8 mt-8 lg:mt-0">
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
                <span className="font-medium">{currency} {planPrice}</span>
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
                Your booking is protected by Agatike Guarantee. You will receive an email confirmation and invoice immediately after payment.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
