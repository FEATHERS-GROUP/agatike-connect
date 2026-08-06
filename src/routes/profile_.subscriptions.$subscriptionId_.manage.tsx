import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubscriptionById, upgradeSpaceSubscription, cancelSpaceSubscription, createSpaceSubscription } from "@/api/space_subscriptions";
import { getSpaceById } from "@/api/spaces";
import { processVisitorPass } from "@/api/visitor_passes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, UserPlus, CreditCard, XCircle, ArrowUpCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PaymentModal } from "@/components/shared/PaymentModal";

export const Route = createFileRoute("/profile_/subscriptions/$subscriptionId_/manage")({
  component: ManageSubscriptionPage,
});

function ManageSubscriptionPage() {
  const { subscriptionId } = Route.useParams();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState<any>(null);
  const [proratedAmount, setProratedAmount] = useState<number>(0);

  // Add Visitor State
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitDate, setVisitDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hostedBy, setHostedBy] = useState(user?.name || "");
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: () => getSubscriptionById({ data: { id: subscriptionId, user_id: user?.id, email: user?.email } }),
    enabled: !!user && !!subscriptionId,
  });

  const { data: space, isLoading: isSpaceLoading } = useQuery({
    queryKey: ["space", subscription?.space_id],
    queryFn: () => getSpaceById({ data: { id: subscription!.space_id } }),
    enabled: !!subscription?.space_id,
  });

  const isLoading = isSubLoading || isSpaceLoading;

  // Compute proration logic when clicking a plan
  const handleChangePlanClick = (targetPlan: any) => {
    const currentPrice = parseFloat(subscription?.price || "0");
    const targetPrice = parseFloat(targetPlan.price);
    
    const amountDue = Math.max(0, targetPrice - currentPrice);
    setUpgradeTargetPlan(targetPlan);
    setProratedAmount(amountDue);
    
    if (amountDue === 0) {
      // Just change plan immediately without payment
      if (confirm(`Are you sure you want to switch to ${targetPlan.name}?`)) {
        handleProceedPayment(targetPlan);
      }
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleProceedPayment = async (targetPlanOverride?: any) => {
    const planToUse = targetPlanOverride || upgradeTargetPlan;
    if (!planToUse) return;
    setIsProcessing(true);
    try {
      const now = new Date();
      let nextBillingDate = null;
      if (upgradeTargetPlan.billing_cycle) {
        if (upgradeTargetPlan.billing_cycle.toLowerCase() === "daily") {
          now.setDate(now.getDate() + 1);
          nextBillingDate = now.toISOString();
        } else if (upgradeTargetPlan.billing_cycle.toLowerCase() === "monthly") {
          now.setMonth(now.getMonth() + 1);
          nextBillingDate = now.toISOString();
        } else if (
          upgradeTargetPlan.billing_cycle.toLowerCase() === "annually" ||
          upgradeTargetPlan.billing_cycle.toLowerCase() === "yearly"
        ) {
          now.setFullYear(now.getFullYear() + 1);
          nextBillingDate = now.toISOString();
        }
      }

      await upgradeSpaceSubscription({
        data: {
          subscription_id: subscriptionId,
          new_plan_name: planToUse.name,
          new_price: planToUse.price,
          new_billing_cycle: planToUse.billing_cycle,
          new_next_billing_date: nextBillingDate,
          customer_email: subscription?.customer_email,
          customer_name: subscription?.customer_name,
          workspace_id: space?.workspace_id,
          space_id: space?.id
        }
      });
      
      toast.success("Subscription changed successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscription", subscriptionId] });
      setIsPaymentModalOpen(false);
      setActiveTab("overview");
    } catch (e: any) {
      toast.error(e.message || "Failed to upgrade subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: () => cancelSpaceSubscription({ data: { subscription_id: subscriptionId } }),
    onSuccess: () => {
      toast.success("Subscription cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["subscription", subscriptionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel subscription");
    }
  });

  const addVisitorMutation = useMutation({
    mutationFn: async () => {
      const sub = await createSpaceSubscription({
        data: {
          space_id: space?.id,
          user_id: user?.id,
          customer_name: visitorName,
          customer_email: visitorEmail,
          customer_phone: visitorPhone,
          customer_address: hostedBy,
          plan_name: "Day Pass (Visitor)",
          price: "0", // Free for now
          billing_cycle: "Daily",
          status: "active",
          booking_type: "visitor",
          start_date: new Date(visitDate).toISOString(),
          next_billing_date: new Date(visitDate).toISOString(),
        }
      });
      await processVisitorPass({
        data: {
          to: visitorEmail,
          visitorName,
          visitorId: sub.id,
          spaceName: space?.name || "Space",
          visitDate: format(new Date(visitDate), "MMM do, yyyy"),
          hostedBy
        }
      });
      return sub;
    },
    onSuccess: () => {
      toast.success("Visitor added successfully! Pass has been emailed.");
      setVisitorName("");
      setVisitorEmail("");
      setVisitorPhone("");
      setVisitDate(format(new Date(), "yyyy-MM-dd"));
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add visitor");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold">Subscription Not Found</h2>
          <Button onClick={() => navigate({ to: "/profile" })} className="mt-4">Back to Profile</Button>
        </div>
      </div>
    );
  }

  // Filter plans to show all other plans
  const currentPrice = parseFloat(subscription.price || "0");
  const otherPlans = space?.plans?.filter((p: any) => p.name !== subscription.plan_name) || [];

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col font-sans">
      <Navbar />
      
      {/* Header with Animated Premium Gradient */}
      <div className="relative bg-primary text-primary-foreground pt-16 pb-28 px-6 md:px-12 overflow-hidden border-b border-primary/20">
        {/* Decorative glassmorphism blobs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-background/20 rounded-full blur-3xl opacity-60 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-60 mix-blend-overlay"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link to={`/profile/subscriptions/${subscriptionId}`} className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-8 font-medium bg-black/10 hover:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-foreground to-primary-foreground/70">
                Manage Subscription
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 font-medium flex items-center gap-3">
                <span className="bg-white/20 px-3 py-1 rounded-md backdrop-blur-md">{space?.name}</span> 
                <span className="opacity-50">•</span> 
                <span>{subscription.plan_name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split Layout */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-12 -mt-16 mb-20 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-6 w-full">
          
          {/* Sidebar Tabs for Desktop, Horizontal for Mobile */}
          <TabsList className="flex flex-row md:flex-col justify-start h-auto bg-background/60 dark:bg-background/40 backdrop-blur-xl p-2 rounded-2xl border border-border/50 shadow-lg w-full md:w-64 shrink-0 overflow-x-auto">
            <TabsTrigger value="overview" className="w-full justify-start py-3.5 px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-base font-medium mb-1">
              <CreditCard className="w-5 h-5 mr-3 opacity-80" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="w-full justify-start py-3.5 px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-base font-medium mb-1">
              <ArrowUpCircle className="w-5 h-5 mr-3 opacity-80" />
              Upgrade
            </TabsTrigger>
            <TabsTrigger value="visitor" className="w-full justify-start py-3.5 px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-base font-medium">
              <UserPlus className="w-5 h-5 mr-3 opacity-80" />
              Add Visitor
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Area */}
          <div className="flex-1 bg-background/90 dark:bg-card/90 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-border/40 min-h-[500px]">
            
            <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1">Subscription Overview</h3>
                  <p className="text-muted-foreground">Manage your current billing plan and status.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Premium Credit Card Style Plan Box */}
                  <div className="relative overflow-hidden bg-secondary border border-border p-7 rounded-3xl shadow-xl transform transition-transform hover:scale-[1.02] duration-300">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-background/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-80">Current Plan</p>
                        <CreditCard className="w-6 h-6 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">{subscription.plan_name}</p>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Pricing</p>
                          <p className="text-2xl font-bold text-foreground">
                            {parseFloat(subscription.price).toLocaleString()} <span className="text-lg font-medium opacity-80">{space?.currency}</span>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 opacity-80">per {subscription.billing_cycle}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Box */}
                  <div className="bg-secondary/40 p-7 rounded-3xl border border-border/50 flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-4">Status & Renewal</p>
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`relative flex h-4 w-4`}>
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`relative inline-flex rounded-full h-4 w-4 ${subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </span>
                      <p className="text-3xl font-bold capitalize tracking-tight">{subscription.status}</p>
                    </div>
                    
                    {subscription.next_billing_date && (
                      <div className="bg-background/50 dark:bg-background/30 rounded-2xl p-4 border border-border/30">
                        <p className="text-sm text-muted-foreground mb-1">Next billing date</p>
                        <p className="font-bold text-lg">{format(new Date(subscription.next_billing_date), "MMMM do, yyyy")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Button Section */}
                <div className="pt-8 mt-8 border-t border-border/30 flex justify-end">
                  {(() => {
                    if (!subscription?.start_date) return null;
                    const now = new Date();
                    const startDate = new Date(subscription.start_date);
                    now.setHours(0, 0, 0, 0);
                    startDate.setHours(0, 0, 0, 0);
                    
                    if (now >= startDate) {
                      return (
                        <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-6 py-4 rounded-2xl border border-orange-500/20 flex items-center gap-3 w-full justify-center">
                          <ShieldAlert className="w-5 h-5" />
                          <p className="text-sm font-medium">
                            This subscription has already started and can no longer be cancelled.
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <Button 
                        variant="destructive" 
                        size="lg"
                        className="rounded-2xl px-8 h-14 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        onClick={() => {
                          const price = parseFloat(subscription?.price || "0");
                          if (price === 0 || subscription?.booking_type === "visitor") {
                            if (confirm("Are you sure you want to cancel this free subscription?")) {
                              cancelMutation.mutate();
                            }
                          } else {
                            if (confirm(`Are you sure you want to cancel this subscription? WARNING: You will only receive a 50% refund (${(price * 0.5).toLocaleString()} ${space?.currency}).`)) {
                              cancelMutation.mutate();
                            }
                          }
                        }}
                        disabled={cancelMutation.isPending || subscription.status === 'cancelled'}
                      >
                        {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upgrade" className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">Available Upgrades</h3>
                  <p className="text-muted-foreground text-base">
                    Upgrade your plan to unlock different benefits. Your current payment of <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded-md">{currentPrice.toLocaleString()} {space?.currency}</span> will be prorated against the new plan!
                  </p>
                </div>

                {otherPlans.length === 0 ? (
                  <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-border/40 border-dashed">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">You're all set!</h4>
                    <p className="font-medium text-muted-foreground max-w-sm mx-auto">There are no other plans available at this space.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {otherPlans.map((plan: any, i: number) => {
                      const amountDue = Math.max(0, parseFloat(plan.price) - currentPrice);
                      return (
                        <div key={i} className="group relative overflow-hidden bg-background hover:bg-gradient-to-b hover:from-background hover:to-primary/5 p-7 rounded-3xl border-2 border-border/40 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-1" onClick={() => handleChangePlanClick(plan)}>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                          
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <h4 className="font-bold text-2xl tracking-tight">{plan.name}</h4>
                            <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                              Upgrade
                            </div>
                          </div>
                          
                          <div className="relative z-10">
                            <p className="text-4xl font-extrabold mb-2 tracking-tighter">
                              {parseFloat(plan.price).toLocaleString()} <span className="text-xl font-bold text-muted-foreground">{space?.currency}</span>
                            </p>
                            <p className="text-sm text-muted-foreground font-medium mb-8">Billed {plan.billing_cycle}</p>
                          </div>
                          
                          <div className="mt-auto pt-6 border-t border-border/50 relative z-10">
                            <div className="flex justify-between items-center mb-6 bg-secondary/50 p-4 rounded-2xl">
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Amount Due Now</span>
                              <span className="text-xl font-black text-primary">{amountDue.toLocaleString()} {space?.currency}</span>
                            </div>
                            <Button size="lg" className="w-full rounded-2xl h-14 font-bold text-base group-hover:bg-primary group-hover:text-primary-foreground shadow-md group-hover:shadow-xl transition-all">
                              Proceed to Upgrade
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="visitor" className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0">
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">Register a Visitor</h3>
                  <p className="text-muted-foreground text-base">Generate a 1-day pass for a guest. They will receive a QR code ticket via email instantly.</p>
                </div>

                <div className="bg-secondary/20 p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                    <Input 
                      placeholder="e.g. John Doe" 
                      value={visitorName} 
                      onChange={e => setVisitorName(e.target.value)}
                      className="rounded-2xl h-14 px-5 bg-background border-border/50 focus-visible:ring-primary/20 text-base"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="e.g. john@example.com" 
                      value={visitorEmail} 
                      onChange={e => setVisitorEmail(e.target.value)}
                      className="rounded-2xl h-14 px-5 bg-background border-border/50 focus-visible:ring-primary/20 text-base"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                    <Input 
                      type="tel" 
                      placeholder="e.g. 0780000000" 
                      value={visitorPhone} 
                      onChange={e => setVisitorPhone(e.target.value)}
                      className="rounded-2xl h-14 px-5 bg-background border-border/50 focus-visible:ring-primary/20 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Visit Date</Label>
                      <Input 
                        type="date" 
                        value={visitDate} 
                        onChange={e => setVisitDate(e.target.value)}
                        className="rounded-2xl h-14 px-5 bg-background border-border/50 focus-visible:ring-primary/20 text-base"
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hosted By</Label>
                      <Input 
                        placeholder="Your Name" 
                        value={hostedBy} 
                        onChange={e => setHostedBy(e.target.value)}
                        className="rounded-2xl h-14 px-5 bg-background border-border/50 focus-visible:ring-primary/20 text-base"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full rounded-2xl h-14 mt-4 font-bold text-base shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      if (!visitorName || !visitorEmail) {
                        toast.error("Name and email are required");
                        return;
                      }
                      addVisitorMutation.mutate();
                    }}
                    disabled={addVisitorMutation.isPending}
                  >
                    {addVisitorMutation.isPending ? "Generating Pass..." : "Generate & Send Pass"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>


      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onProceed={handleProceedPayment}
        baseAmount={proratedAmount}
        baseCurrency={space?.currency || "RWF"}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isProcessing={isProcessing}
        isGenerating={false}
        workspaceId={space?.workspace_id}
        itemLabel={`Upgrade to ${upgradeTargetPlan?.name}`}
      />
    </div>
  );
}
