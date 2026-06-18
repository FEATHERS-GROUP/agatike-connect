import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpaceById } from "@/api/spaces";
import {
  getSpaceSubscriptionsBySpaceId,
  renewSpaceSubscription,
  cancelSpaceSubscription,
} from "@/api/space_subscriptions";
import {
  RefreshCw,
  UserCheck,
  Search,
  Download,
  Eye,
  ReceiptText,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/subscriptions")({
  component: SpaceSubscriptionsPage,
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function getDaysUntilBilling(nextBillingDate: string | null): number | null {
  if (!nextBillingDate) return null;
  const now = new Date();
  const billing = new Date(nextBillingDate);
  const diffMs = billing.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // positive = future, negative = past
}

/** What renewal/cancel UI state a subscription should display */
type RenewalState =
  | "normal" // more than 7 days away → nothing special
  | "expiring_soon" // 1–7 days remaining → show Renew button
  | "grace_period" // 1–7 days past due → show Renew + Cancel
  | "on_hold"; // more than 7 days past due → on hold

function getRenewalState(sub: any): RenewalState {
  const dbStatus = (sub.status || "").toLowerCase();
  if (dbStatus === "on_hold") return "on_hold";
  if (dbStatus === "cancelled") return "normal";

  const days = getDaysUntilBilling(sub.next_billing_date);
  if (days === null) return "normal";

  if (days >= 0 && days <= 7) return "expiring_soon";
  if (days < 0 && days >= -7) return "grace_period";
  if (days < -7) return "on_hold"; // locally computed, db may not have updated yet
  return "normal";
}

function getComputedStatus(sub: any): { label: string; className: string } {
  const dbStatus = (sub.status || "").toLowerCase();
  if (dbStatus === "on_hold") {
    return { label: "On Hold", className: "bg-amber-500/10 text-amber-500" };
  }
  if (dbStatus === "cancelled" || dbStatus === "inactive") {
    return { label: "Expired", className: "bg-muted text-muted-foreground" };
  }
  const renewalState = getRenewalState(sub);
  if (renewalState === "grace_period") {
    return { label: "Grace Period", className: "bg-rose-500/10 text-rose-500" };
  }
  if (renewalState === "expiring_soon") {
    return { label: "Active", className: "bg-green-500/10 text-green-500" };
  }
  return { label: "Active", className: "bg-green-500/10 text-green-500" };
}

function SpaceSubscriptionsPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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
    return subscriptions.filter((sub: any) => {
      const q = query.toLowerCase();
      const customerName = sub.customer_name || "";
      const planName = sub.plan_name || "";
      const matchesQuery =
        !q || customerName.toLowerCase().includes(q) || planName.toLowerCase().includes(q);

      const { label } = getComputedStatus(sub);
      const matchesStatus =
        filterStatus === "all" ||
        label.toLowerCase() === filterStatus.toLowerCase() ||
        (filterStatus === "active" && label === "Active") ||
        (filterStatus === "expired" && (label === "Expired" || label === "On Hold"));

      return matchesQuery && matchesStatus;
    });
  }, [subscriptions, query, filterStatus]);

  const handleRenew = async () => {
    if (!selectedSub) return;
    setIsRenewing(true);
    try {
      const result = await renewSpaceSubscription({ data: { subscription_id: selectedSub.id } });
      toast.success(
        `Renewed! Next billing: ${new Date(result.newNextBillingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
      );
      // Refetch the subscriptions so the drawer updates
      await queryClient.invalidateQueries({ queryKey: ["space_subscriptions", spaceId] });
      // Update selectedSub locally to reflect new state
      setSelectedSub((prev: any) => ({
        ...prev,
        status: "active",
        next_billing_date: result.newNextBillingDate,
      }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to renew subscription. Please try again.");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedSub) return;
    setIsCancelling(true);
    setShowCancelDialog(false);
    try {
      await cancelSpaceSubscription({ data: { subscription_id: selectedSub.id } });
      toast.success("Subscription cancelled successfully.");
      await queryClient.invalidateQueries({ queryKey: ["space_subscriptions", spaceId] });
      setSelectedSub((prev: any) => ({ ...prev, status: "cancelled" }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

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
            Manage all subscriptions for{" "}
            <span className="text-foreground font-semibold">{space.name}</span>.
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
            <option value="expired">Expired / On Hold</option>
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
                  filteredSubscriptions.map((sub: any) => {
                    const isGroup = sub.booking_type === "group";
                    const { label: statusLabel, className: statusClass } = getComputedStatus(sub);
                    const renewalState = getRenewalState(sub);
                    const startDate = sub.start_date
                      ? new Date(sub.start_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : new Date(sub.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                    const nextBillingDate = sub.next_billing_date
                      ? new Date(sub.next_billing_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";
                    const daysLeft = getDaysUntilBilling(sub.next_billing_date);

                    return (
                      <tr key={sub.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {sub.customer_name || "Unknown"}
                          {isGroup && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">Company</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {sub.plan_name}
                          <div className="text-[10px] text-primary mt-0.5">
                            {sub.price} {space.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500">
                            <UserCheck className="h-3 w-3" /> New
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground capitalize">
                          {sub.billing_cycle || "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                          {startDate}
                        </td>
                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                          <span
                            className={
                              renewalState === "expiring_soon"
                                ? "text-amber-500 font-bold"
                                : renewalState === "grace_period"
                                  ? "text-rose-500 font-bold"
                                  : renewalState === "on_hold"
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground font-semibold"
                            }
                          >
                            {nextBillingDate}
                          </span>
                          {renewalState === "expiring_soon" && daysLeft !== null && (
                            <div className="text-[10px] text-amber-500 mt-0.5">
                              {daysLeft}d left
                            </div>
                          )}
                          {renewalState === "grace_period" && daysLeft !== null && (
                            <div className="text-[10px] text-rose-500 mt-0.5">
                              {Math.abs(daysLeft)}d overdue
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass}`}
                          >
                            {statusLabel}
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

      {/* ── Subscription Details Drawer ── */}
      <Sheet open={!!selectedSub} onOpenChange={(isOpen) => !isOpen && setSelectedSub(null)}>
        <SheetContent className="w-[420px] sm:w-[560px] sm:max-w-lg border-l border-border/40 p-0 rounded-l-[2rem] overflow-hidden flex flex-col shadow-2xl">
          {selectedSub &&
            (() => {
              const renewalState = getRenewalState(selectedSub);
              const { label: statusLabel, className: statusClass } = getComputedStatus(selectedSub);
              const daysLeft = getDaysUntilBilling(selectedSub.next_billing_date);

              return (
                <>
                  {/* Header */}
                  <div className="p-8 border-b border-border/40 bg-secondary/5">
                    <SheetHeader>
                      <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        {selectedSub.customer_name}
                      </SheetTitle>
                      <SheetDescription>
                        <span className="font-semibold text-foreground">
                          {selectedSub.plan_name}
                        </span>{" "}
                        • {selectedSub.billing_cycle}
                      </SheetDescription>
                    </SheetHeader>

                    {/* Dates row */}
                    <div className="mt-4 flex gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Start Date
                        </p>
                        <p className="text-sm font-semibold mt-0.5">
                          {selectedSub.start_date
                            ? new Date(selectedSub.start_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : new Date(selectedSub.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Next Billing
                        </p>
                        <p
                          className={`text-sm font-semibold mt-0.5 ${
                            renewalState === "expiring_soon"
                              ? "text-amber-500"
                              : renewalState === "grace_period"
                                ? "text-rose-500"
                                : "text-orange-500"
                          }`}
                        >
                          {selectedSub.next_billing_date
                            ? new Date(selectedSub.next_billing_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Status
                        </p>
                        <span
                          className={`inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Renewal / Grace / On-Hold banners ── */}
                  <div className="px-8 pt-6 space-y-3">
                    {renewalState === "expiring_soon" && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                              Subscription expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Renew now to avoid any service interruption. An invoice will be
                              generated automatically.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="mt-3 w-full h-10 gap-2 text-sm font-semibold rounded-xl"
                          style={{ background: "var(--gradient-primary)" }}
                          disabled={isRenewing}
                          onClick={handleRenew}
                        >
                          {isRenewing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          {isRenewing ? "Renewing…" : "Renew Subscription"}
                        </Button>
                      </div>
                    )}

                    {renewalState === "grace_period" && (
                      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                              {Math.abs(daysLeft!)} day{Math.abs(daysLeft!) !== 1 ? "s" : ""}{" "}
                              overdue — Grace period
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              This subscription is past its billing date. Renew to continue access,
                              or cancel to end it. After 7 days the membership will be automatically
                              put on hold.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button
                            className="h-10 gap-2 text-sm font-semibold rounded-xl"
                            style={{ background: "var(--gradient-primary)" }}
                            disabled={isRenewing || isCancelling}
                            onClick={handleRenew}
                          >
                            {isRenewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            {isRenewing ? "Renewing…" : "Renew"}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 gap-2 text-sm font-semibold rounded-xl border-rose-500/40 text-rose-500 hover:bg-rose-500/10"
                            disabled={isRenewing || isCancelling}
                            onClick={() => setShowCancelDialog(true)}
                          >
                            {isCancelling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            {isCancelling ? "Cancelling…" : "Cancel"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {renewalState === "on_hold" && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                              Membership On Hold — Payment not received
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              This subscription has been placed on hold because it was not renewed
                              within the grace period. Renew now to restore access.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="mt-3 w-full h-10 gap-2 text-sm font-semibold rounded-xl"
                          style={{ background: "var(--gradient-primary)" }}
                          disabled={isRenewing}
                          onClick={handleRenew}
                        >
                          {isRenewing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          {isRenewing ? "Renewing…" : "Renew & Restore Access"}
                        </Button>
                      </div>
                    )}

                    {renewalState === "normal" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 rounded-xl px-4 py-2.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        Subscription is active and in good standing.
                      </div>
                    )}
                  </div>

                  {/* ── Invoices ── */}
                  <div className="p-8 flex-1 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <ReceiptText className="h-5 w-5 text-muted-foreground" />
                      Invoices
                    </h3>

                    {!selectedSub.invoices || selectedSub.invoices.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-2xl border border-dashed border-border/60">
                        <p className="text-sm">No invoices found for this subscription.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedSub.invoices.map((invoice: any) => {
                          const isPaid = invoice.status?.toLowerCase() === "paid";
                          const isPending = invoice.status?.toLowerCase() === "pending";
                          const isExpired =
                            invoice.status?.toLowerCase() === "expired" ||
                            invoice.status?.toLowerCase() === "overdue";

                          return (
                            <div
                              key={invoice.id}
                              className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:border-orange-500/30 transition-colors"
                            >
                              <div>
                                <p className="font-bold text-sm text-foreground">
                                  {invoice.invoice_number ||
                                    `INV-${invoice.id.substring(0, 6).toUpperCase()}`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(invoice.created_at).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-foreground">
                                  {invoice.amount} {space?.currency}
                                </p>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isPaid
                                      ? "bg-green-500/10 text-green-500"
                                      : isPending
                                        ? "bg-amber-500/10 text-amber-500"
                                        : isExpired
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-muted text-muted-foreground"
                                  }`}
                                >
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
              );
            })()}
        </SheetContent>
      </Sheet>

      {/* ── Cancel Confirmation Dialog ── */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel the subscription for{" "}
              <span className="font-semibold text-foreground">{selectedSub?.customer_name}</span>.
              This action cannot be undone. The member will lose access to the space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={handleCancel}
            >
              Yes, Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
