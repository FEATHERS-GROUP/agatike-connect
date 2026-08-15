import { Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface QuotaExceededBannerProps {
  limit: number;
  total: number;
  centered?: boolean;
}

export function QuotaExceededBanner({ limit, total, centered = false }: QuotaExceededBannerProps) {
  const { activeWorkspace } = useWorkspace();
  const hiddenCount = Math.max(0, total - limit);

  if (hiddenCount === 0 && limit > 0) return null;

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center bg-card rounded-3xl border border-border/60 shadow-sm my-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Quota Exceeded</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Your current plan allows for {limit} item{limit !== 1 && "s"}. You have reached this
          limit. Please upgrade your subscription to access and create more items.
        </p>

        <div className="flex gap-4">
          <Button
            asChild
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Link to="/dashboard/billing/subscriptions/pricingplans">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-primary">You have exceeded your plan limits</h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            {hiddenCount} item{hiddenCount !== 1 && "s"} {hiddenCount === 1 ? "is" : "are"}{" "}
            currently hidden. You can only view and manage your {limit} most recent item
            {limit !== 1 && "s"}.
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        className="rounded-full whitespace-nowrap shadow-sm shrink-0"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Link to="/dashboard/billing/subscriptions/pricingplans">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}
