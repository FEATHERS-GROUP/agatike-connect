import { createFileRoute, useRouter, getRouteApi } from "@tanstack/react-router";
import {
  getAdminOrganizerBillingSettings,
  setAdminOrganizerStatus,
  updateAdminWorkspaceCurrency,
  updateAdminOrganizerSubscriptionPlan,
} from "@/api/admin_organizer_control";
import {
  Settings,
  ShieldAlert,
  CheckCircle,
  Ban,
  Globe,
  CreditCard,
  Building2,
  Calendar,
  RefreshCw,
  Zap,
  AlertTriangle,
  X,
  Check,
  ChevronDown,
  Sparkles,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/settings")({
  loader: async ({ params }) => {
    const billing = await getAdminOrganizerBillingSettings({
      data: { organizerId: params.organizerId },
    } as any);
    return { billing };
  },
  component: OrganizerSettings,
});

const CURRENCIES = [
  "RWF",
  "USD",
  "EUR",
  "GBP",
  "KES",
  "UGX",
  "TZS",
  "NGN",
  "GHS",
  "ZAR",
  "XOF",
  "XAF",
  "EGP",
  "MAD",
];

// ── Confirmation Modal ────────────────────────────────────────────────────────
interface ConfirmModal {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  icon?: "warning" | "danger" | "info";
  onConfirm: () => Promise<void>;
}

function ConfirmDialog({ modal, onClose }: { modal: ConfirmModal; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const iconColor =
    modal.icon === "danger"
      ? "text-[#f43f5e] bg-[#f43f5e]/10"
      : modal.icon === "warning"
        ? "text-[#dcdcaa] bg-[#dcdcaa]/10"
        : "text-[#569cd6] bg-[#569cd6]/10";

  const btnClass =
    modal.confirmClass ||
    "bg-[#569cd6]/10 text-[#569cd6] border-[#569cd6]/30 hover:bg-[#569cd6]/20";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await modal.onConfirm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Dialog */}
      <div className="relative z-10 bg-[#1e1e1e] border border-[#444444] rounded-sm shadow-2xl w-full max-w-md mx-4 p-6 font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#797775] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className={`h-10 w-10 rounded-sm flex items-center justify-center mb-4 ${iconColor}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h3 className="text-white font-semibold text-base mb-2">{modal.title}</h3>
        <p className="text-[#797775] text-sm mb-6 leading-relaxed">{modal.message}</p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-[#333333] text-[#797775] hover:text-white hover:border-[#555555] rounded-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-sm transition-colors disabled:opacity-50 font-medium ${btnClass}`}
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {loading ? "Processing..." : modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function OrganizerSettings() {
  const { billing } = Route.useLoaderData();
  const routeApi = getRouteApi("/internal/control/admin/organizers/$organizerId");
  const { overview } = routeApi.useLoaderData();
  const router = useRouter();

  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  // Track pending currency selection per workspace before confirming
  const [pendingCurrency, setPendingCurrency] = useState<Record<string, string>>({});

  const {
    workspaces = [],
    pricingPlans = [],
    activeSubscription,
    subscriptions = [],
  } = billing || {};

  const dismiss = () => setConfirmModal(null);

  // ── Status toggle ──────────────────────────────────────────────────────────
  const promptToggleStatus = (newStatus: boolean) => {
    setConfirmModal({
      title: newStatus ? "Activate Organizer Account" : "Ban Organizer Account",
      message: newStatus
        ? `This will allow "${overview?.name}" to log in and use the platform again. Are you sure?`
        : `This will prevent "${overview?.name}" from logging in. Their public events will remain visible. Are you sure?`,
      confirmLabel: newStatus ? "Activate Account" : "Ban Account",
      icon: newStatus ? "info" : "danger",
      confirmClass: newStatus
        ? "bg-[#84c87e]/10 text-[#84c87e] border-[#84c87e]/30 hover:bg-[#84c87e]/20"
        : "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30 hover:bg-[#f43f5e]/20",
      onConfirm: async () => {
        await setAdminOrganizerStatus({
          data: { organizerId: overview.id, active: newStatus },
        } as any);
        toast.success(newStatus ? "Organizer activated" : "Organizer banned");
        router.invalidate();
      },
    });
  };

  // ── Currency change ────────────────────────────────────────────────────────
  const promptCurrencyChange = (ws: any) => {
    const newCurrency = pendingCurrency[ws.id] || ws.currency || "RWF";
    if (newCurrency === ws.currency) return;
    setConfirmModal({
      title: "Change Workspace Currency",
      message: `Change the currency of workspace "${ws.name}" from ${ws.currency || "RWF"} to ${newCurrency}? This will affect how prices, invoices, and wallet balances are displayed.`,
      confirmLabel: `Set to ${newCurrency}`,
      icon: "warning",
      confirmClass: "bg-[#c586c0]/10 text-[#c586c0] border-[#c586c0]/30 hover:bg-[#c586c0]/20",
      onConfirm: async () => {
        await updateAdminWorkspaceCurrency({
          data: { workspaceId: ws.id, currency: newCurrency },
        } as any);
        toast.success(`${ws.name} currency set to ${newCurrency}`);
        router.invalidate();
      },
    });
  };

  // ── Plan change ────────────────────────────────────────────────────────────
  const promptPlanChange = () => {
    const plan = pricingPlans.find((p: any) => p.id === selectedPlanId);
    if (!plan) return;
    setConfirmModal({
      title: "Change Subscription Plan",
      message: `This will cancel the current active plan and switch "${overview?.name}" to the "${plan.name}" plan (${plan.price === 0 ? "Free" : `${plan.currency} ${plan.price}/${plan.billing_cycle}`}). The change takes effect immediately.`,
      confirmLabel: `Switch to ${plan.name}`,
      icon: "warning",
      confirmClass: "bg-[#569cd6]/10 text-[#569cd6] border-[#569cd6]/30 hover:bg-[#569cd6]/20",
      onConfirm: async () => {
        await updateAdminOrganizerSubscriptionPlan({
          data: { organizerId: overview.id, planId: plan.id, amount: plan.price },
        } as any);
        toast.success(`Plan changed to ${plan.name}`);
        setSelectedPlanId(null);
        router.invalidate();
      },
    });
  };

  return (
    <>
      {confirmModal && <ConfirmDialog modal={confirmModal} onClose={dismiss} />}

      <div className="space-y-0 font-sans text-sm pb-10">
        {/* ── Page header ─────────────────────────────────── */}
        <div className="flex items-center gap-2 py-4 px-0 border-b border-[#333333] mb-0">
          <Settings className="h-5 w-5 text-[#cccccc]" />
          <h2 className="text-base font-medium text-white">Organizer Settings</h2>
        </div>

        {/* ── Account Status ──────────────────────────────── */}
        <section className="border-b border-[#333333]">
          <div className="py-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-8 w-8 rounded-sm bg-[#f43f5e]/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-4 w-4 text-[#f43f5e]" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Account Access &amp; Status</h3>
                <p className="text-[#797775] text-xs mt-0.5">
                  Control login access for this organizer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#333333] px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${overview?.active ? "bg-[#84c87e]" : "bg-[#f43f5e]"} ring-2 ${overview?.active ? "ring-[#84c87e]/20" : "ring-[#f43f5e]/20"}`}
                />
                <div>
                  <p className="text-white font-medium">{overview?.name}</p>
                  <p className="text-[#797775] text-xs">{overview?.email}</p>
                </div>
                <span
                  className={`ml-3 text-xs px-2 py-0.5 rounded-sm border ${overview?.active ? "text-[#84c87e] bg-[#84c87e]/10 border-[#84c87e]/30" : "text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/30"}`}
                >
                  {overview?.active ? "Active" : "Banned"}
                </span>
              </div>
              <div>
                {overview?.active ? (
                  <button
                    onClick={() => promptToggleStatus(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/20 transition-colors rounded-sm font-medium text-sm"
                  >
                    <Ban className="h-3.5 w-3.5" /> Ban Account
                  </button>
                ) : (
                  <button
                    onClick={() => promptToggleStatus(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#84c87e]/10 text-[#84c87e] border border-[#84c87e]/30 hover:bg-[#84c87e]/20 transition-colors rounded-sm font-medium text-sm"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Activate Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Current Subscription ─────────────────────────── */}
        <section className="border-b border-[#333333]">
          <div className="py-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-8 w-8 rounded-sm bg-[#84c87e]/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-[#84c87e]" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Current Subscription</h3>
                <p className="text-[#797775] text-xs mt-0.5">
                  Active billing plan and renewal schedule.
                </p>
              </div>
            </div>

            {activeSubscription ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#333333] border border-[#333333]">
                {[
                  {
                    label: "Plan",
                    value: activeSubscription.pricing_plan?.name || "Unknown",
                    sub:
                      activeSubscription.amount > 0
                        ? `${activeSubscription.pricing_plan?.currency || "RWF"} ${activeSubscription.amount} / ${activeSubscription.pricing_plan?.billing_cycle}`
                        : "Free plan",
                    subColor: "text-[#84c87e]",
                    icon: <Sparkles className="h-3.5 w-3.5 text-[#dcdcaa]" />,
                  },
                  {
                    label: "Status",
                    value: activeSubscription.status,
                    sub: `Since ${new Date(activeSubscription.start_date).toLocaleDateString("en-US")}`,
                    subColor: "text-[#797775]",
                    icon: <CheckCircle className="h-3.5 w-3.5 text-[#84c87e]" />,
                    valueClass: "capitalize text-[#84c87e]",
                  },
                  {
                    label: "Next Billing",
                    value: activeSubscription.next_billing_date
                      ? new Date(activeSubscription.next_billing_date).toLocaleDateString("en-US")
                      : "—",
                    sub: activeSubscription.pricing_plan
                      ? `Svc: ${activeSubscription.pricing_plan.customer_service_fee_percentage ?? 2}% · Max ${activeSubscription.pricing_plan.max_withdrawals_per_week ?? "∞"} withdrawals/wk`
                      : "",
                    subColor: "text-[#797775]",
                    icon: <Calendar className="h-3.5 w-3.5 text-[#c586c0]" />,
                    valueClass:
                      new Date(activeSubscription.next_billing_date) < new Date()
                        ? "text-[#f43f5e]"
                        : "text-white",
                  },
                ].map((card, i) => (
                  <div key={i} className="bg-[#1a1a1a] px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[#797775] text-xs uppercase tracking-wider mb-2">
                      {card.icon}
                      {card.label}
                    </div>
                    <p
                      className={`font-semibold text-base mb-0.5 ${card.valueClass || "text-white"}`}
                    >
                      {card.value}
                    </p>
                    {card.sub && <p className={`text-xs ${card.subColor}`}>{card.sub}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-[#333333] px-5 py-6 text-center text-[#797775] italic text-sm">
                <Clock className="h-5 w-5 mx-auto mb-2 text-[#444]" />
                No active subscription.
              </div>
            )}

            {subscriptions.length > 1 && (
              <div className="mt-3 border border-[#333333] divide-y divide-[#333333]">
                {subscriptions.slice(1, 4).map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-[#111111] px-4 py-2.5 text-xs"
                  >
                    <span className="text-[#cccccc] font-medium">
                      {s.pricing_plan?.name || "Unknown Plan"}
                    </span>
                    <span className="text-[#797775]">
                      {new Date(s.start_date).toLocaleDateString("en-US")}
                    </span>
                    <span
                      className={`capitalize ${s.status === "active" ? "text-[#84c87e]" : "text-[#797775]"}`}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Change Plan ──────────────────────────────────── */}
        <section className="border-b border-[#333333]">
          <div className="py-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-8 w-8 rounded-sm bg-[#dcdcaa]/10 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-[#dcdcaa]" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Change Subscription Plan</h3>
                <p className="text-[#797775] text-xs mt-0.5">
                  Select a plan then confirm to override. Cancels the current plan immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#333333] border border-[#333333]">
              {pricingPlans.map((plan: any) => {
                const isActive = activeSubscription?.plan_id === plan.id;
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(isSelected ? null : plan.id)}
                    className={`text-left p-4 transition-all relative ${
                      isSelected
                        ? "bg-[#569cd6]/10 outline outline-1 outline-[#569cd6] z-10"
                        : isActive
                          ? "bg-[#84c87e]/5"
                          : "bg-[#1a1a1a] hover:bg-[#252526]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 right-2 text-[10px] text-[#84c87e] border border-[#84c87e]/40 px-1.5 py-0.5">
                        Active
                      </span>
                    )}
                    {plan.is_popular && !isActive && (
                      <span className="absolute top-2 right-2 text-[10px] text-[#dcdcaa] border border-[#dcdcaa]/40 px-1.5 py-0.5">
                        Popular
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-4 w-4 bg-[#569cd6] rounded-sm flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                    <p className="font-semibold text-white text-sm mb-1 pr-8">{plan.name}</p>
                    <p className="text-[#84c87e] font-medium">
                      {plan.price === 0 ? "Free" : `${plan.currency} ${plan.price}`}
                      <span className="text-[#797775] font-normal text-xs">
                        {" "}
                        /{plan.billing_cycle}
                      </span>
                    </p>
                    <p className="text-[#797775] text-xs mt-2 line-clamp-2">{plan.description}</p>
                    <div className="mt-3 pt-2 border-t border-[#333333] space-y-1 text-xs text-[#797775]">
                      <div className="flex justify-between">
                        <span>Svc fee</span>
                        <span className="text-[#cccccc]">
                          {plan.customer_service_fee_percentage ?? 2}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Withdrawals/wk</span>
                        <span className="text-[#cccccc]">
                          {plan.max_withdrawals_per_week ?? "∞"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin buffer</span>
                        <span className="text-[#cccccc]">{plan.platform_margin_buffer ?? 0}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPlanId && (
              <div className="mt-3 flex items-center justify-between bg-[#569cd6]/5 border border-[#569cd6]/30 px-4 py-3">
                <p className="text-[#569cd6] text-sm">
                  Selected:{" "}
                  <strong>{pricingPlans.find((p: any) => p.id === selectedPlanId)?.name}</strong> —
                  confirm to apply
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPlanId(null)}
                    className="px-3 py-1.5 text-xs border border-[#333333] text-[#797775] hover:text-white hover:border-[#555555] rounded-sm transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={promptPlanChange}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#569cd6] text-white hover:bg-[#4a8cc0] rounded-sm transition-colors font-medium"
                  >
                    <RefreshCw className="h-3 w-3" /> Confirm Change
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Workspace Currencies ──────────────────────────── */}
        <section>
          <div className="py-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-8 w-8 rounded-sm bg-[#c586c0]/10 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-[#c586c0]" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Workspace Currencies</h3>
                <p className="text-[#797775] text-xs mt-0.5">
                  Set the display currency per workspace. Affects ticket prices, invoices, and
                  wallet balances.
                </p>
              </div>
            </div>

            {workspaces.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-[#333333] text-center py-8 text-[#797775] italic text-sm">
                No workspaces found.
              </div>
            ) : (
              <div className="border border-[#333333] divide-y divide-[#333333]">
                {workspaces.map((ws: any, i: number) => {
                  const pending = pendingCurrency[ws.id];
                  const currentCurrency = ws.currency || "RWF";
                  const hasChange = pending && pending !== currentCurrency;
                  return (
                    <div
                      key={ws.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
                    >
                      {/* Workspace identity */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {ws.logo ? (
                          <img
                            src={ws.logo}
                            alt="logo"
                            className="h-8 w-8 object-cover border border-[#333333] shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-[#252526] border border-[#333333] flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-[#797775]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{ws.name}</p>
                          <p className="text-[#797775] text-xs">
                            {ws.city}
                            {ws.country ? `, ${ws.country}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Current currency badge */}
                      <div className="shrink-0 text-center hidden sm:block">
                        <p className="text-[#797775] text-xs mb-0.5">Current</p>
                        <span className="text-[#cccccc] font-mono font-semibold text-sm">
                          {currentCurrency}
                        </span>
                      </div>

                      {hasChange && <div className="text-[#797775] text-xs shrink-0">→</div>}

                      {/* Currency selector */}
                      <div className="relative shrink-0">
                        <select
                          value={pending || currentCurrency}
                          onChange={(e) =>
                            setPendingCurrency((prev) => ({ ...prev, [ws.id]: e.target.value }))
                          }
                          className="appearance-none bg-[#252526] border border-[#333333] text-white text-sm px-3 py-2 pr-8 focus:outline-none focus:border-[#569cd6] transition-colors cursor-pointer"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#797775] pointer-events-none" />
                      </div>

                      {/* Apply button */}
                      <button
                        onClick={() => promptCurrencyChange(ws)}
                        disabled={!hasChange}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-sm transition-colors font-medium shrink-0 ${
                          hasChange
                            ? "bg-[#c586c0]/10 text-[#c586c0] border-[#c586c0]/30 hover:bg-[#c586c0]/20 cursor-pointer"
                            : "text-[#797775] border-[#333333] opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Apply
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
