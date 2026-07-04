import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getActiveSubscription, getPricingPlans, PricingPlan, Subscription, cancelSubscriptionAdmin } from "@/api/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Sparkles, Loader2, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/billing/subscriptions/")({
  component: SubscriptionsPage,
});

const MODULE_NAMES: Record<string, string> = {
  "86b63107-75bb-4e95-8e31-452fa2c975b3": "Events",
  "b8d914d5-d94f-4ab1-adda-45a8a203da6f": "Tickets",
  "93c085da-f1da-4f2b-9cab-b12327a3a532": "RSVPs",
  "991aa862-ef0e-4d14-b06f-a1a2db39d357": "Settings",
  "46202409-b7cc-44ac-8055-6725497439f4": "Dashboard",
  "1c7961f2-4a9f-4da7-ab7a-a854d9e50edf": "Withdrawals",
  "97eea8bd-1c6c-4394-a6fb-aa867c7655c7": "Users",
  "4afadcf5-2985-4418-b6af-27d40271ec07": "VIP Access",
  "87435881-b6d3-4701-ad99-e89125a82319": "Venue Listings",
  "6ec62138-9d76-4edf-b1bb-88efbafb8e3d": "Venue Designer",
  "8d98adf8-eb3c-4c09-879a-97867e3a9cca": "Experiences",
  "0d10ef50-5f3b-4cd6-acb3-88f6e841d1b3": "Products & Add-ons",
  "34b214ad-0123-4d3e-826b-54657c88ecca": "Page Builder",
  "34648430-c4f5-4e17-bb5e-27c908711138": "Badge Designer",
  "44bd4978-d56a-40b0-b303-b255ea4dc14b": "Community",
  "2023e384-e356-41d8-be1b-ce3344c0bbe7": "Spaces",
};

const LIMIT_LABELS: Record<string, string> = {
  max_workspaces: "Max Workspaces",
  max_events: "Max Events",
  max_cinemas: "Max Cinemas",
  max_spaces: "Max Spaces",
  max_venues: "Max Venue Listings",
  max_ticket_designs: "Max Ticket Designs",
  max_badge_designs: "Max Badge Designs",
  max_page_builders: "Max Page Builders",
  max_invoices: "Max Invoices",
  max_tasks: "Max Tasks",
  max_custom_forms: "Max Custom Forms",
  max_rsvps: "Max RSVPs",
  max_ticket_tiers_per_event: "Max Ticket Tiers / Event",
  max_workspace_users: "Max Workspace Users",
  max_contributors: "Max Contributors",
  has_studio_access: "Studio Access",
  can_invite_contributors: "Can Invite Contributors",
  can_link_modules: "Can Link Modules",
};

function SubscriptionsPage() {
  const { activeWorkspace } = useWorkspace();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<PricingPlan | null>(null);
  const [basicPlan, setBasicPlan] = useState<PricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    async function loadSub() {
      if (!activeWorkspace?.orgnizer_id) {
        setIsLoading(false);
        return;
      }
      try {
        const plans = await getPricingPlans();
        const basic = plans.find((p: PricingPlan) => p.name === "Basic");
        if (basic) setBasicPlan(basic);

        const sub = await getActiveSubscription({
          data: { organizer_id: activeWorkspace.orgnizer_id },
        } as any);
        if (sub) {
          setSubscription(sub);
          const matchedPlan = plans.find((p: PricingPlan) => p.id === sub.plan_id);
          if (matchedPlan) setPlan(matchedPlan);
        }
      } catch (err) {
        console.error("Failed to load subscription", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSub();
  }, [activeWorkspace]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription || !plan) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-2">You don't have an active subscription yet.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border/60 rounded-3xl shadow-sm text-center px-4">
          <Zap className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Ready to upgrade?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Get access to advanced tools to manage your events and spaces more efficiently.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 shadow-md transition-transform hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Link to="/dashboard/billing/subscriptions/pricingplans">
              <Plus className="mr-2 h-5 w-5" /> View Pricing Plans
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleCancelPlan = async () => {
    if (!activeWorkspace?.orgnizer_id) return;
    setIsCanceling(true);
    try {
      await cancelSubscriptionAdmin({ data: { organizer_id: activeWorkspace.orgnizer_id } });
      toast.success("Subscription canceled successfully. You are now on the Basic plan.");
      setShowCancelDialog(false);
      // reload page to fetch fresh sub and workspace models
      window.location.reload();
    } catch (e) {
      toast.error("Failed to cancel subscription.");
      setIsCanceling(false);
    }
  };

  const nextBillingDate = subscription.next_billing_date
    ? new Date(subscription.next_billing_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const isFree = subscription.amount === 0;

  let daysLeft = 0;
  let isTrialExpired = false;

  if (isFree && subscription.next_billing_date) {
    const nextBillingDateObj = new Date(subscription.next_billing_date);
    const now = new Date();
    const diffTime = nextBillingDateObj.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft > 14) daysLeft = 14;
    if (daysLeft <= 0) {
      isTrialExpired = true;
      daysLeft = 0;
    }
  }

  // Defensively parse features and modules
  const featuresArray = Array.isArray(plan.features) ? plan.features : typeof plan.features === "string" ? JSON.parse(plan.features) : [];
  const modulesArray = Array.isArray(plan.modules_included) ? plan.modules_included : typeof plan.modules_included === "string" ? JSON.parse(plan.modules_included) : [];
  
  // Modules diff for cancellation warning
  const basicModules = basicPlan ? (Array.isArray(basicPlan.modules_included) ? basicPlan.modules_included : typeof basicPlan.modules_included === "string" ? JSON.parse(basicPlan.modules_included) : []) : [];
  const lostModules = modulesArray.filter((m: string) => !basicModules.includes(m));

  // Parse usage limits
  const ul = typeof plan.usage_limits === "string" ? JSON.parse(plan.usage_limits) : (plan.usage_limits || {});
  
  // Structural limits to display
  const limitKeys = [
    "max_workspaces", "max_events", "max_cinemas", "max_spaces", "max_venues", "max_ticket_designs",
    "max_badge_designs", "max_page_builders", "max_invoices", "max_tasks", "max_custom_forms", "max_rsvps",
    "max_ticket_tiers_per_event", "max_workspace_users", "max_contributors"
  ];
  
  // Access bools to display
  const accessKeys = ["has_studio_access", "can_invite_contributors", "can_link_modules"];

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active plans and explore available upgrades.
        </p>
      </div>

      {isFree && plan.name !== "Basic" && (
        <div
          className={`p-5 rounded-2xl border ${isTrialExpired ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/10 border-primary/20 text-primary"}`}
        >
          <h3 className="font-bold flex items-center gap-2 mb-1.5">
            {isTrialExpired ? "⚠️ Trial Expired" : "🎁 14-Day Free Trial"}
          </h3>
          <p className="text-sm opacity-90 font-medium">
            {isTrialExpired
              ? "Your 14-day free access to premium modules has expired. Please upgrade to a premium plan to continue using advanced features."
              : `You have ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in your free trial of premium modules.`}
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Active Plan
        </h2>
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background to-secondary/30 shadow-sm flex flex-col md:flex-row">
          
          {/* Main Plan Info */}
          <div className="p-8 sm:p-10 flex-1 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="w-40 h-40 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col items-start gap-4 h-full">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl sm:text-3xl font-bold break-words">{plan.name}</h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary hover:bg-primary/25 border-transparent px-3 py-1 font-bold tracking-wider"
                >
                  {subscription.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                <span className="text-3xl font-medium text-foreground tracking-tight">
                  {isFree
                    ? "Free"
                    : `${plan.currency === "USD" ? "$" : plan.currency + " "}${subscription.amount}`}
                </span>
                {!isFree && (
                  <span className="text-lg">
                    {" "}
                    / {plan.billing_cycle === "yearly" ? "yr" : "mo"}
                  </span>
                )}
              </p>
              {!isFree && (
                <p className="text-sm text-muted-foreground pt-1">
                  Your next charge will be on{" "}
                  <span className="font-medium text-foreground">{nextBillingDate}</span>.
                </p>
              )}
              
              <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button
                  asChild
                  className="w-full rounded-full shadow-md transition-transform hover:scale-105 h-12 text-md font-medium"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/dashboard/billing/subscriptions/pricingplans">
                    {isFree ? "Upgrade Plan" : "Change Plan"}
                  </Link>
                </Button>
                {!isFree && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full rounded-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 h-12 text-md"
                  >
                    Cancel Plan
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown / Privileges */}
          <div className="w-full md:w-[45%] lg:w-[50%] bg-[#111111] border-t md:border-t-0 md:border-l border-border/40 p-8 sm:p-10 space-y-8 h-80 overflow-y-auto custom-scrollbar">
            
            {/* Features */}
            {featuresArray.length > 0 && (
              <div>
                <h4 className="text-xs font-bold mb-4 uppercase tracking-wider text-muted-foreground">Features</h4>
                <div className="space-y-3">
                  {featuresArray.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modules Included */}
            {modulesArray.length > 0 && (
              <div>
                <h4 className="text-xs font-bold mb-4 uppercase tracking-wider text-muted-foreground">Premium Modules</h4>
                <div className="flex flex-wrap gap-2">
                  {modulesArray.map((mId: string) => {
                    const name = MODULE_NAMES[mId] || mId;
                    if (name === "ALL") return <Badge key={mId} className="bg-primary/20 text-primary border-primary/30">All Platform Modules</Badge>;
                    return (
                      <Badge key={mId} variant="outline" className="bg-[#1b1b1c] border-[#333333] text-foreground">
                        {name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Usage Limits */}
            <div>
              <h4 className="text-xs font-bold mb-4 uppercase tracking-wider text-muted-foreground">Usage Limits</h4>
              <div className="grid grid-cols-2 gap-4">
                {limitKeys.map(key => {
                  const val = ul[key];
                  if (val === undefined) return null;
                  return (
                    <div key={key} className="bg-[#1b1b1c] rounded-lg p-3 border border-[#333333]">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{LIMIT_LABELS[key] || key}</div>
                      <div className="font-bold text-lg text-white">
                        {val === -1 ? <span className="text-primary text-xl">∞</span> : val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Access & Permissions */}
            <div>
              <h4 className="text-xs font-bold mb-4 uppercase tracking-wider text-muted-foreground">Permissions</h4>
              <div className="space-y-2">
                {accessKeys.map(key => {
                  const hasAccess = !!ul[key];
                  return (
                    <div key={key} className="flex items-center justify-between bg-[#1b1b1c] rounded-lg p-3 border border-[#333333]">
                      <span className="text-sm font-medium text-white">{LIMIT_LABELS[key] || key}</span>
                      {hasAccess ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md w-[90vw] rounded-3xl border-destructive/20">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Cancel Premium Plan?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-2">
              If you cancel your plan, you will be downgraded to the <strong className="text-foreground">Basic</strong> plan immediately. 
            </DialogDescription>
          </DialogHeader>

          {lostModules.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 my-2">
              <h4 className="text-sm font-bold text-destructive mb-2">You will instantly lose access to:</h4>
              <ul className="list-disc pl-5 text-sm text-destructive/90 space-y-1">
                {lostModules.map((mId: string) => (
                  <li key={mId}>{MODULE_NAMES[mId] || mId}</li>
                ))}
              </ul>
              <p className="text-xs text-destructive/70 mt-3 font-medium">
                These modules will be stripped from all your active workspaces.
              </p>
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl">Keep my plan</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto h-11 rounded-xl"
              onClick={handleCancelPlan}
              disabled={isCanceling}
            >
              {isCanceling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isCanceling ? "Canceling..." : "Yes, cancel & downgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

