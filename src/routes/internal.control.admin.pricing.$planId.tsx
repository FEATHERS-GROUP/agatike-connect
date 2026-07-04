import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPricingPlansAdmin, getPricingPlanStatsAdmin, updatePricingPlanAdmin, getPlatformModulesAdmin } from "@/api/admin_finance";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { Loader2, ArrowLeft, Edit2, Save, X, Plus, Trash2, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/control/admin/pricing/$planId")({
  component: AdminPricingDetailsPage,
});

function AdminPricingDetailsPage() {
  const { planId } = Route.useParams();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formState, setFormState] = useState<Record<string, any>>({});

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["admin-pricing-plans"],
    queryFn: () => getPricingPlansAdmin(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-pricing-stats", planId],
    queryFn: () => getPricingPlanStatsAdmin({ data: { planId } }),
  });

  const { data: platformModules = [] } = useQuery({
    queryKey: ["admin-platform-modules"],
    queryFn: () => getPlatformModulesAdmin(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Record<string, any> }) => updatePricingPlanAdmin({ data }),
    onSuccess: () => {
      toast.success("Pricing plan updated");
      queryClient.invalidateQueries({ queryKey: ["admin-pricing-plans"] });
      setIsEditModalOpen(false);
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const plan = plans.find((p: any) => p.id === planId);

  const handleOpenEdit = () => {
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
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updates = { ...formState };
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

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
    
    updateMutation.mutate({ id: plan.id, updates });
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

  if (plansLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-white">Plan not found</h2>
          <Link to="/internal/control/admin/pricing" className="text-[#f97316] hover:underline mt-4 inline-block">Go back to pricing plans</Link>
        </div>
      </div>
    );
  }

  const renderEditModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-[#333333] bg-[#111111]">
          <h2 className="text-lg font-bold text-white">Edit Pricing Plan: {plan.name}</h2>
          <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">General Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Plan Name</label>
                <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-muted-foreground">The public facing name of the subscription.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Billing Cycle</label>
                <select value={formState.billing_cycle} onChange={e => setFormState({...formState, billing_cycle: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
                <p className="text-[10px] text-muted-foreground">How often the user is charged.</p>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <input type="text" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-muted-foreground">A short marketing description shown on the pricing page.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Active Status</label>
                <select value={formState.active} onChange={e => setFormState({...formState, active: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                  <option value="true">Active (Visible)</option>
                  <option value="false">Inactive (Hidden)</option>
                </select>
                <p className="text-[10px] text-muted-foreground">If inactive, users cannot select this plan.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Is Popular (Badge)</label>
                <select value={formState.is_popular} onChange={e => setFormState({...formState, is_popular: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <p className="text-[10px] text-muted-foreground">Highlights this plan as 'Most Popular'.</p>
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
                <p className="text-[10px] text-muted-foreground">Base currency (e.g. RWF, USD).</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Monthly Price</label>
                <input type="number" step="1" value={formState.price} onChange={e => setFormState({...formState, price: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-muted-foreground">Cost per month.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Yearly Price (Optional)</label>
                <input type="number" step="1" value={formState.yearly_price || ""} onChange={e => setFormState({...formState, yearly_price: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-muted-foreground">Discounted yearly cost.</p>
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
                <p className="text-[10px] text-blue-400/60">Percentage taken from the Organizer on ticket sales and withdrawals.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-400/80">Customer Service Fee (%)</label>
                <input type="number" step="0.01" value={formState.customer_service_fee_percentage} onChange={e => setFormState({...formState, customer_service_fee_percentage: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-blue-400/60">Percentage passed directly to the end customer when buying tickets.</p>
              </div>
            </div>
          </div>

          {/* Advanced Fee Overrides */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Advanced Routing & Fee Overrides</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 p-4 bg-[#111111] rounded-lg border border-[#333333]">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collections (Ticket Sales)</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground">Cust. Override (%)</label>
                    <input type="number" step="0.01" value={formState.customer_collection_fee_percentage || ""} onChange={e => setFormState({...formState, customer_collection_fee_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
                    <p className="text-[9px] text-muted-foreground leading-tight">Overrides the Customer Service Fee if set.</p>
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
                  <p className="text-[9px] text-muted-foreground">If Yes, the Organizer absorbs the customer fee up to a limit.</p>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-[#111111] rounded-lg border border-[#333333]">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Withdrawals</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground">Withdraw Override (%)</label>
                    <input type="number" step="0.01" value={formState.withdrawal_fee_percentage || ""} onChange={e => setFormState({...formState, withdrawal_fee_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded px-2 py-1.5 text-xs text-white" />
                    <p className="text-[9px] text-muted-foreground leading-tight">Overrides the Organizer Platform Contribution for withdrawals.</p>
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
              <p className="text-[10px] text-muted-foreground">These are bullet points displayed to customers.</p>
              
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
              <p className="text-[10px] text-muted-foreground">Select the system modules granted by this subscription.</p>
              
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {platformModules.map((module: any) => {
                  const isIncluded = (formState.modules_included || []).includes(module.id);
                  return (
                    <label key={module.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isIncluded ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#111111] border-[#333333] hover:border-[#444444]'}`}>
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
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#333333] bg-[#111111] flex justify-end gap-3">
          <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/internal/control/admin/pricing" className="p-2 hover:bg-[#333333] rounded-lg transition-colors text-muted-foreground hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h1>
            {!plan.active && <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs uppercase font-bold border border-red-500/20">Inactive</span>}
            {plan.is_popular && <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs uppercase font-bold border border-blue-500/20">Popular</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{plan.description || "No description provided."}</p>
        </div>
        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#333333] hover:bg-[#333333] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Edit2 className="h-4 w-4" /> Edit Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#1b1b1c] rounded-xl border border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-[#333333] bg-[#111111]/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Pricing & Margins</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Monthly Price</div>
                <div className="text-xl font-bold text-white">{formatCurrency(plan.price, plan.currency || "USD")}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Yearly Price</div>
                <div className="text-xl font-bold text-white">{plan.yearly_price ? formatCurrency(plan.yearly_price, plan.currency || "USD") : "-"}</div>
              </div>
              <div>
                <div className="text-xs text-blue-400/80 mb-1">Agatike Profit Margin</div>
                <div className="text-xl font-bold text-blue-400">{plan.organizer_platform_contribution || 0}%</div>
              </div>
              <div>
                <div className="text-xs text-purple-400/80 mb-1">Customer Svc Fee</div>
                <div className="text-xl font-bold text-purple-400">{plan.customer_service_fee_percentage || 0}%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1b1b1c] rounded-xl border border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-[#333333] bg-[#111111]/50">
              <h2 className="text-lg font-bold text-white">Included Features & Modules</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Features List</h3>
                <ul className="space-y-2">
                  {(!plan.features || plan.features.length === 0) ? (
                    <li className="text-sm text-muted-foreground">No features defined.</li>
                  ) : (
                    (typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features).map((f: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Unlocked Modules</h3>
                <ul className="space-y-2">
                  {(!plan.modules_included || plan.modules_included.length === 0) ? (
                    <li className="text-sm text-muted-foreground">No modules unlocked.</li>
                  ) : (
                    (typeof plan.modules_included === "string" ? JSON.parse(plan.modules_included) : plan.modules_included).map((mId: string, i: number) => {
                      const mod = platformModules.find((p: any) => p.id === mId);
                      return (
                        <li key={i} className="text-sm text-blue-400 flex items-start gap-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{mod ? mod.label : mId}</span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Organizer Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1b1b1c] rounded-xl border border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-[#333333] bg-[#111111]/50">
              <h2 className="text-lg font-bold text-white">Adoption Stats</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active Subscribers</div>
                  <div className="text-2xl font-bold text-white">{stats?.activeSubscribers || 0}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#f97316]" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats?.monthlyRecurringRevenue || 0, plan.currency || "USD")}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#333333] bg-[#111111]/50 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Subscribed Workspaces</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {stats?.subscriptions?.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">No active subscriptions.</div>
                ) : (
                  stats?.subscriptions?.map((sub: any) => (
                    <div key={sub.id} className="flex justify-between items-center p-2 rounded-lg bg-[#1b1b1c] border border-[#333333]">
                      <div className="text-sm text-white truncate max-w-[150px]">{sub.workspace?.name || sub.organizer?.name || "Unknown Workspace"}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${sub.status === 'active' || sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {sub.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {isEditModalOpen && renderEditModal()}
    </div>
  );
}
