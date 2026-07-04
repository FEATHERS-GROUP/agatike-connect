import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getWorkspaceWallet,
  requestWithdrawal,
  sendWithdrawalOtp,
  getExchangeRate,
} from "@/api/wallet";
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
  const ADMIN_APPROVAL_THRESHOLD = 150000;
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("RWA");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("momo");
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [payoutAccount, setPayoutAccount] = useState("");

  // Security State
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

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

  const COUNTRY_NAMES: Record<string, string> = {
    RWA: "Rwanda",
    UGA: "Uganda",
    KEN: "Kenya",
    ZMB: "Zambia",
    CMR: "Cameroon",
    CIV: "Cote d'Ivoire",
    COD: "DR Congo",
    COG: "Republic of Congo",
    ETH: "Ethiopia",
    GAB: "Gabon",
    GHA: "Ghana",
    MWI: "Malawi",
    NGA: "Nigeria",
    SEN: "Senegal",
    SLE: "Sierra Leone",
    TZA: "Tanzania",
    BEN: "Benin",
    BFA: "Burkina Faso",
    LSO: "Lesotho",
  };

  const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    RWA: "RWF",
    UGA: "UGX",
    KEN: "KES",
    ZMB: "ZMW",
    CMR: "XAF",
    CIV: "XOF",
    COD: "CDF",
    COG: "XAF",
    ETH: "ETB",
    GAB: "XAF",
    GHA: "GHS",
    MWI: "MWK",
    NGA: "NGN",
    SEN: "XOF",
    SLE: "SLL",
    TZA: "TZS",
    BEN: "XOF",
    BFA: "XOF",
    LSO: "LSL",
  };

  const NETWORKS: any[] = Array.from(
    new Map(
      providerFees
        .filter((f: any) => f.network !== "CARD" && f.network !== "PAYPAL")
        .map((f: any) => [
          `${f.network}-${f.country_code}`,
          {
            label:
              `${f.network.replace(/_/g, " ").replace("MOMO", "MoMo").replace("OAPI", "")} (${COUNTRY_NAMES[f.country_code] || f.country_code})`.replace(
                /\s+/g,
                " ",
              ),
            value: `${f.network}-${f.country_code}`,
            actualNetwork: f.network,
            code: f.country_code,
          },
        ]),
    ).values(),
  ).sort((a: any, b: any) => a.label.localeCompare(b.label));

  const COUNTRIES = Array.from(new Set(providerFees.map((f: any) => f.country_code)))
    .filter(Boolean)
    .sort() as string[];
  const FILTERED_NETWORKS = NETWORKS.filter((n) => n.code === selectedCountry);

  const amountToWithdraw = Number(withdrawAmount) || 0;
  const platformPercentage = subscription?.pricing_plan?.organizer_platform_contribution || 0;
  const platformFixed = subscription?.pricing_plan?.withdrawal_fee_fixed || 0;
  const agatikeFee = amountToWithdraw * (platformPercentage / 100) + platformFixed;

  let netPercentage = 0;
  let netFixed = 0;
  let countryCode = "RWA";
  let actualNetworkId = selectedNetworkId;
  if (payoutMethod === "momo" && selectedNetworkId) {
    const netConfig = NETWORKS.find((n: any) => n.value === selectedNetworkId);
    countryCode = netConfig?.code || "RWA";
    actualNetworkId = netConfig?.actualNetwork || selectedNetworkId;

    const feeConfig = providerFees.find(
      (f: any) => f.network === actualNetworkId && f.country_code === countryCode,
    );
    if (feeConfig) {
      if (feeConfig.is_tiered && feeConfig.tiered_rules) {
        let rules = feeConfig.tiered_rules;
        try {
          if (typeof rules === "string") rules = JSON.parse(rules);
          if (typeof rules === "string") rules = JSON.parse(rules); // handle double-stringified JSON
        } catch (e) {
          console.error("Failed to parse tiered rules", e);
        }

        if (rules && rules.disbursement && Array.isArray(rules.disbursement)) {
          const matchedRule =
            rules.disbursement.find((r: any) => amountToWithdraw <= r.max) ||
            rules.disbursement[rules.disbursement.length - 1];
          if (matchedRule) {
            netPercentage = matchedRule.pct || 0;
            netFixed = matchedRule.fixed || 0;
          }
        }
      } else {
        netPercentage = feeConfig.disbursement_percentage || 0;
        netFixed = feeConfig.disbursement_fixed_fee || 0;
      }
    }
  }

  const networkFee = amountToWithdraw * (netPercentage / 100) + netFixed;
  const totalFee = agatikeFee + networkFee;
  const netPayout = amountToWithdraw - totalFee;

  const targetCurrency = COUNTRY_CURRENCY_MAP[countryCode] || wallet?.currency || "RWF";

  const { data: exchangeRate, isLoading: isExchangeLoading } = useQuery({
    queryKey: ["exchange-rate", wallet?.currency, targetCurrency],
    queryFn: () =>
      getExchangeRate({
        data: { base_currency: wallet?.currency || "RWF", target_currency: targetCurrency },
      } as any),
    enabled: !!wallet?.currency && !!targetCurrency && wallet.currency !== targetCurrency,
  });

  const rate = exchangeRate || 1;
  const convertedAmount = amountToWithdraw * rate;
  const convertedFee = totalFee * rate;
  const convertedNetPayout = netPayout * rate;

  const showExchange = isExchangeLoading || rate !== 1;

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
          network_id: actualNetworkId,
          country_code: countryCode,
          target_currency: targetCurrency,
          exchange_rate: rate,
          converted_amount: convertedAmount,
          converted_net_payout: convertedNetPayout,
          otpToken,
          otp,
          password,
        },
      } as any),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["wallet", activeWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", wallet?.id] });
      
      setStep(5);

      setTimeout(() => {
        navigate({
          to: "/dashboard/$workspaceSlug/withdrawals",
          params: { workspaceSlug: activeWorkspace?.slug || "" },
        });
      }, 4000);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit withdrawal request.");
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: () =>
      sendWithdrawalOtp({
        data: { organizer_id: activeWorkspace!.orgnizer_id },
      } as any),
    onSuccess: (res: any) => {
      setOtpToken(res.token);
      setStep(4);
      toast.success("Security code sent to your email!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send OTP.");
    },
  });

  const handleInitiateWithdrawal = () => {
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

    // Large amounts go straight to admin queue — no OTP needed
    if (amountToWithdraw > ADMIN_APPROVAL_THRESHOLD) {
      withdrawMutation.mutate();
      return;
    }

    sendOtpMutation.mutate();
  };

  const handleConfirmWithdrawal = () => {
    if (!otp || otp.length !== 8) {
      toast.error("Please enter the valid 8-character OTP");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
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
          <Link
            to="/dashboard/$workspaceSlug/withdrawals"
            params={{ workspaceSlug: activeWorkspace?.slug || "" }}
          >
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
          {/* STEP 1: Country & Network */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Payout Method *</Label>
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
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Country *</Label>
                    <Select
                      value={selectedCountry}
                      onValueChange={(val) => {
                        setSelectedCountry(val);
                        setSelectedNetworkId("");
                      }}
                    >
                      <SelectTrigger className="h-14 rounded-xl">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-60">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {COUNTRY_NAMES[c] || c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Network *</Label>
                    <Select value={selectedNetworkId} onValueChange={setSelectedNetworkId}>
                      <SelectTrigger className="h-14 rounded-xl">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {FILTERED_NETWORKS.map((n: any) => (
                          <SelectItem key={n.value} value={n.value}>
                            {n.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg mt-6"
                disabled={payoutMethod === "momo" && !selectedNetworkId}
                onClick={() => setStep(2)}
              >
                Next Step
              </Button>
            </div>
          )}

          {/* STEP 2: Amount */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Amount ({wallet?.currency}) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-14 text-lg rounded-xl"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-1/3 h-14 rounded-xl text-lg"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="w-2/3 h-14 rounded-xl text-lg"
                  disabled={
                    !withdrawAmount ||
                    Number(withdrawAmount) <= 0 ||
                    Number(withdrawAmount) > (wallet?.amount || 0)
                  }
                  onClick={() => setStep(3)}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payout Account & Summary */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  {payoutMethod === "momo" ? "Phone Number" : "Account Number"} *
                </Label>
                <Input
                  placeholder={payoutMethod === "momo" ? "+250 78X XXX XXX" : "0000 0000 0000"}
                  className="h-14 rounded-xl"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                />
              </div>

              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Your Plan:</span>
                  <span className="font-bold">{subscription?.pricing_plan?.name || "Basic"}</span>
                </div>

                <div className="w-full h-px bg-border/60 my-1" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Requested Amount (Subtotal):</span>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-foreground">
                      {showExchange
                        ? isExchangeLoading
                          ? "..."
                          : formatCurrency(convertedAmount, targetCurrency)
                        : formatCurrency(amountToWithdraw, wallet?.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Processing Fee (
                    {[
                      platformPercentage + netPercentage > 0
                        ? `${platformPercentage + netPercentage}%`
                        : null,
                      (platformFixed + netFixed) > 0
                        ? showExchange && !isExchangeLoading
                          ? formatCurrency((platformFixed + netFixed) * rate, targetCurrency)
                          : formatCurrency((platformFixed + netFixed), wallet?.currency)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" + ")}
                    ):
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-destructive">
                      -{" "}
                      {showExchange
                        ? isExchangeLoading
                          ? "..."
                          : formatCurrency(convertedFee, targetCurrency)
                        : formatCurrency(totalFee, wallet?.currency)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-border/60 my-1" />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>You Will Receive (Net):</span>
                  <div className="flex flex-col items-end">
                    <span className="text-primary">
                      {showExchange
                        ? isExchangeLoading
                          ? "..."
                          : formatCurrency(convertedNetPayout, targetCurrency)
                        : formatCurrency(netPayout, wallet?.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-1/3 h-14 rounded-xl text-lg"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="w-2/3 h-14 rounded-xl text-lg"
                  disabled={sendOtpMutation.isPending || withdrawMutation.isPending || !payoutAccount || netPayout <= 0}
                  onClick={handleInitiateWithdrawal}
                >
                  {sendOtpMutation.isPending || withdrawMutation.isPending
                    ? "Processing..."
                    : amountToWithdraw > ADMIN_APPROVAL_THRESHOLD
                    ? "Submit for Admin Approval"
                    : "Confirm Request"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Security Verification */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 text-center space-y-2">
                <h3 className="font-bold text-lg">Security Verification</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit One-Time Password (OTP) via SMS to your registered phone number. Please
                  enter it below along with your account password to authorize this payout.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">8-Character Security Code</Label>
                <Input
                  placeholder="e.g. A1B2C3D4"
                  className="h-14 rounded-xl font-mono text-center text-lg tracking-widest uppercase"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Account Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="h-14 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-1/3 h-14 rounded-xl text-lg"
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="w-2/3 h-14 rounded-xl text-lg"
                  disabled={withdrawMutation.isPending || otp.length !== 8 || !password}
                  onClick={handleConfirmWithdrawal}
                >
                  {withdrawMutation.isPending ? "Authorizing..." : "Submit Withdrawal"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Success / Processing Status */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500 py-12">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="h-12 w-12 animate-pulse" />
              </div>
              <h3 className="font-bold text-2xl">
                {amountToWithdraw > ADMIN_APPROVAL_THRESHOLD
                  ? "Request Submitted"
                  : "Transfer in Progress!"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {amountToWithdraw > ADMIN_APPROVAL_THRESHOLD
                  ? "Your withdrawal request is pending admin approval. We will notify you once it is processed."
                  : "Your funds are on their way to your mobile money account! If the transfer fails for any reason, the funds will be automatically refunded to your wallet."}
              </p>
              <div className="pt-6">
                <p className="text-sm text-primary font-medium animate-pulse">
                  Redirecting to your wallet...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
