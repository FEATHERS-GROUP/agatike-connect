import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import { getSpaceSubscriptionsBySpaceId } from "@/api/space_subscriptions";
import { RefreshCw, UserCheck, Search, Filter, Download, Eye, ReceiptText } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/subscriptions")({
  component: SpaceSubscriptionsPage,
});

function SpaceSubscriptionsPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const { data: space, isLoading: isSpaceLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  const { data: subscriptions = [], isLoading: isSubsLoading } = useQuery({
    queryKey: ["space_subscriptions", spaceId],
    queryFn: () => getSpaceSubscriptionsBySpaceId({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const q = query.toLowerCase();
      const customerName = sub.customer_name || "";
      const planName = sub.plan_name || "";
      const matchesQuery = !q || customerName.toLowerCase().includes(q) || planName.toLowerCase().includes(q);
      
      const computedStatus = sub.status === "cancelled" || sub.status === "inactive" ? "Expired" : "Active";
      const matchesStatus = filterStatus === "all" || computedStatus.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesQuery && matchesStatus;
    });
  }, [subscriptions, query, filterStatus]);

  if (isSpaceLoading || isSubsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading subscriptions...</div>;
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage all subscriptions for <span className="text-foreground font-semibold">{space.name}</span>.
          </p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl h-11 px-5">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or plan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 rounded-xl h-10"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredSubscriptions.length} result{filteredSubscriptions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/10 border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Billing Cycle</th>
                  <th className="px-6 py-4 font-semibold">Start Date</th>
                  <th className="px-6 py-4 font-semibold">Next Billing</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      No subscriptions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const isGroup = sub.booking_type === "group";
                    const computedStatus = sub.status === "cancelled" || sub.status === "inactive" ? "Expired" : "Active";
                    const startDate = sub.start_date 
                      ? new Date(sub.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                    const nextBillingDate = sub.next_billing_date
                      ? new Date(sub.next_billing_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—";

                    return (
                      <tr key={sub.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {sub.customer_name || "Unknown"}
                          {isGroup && <div className="text-[10px] text-muted-foreground mt-0.5">Company</div>}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {sub.plan_name}
                          <div className="text-[10px] text-primary mt-0.5">{sub.price} {space.currency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500">
                            <UserCheck className="h-3 w-3" /> New
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground capitalize">{sub.billing_cycle || "—"}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">{startDate}</td>
                        <td className="px-6 py-4 text-foreground font-semibold text-xs whitespace-nowrap">{nextBillingDate}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            computedStatus === "Active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                          }`}>
                            {computedStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSub(sub)}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary rounded-xl"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription Details Drawer */}
      <Sheet open={!!selectedSub} onOpenChange={(isOpen) => !isOpen && setSelectedSub(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-md border-l border-border/40 p-0 rounded-l-[2rem] overflow-hidden flex flex-col shadow-2xl">
          {selectedSub && (
            <>
              <div className="p-8 border-b border-border/40 bg-secondary/5">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                    {selectedSub.customer_name}
                  </SheetTitle>
                  <SheetDescription>
                    <span className="font-semibold text-foreground">{selectedSub.plan_name}</span> • {selectedSub.billing_cycle}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 flex gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Start Date</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {selectedSub.start_date ? new Date(selectedSub.start_date).toLocaleDateString() : new Date(selectedSub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Next Billing</p>
                    <p className="text-sm font-semibold mt-0.5 text-orange-500">
                      {selectedSub.next_billing_date ? new Date(selectedSub.next_billing_date).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                  Invoices
                </h3>
                
                {(!selectedSub.invoices || selectedSub.invoices.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-border/60">
                    <p className="text-sm">No invoices found for this subscription.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSub.invoices.map((invoice: any) => {
                      const isPaid = invoice.status?.toLowerCase() === "paid";
                      const isExpired = invoice.status?.toLowerCase() === "expired" || invoice.status?.toLowerCase() === "overdue";
                      
                      return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:border-orange-500/30 transition-colors">
                          <div>
                            <p className="font-bold text-sm text-foreground">
                              {invoice.invoice_number || `INV-${invoice.id.substring(0,6).toUpperCase()}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-foreground">
                              {invoice.amount} {space?.currency}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid ? "bg-green-500/10 text-green-500" :
                              isExpired ? "bg-red-500/10 text-red-500" :
                              "bg-amber-500/10 text-amber-500"
                            }`}>
                              {invoice.status || "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
