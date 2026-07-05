import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getInvoices } from "@/api/billing";
import { Button } from "@/components/ui/button";
import { Receipt, Download, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard/billing/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const { activeWorkspace } = useWorkspace();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      if (!activeWorkspace?.orgnizer_id) {
        setIsLoading(false);
        return;
      }
      try {
        const invs = await getInvoices({
          data: { organizer_id: activeWorkspace.orgnizer_id },
        } as any);
        setInvoices(invs);
      } catch (err) {
        console.error("Failed to load invoices", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, [activeWorkspace]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-2">
            View and download your past billing invoices.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="w-full pl-9 h-10 rounded-full bg-secondary/50 border-border/60"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <div className="grid grid-cols-12 items-center gap-4 border-b border-border/40 bg-secondary/30 px-6 sm:px-8 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4 md:col-span-5">Invoice</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-3 md:col-span-2">Amount</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        <div className="divide-y divide-border/40">
          {invoices.length > 0 ? (
            invoices.map((inv) => {
              const displayDate = inv.created_at
                ? new Date(inv.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A";

              return (
                <div
                  key={inv.id}
                  className="grid grid-cols-12 items-center gap-4 px-6 sm:px-8 py-5 text-sm transition-colors hover:bg-secondary/10 group"
                >
                  <div className="col-span-4 md:col-span-5 flex items-center gap-4">
                    {inv.status === "paid" ? (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground text-base tracking-tight truncate max-w-[120px] sm:max-w-none uppercase">
                        INV-{inv.id.substring(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block font-medium">
                        Agatike Subscription
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 text-muted-foreground font-medium">{displayDate}</div>

                  <div className="col-span-3 md:col-span-2 font-bold text-base">
                    {inv.amount === 0 ? "Free" : `$${inv.amount}`}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:text-primary hover:bg-primary/10 rounded-full"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 col-span-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-bold">No invoices yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                When you make a payment or subscribe to a plan, your invoices will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
