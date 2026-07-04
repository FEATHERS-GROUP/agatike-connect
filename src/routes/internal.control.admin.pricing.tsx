import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPricingPlansAdmin, updatePricingPlanAdmin, getPaymentProviderFeesAdmin, createPricingPlanAdmin, getPlatformModulesAdmin } from "@/api/admin_finance";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { Loader2, Edit2, Save, X, Calculator, ArrowRight, Plus, ExternalLink, Trash2 } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/pricing")({
  component: AdminPricingPage,
});

function AdminPricingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"plans" | "sim-collections" | "sim-withdrawals">("plans");
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});

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

  const { data: platformModules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["admin-platform-modules"],
    queryFn: () => getPlatformModulesAdmin(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Record<string, any> }) => updatePricingPlanAdmin({ data }),
    onSuccess: () => {
      toast.success("Pricing plan updated");
      queryClient.invalidateQueries({ queryKey: ["admin-pricing-plans"] });
      setEditingPlan(null);
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createPricingPlanAdmin({ data }),
    onSuccess: () => {
      toast.success("Pricing plan created");
      queryClient.invalidateQueries({ queryKey: ["admin-pricing-plans"] });
      setIsCreateModalOpen(false);
    },
    onError: (e) => toast.error(e.message || "Failed to create plan"),
  });

  const handleOpenEdit = (plan: any) => {
    let featuresArr = plan.features || [];
    let modulesArr = plan.modules_included || [];
    
    if (typeof featuresArr === "string") {
      try { featuresArr = JSON.parse(featuresArr); } catch { featuresArr = []; }
    }
    if (typeof modulesArr === "string") {
      try { modulesArr = JSON.parse(modulesArr); } catch { modulesArr = []; }
    }

    setFormState({
      ...plan,
      features: featuresArr,
      modules_included: modulesArr,
      active: String(plan.active),
      is_popular: String(plan.is_popular),
      enable_subsidized_collection: String(plan.enable_subsidized_collection),
      withdrawal_dependency_required: String(plan.withdrawal_dependency_required)
    });
    setEditingPlan(plan);
  };

  const handleOpenCreate = () => {
    setFormState({
      name: "",
      description: "",
      price: 0,
      yearly_price: 0,
      currency: "RWF",
      billing_cycle: "monthly",
      active: "true",
      is_popular: "false",
      customer_service_fee_percentage: 0,
      organizer_platform_contribution: 2,
      platform_margin_buffer: 0,
      customer_collection_fee_percentage: 0,
      customer_collection_fee_fixed: 0,
      organizer_collection_fee_percentage: 0,
      organizer_collection_fee_fixed: 0,
      withdrawal_fee_percentage: 0,
      withdrawal_fee_fixed: 0,
      enable_subsidized_collection: "false",
      withdrawal_dependency_required: "false",
      max_withdrawals_per_week: "unlimited",
      features: [],
      modules_included: []
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updates = { ...formState };
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    // Convert booleans
    const booleanFields = ['active', 'is_popular', 'enable_subsidized_collection', 'withdrawal_dependency_required'];
    for (const field of booleanFields) {
      if (updates[field] === "true") updates[field] = true;
      else if (updates[field] === "false") updates[field] = false;
    }

    const numericFields = [
      'price', 'yearly_price', 'customer_service_fee_percentage', 'organizer_platform_contribution',
      'platform_margin_buffer', 'customer_collection_fee_percentage', 'customer_collection_fee_fixed',
      'organizer_collection_fee_percentage', 'organizer_collection_fee_fixed', 'withdrawal_fee_percentage',
      'withdrawal_fee_fixed', 'max_collection_subsidy_percentage'
    ];
    for (const field of numericFields) {
      if (updates[field] !== undefined && updates[field] !== null && updates[field] !== "") {
        updates[field] = Number(updates[field]);
      } else {
        updates[field] = null;
      }
    }
    
    updateMutation.mutate({ id: editingPlan.id, updates });
  };

  const handleSaveCreate = () => {
    const data = { ...formState };
    createMutation.mutate(data);
  };

  const toggleModule = (moduleId: string) => {
    const current = Array.isArray(formState.modules_included) ? formState.modules_included : [];
    if (current.includes(moduleId)) {
      setFormState({ ...formState, modules_included: current.filter(id => id !== moduleId) });
    } else {
      setFormState({ ...formState, modules_included: [...current, moduleId] });
    }
  };

  const updateFeature = (index: number, val: string) => {
    const current = [...(formState.features || [])];
    current[index] = val;
    setFormState({ ...formState, features: current });
  };

  const removeFeature = (index: number) => {
    const current = [...(formState.features || [])];
    current.splice(index, 1);
    setFormState({ ...formState, features: current });
  };

  const addFeature = () => {
    const current = [...(formState.features || [])];
    current.push("");
    setFormState({ ...formState, features: current });
  };

  // Simulator Calcs
  const selectedPlan = useMemo(() => plans.find((p: any) => p.id === simPlanId) || plans[0], [plans, simPlanId]);
  const selectedProvider = useMemo(() => providers.find((p: any) => p.id === simProviderId) || providers[0], [providers, simProviderId]);

  const runCollectionSim = () => {
    if (!selectedPlan || !selectedProvider) return null;
    const amount = simAmount;
    
    const customerPct = Number(selectedPlan.customer_collection_fee_percentage || selectedPlan.customer_service_fee_percentage || 0);
    const customerFixed = Number(selectedPlan.customer_collection_fee_fixed || 0);
    const customerFee = (amount * (customerPct / 100)) + customerFixed;

    const orgPct = Number(selectedPlan.organizer_platform_contribution || 0);
    const orgFee = amount * (orgPct / 100);

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
    
    const agatikeMargin = amount * (Number(selectedPlan.organizer_platform_contribution || 0) / 100);

    const provPct = Number(selectedProvider.disbursement_percentage || 0);
    const provFixed = Number(selectedProvider.disbursement_fixed_fee || 0);
    const providerCost = (amount * (provPct / 100)) + provFixed;

    const orgFee = agatikeMargin + providerCost;
    const platformRevenue = orgFee;
    const netProfit = agatikeMargin; 

    return { customerFee: 0, orgFee, providerCost, platformRevenue, netProfit, amount };
  };

  if (plansLoading || providersLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </div>
    );
  }

  const renderFormFields = () => (
    <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
      
      {/* General Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">General Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Plan Name</label>
            <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Billing Cycle</label>
            <select value={formState.billing_cycle} onChange={e => setFormState({...formState, billing_cycle: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input type="text" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Active Status</label>
            <select value={formState.active} onChange={e => setFormState({...formState, active: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
              <option value="true">Active (Visible)</option>
              <option value="false">Inactive (Hidden)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Is Popular (Badge)</label>
            <select value={formState.is_popular} onChange={e => setFormState({...formState, is_popular: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Subscription Pricing</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Currency</label>
            <input type="text" value={formState.currency || "RWF"} onChange={e => setFormState({...formState, currency: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Monthly Price</label>
            <input type="number" step="1" value={formState.price} onChange={e => setFormState({...formState, price: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Yearly Price (Optional)</label>
            <input type="number" step="1" value={formState.yearly_price || ""} onChange={e => setFormState({...formState, yearly_price: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>

      {/* Margins */}
      <div className="space-y-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-400 border-b border-blue-500/20 pb-2">Core Platform Margins (Profit Settings)</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-blue-400/80">Organizer Platform Contribution (%)</label>
            <input type="number" step="0.01" value={formState.organizer_platform_contribution} onChange={e => setFormState({...formState, organizer_platform_contribution: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-blue-400/80">Customer Service Fee (%)</label>
            <input type="number" step="0.01" value={formState.customer_service_fee_percentage} onChange={e => setFormState({...formState, customer_service_fee_percentage: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>

      {/* Advanced Fee Overrides */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Advanced Routing & Fee Overrides</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 p-4 bg-[#111111] rounded-lg border border-[#333333]">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collections</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Cust. Override (%)</label>
                <input type="number" step="0.01" value={formState.customer_collection_fee_percentage || ""} onChange={e => setFormState({...formState, customer_collection_fee_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Cust. Override (Fixed)</label>
                <input type="number" step="1" value={formState.customer_collection_fee_fixed || ""} onChange={e => setFormState({...formState, customer_collection_fee_fixed: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Org. Override (%)</label>
                <input type="number" step="0.01" value={formState.organizer_collection_fee_percentage || ""} onChange={e => setFormState({...formState, organizer_collection_fee_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Org. Override (Fixed)</label>
                <input type="number" step="1" value={formState.organizer_collection_fee_fixed || ""} onChange={e => setFormState({...formState, organizer_collection_fee_fixed: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
            </div>
            
            <div className="space-y-1.5 pt-2 border-t border-[#333333]">
              <label className="text-xs font-medium text-muted-foreground">Enable Subsidized Collections?</label>
              <select value={formState.enable_subsidized_collection} onChange={e => setFormState({...formState, enable_subsidized_collection: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-[#111111] rounded-lg border border-[#333333]">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Withdrawals</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Withdraw Override (%)</label>
                <input type="number" step="0.01" value={formState.withdrawal_fee_percentage || ""} onChange={e => setFormState({...formState, withdrawal_fee_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Withdraw Override (Fixed)</label>
                <input type="number" step="1" value={formState.withdrawal_fee_fixed || ""} onChange={e => setFormState({...formState, withdrawal_fee_fixed: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-medium text-muted-foreground">Max Withdrawals/Week</label>
                <input type="text" value={formState.max_withdrawals_per_week || "unlimited"} onChange={e => setFormState({...formState, max_withdrawals_per_week: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Modules */}
      <div className="grid grid-cols-2 gap-8">
        {/* Features Array */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#333333] pb-2">
            <h3 className="text-sm font-semibold text-white">Features List</h3>
            <button onClick={addFeature} className="text-xs flex items-center gap-1 text-[#f97316] hover:text-[#ea580c] transition-colors">
              <Plus className="h-3 w-3" /> Add Feature
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {(formState.features || []).map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={feature} 
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="e.g. Unlimited tickets"
                />
                <button onClick={() => removeFeature(idx)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {(!formState.features || formState.features.length === 0) && (
              <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-[#333333] rounded-lg">
                No features added yet.
              </div>
            )}
          </div>
        </div>

        {/* Modules Array */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Included Modules</h3>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {platformModules.map((module: any) => {
              const isIncluded = (formState.modules_included || []).includes(module.id);
              return (
                <label key={module.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isIncluded ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#111111] border-[#333333] hover:border-gray-500'}`}>
                  <input 
                    type="checkbox" 
                    checked={isIncluded}
                    onChange={() => toggleModule(module.id)}
                    className="accent-blue-500 h-4 w-4 rounded bg-[#1b1b1c] border-[#333333]"
                  />
                  <div>
                    <div className={`text-sm font-medium ${isIncluded ? 'text-blue-400' : 'text-white'}`}>{module.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{module.category || "Uncategorized"}</div>
                  </div>
                </label>
              );
            })}
            {platformModules.length === 0 && (
              <div className="text-xs text-muted-foreground">No modules found in the database.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pricing Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure subscription tiers, margins, features, and simulate unit economics.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Pricing Plan
        </button>
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
                  <th className="px-6 py-4 font-medium">Plan Info</th>
                  <th className="px-6 py-4 font-medium">Pricing</th>
                  <th className="px-6 py-4 font-medium">Margins</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {plans.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-[#252526]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-white flex items-center gap-2">
                          {plan.name}
                          {plan.is_popular && <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Popular</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate w-48">
                          {plan.description || "No description"}
                        </div>
                        {!plan.active && <span className="text-[10px] uppercase font-bold text-red-400">Inactive</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between w-32">
                          <span className="text-muted-foreground">Monthly:</span>
                          <span className="text-white font-medium">{formatCurrency(plan.price, plan.currency || "USD")}</span>
                        </div>
                        <div className="flex justify-between w-32">
                          <span className="text-muted-foreground">Yearly:</span>
                          <span className="text-white font-medium">{plan.yearly_price ? formatCurrency(plan.yearly_price, plan.currency || "USD") : "-"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between w-32">
                          <span className="text-muted-foreground">Agatike Org Fee:</span>
                          <span className="text-blue-400 font-bold">{plan.organizer_platform_contribution || 0}%</span>
                        </div>
                        <div className="flex justify-between w-32">
                          <span className="text-muted-foreground">Customer Fee:</span>
                          <span className="text-purple-400 font-bold">{plan.customer_service_fee_percentage || plan.customer_collection_fee_percentage || 0}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenEdit(plan)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#111111] hover:bg-[#333333] border border-[#333333] text-white rounded-md transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
                
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No pricing plans found.
                    </td>
                  </tr>
                )}
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

      {/* View/Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#333333] bg-[#111111]">
              <h2 className="text-lg font-bold text-white">Pricing Plan Details: {editingPlan.name}</h2>
              <button onClick={() => setEditingPlan(null)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {renderFormFields()}

            <div className="p-4 border-t border-[#333333] bg-[#111111] flex justify-end gap-3">
              <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#333333] bg-[#111111]">
              <h2 className="text-lg font-bold text-white">Create New Pricing Plan</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {renderFormFields()}

            <div className="p-4 border-t border-[#333333] bg-[#111111] flex justify-end gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveCreate} disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <Save className="h-4 w-4" /> Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
