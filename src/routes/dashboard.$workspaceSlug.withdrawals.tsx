import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceWallet, getWalletTransactions } from "@/api/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  History,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/withdrawals")({
  component: WithdrawalsPage,
});

function WithdrawalsPage() {
  const { activeWorkspace } = useWorkspace();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("momo");
  const [payoutAccount, setPayoutAccount] = useState("");

  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["wallet", activeWorkspace?.id],
    queryFn: () => getWorkspaceWallet({ data: { workspace_id: activeWorkspace!.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["wallet-transactions", wallet?.id],
    queryFn: () => getWalletTransactions({ data: { wallet_id: wallet!.id } } as any),
    enabled: !!wallet?.id,
  });

  const handleWithdrawRequest = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(withdrawAmount) > (wallet?.amount || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    if (!payoutAccount) {
      toast.error("Please enter your payout account details");
      return;
    }

    // Mock API call
    toast.success("Withdrawal request submitted successfully!");
    setIsWithdrawModalOpen(false);
    setWithdrawAmount("");
    setPayoutAccount("");
  };

  if (isWalletLoading) {
    return (
      <div className="p-12 flex justify-center text-primary animate-pulse">
        Loading wallet data...
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = "RWF") => {
    let safeCurrency = (currency || "RWF").toUpperCase();
    if (safeCurrency.includes("DOLLAR")) safeCurrency = "USD";
    else if (safeCurrency.includes("FRANC") || safeCurrency === "FRW") safeCurrency = "RWF";
    else if (safeCurrency.includes("EURO")) safeCurrency = "EUR";

    try {
      return new Intl.NumberFormat("en-RW", { style: "currency", currency: safeCurrency }).format(
        amount,
      );
    } catch (e) {
      // Fallback if the currency code is still invalid
      return `${safeCurrency} ${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Withdrawals</h1>
          <p className="text-muted-foreground mt-1">Manage your earnings and request payouts.</p>
        </div>
      </header>

      {/* Balance Card */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl p-8 md:p-10 text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Wallet className="w-48 h-48 -mt-10 -mr-10" />
        </div>

        <div className="relative z-10">
          <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-2">
            Available Balance
          </p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
            {formatCurrency(wallet?.amount || 0, wallet?.currency)}
          </h2>

          <div className="flex flex-wrap gap-4 items-center">
            <Button
              size="lg"
              className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-8 shadow-lg"
              onClick={() => setIsWithdrawModalOpen(true)}
            >
              <Banknote className="mr-2 h-5 w-5" /> Request Withdrawal
            </Button>

            <div className="flex items-center gap-2 text-white/80 text-sm ml-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Wallet: {wallet?.walletNumber || "Auto-generated"}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Transaction Ledger
          </h3>
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
                {isTransactionsLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-muted-foreground animate-pulse"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                              txn.type === "credit"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {txn.type === "credit" ? (
                              <ArrowDownLeft className="h-5 w-5" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {txn.description || (txn.type === "credit" ? "Income" : "Withdrawal")}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{txn.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(txn.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            txn.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : txn.status === "pending"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {txn.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                          {txn.status === "pending" && <Clock className="h-3 w-3" />}
                          {txn.status}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          txn.type === "credit" ? "text-green-500" : "text-foreground"
                        }`}
                      >
                        {txn.type === "credit" ? "+" : "-"}
                        {formatCurrency(txn.amount, "RWF")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Request Withdrawal</DialogTitle>
            <DialogDescription>
              Transfer funds from your Agatike wallet to your local account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="bg-secondary/50 p-4 rounded-2xl flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">
                Available to withdraw:
              </span>
              <span className="font-bold text-primary">
                {formatCurrency(wallet?.amount || 0, wallet?.currency)}
              </span>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Amount ({wallet?.currency})</Label>
              <Input
                type="number"
                placeholder="0.00"
                className="h-14 text-lg rounded-xl"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Payout Method</Label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger className="h-14 rounded-xl">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="momo">Mobile Money (MTN/Airtel)</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {payoutMethod === "momo" ? "Phone Number" : "Account Number"}
              </Label>
              <Input
                placeholder={payoutMethod === "momo" ? "+250 78X XXX XXX" : "0000 0000 0000"}
                className="h-14 rounded-xl"
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full shadow-lg px-8"
              style={{ background: "var(--gradient-primary)", color: "white" }}
              onClick={handleWithdrawRequest}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
