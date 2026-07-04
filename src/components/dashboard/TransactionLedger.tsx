import { useState, useMemo } from "react";
import {
  History,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TransactionLedgerProps {
  transactions: any[];
  isLoading: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
}

export function TransactionLedger({
  transactions,
  isLoading,
  formatCurrency,
}: TransactionLedgerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const lowerQuery = searchQuery.toLowerCase();
    return transactions.filter(
      (txn) =>
        txn.description?.toLowerCase().includes(lowerQuery) ||
        txn.type?.toLowerCase().includes(lowerQuery) ||
        txn.status?.toLowerCase().includes(lowerQuery) ||
        txn.provider_reference?.toLowerCase().includes(lowerQuery),
    );
  }, [transactions, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Transaction Ledger
        </h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 rounded-full bg-card"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground animate-pulse"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    {searchQuery ? "No transactions match your search." : "No transactions found."}
                  </td>
                </tr>
              ) : (
                currentTransactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            txn.type === "credit" ||
                            txn.type === "deposit" ||
                            txn.type === "event_ticket" ||
                            txn.type === "space_subscription"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {txn.type === "credit" ||
                          txn.type === "deposit" ||
                          txn.type === "event_ticket" ||
                          txn.type === "space_subscription" ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {txn.description ||
                              (txn.type === "credit" || txn.type === "deposit"
                                ? "Income"
                                : "Withdrawal")}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {txn.type?.replace("_", " ")}
                            {(Number(txn.platform_fee || 0) + Number(txn.network_fee || 0)) > 0 ? (
                              <span className="ml-2 font-medium text-[#f97316]">
                                · Processing Fee: {formatCurrency(Number(txn.platform_fee || 0) + Number(txn.network_fee || 0), txn.currency || "RWF")}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(txn.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          txn.status === "completed" || txn.status === "SUCCESS"
                            ? "bg-green-500/10 text-green-500"
                            : txn.status === "pending" || txn.status === "PENDING"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {(txn.status === "completed" || txn.status === "SUCCESS") && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {(txn.status === "pending" || txn.status === "PENDING") && (
                          <Clock className="h-3 w-3" />
                        )}
                        {txn.status}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        txn.type === "credit" ||
                        txn.type === "deposit" ||
                        txn.type === "event_ticket" ||
                        txn.type === "space_subscription"
                          ? "text-green-500"
                          : "text-foreground"
                      }`}
                    >
                      {txn.type === "credit" ||
                      txn.type === "deposit" ||
                      txn.type === "event_ticket" ||
                      txn.type === "space_subscription"
                        ? "+"
                        : "-"}
                      {formatCurrency(txn.amount, txn.currency || "RWF")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredTransactions.length > rowsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-secondary/10">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
