import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getWorkspaceWallet,
  getWalletTransactions,
  updateWalletSupportedNetworks,
} from "@/api/wallet";
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
  Settings,
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
import { Switch } from "@/components/ui/switch";
import { TransactionLedger } from "@/components/dashboard/TransactionLedger";

export const Route = createFileRoute("/dashboard/$workspaceSlug/withdrawals")({
  component: WithdrawalsPage,
});

function WithdrawalsPage() {
  const { activeWorkspace } = useWorkspace();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("momo");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [isNetworksModalOpen, setIsNetworksModalOpen] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const queryClient = useQueryClient();

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

  const updateNetworksMutation = useMutation({
    mutationFn: (networks: string[]) =>
      updateWalletSupportedNetworks({ data: { id: wallet!.id, networks } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", activeWorkspace?.id] });
      toast.success("Supported networks updated!");
    },
    onError: () => toast.error("Failed to update networks"),
  });

  const toggleNetwork = (networkValue: string, checked: boolean) => {
    if (checked) {
      setSelectedNetworks((prev) => [...prev, networkValue]);
    } else {
      setSelectedNetworks((prev) => prev.filter((n) => n !== networkValue));
    }
  };

  const handleSaveNetworks = () => {
    updateNetworksMutation.mutate(selectedNetworks);
    setIsNetworksModalOpen(false);
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

      {/* Accepted Payment Methods Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Supported Payment Networks
          </h3>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setSelectedNetworks(
                Array.isArray(wallet?.supported_networks) ? wallet?.supported_networks : [],
              );
              setIsNetworksModalOpen(true);
            }}
          >
            Configure Networks
          </Button>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted-foreground">
            You currently have{" "}
            <strong>
              {(Array.isArray(wallet?.supported_networks) ? wallet?.supported_networks : []).length}
            </strong>{" "}
            Mobile Money networks enabled for checkout.
          </p>
        </div>
      </div>

      {/* Transactions History */}
      <TransactionLedger
        transactions={transactions}
        isLoading={isTransactionsLoading}
        formatCurrency={formatCurrency}
      />

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

      {/* Networks Configuration Modal */}
      <Dialog open={isNetworksModalOpen} onOpenChange={setIsNetworksModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] rounded-3xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Supported Payment Networks</DialogTitle>
            <DialogDescription>
              Select which Mobile Money networks you want to accept during checkout. Your wallet
              will automatically convert incoming payments to your native currency (
              {wallet?.currency}).
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "MTN Rwanda", value: "MTN_MOMO_RWA", curr: "RWF" },
                { label: "Airtel Rwanda", value: "AIRTEL_OAPI_RWA", curr: "RWF" },
                { label: "MTN Uganda", value: "MTN_MOMO_UGA", curr: "UGX" },
                { label: "Airtel Uganda", value: "AIRTEL_OAPI_UGA", curr: "UGX" },
                { label: "Safaricom M-Pesa Kenya", value: "SAFARICOM_M_PESA_KEN", curr: "KES" },
                { label: "MTN Zambia", value: "MTN_MOMO_ZMB", curr: "ZMW" },
                { label: "Airtel Zambia", value: "AIRTEL_OAPI_ZMB", curr: "ZMW" },
                { label: "MTN Cameroon", value: "MTN_MOMO_CMR", curr: "XAF" },
                { label: "MTN Cote d'Ivoire", value: "MTN_MOMO_CIV", curr: "XOF" },
                { label: "Orange Cote d'Ivoire", value: "ORANGE_CIV", curr: "XOF" },
                { label: "Airtel DRC", value: "AIRTEL_OAPI_COD", curr: "CDF/USD" },
                { label: "Orange DRC", value: "ORANGE_COD", curr: "CDF/USD" },
                { label: "Vodacom DRC", value: "VODACOM_MPESA_COD", curr: "CDF/USD" },
              ].map((network) => {
                const isChecked = selectedNetworks.includes(network.value);
                return (
                  <div
                    key={network.value}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isChecked ? "border-primary bg-primary/5" : "border-border/40 bg-secondary/20"}`}
                  >
                    <div>
                      <Label className="font-semibold">{network.label}</Label>
                      <p className="text-xs text-muted-foreground">Charges in {network.curr}</p>
                    </div>
                    <Switch
                      checked={isChecked}
                      onCheckedChange={(c) => toggleNetwork(network.value, c)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/60">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsNetworksModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full shadow-lg px-8"
              style={{ background: "var(--gradient-primary)", color: "white" }}
              onClick={handleSaveNetworks}
              disabled={updateNetworksMutation.isPending}
            >
              {updateNetworksMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
