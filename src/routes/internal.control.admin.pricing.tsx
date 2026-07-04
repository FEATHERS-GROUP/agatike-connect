import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPricingPlansAdmin, updatePricingPlanAdmin, getPaymentProviderFeesAdmin } from "@/api/admin_finance";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Edit2, Save, X, Calculator, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/pricing")({
  component: AdminPricingPage,
});

function AdminPricingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"plans" | "sim-collections" | "sim-withdrawals">("plans");
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Simulator State
  const [simAmount, setSimAmount] = useState<number>(5000);
  const [simPlanId, setSimPlanId] = useState<string>("");
  const [simProviderId, setSimProviderId] = useState<string>("");

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["admin-pricing-plans"],
    queryFn: () => getPricingPlansAdmin(),
  });

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["admin-provider-fees"],
    queryFn: () => getPaymentProviderFeesAdmin(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Record<string, any> }) => updatePricingPlanAdmin({ data }),
    onSuccess: () => {
      toast.success("Pricing plan updated");
      queryClient.invalidateQueries({ queryKey: ["admin-pricing-plans"] });
      setEditingRow(null);
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const handleEdit = (plan: any) => {
    setEditingRow(plan.id);
    setEditForm({ ...plan });
  };

  const handleSave = () => {
    if (!editingRow) return;
    const updates = { ...editForm };
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;
    
    const numericFields = [
      'price', 'yearly_price', 'customer_service_fee_percentage', 'organizer_platform_contribution',
      'platform_margin_buffer', 'customer_collection_fee_percentage', 'customer_collection_fee_fixed',
      'organizer_collection_fee_percentage', 'organizer_collection_fee_fixed', 'withdrawal_fee_percentage',
      'withdrawal_fee_fixed', 'max_collection_subsidy_percentage'
    ];
    for (const field of numericFields) {
      if (updates[field] !== undefined && updates[field] !== null) {
        updates[field] = Number(updates[field]);
      }
    }
    
    updateMutation.mutate({ id: editingRow, updates });
  };

  // Simulator Calcs
  const selectedPlan = useMemo(() => plans.find((p: any) => p.id === simPlanId) || plans[0], [plans, simPlanId]);
  const selectedProvider = useMemo(() => providers.find((p: any) => p.id === simProviderId) || providers[0], [providers, simProviderId]);

  const runCollectionSim = () => {
    if (!selectedPlan || !selectedProvider) return null;
    const amount = simAmount;
    
    // Customer Fee = percentage + fixed
    const customerPct = Number(selectedPlan.customer_collection_fee_percentage || selectedPlan.customer_service_fee_percentage || 0);
    const customerFixed = Number(selectedPlan.customer_collection_fee_fixed || 0);
    const customerFee = (amount * (customerPct / 100)) + customerFixed;

    // Organizer Fee (using organizer_platform_contribution)
    const orgPct = Number(selectedPlan.organizer_platform_contribution || 0);
    const orgFee = amount * (orgPct / 100);

    // Provider Cost
    const provPct = Number(selectedProvider.collection_percentage || 0);
    const provFixed = Number(selectedProvider.collection_fixed_fee || 0);
    const providerCost = (amount * (provPct / 100)) + provFixed;

    const platformRevenue = customerFee + orgFee;
    const netProfit = platformRevenue - providerCost;

    return { customerFee, orgFee, providerCost, platformRevenue, netProfit, amount };
  };

  const runWithdrawalSim = () => {
    if (!selectedPlan || !selectedProvider) return null;
    const amount = simAmount;
    
    // Agatike Margin (using organizer_platform_contribution as requested)
    const agatikeMargin = amount * (Number(selectedPlan.organizer_platform_contribution || 0) / 100);

    // Provider Cost
    const provPct = Number(selectedProvider.disbursement_percentage || 0);
    const provFixed = Number(selectedProvider.disbursement_fixed_fee || 0);
    const providerCost = (amount * (provPct / 100)) + provFixed;

    // Total Fee charged to Organizer
    const orgFee = agatikeMargin + providerCost;
    const platformRevenue = orgFee;
    const netProfit = agatikeMargin; // Since platformRevenue - providerCost = agatikeMargin

    return { customerFee: 0, orgFee, providerCost, platformRevenue, netProfit, amount };
  };

  if (plansLoading || providersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pricing Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure subscription tiers and simulate unit economics.
          </p>
        </div>
      </div>

      <div className="flex border-b border-[#333333]">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "plans" ? "border-[#f97316] text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Pricing Plans
        </button>
        <button
          onClick={() => setActiveTab("sim-collections")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "sim-collections" ? "border-[#f97316] text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          <Calculator className="h-4 w-4" /> Collections Simulator
        </button>
        <button
          onClick={() => setActiveTab("sim-withdrawals")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "sim-withdrawals" ? "border-[#f97316] text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          <Calculator className="h-4 w-4" /> Withdrawals Simulator
        </button>
      </div>

      {activeTab === "plans" && (
        <div className="bg-[#1b1b1c] rounded-xl border border-[#333333] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-[#111111]/50 border-b border-[#333333]">
                <tr>
                  <th className="px-6 py-4 font-medium">Plan Name</th>
                  <th className="px-6 py-4 font-medium">Monthly Price</th>
                  <th className="px-6 py-4 font-medium">Customer Fee</th>
                  <th className="px-6 py-4 font-medium">Platform Contribution (Agatike Profit)</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {plans.map((plan: any) => {
                  const isEditing = editingRow === plan.id;
                  return (
                    <tr key={plan.id} className="hover:bg-[#252526]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{plan.name}</div>
                        {!plan.active && <span className="text-xs text-destructive">Inactive</span>}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                            className="w-24 bg-[#111111] border border-[#333333] rounded px-2 py-1 text-white"
                          />
                        ) : (
                          formatCurrency(plan.price, plan.currency || "USD")
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="number" step="0.01"
                              value={editForm.customer_service_fee_percentage}
                              onChange={(e) => setEditForm({...editForm, customer_service_fee_percentage: e.target.value})}
                              className="w-16 bg-[#111111] border border-[#333333] rounded px-2 py-1 text-white"
                            />
                            <span className="text-muted-foreground py-1">%</span>
                          </div>
                        ) : (
                          `${plan.customer_service_fee_percentage || plan.customer_collection_fee_percentage || 0}%`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="number" step="0.01"
                              value={editForm.organizer_platform_contribution}
                              onChange={(e) => setEditForm({...editForm, organizer_platform_contribution: e.target.value})}
                              className="w-16 bg-[#111111] border border-[#333333] rounded px-2 py-1 text-white"
                            />
                            <span className="text-muted-foreground py-1">%</span>
                          </div>
                        ) : (
                          `${plan.organizer_platform_contribution || 0}%`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingRow(null)} className="p-1.5 text-muted-foreground hover:text-white rounded-md">
                              <X className="h-4 w-4" />
                            </button>
                            <button onClick={handleSave} disabled={updateMutation.isPending} className="p-1.5 bg-[#f97316] text-white rounded-md hover:bg-[#ea580c] disabled:opacity-50">
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEdit(plan)} className="p-1.5 text-muted-foreground hover:text-white hover:bg-[#333333] rounded-md">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulator Views */}
      {(activeTab === "sim-collections" || activeTab === "sim-withdrawals") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 bg-[#1b1b1c] p-6 rounded-xl border border-[#333333]">
            <h2 className="text-lg font-medium text-white">Simulator Inputs</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Amount (Ticket Price or Withdrawal)</label>
              <input 
                type="number"
                value={simAmount}
                onChange={e => setSimAmount(Number(e.target.value))}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Pricing Plan</label>
              <select
                value={selectedPlan?.id}
                onChange={e => setSimPlanId(e.target.value)}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-white"
              >
                {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.organizer_platform_contribution}% org fee)</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Target Network (PawaPay)</label>
              <select
                value={selectedProvider?.id}
                onChange={e => setSimProviderId(e.target.value)}
                className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-white"
              >
                {providers.map((p: any) => <option key={p.id} value={p.id}>{p.network} ({p.country_code})</option>)}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6 bg-[#111111] border border-[#333333] p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#f97316]"></div>
            <h2 className="text-xl font-bold text-white">
              {activeTab === "sim-collections" ? "Collections (Ticket Sale) Breakdown" : "Withdrawals Breakdown"}
            </h2>

            {(() => {
              const res = activeTab === "sim-collections" ? runCollectionSim() : runWithdrawalSim();
              if (!res) return null;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1b1b1c] p-4 rounded-lg border border-[#333333]">
                      <div className="text-sm text-muted-foreground">Transaction Amount</div>
                      <div className="text-2xl font-bold text-white">{formatCurrency(res.amount, "RWF")}</div>
                    </div>
                    <div className="bg-[#1b1b1c] p-4 rounded-lg border border-[#333333]">
                      <div className="text-sm text-muted-foreground">Total Fees Collected (Agatike + Provider)</div>
                      <div className="text-2xl font-bold text-white">{formatCurrency(res.platformRevenue, "RWF")}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fee Distribution</h3>
                    
                    {activeTab === "sim-collections" && (
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <span className="text-blue-400 font-medium">Customer Pays</span>
                        <span className="text-blue-400 font-bold">{formatCurrency(res.customerFee, "RWF")}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <span className="text-purple-400 font-medium">Organizer Pays</span>
                      <span className="text-purple-400 font-bold">{formatCurrency(res.orgFee, "RWF")}</span>
                    </div>

                    <div className="flex items-center justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <span className="text-red-400 font-medium">Provider Cost (Paid to PawaPay)</span>
                      <span className="text-red-400 font-bold">-{formatCurrency(res.providerCost, "RWF")}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl mt-4">
                      <span className="text-[#f97316] font-medium text-lg">Agatike Net Profit</span>
                      <span className="text-[#f97316] font-bold text-xl">{formatCurrency(res.netProfit, "RWF")}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
