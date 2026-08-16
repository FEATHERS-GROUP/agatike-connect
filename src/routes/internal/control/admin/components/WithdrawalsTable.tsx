import * as LucideIcons from "lucide-react";

export function WithdrawalsTable({ paginated, searchQuery, setSelectedTx }: { paginated: any[]; searchQuery: string; setSelectedTx: (tx: any) => void }) {
  return (
    <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
              <thead className="bg-gray-50 dark:bg-[#252526] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref ID</th>
                  <th className="px-4 py-3 font-medium">Organizer</th>
                  <th className="px-4 py-3 font-medium">Payout Details</th>
                  <th className="px-4 py-3 font-medium">Amount Requested</th>
                  <th className="px-4 py-3 font-medium">Net Payout</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500 dark:text-[#888888]"
                    >
                      {searchQuery
                        ? "No withdrawals match your search."
                        : "No withdrawal requests found."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((tx: any) => {
                    const org = tx.organizer || {};
                    const isAdminApproval = tx.raw_callback_data?.requires_admin_approval;
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-gray-500 dark:text-[#888888]" title={tx.id}>
                            {tx.id ? `${tx.id.substring(0, 8)}...` : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333333] border border-gray-300 dark:border-[#444] overflow-hidden shrink-0 flex items-center justify-center">
                              {org.image ? (
                                <img
                                  src={org.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <LucideIcons.Building2 className="w-4 h-4 text-gray-500 dark:text-[#888]" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {org.name || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-[#888888]">
                                {org.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white text-sm font-medium">
                            {tx.payout_method?.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-[#888888] font-mono">
                            {tx.payout_account}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                          {tx.currency} {Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-green-400">
                          {tx.currency} {Number(tx.net_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium uppercase w-fit ${
                                tx.status === "completed"
                                  ? "bg-green-500/10 text-green-500"
                                  : tx.status === "pending"
                                    ? "bg-yellow-500/10 text-yellow-400"
                                    : tx.status === "rejected"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-gray-500/10 text-gray-400"
                              }`}
                            >
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
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-[#888888]">
                          {new Date(tx.created_at).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
                            <span className="text-xs text-gray-500 dark:text-[#555555]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
  );
}
