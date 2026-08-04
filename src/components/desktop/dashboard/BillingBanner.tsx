import { useQuery } from "@tanstack/react-query";
import { getActiveSubscription } from "@/api/billing";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WARNING_THRESHOLD_DAYS = 5;

export function BillingBanner({ isSidebar }: { isSidebar?: boolean } = {}) {
  const { activeWorkspace } = useWorkspace() as any;

  // This banner is based on the ORGANIZER's platform subscription — not per-workspace
  // space subscriptions. It shows on every workspace the organizer owns.
  const { data: sub } = useQuery({
    queryKey: ["active_subscription_banner", activeWorkspace?.orgnizer_id],
    queryFn: async () => {
      if (!activeWorkspace?.orgnizer_id) return null;
      return await getActiveSubscription({
        data: { organizer_id: activeWorkspace.orgnizer_id },
      } as any);
    },
    enabled: !!activeWorkspace?.orgnizer_id,
  });

  // Don't show if there's no active subscription or no billing date (permanently free)
  if (!sub || !sub.next_billing_date) return null;

  const nextBilling = new Date(sub.next_billing_date);
  const now = new Date();

  // Strip the time portion so we strictly compare calendar days (avoids 15.2 days rounding up to 16)
  const nextBillingDateOnly = new Date(nextBilling.getFullYear(), nextBilling.getMonth(), nextBilling.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nextBillingDateOnly.getTime() - nowDateOnly.getTime();
  const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

  console.log("BillingBanner Debug:", {
    nextBilling: sub.next_billing_date,
    daysLeft,
    WARNING_THRESHOLD_DAYS
  });

  // Only show if within the warning threshold
  if (daysLeft > WARNING_THRESHOLD_DAYS) return null;

  const isOverdue = daysLeft < 0;
  const absDays = Math.abs(daysLeft);

  // If 7+ days overdue the cron job should have already downgraded them
  if (absDays >= 7 && isOverdue) return null;

  const message = isOverdue
    ? `Your subscription is overdue by ${absDays === 0 ? "today" : `${absDays} day(s)`}. You have ${7 - absDays} day(s) left until your account is downgraded.`
    : `Your subscription is expiring in ${daysLeft} day(s). Renew now to keep your access.`;

  // Go directly to checkout for the same plan with renew=true so remaining days are preserved
  const checkoutHref = `/dashboard/billing/subscriptions/checkout/${sub.plan_id}` as any;
  const checkoutSearch = {
    cycle: "monthly",
    renew: "true",
    currentNextBillingDate: sub.next_billing_date,
  } as any;

  if (isSidebar) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-2 py-3 flex flex-col items-center text-center gap-3 mb-4 shadow-sm relative overflow-hidden">
        <AlertCircle className="w-8 h-8 shrink-0 text-destructive opacity-80" />
        <p className="text-xs font-semibold leading-relaxed">{message}</p>
        <Link to={checkoutHref} search={checkoutSearch} className="w-full mt-1">
          <Button variant="destructive" size="sm" className="w-full font-bold shadow-sm">
            Pay Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Link to={checkoutHref} search={checkoutSearch} className="shrink-0 w-full sm:w-auto">
        <Button variant="destructive" size="sm" className="w-full sm:w-auto">
          Pay Now
        </Button>
      </Link>
    </div>
  );
}
