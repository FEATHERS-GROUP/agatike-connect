import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing/subscriptions/")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const currentPlan = {
    name: "Pro Organizer",
    price: "$49.99",
    billingCycle: "monthly",
    nextBillingDate: "July 27, 2026",
    status: "active",
  };

  const features = [
    "Unlimited Workspaces",
    "Branded Event Pages",
    "Advanced Analytics & Reporting",
    "Priority 24/7 Support",
    "Custom Ticket Designer",
    "Staff Roles & Permissions",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active plans and explore available upgrades.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Active Plan
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background to-secondary/30 p-8 shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary hover:bg-primary/25 border-transparent px-2"
                >
                  {currentPlan.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                <span className="text-xl font-medium text-foreground">{currentPlan.price}</span> / {currentPlan.billingCycle}
              </p>
              <p className="text-sm text-muted-foreground pt-1">
                Your next charge will be on <span className="font-medium text-foreground">{currentPlan.nextBillingDate}</span>.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[140px]">
              <Button
                className="w-full rounded-full shadow-md transition-transform hover:scale-105"
                style={{ background: "var(--gradient-primary)" }}
              >
                Change Plan
              </Button>
              <Button variant="outline" className="w-full rounded-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                Cancel Plan
              </Button>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-8 border-t border-border/40">
            <h4 className="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">Plan Includes</h4>
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
