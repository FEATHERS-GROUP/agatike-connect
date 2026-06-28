import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceWallet, requestWithdrawal } from "@/api/wallet";
import { getActiveSubscription } from "@/api/billing";
import { getAllPaymentProviderFees } from "@/api/pawapay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/$workspaceSlug/withdrawals/request")({
  component: RequestWithdrawalPage,
});

function RequestWithdrawalPage() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("momo");
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [payoutAccount, setPayoutAccount] = useState("");
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["wallet", activeWorkspace?.id],
    queryFn: () => getWorkspaceWallet({ data: { workspace_id: activeWorkspace!.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: subscription } = useQuery({
    queryKey: ["active-subscription", activeWorkspace?.orgnizer_id],
    queryFn: () =>
      getActiveSubscription({ data: { organizer_id: activeWorkspace!.orgnizer_id } } as any),
    enabled: !!activeWorkspace?.orgnizer_id,
  });

  const { data: providerFees = [] } = useQuery({
    queryKey: ["provider-fees"],
    queryFn: () => getAllPaymentProviderFees(),
  });

  const NETWORKS = [
    { label: "MTN Rwanda", value: "MTN_MOMO_RWA", curr: "RWF", code: "RWA" },
    { label: "Airtel Rwanda", value: "AIRTEL_OAPI_RWA", curr: "RWF", code: "RWA" },
    { label: "MTN Uganda", value: "MTN_MOMO_UGA", curr: "UGX", code: "UGA" },
    { label: "Airtel Uganda", value: "AIRTEL_OAPI_UGA", curr: "UGX", code: "UGA" },
    { label: "Safaricom M-Pesa Kenya", value: "SAFARICOM_M_PESA_KEN", curr: "KES", code: "KEN" },
    { label: "MTN Zambia", value: "MTN_MOMO_ZMB", curr: "ZMW", code: "ZMB" },
    { label: "Airtel Zambia", value: "AIRTEL_OAPI_ZMB", curr: "ZMW", code: "ZMB" },
    { label: "MTN Cameroon", value: "MTN_MOMO_CMR", curr: "XAF", code: "CMR" },
    { label: "MTN Cote d'Ivoire", value: "MTN_MOMO_CIV", curr: "XOF", code: "CIV" },
    { label: "Orange Cote d'Ivoire", value: "ORANGE_CIV", curr: "XOF", code: "CIV" },
    { label: "Airtel DRC", value: "AIRTEL_OAPI_COD", curr: "CDF/USD", code: "COD" },
    { label: "Orange DRC", value: "ORANGE_COD", curr: "CDF/USD", code: "COD" },
    { label: "Vodacom DRC", value: "VODACOM_MPESA_COD", curr: "CDF/USD", code: "COD" },
  ];

  // Calculate live fees
  const amountToWithdraw = Number(withdrawAmount) || 0;
  const platformPercentage = subscription?.pricing_plan?.organizer_platform_contribution;
  const agatikeFee = amountToWithdraw * (platformPercentage / 100);

  let netPercentage = 0;
  let netFixed = 0;
  let countryCode = "RWA";
  if (payoutMethod === "momo" && selectedNetworkId) {
    const netConfig = NETWORKS.find((n) => n.value === selectedNetworkId);
    countryCode = netConfig?.code || "RWA";
    const feeConfig = providerFees.find(
      (f) => f.network === selectedNetworkId && f.country_code === countryCode,
    );
    if (feeConfig) {
      netPercentage = feeConfig.disbursement_percentage || 0;
      netFixed = feeConfig.disbursement_fixed_fee || 0;
    }
  }

  const networkFee = amountToWithdraw * (netPercentage / 100) + netFixed;
  const totalFee = agatikeFee + networkFee;
  const netPayout = amountToWithdraw - totalFee;

  const withdrawMutation = useMutation({
    mutationFn: () =>
      requestWithdrawal({
        data: {
          wallet_id: wallet!.id,
          workspace_id: activeWorkspace!.id,
          organizer_id: activeWorkspace!.orgnizer_id,
          amount: amountToWithdraw,
          payout_method: payoutMethod,
          payout_account: payoutAccount,
          currency: wallet!.currency,
          network_id: selectedNetworkId,
          country_code: countryCode,
        },
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", activeWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", wallet?.id] });
      toast.success("Withdrawal request submitted successfully!");
      navigate({ to: `/dashboard/${activeWorkspace?.slug}/withdrawals` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit withdrawal request.");
    },
  });

  const handleWithdrawRequest = () => {
    if (!withdrawAmount || isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountToWithdraw > (wallet?.amount || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    if (payoutMethod === "momo" && !selectedNetworkId) {
      toast.error("Please select a payout network");
      return;
    }

    if (!payoutAccount) {
      toast.error("Please enter your payout account details");
      return;
    }

    if (netPayout <= 0) {
      toast.error("Withdrawal amount is too low to cover the processing fees.");
      return;
    }

    withdrawMutation.mutate();
  };

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
      return `${safeCurrency} ${amount.toLocaleString()}`;
    }
  };

  if (isWalletLoading) {
    return (
      <div className="p-12 flex justify-center text-primary animate-pulse">
        Loading wallet data...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to={`/dashboard/${activeWorkspace?.slug}/withdrawals`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Request Withdrawal</h1>
          <p className="text-muted-foreground mt-1">Transfer funds to your local account.</p>
        </div>
      </header>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] space-y-8">
        <div className="bg-secondary/50 p-4 rounded-2xl flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">Available to withdraw:</span>
          <span className="font-bold text-primary text-xl">
            {formatCurrency(wallet?.amount || 0, wallet?.currency)}
          </span>
        </div>

        <div className="space-y-6">
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

          {payoutMethod === "momo" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Network</Label>
              <Select value={selectedNetworkId} onValueChange={setSelectedNetworkId}>
                <SelectTrigger className="h-14 rounded-xl">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

        <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Your Plan:</span>
            <span className="font-bold">{subscription?.pricing_plan?.name || "Basic"}</span>
          </div>

          <div className="w-full h-px bg-border/60 my-1" />
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Requested Amount (Subtotal):</span>
            <span className="font-medium text-foreground">
              {formatCurrency(amountToWithdraw, wallet?.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Processing Fee ({platformPercentage + netPercentage}% {netFixed > 0 ? `+ ${netFixed}` : ""}):
            </span>
            <span className="font-medium text-destructive">
              - {formatCurrency(totalFee, wallet?.currency)}
            </span>
          </div>

          <div className="w-full h-px bg-border/60 my-2" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">You Will Receive (Net):</span>
            <span className="font-bold text-green-600 text-2xl">
              {formatCurrency(netPayout > 0 ? netPayout : 0, wallet?.currency)}
            </span>
          </div>
        </div>

        <Button
          className="w-full h-14 rounded-xl shadow-lg text-lg font-bold"
          style={{ background: "var(--gradient-primary)", color: "white" }}
          onClick={handleWithdrawRequest}
          disabled={withdrawMutation.isPending}
        >
          {withdrawMutation.isPending ? "Processing..." : "Submit Request"}
        </Button>
      </div>
    </div>
  );
}
