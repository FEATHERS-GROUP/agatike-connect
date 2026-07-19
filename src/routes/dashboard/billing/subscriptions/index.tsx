import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getActiveSubscription,
  getPricingPlans,
  PricingPlan,
  Subscription,
  cancelSubscriptionAdmin,
} from "@/api/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Check,
  Sparkles,
  Loader2,
  Plus,
  AlertTriangle,
  Layout,
  Crown,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Globe,
  Calendar,
  Layers,
  MapPin,
  Ticket,
  FileText,
  Users,
  Video,
  Monitor,
  ShoppingBag,
  Gift,
  BookOpen,
  PieChart,
  Target,
} from "lucide-react";
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

const GLOBAL_LIMITS: Record<string, { label: string; icon: React.FC<any> }> = {
  max_workspaces: { label: "Workspaces", icon: Globe },
  max_events: { label: "Events", icon: Calendar },
  max_cinemas: { label: "Cinemas", icon: Video },
  max_spaces: { label: "Spaces", icon: Layers },
  max_venues: { label: "Venue Listings", icon: MapPin },
  max_movies: { label: "Movies", icon: Video },
  max_cinema_screens: { label: "Cinema Screens", icon: Monitor },
  max_products: { label: "Products", icon: ShoppingBag },
  max_campaigns: { label: "Campaigns", icon: Target },
  max_gift_cards: { label: "Gift Cards", icon: Gift },
  max_punch_cards: { label: "Punch Cards", icon: Ticket },
  max_customer_books: { label: "Custom Books", icon: BookOpen },
  max_custom_forms: { label: "Custom Forms", icon: FileText },
  max_rsvps: { label: "RSVPs", icon: CheckCircle2 },
  max_ticket_tiers_per_event: { label: "Ticket Tiers / Event", icon: Ticket },
  max_ticket_designs: { label: "Ticket Designs", icon: Layout },
  max_badge_designs: { label: "Badge Designs", icon: ShieldCheck },
  max_page_builders: { label: "Page Builders", icon: Layout },
  max_invoices: { label: "Invoices", icon: FileText },
  max_tasks: { label: "Tasks", icon: Check },
  max_workspace_users: { label: "Workspace Users", icon: Users },
  max_contributors: { label: "Contributors", icon: Users },
};

const PER_EVENT_LIMITS: Record<string, { label: string; icon: React.FC<any> }> = {
  max_event_staff: { label: "Event Staff", icon: Users },
  max_event_sections: { label: "Event Sections", icon: MapPin },
  max_event_vendors: { label: "Event Vendors", icon: ShoppingBag },
  max_event_vouchers: { label: "Event Vouchers", icon: Ticket },
  max_event_stories: { label: "Event Stories", icon: Layout },
  max_event_posts: { label: "Event Posts", icon: FileText },
};

const PERMISSION_KEYS: Record<string, string> = {
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
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-2">You don't have an active subscription yet.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/60 rounded-[2.5rem] shadow-sm text-center px-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <Zap className="h-16 w-16 text-muted-foreground mb-6 opacity-30 group-hover:text-primary/60 transition-colors duration-500 relative z-10" />
          <h2 className="text-3xl font-bold mb-3 relative z-10">Ready to unlock your potential?</h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg leading-relaxed relative z-10">
            Get access to advanced modules, expanded limits, and powerful tools to manage your
            events and spaces more efficiently.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-10 h-14 text-lg shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-1 hover:scale-105 relative z-10"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Link to="/dashboard/billing/subscriptions/pricingplans">
              <Sparkles className="mr-2 h-5 w-5" /> Explore Pricing Plans
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

  const featuresArray = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === "string"
      ? JSON.parse(plan.features)
      : [];
  const modulesArray = Array.isArray(plan.modules_included)
    ? plan.modules_included
    : typeof plan.modules_included === "string"
      ? JSON.parse(plan.modules_included)
      : [];
  const basicModules = basicPlan
    ? Array.isArray(basicPlan.modules_included)
      ? basicPlan.modules_included
      : typeof basicPlan.modules_included === "string"
        ? JSON.parse(basicPlan.modules_included)
        : []
    : [];
  const lostModules = modulesArray.filter((m: string) => !basicModules.includes(m));
  const ul =
    typeof plan.usage_limits === "string" ? JSON.parse(plan.usage_limits) : plan.usage_limits || {};

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4 pb-20">
      {/* Header section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Subscriptions & Billing</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your active plan, view feature access, and monitor your usage limits.
        </p>
      </div>

      {isFree && plan.name === "Basic" && (
        <div
          className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${isTrialExpired ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/10 border-primary/20 text-primary"}`}
        >
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-1.5">
              {isTrialExpired ? "⚠️ Trial Expired" : "🎁 14-Day Free Trial"}
            </h3>
            <p className="text-sm opacity-90 font-medium">
              {isTrialExpired
                ? "Your 14-day free access to premium modules has expired. Please upgrade to a premium plan."
                : `You have ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in your free trial of premium modules.`}
            </p>
          </div>
          {!isTrialExpired && (
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/dashboard/billing/subscriptions/pricingplans">Upgrade Now</Link>
            </Button>
          )}
        </div>
      )}

      {/* Hero Active Plan Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-lg flex flex-col md:flex-row group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
          <Crown className="w-64 h-64 text-primary" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background pointer-events-none" />

        <div className="p-8 sm:p-12 relative z-10 flex flex-col justify-between w-full">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">{plan.name}</h2>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-transparent px-4 py-1.5 text-sm font-bold tracking-widest uppercase rounded-full shadow-sm">
                {subscription.status}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl sm:text-6xl font-black text-foreground tracking-tighter">
                {isFree
                  ? "Free"
                  : `${plan.currency === "USD" ? "$" : plan.currency + " "}${subscription.amount}`}
              </span>
              {!isFree && (
                <span className="text-xl text-muted-foreground font-medium">
                  / {plan.billing_cycle === "yearly" ? "year" : "month"}
                </span>
              )}
            </div>

            {!isFree && (
              <p className="text-sm text-muted-foreground mt-4 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next charge on <span className="text-foreground">{nextBillingDate}</span>
              </p>
            )}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              asChild
              className="w-full rounded-full shadow-[var(--shadow-glow)] transition-all hover:scale-105 hover:-translate-y-0.5 h-14 text-lg font-bold flex-1"
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
                className="w-full rounded-full border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 h-14 text-lg font-semibold flex-1"
              >
                Cancel Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid layout for Features, Permissions, Modules, Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Features */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 flex flex-col h-full shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-primary" /> Features
          </h4>
          <div className="space-y-4 flex-1">
            {featuresArray.length > 0 ? (
              featuresArray.map((feature: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm font-medium text-foreground/90"
                >
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No specific features listed.</div>
            )}
          </div>
        </div>

        {/* Permissions & Access */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 flex flex-col h-full shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Permissions
          </h4>
          <div className="space-y-4 flex-1">
            {Object.keys(PERMISSION_KEYS).map((key) => {
              const hasAccess = !!ul[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40"
                >
                  <span className="text-sm font-semibold">{PERMISSION_KEYS[key]}</span>
                  {hasAccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Modules */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 flex flex-col h-full shadow-sm lg:col-span-1">
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
            <Layers className="w-4 h-4 text-blue-500" /> Premium Modules
          </h4>
          <div className="flex flex-wrap gap-2 flex-1 content-start">
            {modulesArray.length > 0 ? (
              modulesArray.map((mId: string) => {
                const name = MODULE_NAMES[mId] || mId;
                if (name === "ALL")
                  return (
                    <Badge
                      key={mId}
                      className="bg-primary/20 text-primary border-primary/30 px-3 py-1.5 rounded-xl font-semibold"
                    >
                      All Platform Modules Included
                    </Badge>
                  );
                return (
                  <Badge
                    key={mId}
                    variant="outline"
                    className="bg-secondary/40 border-border/60 text-foreground px-3 py-1.5 rounded-xl"
                  >
                    {name}
                  </Badge>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground">No premium modules included.</div>
            )}
          </div>
        </div>
      </div>

      {/* Global Limits */}
      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
          <Globe className="w-4 h-4 text-indigo-500" /> Workspace & Global Limits
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(GLOBAL_LIMITS).map(([key, config]) => {
            const val = ul[key] !== undefined ? ul[key] : -1;
            const Icon = config.icon;
            const isUnlimited = val === -1;
            return (
              <div
                key={key}
                className="bg-secondary/20 rounded-2xl p-4 border border-border/40 flex flex-col items-start gap-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="p-2 rounded-xl bg-background border border-border/60">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1 leading-tight">
                    {config.label}
                  </div>
                  <div className="font-black text-xl sm:text-2xl text-foreground">
                    {isUnlimited ? (
                      <span className="text-primary text-3xl leading-none">∞</span>
                    ) : (
                      val
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Event Limits */}
      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
          <Target className="w-4 h-4 text-orange-500" /> Per-Event Limitations
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(PER_EVENT_LIMITS).map(([key, config]) => {
            const val = ul[key] !== undefined ? ul[key] : -1;
            const Icon = config.icon;
            const isUnlimited = val === -1;
            return (
              <div
                key={key}
                className="bg-secondary/20 rounded-2xl p-4 border border-border/40 flex flex-col items-start gap-3 hover:bg-secondary/40 transition-colors"
              >
                <div className="p-2 rounded-xl bg-background border border-border/60">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1 leading-tight">
                    {config.label}
                  </div>
                  <div className="font-black text-xl sm:text-2xl text-foreground">
                    {isUnlimited ? (
                      <span className="text-primary text-3xl leading-none">∞</span>
                    ) : (
                      val
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md w-[90vw] rounded-3xl border-destructive/20 bg-background">
          <DialogHeader>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-bold">Cancel Premium Plan?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-base pt-2">
              If you cancel your plan, you will be downgraded to the{" "}
              <strong className="text-foreground">Basic</strong> plan immediately.
            </DialogDescription>
          </DialogHeader>

          {lostModules.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 my-4">
              <h4 className="text-sm font-bold text-destructive mb-3">
                You will instantly lose access to:
              </h4>
              <div className="flex flex-wrap gap-2">
                {lostModules.map((mId: string) => (
                  <Badge
                    key={mId}
                    variant="outline"
                    className="border-destructive/30 text-destructive/90 bg-destructive/5"
                  >
                    {MODULE_NAMES[mId] || mId}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-destructive/70 mt-4 font-medium">
                These modules will be stripped from all your active workspaces.
              </p>
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 rounded-xl font-bold border-border/80"
              >
                Keep my plan
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="w-full sm:w-auto h-12 rounded-xl font-bold"
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
