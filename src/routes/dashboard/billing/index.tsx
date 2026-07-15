import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Loader2, AlertCircle, Calendar } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoices, payPendingInvoice } from "@/api/billing";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentModal } from "@/components/shared/PaymentModal";

export const Route = createFileRoute("/dashboard/billing/")({
  component: BillingOverview,
});

function BillingOverview() {
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { limits, stats, workspaceStats, isLoading: limitsLoading } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["organizer-invoices", activeWorkspace?.orgnizer_id],
    queryFn: () => getInvoices({ data: { organizer_id: activeWorkspace?.orgnizer_id } } as any),
    enabled: !!activeWorkspace?.orgnizer_id,
  });

  const pendingInvoices = invoices.filter((inv: any) => inv.status === "pending");

  const payMutation = useMutation({
    mutationFn: (values: any) => payPendingInvoice({ data: values } as any),
    onSuccess: () => {
      toast.success("Payment successful! Your subscription is now active.");
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      queryClient.invalidateQueries({ queryKey: ["organizer-invoices"] });
      // Invalidate limits / active sub if needed
    },
    onError: (err: any) => toast.error(err.message || "Payment failed"),
  });

  const handleProceedPayment = (details?: any) => {
    if (!selectedInvoice) return;
    
    payMutation.mutate({
      invoice_id: selectedInvoice.id,
      amount: selectedInvoice.amount,
      payment_method: paymentMethod,
    });
  };

  const paymentMethods = [
    {
      id: "pm_1",
      brand: "Visa",
      last4: "4242",
      expiry: "12/28",
      isDefault: true,
    },
  ];

  const USAGE_METRICS = [
    { label: "Workspaces", limitKey: "max_workspaces", statVal: stats?.workspaces },
    { label: "Team Members", limitKey: "max_workspace_users", statVal: stats?.users },
    { label: "Invoices", limitKey: "max_invoices", statVal: stats?.invoices },
    { label: "Events", limitKey: "max_events", statVal: workspaceStats?.events },
    { label: "Experiences", limitKey: "max_experiences", statVal: workspaceStats?.experiences },
    { label: "Cinemas", limitKey: "max_cinemas", statVal: workspaceStats?.cinemas },
    { label: "Spaces", limitKey: "max_spaces", statVal: workspaceStats?.spaces },
    { label: "Venues", limitKey: "max_venues", statVal: workspaceStats?.venues },
    {
      label: "Page Builders",
      limitKey: "max_page_builders",
      statVal: workspaceStats?.page_builders,
    },
    { label: "Custom Forms", limitKey: "max_custom_forms", statVal: workspaceStats?.custom_forms },
    { label: "Tasks", limitKey: "max_tasks", statVal: workspaceStats?.tasks },
    { label: "RSVPs", limitKey: "max_rsvps", statVal: workspaceStats?.rsvps },
    {
      label: "Ticket Tiers",
      limitKey: "max_ticket_tiers_per_event",
      statVal: workspaceStats?.ticket_tiers,
    },
    {
      label: "Venue Designs",
      limitKey: "max_ticket_designs",
      statVal: workspaceStats?.venue_designs,
    },
    {
      label: "Badge Designs",
      limitKey: "max_badge_designs",
      statVal: workspaceStats?.badge_designs,
    },
    {
      label: "Ticket Designs",
      limitKey: "max_ticket_designs",
      statVal: workspaceStats?.ticket_designs,
    },
    { label: "Products", limitKey: "max_products", statVal: workspaceStats?.products },
    { label: "Campaigns", limitKey: "max_campaigns", statVal: workspaceStats?.campaigns },
    { label: "Gift Cards", limitKey: "max_gift_cards", statVal: workspaceStats?.gift_cards },
    { label: "Punch Cards", limitKey: "max_punch_cards", statVal: workspaceStats?.punch_cards },
    { label: "Movies", limitKey: "max_movies", statVal: workspaceStats?.movies },
    { label: "Cinema Screens", limitKey: "max_cinema_screens", statVal: workspaceStats?.screens },
    { label: "Comments", limitKey: "max_comments", statVal: workspaceStats?.comments },
    { label: "Integrations", limitKey: "max_integrations", statVal: 0 },
    { label: "Procurements", limitKey: "max_procurements", statVal: workspaceStats?.procurements },
    { label: "Custom Books", limitKey: "max_customer_books", statVal: workspaceStats?.books },
    { label: "Notes", limitKey: "max_notes", statVal: workspaceStats?.notes },
    { label: "Experiences", limitKey: "max_experiences", statVal: workspaceStats?.experiences },
    {
      label: "Membership Plans",
      limitKey: "max_membership_plans",
      statVal: workspaceStats?.membership_plans,
    },
    { label: "Locations", limitKey: "max_locations", statVal: workspaceStats?.locations },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscriptions, view pending invoices, and track your plan usage.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Invoices Card */}
        <div className="rounded-xl border border-red-500/30 bg-red-50/50 p-6 shadow-sm flex flex-col h-48 overflow-y-auto">
          <div className="flex items-center gap-2 text-red-600 mb-4 font-medium">
            <AlertCircle className="h-5 w-5" />
            Pending Invoices
          </div>
          
          {invoicesLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
          ) : pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                  <div>
                    <div className="font-bold text-gray-900">${inv.amount}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" /> Due: {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsPaymentModalOpen(true);
                    }}
                  >
                    Pay Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-70">
              <p className="text-sm text-gray-500 font-medium">No pending invoices</p>
              <p className="text-xs text-gray-400">Your account is up to date.</p>
            </div>
          )}
        </div>

        {/* Payment Methods Card */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm flex flex-col h-48">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CreditCard className="h-5 w-5 text-primary" />
                Saved Cards
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
          <Button
            variant="ghost"
            size="sm"
            className="w-fit text-primary -ml-3 mt-auto hover:bg-primary/10 rounded-lg group"
          >
            Add New Card
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 overflow-hidden bg-card shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold">Plan Usage & Limits</h2>
        </div>

        {limitsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {USAGE_METRICS.map((metric) => {
              const limitVal = limits[metric.limitKey];
              if (limitVal === undefined) return null;

              const isUnlimited = limitVal === -1;
              const used = metric.statVal || 0;
              const remaining = isUnlimited ? "∞" : Math.max(0, limitVal - used);
              const progress = isUnlimited ? 0 : Math.min(100, (used / limitVal) * 100);

              return (
                <div key={metric.label} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{metric.label}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {used} used {isUnlimited ? "" : `/ ${limitVal} limit`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black">{remaining}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground block -mt-1">
                        Left
                      </span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border/40">
          <h3 className="text-lg font-bold mb-4">Per-Event Limitations</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Event Staff", key: "max_event_staff" },
              { label: "Event Sections", key: "max_event_sections" },
              { label: "Event Vendors", key: "max_event_vendors" },
              { label: "Event Vouchers", key: "max_event_vouchers" },
              { label: "Event Stories", key: "max_event_stories" },
              { label: "Event Posts", key: "max_event_posts" },
            ].map(({ label, key }) => {
              const limitVal = limits[key];
              if (limitVal === undefined) return null;
              const isUnlimited = limitVal === -1;
              return (
                <div key={key} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className="text-xl font-bold">
                    {isUnlimited ? "Unlimited" : `${limitVal} max`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <h3 className="text-lg font-bold mb-4">Access & Permissions</h3>
          <div className="flex flex-wrap gap-3">
            {limits.has_studio_access !== undefined && (
              <Badge
                variant={limits.has_studio_access ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.has_studio_access ? "✓" : "✕"} Studio Access
              </Badge>
            )}
            {limits.can_invite_contributors !== undefined && (
              <Badge
                variant={limits.can_invite_contributors ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_invite_contributors ? "✓" : "✕"} Can Invite Contributors
              </Badge>
            )}
            {limits.can_link_modules !== undefined && (
              <Badge
                variant={limits.can_link_modules ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_link_modules ? "✓" : "✕"} Can Link Modules
              </Badge>
            )}
            {limits.can_import_staff !== undefined && (
              <Badge
                variant={limits.can_import_staff ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_import_staff ? "✓" : "✕"} Can Import Staff
              </Badge>
            )}
            {limits.can_use_form_integration !== undefined && (
              <Badge
                variant={limits.can_use_form_integration ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_use_form_integration ? "✓" : "✕"} Form Integration
              </Badge>
            )}
            {limits.can_access_event_sections !== undefined && (
              <Badge
                variant={limits.can_access_event_sections ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_access_event_sections ? "✓" : "✕"} Event Sections
              </Badge>
            )}
            {limits.can_use_venue_integration !== undefined && (
              <Badge
                variant={limits.can_use_venue_integration ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_use_venue_integration ? "✓" : "✕"} Venue Integration
              </Badge>
            )}
            {limits.can_share_feedback_link !== undefined && (
              <Badge
                variant={limits.can_share_feedback_link ? "default" : "secondary"}
                className="py-1.5 px-3"
              >
                {limits.can_share_feedback_link ? "✓" : "✕"} Share Feedback Link
              </Badge>
            )}
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onProceed={handleProceedPayment}
          isProcessing={payMutation.isPending}
          isGenerating={false}
          workspaceId={activeWorkspace?.id || ""}
          baseAmount={selectedInvoice.amount}
          itemLabel="Subscription Invoice"
          baseCurrency="USD"
        />
      )}
    </div>
  );
}
