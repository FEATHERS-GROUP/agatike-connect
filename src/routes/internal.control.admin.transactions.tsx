import { createFileRoute } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { getAllPlatformTransactions } from "@/api/admin_organizer_control";

export const Route = createFileRoute("/internal/control/admin/transactions")({
  loader: () => getAllPlatformTransactions(),
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredTransactions = transactions.filter((tx: any) => {
    const orgName = tx.organizer?.name || "";
    const orgEmail = tx.organizer?.email || "";
    const planName = tx.subscription?.pricing_plan?.name || "";
    const search = searchQuery.toLowerCase();
    
    return (
      orgName.toLowerCase().includes(search) ||
      orgEmail.toLowerCase().includes(search) ||
      planName.toLowerCase().includes(search) ||
      tx.status.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalRevenue = transactions
    .filter((tx: any) => tx.status === "paid")
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || "0"), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            Platform Transactions
            <LucideIcons.CreditCard className="w-6 h-6 text-[#f97316]" />
          </h1>
          <p className="text-[#888888] mt-1 text-sm">
            View all subscription invoices across all platform organizers.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input 
              type="text"
              placeholder="Search organizers, plans, status..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] placeholder:text-[#666666]"
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#252526] hover:bg-[#2d2d30] border border-[#333333] rounded-lg text-sm font-medium text-white transition-colors w-full sm:w-auto shrink-0"
          >
            <LucideIcons.Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <LucideIcons.DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="text-sm text-[#888888]">Total Revenue (Paid)</div>
            <div className="text-xl font-semibold text-white">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0">
            <LucideIcons.FileText className="w-6 h-6 text-[#f97316]" />
          </div>
          <div>
            <div className="text-sm text-[#888888]">Total Invoices</div>
            <div className="text-xl font-semibold text-white">{transactions.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cccccc]">
            <thead className="bg-[#252526] text-[#888888] border-b border-[#333333]">
              <tr>
                <th className="px-6 py-4 font-medium">Organizer</th>
                <th className="px-6 py-4 font-medium">Plan Details</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Next Billing</th>
                <th className="px-6 py-4 font-medium">Invoice Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#888888]">
                    No transactions found. {searchQuery && "Try a different search query."}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx: any) => {
                  const org = tx.organizer || {};
                  const sub = tx.subscription || {};
                  const plan = sub.pricing_plan || {};
                  const currency = plan.currency || "USD";
                  
                  return (
                    <tr key={tx.id} className="hover:bg-[#252526] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#333333] overflow-hidden shrink-0 border border-[#444444] flex items-center justify-center">
                            {org.image ? (
                              <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
                            ) : (
                              <LucideIcons.Building2 className="w-4 h-4 text-[#888888]" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{org.name || "Unknown"}</div>
                            <div className="text-xs text-[#888888]">{org.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{plan.name || "Custom Plan"}</div>
                        <div className="text-xs text-[#888888] mt-0.5">Subscription</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-white">
                        {tx.amount === 0 ? "Free" : `${currency} ${tx.amount}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                          tx.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#aaaaaa]">
                        {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#aaaaaa]">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        }) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-[#888888]">
            Showing <span className="font-medium text-white">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-white">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)}
            </span>{" "}
            of <span className="font-medium text-white">{filteredTransactions.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#aaaaaa] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#1b1b1c] border border-[#333333] text-[#aaaaaa] hover:text-white disabled:opacity-50 transition-colors"
            >
              <LucideIcons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
