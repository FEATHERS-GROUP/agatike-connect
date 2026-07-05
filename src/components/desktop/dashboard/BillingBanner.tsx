import { useQuery } from "@tanstack/react-query";
import { getWorkspaceSubscriptionsByWorkspaceId } from "@/api/space_subscriptions";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BillingBanner() {
  const { activeWorkspace } = useWorkspace() as any;

  const { data: subscriptions } = useQuery({
    queryKey: ["workspace_subscriptions", activeWorkspace?.id],
    queryFn: async () => {
      if (!activeWorkspace?.id) return [];
      return await getWorkspaceSubscriptionsByWorkspaceId({
        data: { workspace_id: activeWorkspace.id },
      } as any);
    },
    enabled: !!activeWorkspace?.id,
  });

  if (!subscriptions || subscriptions.length === 0) return null;

  // Find the active subscription (the one that is not cancelled and has a next_billing_date)
  const sub = subscriptions.find((s: any) => s.status !== "cancelled" && s.next_billing_date);

  if (!sub) return null;

  // We consider the grace period to be 7 days
  const nextBilling = new Date(sub.next_billing_date);
  const now = new Date();
  const diffTime = nextBilling.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If more than 7 days left, don't show the banner
  if (daysLeft > 7) return null;

  const isOverdue = daysLeft <= 0;
  const absDays = Math.abs(daysLeft);

  // If 7 days are over, the cron job should have already downgraded and logged them out.
  // But just in case, we don't need to show a banner if it's already past 7 days, or we can say it's canceled.
  if (absDays >= 7 && isOverdue) return null;

  const message = isOverdue
    ? `Your subscription is overdue by ${absDays === 0 ? "today" : `${absDays} day(s)`}. You have ${7 - absDays} day(s) left until your subscription is canceled.`
    : `Your subscription is expiring in ${daysLeft} day(s). Please make a payment.`;

  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Link to="/dashboard/billing/subscriptions" className="shrink-0 w-full sm:w-auto">
        <Button variant="destructive" size="sm" className="w-full sm:w-auto">
          Pay Now
        </Button>
      </Link>
    </div>
  );
}
