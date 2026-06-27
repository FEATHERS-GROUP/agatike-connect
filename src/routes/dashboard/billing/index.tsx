import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing/")({
  component: BillingOverview,
});

function BillingOverview() {
  const paymentMethods = [
    {
      id: "pm_1",
      brand: "Visa",
      last4: "4242",
      expiry: "12/28",
      isDefault: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage your payment methods and view your current balance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-secondary/30 p-6 shadow-sm flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Current Balance</span>
            </div>
            <h2 className="text-4xl font-bold">$0.00</h2>
            <p className="text-sm text-muted-foreground mt-1">No outstanding charges.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="rounded-full">
              Add Funds
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Methods
              </div>
            </div>
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-secondary/50 border border-border/40">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {pm.brand} ending in {pm.last4}
                    {pm.isDefault && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Expires {pm.expiry}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-fit text-primary -ml-3 mt-4 hover:bg-primary/10 rounded-lg group">
            <Plus className="h-4 w-4 mr-1" /> Add Payment Method
          </Button>
        </div>
      </div>
    </div>
  );
}
