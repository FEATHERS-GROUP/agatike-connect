import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getActiveSubscription, getPricingPlans, PricingPlan, Subscription } from "@/api/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Sparkles, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing/subscriptions/")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const { activeWorkspace } = useWorkspace();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<PricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSub() {
      if (!activeWorkspace?.orgnizer_id) {
        setIsLoading(false);
        return;
      }
      try {
        const sub = await getActiveSubscription({
          data: { organizer_id: activeWorkspace.orgnizer_id },
        } as any);
        if (sub) {
          setSubscription(sub);
          const plans = await getPricingPlans();
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

  const nextBillingDate = subscription.next_billing_date
    ? new Date(subscription.next_billing_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const isFree = subscription.amount === 0;

  // Calculate days left for free trial
  let daysLeft = 0;
  let isTrialExpired = false;

  if (isFree && subscription.next_billing_date) {
    const nextBillingDateObj = new Date(subscription.next_billing_date);
    const now = new Date();
    const diffTime = nextBillingDateObj.getTime() - now.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft > 14) {
      daysLeft = 14;
    }

    if (daysLeft <= 0) {
      isTrialExpired = true;
      daysLeft = 0;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active plans and explore available upgrades.
        </p>
      </div>

      {isFree && (
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
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background to-secondary/30 p-8 sm:p-10 shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Sparkles className="w-40 h-40 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
            <div className="space-y-4 w-full lg:w-auto">
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
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto min-w-[160px] mt-4 lg:mt-0">
              <Button
                asChild
                className="w-full sm:flex-1 lg:w-full rounded-full shadow-md transition-transform hover:scale-105 h-12 text-md font-medium"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Link to="/dashboard/billing/subscriptions/pricingplans">
                  {isFree ? "Upgrade Plan" : "Change Plan"}
                </Link>
              </Button>
              {!isFree && (
                <Button
                  variant="outline"
                  onClick={() => toast.info("Please contact support to cancel your subscription.")}
                  className="w-full sm:flex-1 lg:w-full rounded-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 h-12 text-md"
                >
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-10 pt-8 border-t border-border/40">
            <h4 className="text-sm font-bold mb-6 uppercase tracking-wider text-muted-foreground">
              What's Included
            </h4>
            <div className="grid lg:grid-cols-2 gap-y-4 gap-x-8">
              {(Array.isArray(plan.features) ? plan.features : typeof plan.features === "string" ? JSON.parse(plan.features) : []).map((feature: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                >
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
