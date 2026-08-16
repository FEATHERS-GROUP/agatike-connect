import * as LucideIcons from "lucide-react";

export function WalletTable({ paginated, searchQuery, highlightedId }: { paginated: any[]; searchQuery: string; highlightedId?: string | null }) {
  return (
    <table className="w-full text-left text-sm text-gray-700 dark:text-[#cccccc]">
              <thead className="bg-gray-50 dark:bg-[#252526] text-gray-500 dark:text-[#888888] border-b border-gray-200 dark:border-[#333333]">
                <tr>
                  <th className="px-4 py-3 font-medium">Ref ID</th>
                  <th className="px-4 py-3 font-medium">Organizer / Workspace</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500 dark:text-[#888888]"
                    >
                      {searchQuery ? "No wallet transactions match your search." : "No wallet transactions found."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((tx: any) => {
                    const org = tx.organizer || {};
                    const isHighlighted = highlightedId === tx.id;
                      return (
                        <tr
                          key={tx.id}
                          id={`row-${tx.id}`}
                          className={[
                            "transition-colors",
                            isHighlighted
                              ? "bg-[#f97316]/15 ring-2 ring-inset ring-[#f97316]/50 animate-pulse"
                              : "hover:bg-gray-100 dark:hover:bg-[#252526]",
                          ].join(" ")}
                        >
                        <td className="px-4 py-3">
                          <div className="font-mono text-[11px] text-gray-500 dark:text-[#888888]" title={`ID: ${tx.id}\nProvider: ${tx.provider_reference || 'N/A'}`}>
                            {tx.provider_reference || (tx.id ? `${tx.id.substring(0, 8)}...` : "—")}
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
                                {tx.workspaceName || "Unknown Workspace"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white uppercase">
                            {tx.type}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">
                          <div className="flex flex-col gap-0.5">
                            <span>
                              {tx.currency} {Number(tx.amount).toLocaleString()}
                            </span>
                            {tx.amount !== tx.net_amount && (
                              <span className="text-[10px] text-green-500 font-medium">
                                Net: {tx.currency} {Number(tx.net_amount).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                              tx.status === "completed"
                                ? "bg-green-500/10 text-green-500"
                                : tx.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : tx.status === "failed" || tx.status === "rejected"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888888]">
                          {tx.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888888]">
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString("en-GB", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
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
