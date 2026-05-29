import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Wallet, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/events/$eventId/planning")({
  component: PlanningView,
});

function PlanningView() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget & Planning</h1>
          <p className="text-sm text-muted-foreground">Draft your financial plan for this event.</p>
        </div>
        <Button className="rounded-full shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          Add Expense
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Budget</p>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-semibold">$15,000</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Expenses Logged</p>
            <PieChart className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold">$8,450</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Projected Profit</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-semibold text-green-500">+$6,550</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6">
        <h3 className="font-semibold mb-4">Expense Breakdown</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Venue Rental</span>
            <span className="text-muted-foreground">$5,000</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Marketing & Ads</span>
            <span className="text-muted-foreground">$2,000</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Staff & Security</span>
            <span className="text-muted-foreground">$1,450</span>
          </div>
        </div>
      </div>
    </div>
  );
}
