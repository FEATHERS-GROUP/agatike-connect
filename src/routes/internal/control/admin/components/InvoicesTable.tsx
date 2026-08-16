import * as LucideIcons from "lucide-react";

export function InvoicesTable({ paginated, searchQuery }: { paginated: any[]; searchQuery: string }) {
  return (
    <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
              <thead className="bg-gray-50 dark:bg-[#252526] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref ID</th>
                  <th className="px-4 py-3 font-medium">Organizer</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Next Billing</th>
                  <th className="px-4 py-3 font-medium">Invoice Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500 dark:text-[#888888]"
                    >
                      {searchQuery ? "No invoices match your search." : "No invoices found."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((tx: any) => {
                    const org = tx.organizer || {};
                    const sub = tx.subscription || {};
                    const plan = sub.pricing_plan || {};
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-100 dark:hover:bg-[#252526] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-mono text-[11px] text-gray-500 dark:text-[#888888]" title={tx.id}>
                            {tx.id ? `${tx.id.substring(0, 8)}...` : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
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
                              <div className="font-medium text-gray-900 dark:text-white">
                                {org.name || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-[#888888]">
                                {org.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {plan.name || "Custom Plan"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-[#888888]">
                            Subscription
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">
                          {tx.amount === 0 ? "Free" : `${plan.currency || "USD"} ${tx.amount}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                              tx.status === "paid"
                                ? "bg-green-500/10 text-green-500"
                                : tx.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888888]">
                          {sub.next_billing_date
                            ? new Date(sub.next_billing_date).toLocaleDateString("en-GB", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888888]">
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString("en-GB", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
  );
}
