import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { getAllPlatformTransactions, getAdminWithdrawals, sendAdminWithdrawalOtp, approveAdminPayout, rejectAdminPayout } from "@/api/admin_organizer_control";

export const Route = createFileRoute("/internal/control/admin/transactions")({
  loader: async () => {
    const [invoices, withdrawals] = await Promise.all([
      getAllPlatformTransactions(),
      getAdminWithdrawals(),
    ]);
    return { invoices, withdrawals };
  },
  component: TransactionsPage,
});

// ─── Approval Modal ────────────────────────────────────────────────────────────
function ApprovalModal({
  tx,
  onClose,
  onDone,
}: {
  tx: any;
  onClose: () => void;
  onDone: () => void;
}) {
  const [calledCheck, setCalledCheck] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const sendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await sendAdminWithdrawalOtp({ data: { transactionId: tx.id } } as any);
      setOtpToken(res.token);
      setSentToEmail(res.email || "");
      setOtpSent(true);
    } catch (err: any) {
      alert(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleApprove = async () => {
    if (!otp || otp.length < 6) {
      alert("Please enter the full OTP code");
      return;
    }
    setIsApproving(true);
    try {
      await approveAdminPayout({ data: { transactionId: tx.id, otpToken, otp, overrideNetworkId } } as any);
      alert("Payout approved and submitted to PawaPay successfully!");
      onDone();
    } catch (err: any) {
      alert(err.message || "Failed to approve payout");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setIsRejecting(true);
    try {
      await rejectAdminPayout({ data: { transactionId: tx.id, reason } } as any);
      alert("Withdrawal rejected. Organizer's wallet has been refunded.");
      onDone();
    } catch (err: any) {
      alert(err.message || "Failed to reject payout");
    } finally {
      setIsRejecting(false);
    }
  };

  const org = tx.organizer || {};
  const currency = tx.currency || "RWF";
  const formatAmount = (n: number) => `${currency} ${Number(n).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111111] border border-[#333333] rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-5 border-b border-[#333333] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <LucideIcons.ShieldCheck className="w-5 h-5 text-[#f97316]" />
            Review Withdrawal Request
          </h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white transition-colors">
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#333333] border border-[#444444] flex items-center justify-center overflow-hidden shrink-0">
                {org.image ? (
                  <img src={org.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <LucideIcons.Building2 className="w-5 h-5 text-[#888888]" />
                )}
              </div>
              <div>
                <div className="font-medium text-white">{org.name || "Unknown Organizer"}</div>
                <div className="text-xs text-[#888888]">{org.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="bg-[#111111] border border-[#333333] rounded-lg p-3">
                <div className="text-[#888888] mb-1">Requested Amount</div>
                <div className="text-xl font-bold text-white font-mono">{formatAmount(tx.amount)}</div>
              </div>
              <div className="bg-[#111111] border border-[#333333] rounded-lg p-3">
                <div className="text-[#888888] mb-1">Net Payout</div>
                <div className="text-xl font-bold text-green-400 font-mono">{formatAmount(tx.net_amount)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs mb-3 border-t border-[#333333] pt-3">
              <div>
                <span className="text-[#888888]">Agatike Fee (Platform)</span>
                <div className="font-mono text-white mt-1">{formatAmount(tx.platform_fee || 0)}</div>
              </div>
              <div>
                <span className="text-[#888888]">PawaPay Fee (Network)</span>
                <div className="font-mono text-white mt-1">{formatAmount(tx.network_fee || 0)}</div>
              </div>
            </div>

            <div className="mb-3 border-t border-[#333333] pt-3">
              <label className="text-xs text-[#888888] block mb-1">Target Payment Network</label>
              <select
                value={overrideNetworkId}
                onChange={(e) => setOverrideNetworkId(e.target.value)}
                className="w-full bg-[#111111] border border-[#444444] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#f97316]"
              >
                <option value="">-- Verify & Select Network --</option>
                <option value="MTN_MOMO_RWA">MTN Rwanda (MTN_MOMO_RWA)</option>
                <option value="AIRTEL_OAPI_RWA">Airtel Rwanda (AIRTEL_OAPI_RWA)</option>
                <option value="MTN_MOMO_UGA">MTN Uganda (MTN_MOMO_UGA)</option>
                <option value="AIRTEL_OAPI_UGA">Airtel Uganda (AIRTEL_OAPI_UGA)</option>
                <option value="SAFARICOM_M_PESA_KEN">Safaricom M-Pesa Kenya (SAFARICOM_M_PESA_KEN)</option>
                <option value="MTN_MOMO_ZMB">MTN Zambia (MTN_MOMO_ZMB)</option>
                <option value="AIRTEL_OAPI_ZMB">Airtel Zambia (AIRTEL_OAPI_ZMB)</option>
                <option value="MTN_MOMO_CMR">MTN Cameroon (MTN_MOMO_CMR)</option>
                <option value="MTN_MOMO_CIV">MTN Cote d'Ivoire (MTN_MOMO_CIV)</option>
                <option value="ORANGE_CIV">Orange Cote d'Ivoire (ORANGE_CIV)</option>
                <option value="AIRTEL_OAPI_COD">Airtel DRC (AIRTEL_OAPI_COD)</option>
                <option value="ORANGE_COD">Orange DRC (ORANGE_COD)</option>
                <option value="VODACOM_MPESA_COD">Vodacom DRC (VODACOM_MPESA_COD)</option>
              </select>
            </div>

            <div className="text-xs text-[#888888] grid grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="text-[#666]">Method:</span> <span className="text-[#cccccc]">{tx.payout_method?.toUpperCase()}</span></div>
              <div><span className="text-[#666]">Account:</span> <span className="text-[#cccccc] font-mono">{tx.payout_account}</span></div>
              <div><span className="text-[#666]">Phone:</span> <span className="text-[#cccccc]">{org.phone || "N/A"}</span></div>
              <div><span className="text-[#666]">Date:</span> <span className="text-[#cccccc]">{new Date(tx.created_at).toLocaleDateString("en-GB")}</span></div>
            </div>
          </div>

          {/* Step 1: Verification Checklist */}
          <div className={`rounded-xl p-4 border transition-colors ${calledCheck ? "bg-green-500/5 border-green-500/20" : "bg-[#1b1b1c] border-[#333333]"}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={calledCheck}
                onChange={(e) => setCalledCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#f97316] shrink-0"
              />
              <span className="text-sm text-[#cccccc]">
                I have called {org.name ? <span className="text-white font-medium">{org.name}</span> : "the organizer"} (<span className="text-white font-mono">{org.phone || org.email || "N/A"}</span>) and verified their identity and the withdrawal details.
              </span>
            </label>
          </div>

          {/* Step 2: Send OTP */}
          {calledCheck && !otpSent && (
            <div className="animate-in fade-in duration-300">
              <button
                onClick={sendOtp}
                disabled={isSendingOtp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LucideIcons.MessageSquare className="w-4 h-4" />
                )}
                {isSendingOtp ? "Sending OTP..." : "Send OTP to Organizer"}
              </button>
            </div>
          )}

          {/* Step 3: Enter OTP */}
          {otpSent && (
            <div className="space-y-3 animate-in fade-in duration-300">
              {sentToEmail ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
                  ✓ OTP sent to <strong>{sentToEmail}</strong>. Ask the organizer to check their email and read the code to you.
                </div>
              ) : null}
              <div>
                <label className="block text-xs font-medium text-[#888888] mb-2">Enter OTP from Organizer</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#252526] border border-[#444444] rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest text-white focus:outline-none focus:border-[#f97316]"
                />
              </div>
              <button
                onClick={handleApprove}
                disabled={isApproving || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isApproving ? (
                  <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LucideIcons.CheckCircle className="w-4 h-4" />
                )}
                {isApproving ? "Approving & Sending..." : "Approve Payout"}
              </button>
            </div>
          )}

          {/* Reject Section */}
          <div className="border-t border-[#333333] pt-4">
            {!showRejectInput ? (
              <button
                onClick={() => setShowRejectInput(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors"
              >
                <LucideIcons.XCircle className="w-4 h-4" />
                Reject This Request
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-200">
                <label className="block text-xs font-medium text-[#888888]">Rejection Reason (required)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Could not verify identity, suspicious activity..."
                  rows={3}
                  className="w-full bg-[#252526] border border-[#444444] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#444444] text-[#888888] hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || !reason.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isRejecting ? <LucideIcons.Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isRejecting ? "Rejecting..." : "Confirm Reject & Refund"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function TransactionsPage() {
  const { invoices, withdrawals } = Route.useLoaderData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"invoices" | "withdrawals">("withdrawals");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const ITEMS_PER_PAGE = 12;

  const pendingCount = (withdrawals as any[]).filter((w) => w.status === "pending").length;

  // Invoices tab
  const filteredInvoices = (invoices as any[]).filter((tx) => {
    const search = searchQuery.toLowerCase();
    return (
      (tx.organizer?.name || "").toLowerCase().includes(search) ||
      (tx.organizer?.email || "").toLowerCase().includes(search) ||
      (tx.subscription?.pricing_plan?.name || "").toLowerCase().includes(search) ||
      tx.status.toLowerCase().includes(search)
    );
  });

  // Withdrawals tab
  const filteredWithdrawals = (withdrawals as any[]).filter((tx) => {
    const search = searchQuery.toLowerCase();
    return (
      (tx.organizer?.name || "").toLowerCase().includes(search) ||
      (tx.organizer?.email || "").toLowerCase().includes(search) ||
      tx.status.toLowerCase().includes(search) ||
      (tx.payout_account || "").toLowerCase().includes(search)
    );
  });

  const activeList = activeTab === "invoices" ? filteredInvoices : filteredWithdrawals;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = activeList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalRevenue = (invoices as any[])
    .filter((tx) => tx.status === "paid")
    .reduce((s, tx) => s + parseFloat(tx.amount || "0"), 0);

  const totalWithdrawals = (withdrawals as any[])
    .filter((tx) => tx.status === "completed")
    .reduce((s, tx) => s + parseFloat(tx.amount || "0"), 0);

  const handleTabChange = (tab: "invoices" | "withdrawals") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selectedTx && (
        <ApprovalModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDone={() => {
            setSelectedTx(null);
            router.invalidate();
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            Platform Transactions
            <LucideIcons.BarChart3 className="w-6 h-6 text-[#f97316]" />
          </h1>
          <p className="text-[#888888] mt-1 text-sm">
            Manage subscription invoices and organizer withdrawal requests.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] placeholder:text-[#666666]"
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <LucideIcons.DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="text-xs text-[#888888]">Subscription Revenue</div>
            <div className="text-lg font-semibold text-white font-mono">${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <LucideIcons.ArrowUpRight className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-[#888888]">Total Paid Out</div>
            <div className="text-lg font-semibold text-white font-mono">RWF {totalWithdrawals.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${pendingCount > 0 ? "bg-yellow-500/10" : "bg-[#333333]"}`}>
            <LucideIcons.Clock className={`w-5 h-5 ${pendingCount > 0 ? "text-yellow-400" : "text-[#888888]"}`} />
          </div>
          <div>
            <div className="text-xs text-[#888888]">Pending Withdrawals</div>
            <div className={`text-lg font-semibold font-mono ${pendingCount > 0 ? "text-yellow-400" : "text-white"}`}>{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333333]">
        <button
          onClick={() => handleTabChange("withdrawals")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "withdrawals" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-[#888888] hover:text-white"}`}
        >
          <LucideIcons.ArrowUpRight className="w-4 h-4" />
          Withdrawal Requests
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-bold">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => handleTabChange("invoices")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "invoices" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-[#888888] hover:text-white"}`}
        >
          <LucideIcons.FileText className="w-4 h-4" />
          Subscription Invoices
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "withdrawals" ? (
            <table className="w-full text-left text-sm text-[#cccccc]">
              <thead className="bg-[#252526] text-[#888888] border-b border-[#333333]">
                <tr>
                  <th className="px-6 py-4 font-medium">Organizer</th>
                  <th className="px-6 py-4 font-medium">Payout Details</th>
                  <th className="px-6 py-4 font-medium">Amount Requested</th>
                  <th className="px-6 py-4 font-medium">Net Payout</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#888888]">
                      {searchQuery ? "No withdrawals match your search." : "No withdrawal requests found."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((tx: any) => {
                    const org = tx.organizer || {};
                    const isAdminApproval = tx.raw_callback_data?.requires_admin_approval;
                    return (
                      <tr key={tx.id} className="hover:bg-[#252526] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#333333] border border-[#444] overflow-hidden shrink-0 flex items-center justify-center">
                              {org.image ? <img src={org.image} alt="" className="w-full h-full object-cover" /> : <LucideIcons.Building2 className="w-4 h-4 text-[#888]" />}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{org.name || "Unknown"}</div>
                              <div className="text-xs text-[#888888]">{org.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white text-sm font-medium">{tx.payout_method?.toUpperCase()}</div>
                          <div className="text-xs text-[#888888] font-mono">{tx.payout_account}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-white">
                          {tx.currency} {Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-green-400">
                          {tx.currency} {Number(tx.net_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase w-fit ${
                              tx.status === "completed" ? "bg-green-500/10 text-green-500" :
                              tx.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                              tx.status === "rejected" ? "bg-red-500/10 text-red-500" :
                              "bg-gray-500/10 text-gray-400"
                            }`}>
                              {tx.status}
                            </span>
                            {isAdminApproval && tx.status === "pending" && (
                              <span className="text-[10px] text-orange-400 flex items-center gap-1">
                                <LucideIcons.AlertCircle className="w-3 h-3" />
                                Admin approval needed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#888888]">
                          {new Date(tx.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {tx.status === "pending" ? (
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="px-3 py-1.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ml-auto"
                            >
                              <LucideIcons.ShieldCheck className="w-3 h-3" />
                              Review
                            </button>
                          ) : (
                            <span className="text-xs text-[#555555]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-[#cccccc]">
              <thead className="bg-[#252526] text-[#888888] border-b border-[#333333]">
                <tr>
                  <th className="px-6 py-4 font-medium">Organizer</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Next Billing</th>
                  <th className="px-6 py-4 font-medium">Invoice Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#888888]">
                      {searchQuery ? "No invoices match your search." : "No invoices found."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((tx: any) => {
                    const org = tx.organizer || {};
                    const sub = tx.subscription || {};
                    const plan = sub.pricing_plan || {};
                    return (
                      <tr key={tx.id} className="hover:bg-[#252526] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#333333] border border-[#444] overflow-hidden shrink-0 flex items-center justify-center">
                              {org.image ? <img src={org.image} alt="" className="w-full h-full object-cover" /> : <LucideIcons.Building2 className="w-4 h-4 text-[#888]" />}
                            </div>
                            <div>
                              <div className="font-medium text-white">{org.name || "Unknown"}</div>
                              <div className="text-xs text-[#888888]">{org.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{plan.name || "Custom Plan"}</div>
                          <div className="text-xs text-[#888888]">Subscription</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-white">
                          {tx.amount === 0 ? "Free" : `${plan.currency || "USD"} ${tx.amount}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                            tx.status === "paid" ? "bg-green-500/10 text-green-500" :
                            tx.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-red-500/10 text-red-500"
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#888888]">
                          {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#888888]">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-[#888888]">
            Showing <span className="font-medium text-white">{startIndex + 1}</span>–
            <span className="font-medium text-white">{Math.min(startIndex + ITEMS_PER_PAGE, activeList.length)}</span> of{" "}
            <span className="font-medium text-white">{activeList.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-40 transition-colors"
            >
              <LucideIcons.ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#aaaaaa] px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-40 transition-colors"
            >
              <LucideIcons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
