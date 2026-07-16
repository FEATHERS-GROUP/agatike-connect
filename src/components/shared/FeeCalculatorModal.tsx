import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { getPricingPlans } from "@/api/billing";
import { getAllPaymentProviderFees } from "@/api/pawapay";

interface FeeCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeeCalculatorModal({ open, onOpenChange }: FeeCalculatorModalProps) {
  const [calcTicketPrice, setCalcTicketPrice] = useState<number>(5000);
  const [calcTicketCount, setCalcTicketCount] = useState<number>(100);
  const [calcPlanId, setCalcPlanId] = useState<string>("");
  const [calcCountry, setCalcCountry] = useState<string>("RWA");
  const [calcNetwork, setCalcNetwork] = useState<string>("");

  const { data: pricingPlans = [] } = useQuery({
    queryKey: ["pricingPlans"],
    queryFn: async () => await getPricingPlans(),
  });

  const { data: providerFees = [] } = useQuery({
    queryKey: ["providerFees"],
    queryFn: async () => await getAllPaymentProviderFees(),
  });

  const selectedPlan = pricingPlans.find((p: any) => p.id === calcPlanId) || pricingPlans[0] || {};
  const availableCountries = Array.from(
    new Set(providerFees.map((f: any) => f.country_code).filter(Boolean)),
  );
  const availableNetworks = providerFees.filter((f: any) => f.country_code === calcCountry);
  const selectedNetwork =
    availableNetworks.find((f: any) => f.network === calcNetwork) || availableNetworks[0] || {};

  useEffect(() => {
    if (pricingPlans.length > 0 && !calcPlanId) {
      setCalcPlanId(pricingPlans[0].id);
    }
  }, [pricingPlans, calcPlanId]);

  useEffect(() => {
    if (
      availableNetworks.length > 0 &&
      (!calcNetwork || !availableNetworks.find((n: any) => n.network === calcNetwork))
    ) {
      setCalcNetwork(availableNetworks[0].network);
    }
  }, [availableNetworks, calcNetwork]);

  const totalTicketSales = calcTicketPrice * calcTicketCount;

  const custServicePct = Number(selectedPlan.customer_service_fee_percentage) || 0;
  const custCollectionPct = Number(selectedPlan.customer_collection_fee_percentage) || 0;
  const custFixed = Number(selectedPlan.customer_collection_fee_fixed) || 0;

  const customerFeePerTicket =
    (calcTicketPrice * (custServicePct + custCollectionPct)) / 100 + custFixed;
  const totalCustomerFee = customerFeePerTicket * calcTicketCount;

  const orgCollectionPct = Number(selectedPlan.organizer_collection_fee_percentage) || 0;
  const orgFixed = Number(selectedPlan.organizer_collection_fee_fixed) || 0;
  const organizerFeePerTicket = (calcTicketPrice * orgCollectionPct) / 100 + orgFixed;
  const totalOrganizerFee = organizerFeePerTicket * calcTicketCount;

  const estimatedWalletBalance = totalTicketSales - totalOrganizerFee;

  const withdrawalFeePct = Number(selectedPlan.withdrawal_fee_percentage) || 0;
  const withdrawalFeeFixed = Number(selectedPlan.withdrawal_fee_fixed) || 0;

  const providerDisbursementPct = Number(selectedNetwork?.disbursement_percentage) || 0;
  const providerDisbursementFee =
    estimatedWalletBalance * (providerDisbursementPct / 100) +
    (Number(selectedNetwork?.disbursement_fixed_fee) || 0);

  const agatikeWithdrawalFee =
    estimatedWalletBalance * (withdrawalFeePct / 100) + withdrawalFeeFixed;
  const finalAmount = estimatedWalletBalance - agatikeWithdrawalFee - providerDisbursementFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Fee Calculator
          </DialogTitle>
          <DialogDescription>
            Estimate your earnings based on your selected plan and payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-700 dark:text-white/80">Ticket Price (RWF)</Label>
            <Input
              type="number"
              value={calcTicketPrice}
              onChange={(e) => setCalcTicketPrice(Number(e.target.value) || 0)}
              className="h-10 rounded-lg bg-gray-50 dark:bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-700 dark:text-white/80">
              Expected Tickets Sold
            </Label>
            <Input
              type="number"
              value={calcTicketCount}
              onChange={(e) => setCalcTicketCount(Number(e.target.value) || 0)}
              className="h-10 rounded-lg bg-gray-50 dark:bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-700 dark:text-white/80">Agatike Plan</Label>
            <Select value={calcPlanId} onValueChange={setCalcPlanId}>
              <SelectTrigger className="h-10 rounded-lg bg-gray-50 dark:bg-white/5">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                {pricingPlans.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-gray-700 dark:text-white/80">Country</Label>
            <Select value={calcCountry} onValueChange={setCalcCountry}>
              <SelectTrigger className="h-10 rounded-lg bg-gray-50 dark:bg-white/5">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {(availableCountries as string[]).map((c: string) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs text-gray-700 dark:text-white/80">
              Expected Payout Network
            </Label>
            <Select value={calcNetwork} onValueChange={setCalcNetwork}>
              <SelectTrigger className="h-10 rounded-lg bg-gray-50 dark:bg-white/5">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                {availableNetworks.map((n: any) => (
                  <SelectItem key={n.network} value={n.network}>
                    {n.network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-3 text-sm border border-gray-200 dark:border-white/10">
          <div className="flex justify-between text-gray-600 dark:text-white/70">
            <span>Total Ticket Sales:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalTicketSales.toLocaleString()} RWF
            </span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-white/70">
            <span>Agatike Organizer Fee:</span>
            <span className="text-red-500 font-medium">
              - {totalOrganizerFee.toLocaleString()} RWF
            </span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-white/70">
            <span>Estimated Wallet Balance:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {estimatedWalletBalance.toLocaleString()} RWF
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-white/50">
            <span>Withdrawal Fee:</span>
            <span>- {(agatikeWithdrawalFee + providerDisbursementFee).toLocaleString()} RWF</span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
          <div className="flex justify-between font-bold text-lg text-primary">
            <span>Final Amount You Receive:</span>
            <span>{finalAmount.toLocaleString()} RWF</span>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-white/40 mt-1 text-right">
            * Note: Customer pays a separate fee of {totalCustomerFee.toLocaleString()} RWF on
            checkout.
          </div>
        </div>

        <div className="mt-2 p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs text-gray-600 dark:text-white/70 leading-relaxed">
          <strong>Pricing Explanation:</strong> Agatike uses transparent transaction pricing.
          Ticket sales fees and payout processing fees are shown clearly before every withdrawal.
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close Calculator</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FloatingFeeCalculator() {
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        onClick={() => setIsFeeModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 px-6 rounded-full shadow-[0_0_20px_rgba(242,87,29,0.3)] hover:shadow-[0_0_25px_rgba(242,87,29,0.5)] transition-all duration-300 flex items-center gap-2 text-white"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Calculator className="w-5 h-5" />
        <span className="font-semibold">Fee Calculator</span>
      </Button>
      <FeeCalculatorModal open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen} />
    </>
  );
}
