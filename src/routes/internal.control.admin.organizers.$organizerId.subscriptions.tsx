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
} from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute(
  "/internal/control/admin/organizers/$organizerId/subscriptions"
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

function fmtCurrency(amount: number, currency = "RWF") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
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
  if (["pending"].includes(s))
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border bg-[#dcdcaa]/10 text-[#dcdcaa] border-[#dcdcaa]/30">
        <Clock className="h-2.5 w-2.5" />
        {status}
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

function OrganizerSubscriptions() {
  const { subscriptions, transactions, feeSimulations } = Route.useLoaderData();

  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [simSearch, setSimSearch] = useState("");
  const [simPage, setSimPage] = useState(1);

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
        (t.workspaceName || "").toLowerCase().includes(q)
    );
  }, [transactions, txSearch]);

  const filteredSims = useMemo(() => {
    const q = simSearch.toLowerCase();
    if (!q) return feeSimulations;
    return feeSimulations.filter(
      (s: any) =>
        (s.transaction_id || "").toLowerCase().includes(q) ||
        (s.decision || "").toLowerCase().includes(q)
    );
  }, [feeSimulations, simSearch]);

  const txSlice = filteredTx.slice((txPage - 1) * PAGE_SIZE, txPage * PAGE_SIZE);
  const simSlice = filteredSims.slice((simPage - 1) * PAGE_SIZE, simPage * PAGE_SIZE);

  // Revenue metrics
  const totalRevenue = transactions
    .filter((t: any) => CREDIT_TYPES.has(t.type) && t.status === "completed")
    .reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);

  const pendingCount = transactions.filter(
    (t: any) => (t.status || "").toLowerCase() === "pending"
  ).length;

  const approvedSims = feeSimulations.filter((s: any) => s.decision === "approved").length;
  const avgMargin =
    feeSimulations.length > 0
      ? feeSimulations.reduce(
          (acc: number, s: any) => acc + (parseFloat(s.expected_margin) || 0),
          0
        ) / feeSimulations.length
      : 0;

  return (
    <div className="font-sans text-sm pb-10">

      {/* ── KPI Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333] border border-[#333333] mb-0">
        {[
          {
            label: "Active Plan",
            value: activeSubscription?.pricing_plan?.name || "None",
            sub: activeSubscription
              ? activeSubscription.amount > 0
                ? `${activeSubscription.pricing_plan?.currency || "RWF"} ${activeSubscription.amount}/${activeSubscription.pricing_plan?.billing_cycle}`
                : "Free plan"
              : "No active subscription",
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
            value: fmtCurrency(totalRevenue),
            sub: `${transactions.filter((t: any) => CREDIT_TYPES.has(t.type)).length} credits · ${pendingCount} pending`,
            icon: <TrendingUp className="h-4 w-4 text-[#84c87e]" />,
            valueColor: "text-[#84c87e]",
          },
          {
            label: "Avg Sim Margin",
            value: fmtCurrency(avgMargin),
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

      {/* ── Platform Subscriptions ─────────────────────────── */}
      <section className="border-b border-[#333333]">
        <div className="py-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-[#84c87e]" />
            <h2 className="text-sm font-medium text-white">
              Platform Subscriptions
            </h2>
            <span className="ml-auto text-xs text-[#797775]">{subscriptions.length} records</span>
          </div>

          <div className="border border-[#333333]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead>
                  <tr className="bg-[#2d2d30] text-[#797775] text-xs uppercase tracking-wider">
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Plan</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Status</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Amount</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Start Date</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Next Billing</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Svc Fee</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Max Withdrawals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#797775] italic">
                        No subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((s: any, i: number) => (
                      <tr
                        key={s.id}
                        className={`transition-colors hover:bg-[#252526] ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
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
                            <span className="text-[#797775]">—</span>
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
      </section>

      {/* ── Wallet Transactions ─────────────────────────────── */}
      <section className="border-b border-[#333333]">
        <div className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#569cd6]" />
              <h2 className="text-sm font-medium text-white">
                Wallet Transactions
              </h2>
              <span className="text-xs text-[#797775]">({transactions.length})</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#797775]" />
              <input
                type="text"
                placeholder="Search transactions…"
                value={txSearch}
                onChange={(e) => {
                  setTxSearch(e.target.value);
                  setTxPage(1);
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
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Type</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Description</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Workspace</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Amount</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Status</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {txSlice.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#797775] italic">
                        {txSearch ? "No transactions match your search." : "No transactions found."}
                      </td>
                    </tr>
                  ) : (
                    txSlice.map((t: any, i: number) => {
                      const isCredit = CREDIT_TYPES.has(t.type);
                      return (
                        <tr
                          key={t.id}
                          className={`transition-colors hover:bg-[#252526] ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
                        >
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-6 w-6 flex items-center justify-center ${
                                  isCredit
                                    ? "bg-[#84c87e]/10 text-[#84c87e]"
                                    : "bg-[#f43f5e]/10 text-[#f43f5e]"
                                }`}
                              >
                                {isCredit ? (
                                  <ArrowDownLeft className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <span className="text-[#cccccc] capitalize text-xs">
                                {(t.type || "").replace(/_/g, " ")}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-5 max-w-[200px]">
                            <p className="truncate text-[#cccccc]">
                              {t.description || t.provider_reference || "—"}
                            </p>
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-1.5 text-[#797775] text-xs">
                              <Building2 className="h-3 w-3 shrink-0" />
                              {t.workspaceName}
                            </div>
                          </td>
                          <td className={`py-3 px-5 font-semibold ${isCredit ? "text-[#84c87e]" : "text-[#cccccc]"}`}>
                            {isCredit ? "+" : "−"}
                            {fmtCurrency(parseFloat(t.amount) || 0, t.currency)}
                          </td>
                          <td className="py-3 px-5">
                            <StatusPill status={t.status} />
                          </td>
                          <td className="py-3 px-5 text-[#797775]">
                            {t.created_at
                              ? new Date(t.created_at).toLocaleDateString("en-US")
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
              page={txPage}
              total={filteredTx.length}
              onPrev={() => setTxPage((p) => Math.max(1, p - 1))}
              onNext={() =>
                setTxPage((p) =>
                  Math.min(Math.ceil(filteredTx.length / PAGE_SIZE), p + 1)
                )
              }
            />
          </div>
        </div>
      </section>

      {/* ── Fee Simulations ─────────────────────────────────── */}
      <section>
        <div className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#c586c0]" />
              <h2 className="text-sm font-medium text-white">
                Fee Simulations
              </h2>
              <span className="text-xs text-[#797775]">({feeSimulations.length})</span>
            </div>
            <div className="relative">
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
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Transaction ID</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Decision</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Collection Cost</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Disbursement Cost</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Net Margin</th>
                    <th className="py-2.5 px-5 font-medium border-b border-[#333333]">Date</th>
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
                          className={`transition-colors hover:bg-[#252526] ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111111]"}`}
                        >
                          <td className="py-3 px-5 font-mono text-[#569cd6] text-xs">
                            {String(s.transaction_id || "—").substring(0, 18)}…
                          </td>
                          <td className="py-3 px-5">
                            <StatusPill status={s.decision} />
                          </td>
                          <td className="py-3 px-5 text-[#f43f5e]">
                            {fmtCurrency(parseFloat(s.expected_collection_cost) || 0)}
                          </td>
                          <td className="py-3 px-5 text-[#dcdcaa]">
                            {fmtCurrency(parseFloat(s.expected_disbursement_cost) || 0)}
                          </td>
                          <td
                            className={`py-3 px-5 font-semibold ${
                              margin >= 0 ? "text-[#84c87e]" : "text-[#f43f5e]"
                            }`}
                          >
                            {margin >= 0 ? "+" : ""}
                            {fmtCurrency(margin)}
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
                setSimPage((p) =>
                  Math.min(Math.ceil(filteredSims.length / PAGE_SIZE), p + 1)
                )
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
