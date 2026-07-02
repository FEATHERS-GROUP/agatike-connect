import { createFileRoute } from "@tanstack/react-router";
import { getAdminOrganizerSubscriptionsDetail } from "@/api/admin_organizer_control";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
  Building2,
  Calendar,
  Sparkles,
  BarChart3,
  X,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute(
  "/internal/control/admin/organizers/$organizerId/subscriptions",
)({
  loader: async ({ params }) => {
    const data = await getAdminOrganizerSubscriptionsDetail({
      data: { organizerId: params.organizerId },
    } as any);
    return data;
  },
  component: OrganizerSubscriptions,
});

const CREDIT_TYPES = new Set(["credit", "deposit", "event_ticket", "space_subscription"]);
const PAGE_SIZE = 20;

function fmtAmt(amount: number | string, currency = "RWF") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num}`;
  }
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (["completed", "success", "paid", "active", "approved"].includes(s))
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#84c87e]/10 text-[#84c87e] border-[#84c87e]/30">
        <CheckCircle2 className="h-2.5 w-2.5" />
        {status}
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#dcdcaa]/10 text-[#dcdcaa] border-[#dcdcaa]/30">
        <Clock className="h-2.5 w-2.5" />
        Pending
      </span>
    );
  if (["blocked", "failed", "canceled", "cancelled"].includes(s))
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30 capitalize">
        {status}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#333333]/60 text-[#797775] border-[#333333] capitalize">
      {status || "—"}
    </span>
  );
}

function Pagination({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[#333333] bg-[#111111]">
      <span className="text-xs text-[#797775]">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="p-1.5 border border-[#333333] text-[#797775] hover:text-white hover:border-[#555555] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs text-[#797775]">
          {page} / {pages}
        </span>
        <button
          onClick={onNext}
          disabled={page === pages}
          className="p-1.5 border border-[#333333] text-[#797775] hover:text-white hover:border-[#555555] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Transaction Detail Drawer ─────────────────────────────────────────────────
function TxDrawer({ tx, onClose }: { tx: any; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const isCredit = CREDIT_TYPES.has(tx.type);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const Field = ({
    label,
    value,
    mono,
    copyKey,
  }: {
    label: string;
    value?: string | null;
    mono?: boolean;
    copyKey?: string;
  }) => {
    if (!value)
      return (
        <div>
          <p className="text-[#797775] text-xs uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-[#555555] text-xs italic">—</p>
        </div>
      );
    return (
      <div>
        <p className="text-[#797775] text-xs uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-start gap-1.5">
          <p
            className={`text-[#cccccc] text-sm break-all ${mono ? "font-mono text-xs text-[#569cd6]" : ""}`}
          >
            {value}
          </p>
          {copyKey && (
            <button
              onClick={() => copyToClipboard(value, copyKey)}
              className="shrink-0 mt-0.5 text-[#797775] hover:text-white transition-colors"
            >
              {copied === copyKey ? (
                <Check className="h-3 w-3 text-[#84c87e]" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="relative ml-auto z-10 w-full max-w-lg h-full bg-[#1b1b1c] border-l border-[#333333] flex flex-col font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 flex items-center justify-center ${isCredit ? "bg-[#84c87e]/10 text-[#84c87e]" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}
            >
              {isCredit ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm capitalize">
                {(tx.type || "").replace(/_/g, " ")}
              </p>
              <p className="text-[#797775] text-xs">{tx.workspaceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#797775] hover:text-white transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount hero */}
        <div className="px-5 py-5 border-b border-[#333333] bg-[#111111] shrink-0">
          <p className="text-[#797775] text-xs mb-1">Amount</p>
          <p className={`text-3xl font-bold mb-1 ${isCredit ? "text-[#84c87e]" : "text-white"}`}>
            {isCredit ? "+" : "−"}
            {fmtAmt(tx.amount, tx.currency)}
          </p>
          {tx.net_amount && tx.net_amount !== tx.amount && (
            <p className="text-[#797775] text-sm">
              Net payout: {fmtAmt(tx.net_amount, tx.currency)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <StatusPill status={tx.status} />
            {tx.provider_status && tx.provider_status !== tx.status && (
              <StatusPill status={`Provider: ${tx.provider_status}`} />
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Core info */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Transaction ID" value={tx.id} mono copyKey="id" />
            <Field label="Wallet ID" value={tx.wallet_id} mono copyKey="wallet_id" />
            <Field label="Currency" value={tx.currency} />
            <Field label="Type" value={(tx.type || "").replace(/_/g, " ")} />
          </div>

          <div className="h-px bg-[#333333]" />

          {/* References */}
          <div className="grid grid-cols-1 gap-4">
            <Field label="Provider Reference" value={tx.provider_reference} mono copyKey="pref" />
            <Field label="Reference ID" value={tx.reference_id} mono copyKey="refid" />
            <Field label="Description" value={tx.description} />
          </div>

          {/* Payout info */}
          {(tx.payout_method || tx.payout_account) && (
            <>
              <div className="h-px bg-[#333333]" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Payout Method" value={tx.payout_method} />
                <Field label="Payout Account" value={tx.payout_account} copyKey="paccount" />
              </div>
            </>
          )}

          {/* Dates */}
          <div className="h-px bg-[#333333]" />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Created At"
              value={tx.created_at ? new Date(tx.created_at).toLocaleString("en-US") : null}
            />
            <Field
              label="Updated At"
              value={tx.updated_at ? new Date(tx.updated_at).toLocaleString("en-US") : null}
            />
          </div>

          {/* Raw callback data */}
          {tx.raw_callback_data && (
            <>
              <div className="h-px bg-[#333333]" />
              <div>
                <p className="text-[#797775] text-xs uppercase tracking-wider mb-2">
                  Raw Callback Data
                </p>
                <pre className="bg-[#111111] border border-[#333333] p-3 text-xs text-[#84c87e] font-mono overflow-x-auto whitespace-pre-wrap break-all rounded-sm">
                  {JSON.stringify(tx.raw_callback_data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
type Tab = "subscriptions" | "transactions" | "simulations";

function OrganizerSubscriptions() {
  const { subscriptions, transactions, feeSimulations } = Route.useLoaderData();

  const [activeTab, setActiveTab] = useState<Tab>("transactions");
  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [simSearch, setSimSearch] = useState("");
  const [simPage, setSimPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const activeSubscription = subscriptions.find((s: any) => s.status === "active");

  const filteredTx = useMemo(() => {
    const q = txSearch.toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t: any) =>
        (t.description || "").toLowerCase().includes(q) ||
        (t.type || "").toLowerCase().includes(q) ||
        (t.status || "").toLowerCase().includes(q) ||
        (t.provider_reference || "").toLowerCase().includes(q) ||
        (t.reference_id || "").toLowerCase().includes(q) ||
        (t.workspaceName || "").toLowerCase().includes(q),
    );
  }, [transactions, txSearch]);

  const filteredSims = useMemo(() => {
    const q = simSearch.toLowerCase();
    if (!q) return feeSimulations;
    return feeSimulations.filter(
      (s: any) =>
        (s.transaction_id || "").toLowerCase().includes(q) ||
        (s.decision || "").toLowerCase().includes(q),
    );
  }, [feeSimulations, simSearch]);

  const txSlice = filteredTx.slice((txPage - 1) * PAGE_SIZE, txPage * PAGE_SIZE);
  const simSlice = filteredSims.slice((simPage - 1) * PAGE_SIZE, simPage * PAGE_SIZE);

  const totalRevenue = transactions
    .filter((t: any) => CREDIT_TYPES.has(t.type) && t.status === "completed")
    .reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);
  const pendingCount = transactions.filter(
    (t: any) => (t.status || "").toLowerCase() === "pending",
  ).length;
  const approvedSims = feeSimulations.filter((s: any) => s.decision === "approved").length;
  const avgMargin =
    feeSimulations.length > 0
      ? feeSimulations.reduce(
          (acc: number, s: any) => acc + (parseFloat(s.expected_margin) || 0),
          0,
        ) / feeSimulations.length
      : 0;

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: "subscriptions",
      label: "Platform Plans",
      count: subscriptions.length,
      icon: <CreditCard className="h-3.5 w-3.5" />,
    },
    {
      id: "transactions",
      label: "Wallet Transactions",
      count: transactions.length,
      icon: <Activity className="h-3.5 w-3.5" />,
    },
    {
      id: "simulations",
      label: "Fee Simulations",
      count: feeSimulations.length,
      icon: <BarChart3 className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <>
      {selectedTx && <TxDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />}

      <div className="font-sans text-sm pb-10">
        {/* ── KPI Strip ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333] border border-[#333333]">
          {[
            {
              label: "Active Plan",
              value: activeSubscription?.pricing_plan?.name || "None",
              sub:
                activeSubscription?.amount > 0
                  ? `${activeSubscription.pricing_plan?.currency || "RWF"} ${activeSubscription.amount}/${activeSubscription.pricing_plan?.billing_cycle}`
                  : "Free plan",
              icon: <Sparkles className="h-4 w-4 text-[#dcdcaa]" />,
              valueColor: "text-white",
            },
            {
              label: "Next Billing",
              value: activeSubscription?.next_billing_date
                ? new Date(activeSubscription.next_billing_date).toLocaleDateString("en-US")
                : "—",
              sub: activeSubscription?.pricing_plan
                ? `Svc fee: ${activeSubscription.pricing_plan.customer_service_fee_percentage ?? 2}%`
                : "—",
              icon: <Calendar className="h-4 w-4 text-[#c586c0]" />,
              valueColor:
                activeSubscription?.next_billing_date &&
                new Date(activeSubscription.next_billing_date) < new Date()
                  ? "text-[#f43f5e]"
                  : "text-white",
            },
            {
              label: "Total Revenue",
              value: fmtAmt(totalRevenue),
              sub: `${transactions.filter((t: any) => CREDIT_TYPES.has(t.type)).length} credits · ${pendingCount} pending`,
              icon: <TrendingUp className="h-4 w-4 text-[#84c87e]" />,
              valueColor: "text-[#84c87e]",
            },
            {
              label: "Avg Sim Margin",
              value: fmtAmt(avgMargin),
              sub: `${approvedSims}/${feeSimulations.length} simulations approved`,
              icon: <BarChart3 className="h-4 w-4 text-[#569cd6]" />,
              valueColor: avgMargin >= 0 ? "text-[#84c87e]" : "text-[#f43f5e]",
            },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#1a1a1a] px-5 py-5">
              <div className="flex items-center gap-1.5 text-[#797775] text-xs uppercase tracking-wider mb-2">
                {kpi.icon}
                {kpi.label}
              </div>
              <p className={`font-bold text-lg leading-tight mb-0.5 ${kpi.valueColor}`}>
                {kpi.value}
              </p>
              <p className="text-[#797775] text-xs">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tab Bar ────────────────────────────────────────── */}
        <div className="flex border-b border-[#333333] bg-[#111111]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-[#f97316] text-white bg-[#1a1a1a]"
                  : "border-transparent text-[#797775] hover:text-[#cccccc] hover:bg-[#1a1a1a]"
              }`}
            >
              {t.icon}
              {t.label}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-sm ${activeTab === t.id ? "bg-[#f97316]/20 text-[#f97316]" : "bg-[#333333] text-[#797775]"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* TAB: Platform Subscriptions                         */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === "subscriptions" && (
          <div className="py-5">
            <div className="border border-[#333333]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#2d2d30] text-[#797775] text-xs uppercase tracking-wider">
                      {[
                        "Plan",
                        "Status",
                        "Amount",
                        "Start Date",
                        "Next Billing",
                        "Svc Fee",
                        "Max Withdrawals/wk",
                      ].map((h) => (
                        <th key={h} className="py-2.5 px-5 font-medium border-b border-[#333333]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[#797775] italic">
                          No subscriptions.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((s: any, i: number) => (
                        <tr
                          key={s.id}
                          className={`hover:bg-[#252526] transition-colors ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
                        >
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-[#dcdcaa] shrink-0" />
                              <span className="font-medium text-white">
                                {s.pricing_plan?.name || "Unknown Plan"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            <StatusPill status={s.status} />
                          </td>
                          <td className="py-3 px-5 text-[#dcdcaa] font-medium">
                            {s.amount > 0
                              ? `${s.pricing_plan?.currency || "RWF"} ${s.amount}`
                              : "Free"}
                          </td>
                          <td className="py-3 px-5 text-[#797775]">
                            {s.start_date
                              ? new Date(s.start_date).toLocaleDateString("en-US")
                              : "—"}
                          </td>
                          <td className="py-3 px-5">
                            {s.next_billing_date ? (
                              <span
                                className={
                                  new Date(s.next_billing_date) < new Date()
                                    ? "text-[#f43f5e]"
                                    : "text-[#cccccc]"
                                }
                              >
                                {new Date(s.next_billing_date).toLocaleDateString("en-US")}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-5 text-[#cccccc]">
                            {s.pricing_plan?.customer_service_fee_percentage ?? "—"}%
                          </td>
                          <td className="py-3 px-5 text-[#cccccc]">
                            {s.pricing_plan?.max_withdrawals_per_week ?? "∞"}/wk
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* TAB: Wallet Transactions                            */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === "transactions" && (
          <div className="py-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <p className="text-xs text-[#797775]">{filteredTx.length} transactions</p>
              <div className="ml-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#797775]" />
                <input
                  type="text"
                  placeholder="Search by type, ref, workspace…"
                  value={txSearch}
                  onChange={(e) => {
                    setTxSearch(e.target.value);
                    setTxPage(1);
                  }}
                  className="bg-[#1a1a1a] border border-[#333333] text-white text-sm pl-9 pr-4 py-2 w-72 focus:outline-none focus:border-[#569cd6] transition-colors placeholder-[#797775]"
                />
              </div>
            </div>

            <div className="border border-[#333333]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#2d2d30] text-[#797775] text-xs uppercase tracking-wider">
                      {[
                        "",
                        "Type",
                        "Workspace",
                        "Amount",
                        "Net Amount",
                        "Currency",
                        "Provider Ref",
                        "Status",
                        "Date",
                        "",
                      ].map((h, i) => (
                        <th key={i} className="py-2.5 px-4 font-medium border-b border-[#333333]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {txSlice.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-10 text-center text-[#797775] italic">
                          {txSearch ? "No transactions match." : "No transactions found."}
                        </td>
                      </tr>
                    ) : (
                      txSlice.map((t: any, i: number) => {
                        const isCredit = CREDIT_TYPES.has(t.type);
                        return (
                          <tr
                            key={t.id}
                            className={`hover:bg-[#252526] transition-colors ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
                          >
                            {/* Direction icon */}
                            <td className="py-3 px-4">
                              <div
                                className={`h-7 w-7 flex items-center justify-center ${isCredit ? "bg-[#84c87e]/10 text-[#84c87e]" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}
                              >
                                {isCredit ? (
                                  <ArrowDownLeft className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                )}
                              </div>
                            </td>
                            {/* Type */}
                            <td className="py-3 px-4">
                              <p className="text-[#cccccc] capitalize">
                                {(t.type || "").replace(/_/g, " ")}
                              </p>
                              {t.description && (
                                <p className="text-[#797775] text-xs truncate max-w-[140px]">
                                  {t.description}
                                </p>
                              )}
                            </td>
                            {/* Workspace */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-[#797775] text-xs">
                                <Building2 className="h-3 w-3 shrink-0" />
                                {t.workspaceName}
                              </div>
                            </td>
                            {/* Amount */}
                            <td
                              className={`py-3 px-4 font-semibold ${isCredit ? "text-[#84c87e]" : "text-[#cccccc]"}`}
                            >
                              {isCredit ? "+" : "−"}
                              {fmtAmt(t.amount, t.currency)}
                            </td>
                            {/* Net Amount */}
                            <td className="py-3 px-4 text-[#797775]">
                              {t.net_amount ? fmtAmt(t.net_amount, t.currency) : "—"}
                            </td>
                            {/* Currency */}
                            <td className="py-3 px-4 font-mono text-[#797775] text-xs">
                              {t.currency || "—"}
                            </td>
                            {/* Provider reference */}
                            <td className="py-3 px-4">
                              {t.provider_reference ? (
                                <span className="font-mono text-xs text-[#569cd6]">
                                  {String(t.provider_reference).substring(0, 14)}
                                  {String(t.provider_reference).length > 14 ? "…" : ""}
                                </span>
                              ) : (
                                <span className="text-[#555555]">—</span>
                              )}
                            </td>
                            {/* Status */}
                            <td className="py-3 px-4">
                              <StatusPill status={t.status} />
                            </td>
                            {/* Date */}
                            <td className="py-3 px-4 text-[#797775]">
                              {t.created_at
                                ? new Date(t.created_at).toLocaleDateString("en-US")
                                : "—"}
                            </td>
                            {/* View action */}
                            <td className="py-3 px-4">
                              <button
                                onClick={() => setSelectedTx(t)}
                                className="flex items-center gap-1 px-2 py-1 text-xs border border-[#333333] text-[#797775] hover:border-[#569cd6] hover:text-[#569cd6] transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={txPage}
                total={filteredTx.length}
                onPrev={() => setTxPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setTxPage((p) => Math.min(Math.ceil(filteredTx.length / PAGE_SIZE), p + 1))
                }
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* TAB: Fee Simulations                                */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === "simulations" && (
          <div className="py-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <p className="text-xs text-[#797775]">{filteredSims.length} simulations</p>
              <div className="ml-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#797775]" />
                <input
                  type="text"
                  placeholder="Search simulations…"
                  value={simSearch}
                  onChange={(e) => {
                    setSimSearch(e.target.value);
                    setSimPage(1);
                  }}
                  className="bg-[#1a1a1a] border border-[#333333] text-white text-sm pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-[#569cd6] transition-colors placeholder-[#797775]"
                />
              </div>
            </div>

            <div className="border border-[#333333]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#2d2d30] text-[#797775] text-xs uppercase tracking-wider">
                      {[
                        "Transaction ID",
                        "Decision",
                        "Collection Cost",
                        "Disbursement Cost",
                        "Net Margin",
                        "Date",
                      ].map((h) => (
                        <th key={h} className="py-2.5 px-5 font-medium border-b border-[#333333]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {simSlice.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[#797775] italic">
                          {simSearch ? "No simulations match." : "No fee simulations recorded."}
                        </td>
                      </tr>
                    ) : (
                      simSlice.map((s: any, i: number) => {
                        const margin = parseFloat(s.expected_margin) || 0;
                        return (
                          <tr
                            key={s.transaction_id}
                            className={`hover:bg-[#252526] transition-colors ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
                          >
                            <td className="py-3 px-5 font-mono text-[#569cd6] text-xs">
                              {String(s.transaction_id || "—").substring(0, 18)}…
                            </td>
                            <td className="py-3 px-5">
                              <StatusPill status={s.decision} />
                            </td>
                            <td className="py-3 px-5 text-[#f43f5e]">
                              {fmtAmt(parseFloat(s.expected_collection_cost) || 0)}
                            </td>
                            <td className="py-3 px-5 text-[#dcdcaa]">
                              {fmtAmt(parseFloat(s.expected_disbursement_cost) || 0)}
                            </td>
                            <td
                              className={`py-3 px-5 font-semibold ${margin >= 0 ? "text-[#84c87e]" : "text-[#f43f5e]"}`}
                            >
                              {margin >= 0 ? "+" : ""}
                              {fmtAmt(margin)}
                            </td>
                            <td className="py-3 px-5 text-[#797775]">
                              {s.created_at
                                ? new Date(s.created_at).toLocaleDateString("en-US")
                                : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={simPage}
                total={filteredSims.length}
                onPrev={() => setSimPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setSimPage((p) => Math.min(Math.ceil(filteredSims.length / PAGE_SIZE), p + 1))
                }
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
