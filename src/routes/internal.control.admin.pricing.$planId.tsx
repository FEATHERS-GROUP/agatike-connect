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
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 5;
  const STEP_TITLES = ["General Info", "Pricing & Margins", "Advanced Overrides", "Features & Modules", "Usage Limits & Rules"];

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

    let usageLimits = plan.usage_limits || {};
    if (typeof usageLimits === "string") {
      try { usageLimits = JSON.parse(usageLimits); } catch { usageLimits = {}; }
    }

    setFormState({
      ...plan,
      features: featuresArr,
      modules_included: modulesArr,
      usage_limits: {
        max_workspaces: 1,
        max_events: 5,
        max_experiences: 0,
        max_cinemas: 0,
        max_cinema_screens: 0,
        max_movies: 0,
        max_products: 0,
        max_spaces: 0,
        max_venues: 0,
        max_ticket_designs: 1,
        max_badge_designs: 0,
        max_page_builders: 0,
        max_invoices: 10,
        max_tasks: 10,
        max_custom_forms: 1,
        max_rsvps: 100,
        max_customer_books: 1,
        max_campaigns: 0,
        max_gift_cards: 0,
        max_punch_cards: 0,
        max_event_staff: 1,
        max_event_sections: 1,
        max_event_vendors: 0,
        max_event_vouchers: 0,
        max_event_stories: 0,
        max_event_posts: 0,
        max_ticket_tiers_per_event: 2,
        max_contributors: 0,
        max_planning_items: 20,
        has_studio_access: false,
        can_invite_contributors: false,
        can_link_modules: false,
        can_import_staff: false,
        can_use_form_integration: false,
        can_access_event_sections: false,
        can_use_venue_integration: false,
        can_share_feedback_link: false,
        support_type: "standard",
        venue_design_type: "basic",
        ...usageLimits,
      },
      active: String(plan.active),
      is_popular: String(plan.is_popular),
      enable_subsidized_collection: String(plan.enable_subsidized_collection),
      withdrawal_dependency_required: String(plan.withdrawal_dependency_required)
    });
    setIsEditModalOpen(true);
    setCurrentStep(1);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan not found</h2>
          <Link to="/internal/control/admin/pricing" className="text-[#f97316] hover:underline mt-4 inline-block">Go back to pricing plans</Link>
        </div>
      </div>
    );
  }

  const renderEditModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Pricing Plan: {plan.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {currentStep} of {TOTAL_STEPS} — {STEP_TITLES[currentStep - 1]}</p>
          </div>
          <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-5 pb-2 border-b border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]/40">
          <div className="flex items-start gap-0">
            {STEP_TITLES.map((title, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              return (
                <div key={title} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div className={`h-0.5 flex-1 transition-colors ${idx === 0 ? 'invisible' : isCompleted || isActive ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-[#333333]'}`} />
                    <button
                      type="button"
                      onClick={() => setCurrentStep(stepNum)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${isActive ? 'bg-[#f97316] text-white ring-2 ring-[#f97316]/30' : isCompleted ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-gray-200 dark:bg-[#333333] text-muted-foreground hover:bg-gray-200 dark:hover:bg-[#444444]'}`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                    </button>
                    <div className={`h-0.5 flex-1 transition-colors ${idx === TOTAL_STEPS - 1 ? 'invisible' : isCompleted ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-[#333333]'}`} />
                  </div>
                  <span className={`text-[10px] mt-2 text-center leading-tight ${isActive ? 'text-gray-900 dark:text-white font-medium' : isCompleted ? 'text-[#f97316]/80' : 'text-muted-foreground'}`}>{title}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[340px]">

          {/* Step 1 – General Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Plan Name</label>
                  <input type="text" value={formState.name || ""} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                  <p className="text-[10px] text-muted-foreground">The public facing name of the subscription.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Billing Cycle</label>
                  <select value={formState.billing_cycle || "monthly"} onChange={e => setFormState({...formState, billing_cycle: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">How often the user is charged.</p>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <input type="text" value={formState.description || ""} onChange={e => setFormState({...formState, description: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                  <p className="text-[10px] text-muted-foreground">A short marketing description shown on the pricing page.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Active Status</label>
                  <select value={formState.active} onChange={e => setFormState({...formState, active: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">If inactive, users cannot select this plan.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Is Popular (Badge)</label>
                  <select value={formState.is_popular} onChange={e => setFormState({...formState, is_popular: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">Highlights this plan as 'Most Popular'.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Pricing & Margins */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#333333] pb-2">Subscription Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Currency</label>
                    <input type="text" value={formState.currency || "RWF"} onChange={e => setFormState({...formState, currency: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                    <p className="text-[10px] text-muted-foreground">Base currency (e.g. RWF, USD).</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Monthly Price</label>
                    <input type="number" step="1" value={formState.price || ""} onChange={e => setFormState({...formState, price: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                    <p className="text-[10px] text-muted-foreground">Cost per month.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Yearly Price (Optional)</label>
                    <input type="number" step="1" value={formState.yearly_price || ""} onChange={e => setFormState({...formState, yearly_price: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                    <p className="text-[10px] text-muted-foreground">Discounted yearly cost.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                <h3 className="text-sm font-semibold text-blue-400 border-b border-blue-500/20 pb-2">Core Platform Margins (Profit Settings)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-blue-400/80">Organizer Platform Contribution (%)</label>
                    <input type="number" step="0.01" value={formState.organizer_platform_contribution || ""} onChange={e => setFormState({...formState, organizer_platform_contribution: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                    <p className="text-[10px] text-blue-400/60">Percentage taken from the Organizer on ticket sales and withdrawals.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-blue-400/80">Customer Service Fee (%)</label>
                    <input type="number" step="0.01" value={formState.customer_service_fee_percentage || ""} onChange={e => setFormState({...formState, customer_service_fee_percentage: e.target.value})} className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
                    <p className="text-[10px] text-blue-400/60">Percentage passed directly to the end customer when buying tickets.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 – Advanced Overrides */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#333333] pb-2">Advanced Routing &amp; Fee Overrides</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 p-4 bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-[#333333]">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Collections (Ticket Sales)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Cust. Override (%)</label>
                      <input type="number" step="0.01" value={formState.customer_collection_fee_percentage || ""} onChange={e => setFormState({...formState, customer_collection_fee_percentage: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                      <p className="text-[9px] text-muted-foreground leading-tight">Overrides the Customer Service Fee if set.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Cust. Override (Fixed)</label>
                      <input type="number" step="1" value={formState.customer_collection_fee_fixed || ""} onChange={e => setFormState({...formState, customer_collection_fee_fixed: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Org. Override (%)</label>
                      <input type="number" step="0.01" value={formState.organizer_collection_fee_percentage || ""} onChange={e => setFormState({...formState, organizer_collection_fee_percentage: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Org. Override (Fixed)</label>
                      <input type="number" step="1" value={formState.organizer_collection_fee_fixed || ""} onChange={e => setFormState({...formState, organizer_collection_fee_fixed: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-[#333333]">
                    <label className="text-xs font-medium text-muted-foreground">Enable Subsidized Collections?</label>
                    <select value={formState.enable_subsidized_collection} onChange={e => setFormState({...formState, enable_subsidized_collection: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white">
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    <p className="text-[9px] text-muted-foreground">If Yes, the Organizer absorbs the customer fee up to a limit.</p>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-[#333333]">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Withdrawals</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Withdraw Override (%)</label>
                      <input type="number" step="0.01" value={formState.withdrawal_fee_percentage || ""} onChange={e => setFormState({...formState, withdrawal_fee_percentage: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                      <p className="text-[9px] text-muted-foreground leading-tight">Overrides the Organizer Platform Contribution for withdrawals.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Withdraw Override (Fixed)</label>
                      <input type="number" step="1" value={formState.withdrawal_fee_fixed || ""} onChange={e => setFormState({...formState, withdrawal_fee_fixed: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-medium text-muted-foreground">Max Withdrawals/Week</label>
                      <input type="text" value={formState.max_withdrawals_per_week || "unlimited"} onChange={e => setFormState({...formState, max_withdrawals_per_week: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 – Features & Modules */}
          {currentStep === 4 && (
            <div className="grid grid-cols-2 gap-8">
              {/* Features Array */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#333333] pb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Features List</h3>
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
                        className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white"
                        placeholder="e.g. Unlimited tickets"
                      />
                      <button onClick={() => removeFeature(idx)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {(!formState.features || formState.features.length === 0) && (
                    <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-gray-200 dark:border-[#333333] rounded-lg">
                      No features added yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Modules Array */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#333333] pb-2">Included Modules</h3>
                <p className="text-[10px] text-muted-foreground">Select the system modules granted by this subscription.</p>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {platformModules.map((module: any) => {
                    const isIncluded = (formState.modules_included || []).includes(module.id);
                    return (
                      <label key={module.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isIncluded ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-[#444444]'}`}>
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => toggleModule(module.id)}
                          className="accent-blue-500 h-4 w-4 rounded bg-gray-50 dark:bg-[#1b1b1c] border-gray-200 dark:border-[#333333]"
                        />
                        <div>
                          <div className={`text-sm font-medium ${isIncluded ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>{module.label}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{module.category || "Uncategorized"}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 – Usage Limits & Rules */}
          {currentStep === 5 && (() => {
            const ul = formState.usage_limits || {};
            const setUL = (key: string, val: any) =>
              setFormState({ ...formState, usage_limits: { ...ul, [key]: val } });

            const LIMIT_FIELDS = [
              {
                key: "max_workspaces",
                label: "Max Workspaces",
                desc: "How many workspaces this organizer can create. Each workspace is a separate brand/event hub.",
              },
              {
                key: "max_events",
                label: "Max Events",
                desc: "Total events per workspace. Includes all published and draft events.",
              },
              {
                key: "max_experiences",
                label: "Max Experiences",
                desc: "Total experiences (tours, activities) per workspace.",
              },
              {
                key: "max_cinemas",
                label: "Max Cinemas",
                desc: "How many Cinema modules the organizer can create per workspace.",
              },
              {
                key: "max_cinema_screens",
                label: "Max Cinema Screens",
                desc: "Total screens/halls that can be added across all cinemas in the workspace.",
              },
              {
                key: "max_movies",
                label: "Max Movies",
                desc: "Total movies that can be added across all cinemas in the workspace.",
              },
              {
                key: "max_products",
                label: "Max Products",
                desc: "Total products and add-ons the organizer can create per workspace.",
              },
              {
                key: "max_spaces",
                label: "Max Spaces",
                desc: "How many Spaces (venue rental hubs) per workspace.",
              },
              {
                key: "max_venues",
                label: "Max Venue Listings",
                desc: "Total venue listings the organizer can publish per workspace.",
              },
              {
                key: "max_ticket_designs",
                label: "Max Ticket Designs",
                desc: "Number of custom ticket design templates per workspace.",
              },
              {
                key: "max_badge_designs",
                label: "Max Badge Designs",
                desc: "Number of custom badge/accreditation templates per workspace.",
              },
              {
                key: "max_page_builders",
                label: "Max Page Builders",
                desc: "How many custom landing pages the organizer can build per workspace.",
              },
              {
                key: "max_invoices",
                label: "Max Invoices",
                desc: "Total procurement/supplier invoices allowed per workspace.",
              },
              {
                key: "max_tasks",
                label: "Max Tasks",
                desc: "Total workspace task board items allowed per workspace.",
              },
              {
                key: "max_custom_forms",
                label: "Max Custom Forms",
                desc: "Number of custom forms (RSVPs, registrations) per workspace.",
              },
              {
                key: "max_campaigns",
                label: "Max Campaigns",
                desc: "Total merch/campaigns per workspace.",
              },
              {
                key: "max_gift_cards",
                label: "Max Gift Cards",
                desc: "Total gift cards per workspace.",
              },
              {
                key: "max_punch_cards",
                label: "Max Punch Cards",
                desc: "Total punch cards per workspace.",
              },
              {
                key: "max_customer_books",
                label: "Max Customer Books",
                desc: "Total custom books per workspace.",
              },
              {
                key: "max_rsvps",
                label: "Max RSVPs",
                desc: "How many RSVPs can be submitted across all custom forms.",
              },
              {
                key: "max_ticket_tiers_per_event",
                label: "Max Ticket Tiers / Event",
                desc: "How many ticket pricing tiers an organizer can add to a single event, cinema, space, or venue.",
              },
              {
                key: "max_event_staff",
                label: "Max Event Staff",
                desc: "Max staff members per event.",
              },
              {
                key: "max_event_sections",
                label: "Max Event Sections",
                desc: "Max map sections per event.",
              },
              {
                key: "max_event_vendors",
                label: "Max Event Vendors",
                desc: "Max vendors per event.",
              },
              {
                key: "max_event_vouchers",
                label: "Max Sponsored Vouchers",
                desc: "Max sponsored vouchers generated per event.",
              },
              {
                key: "max_event_stories",
                label: "Max Event Stories",
                desc: "Max stories uploaded per event.",
              },
              {
                key: "max_event_posts",
                label: "Max Event Posts",
                desc: "Max community posts per event.",
              },
              {
                key: "max_workspace_users",
                label: "Max Workspace Users",
                desc: "How many admin/team members can be added to the workspace.",
              },
              {
                key: "max_contributors",
                label: "Max Contributors",
                desc: "External contributors who can be linked to specific designer projects.",
              },
            ];

            const ACCESS_FIELDS = [
              {
                key: "has_studio_access",
                label: "Has Studio Access",
                desc: "Unlocks Agatike Studio — advanced ticket, badge, and venue design editor.",
              },
              {
                key: "can_invite_contributors",
                label: "Can Invite Contributors",
                desc: "Allows the organizer to invite external contributors to design projects.",
              },
              {
                key: "can_link_modules",
                label: "Can Link Modules",
                desc: "Allows linking events, cinemas, spaces, and venues to each other within a workspace.",
              },
              {
                key: "can_import_staff",
                label: "Can Import Staff (CSV)",
                desc: "Allows the organizer to bulk import staff members.",
              },
              {
                key: "can_use_form_integration",
                label: "Form Integrations",
                desc: "Allows integrating custom forms for RSVPs and data collection on events.",
              },
              {
                key: "can_access_event_sections",
                label: "Event Sections Access",
                desc: "Unlocks the advanced 'Sections' tool to segment event layouts and access control.",
              },
              {
                key: "can_use_venue_integration",
                label: "Venue Integration",
                desc: "Allows integrating interactive digital venue maps with events for ticket selection.",
              },
              {
                key: "can_share_feedback_link",
                label: "Share Feedback Link",
                desc: "Enables sharing a public feedback collection link on event experiences.",
              },
            ];

            return (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usage Limits & Rules</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define what features and structural limits this plan enforces on the Organizer dashboard.
                    Toggle <span className="text-[#f97316] font-semibold">∞ Unlimited</span> to remove a restriction entirely — the organizer won't be blocked.
                    Leave a number to set a hard cap.
                  </p>
                </div>

                {/* Structural Limits */}
                <div className="p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-xl space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Structural Limits</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set a number to cap usage per workspace. Enable <strong className="text-[#f97316]">∞ Unlimited</strong> to remove the limit (stored as -1).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LIMIT_FIELDS.map(({ key, label, desc }) => {
                      const isUnlimited = ul[key] === -1;
                      return (
                        <div key={key} className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
                              <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</div>
                            </div>
                            {/* Unlimited toggle */}
                            <button
                              type="button"
                              onClick={() => setUL(key, isUnlimited ? 0 : -1)}
                              className={`ml-3 shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                                isUnlimited
                                  ? "bg-[#f97316]/15 border-[#f97316]/40 text-[#f97316]"
                                  : "bg-white dark:bg-[#111111] border-gray-200 dark:border-[#333333] text-muted-foreground hover:border-[#f97316]/40 hover:text-[#f97316]/70"
                              }`}
                            >
                              <span>∞</span>
                              <span>{isUnlimited ? "Unlimited" : "Set limit"}</span>
                            </button>
                          </div>
                          {!isUnlimited && (
                            <input
                              type="number"
                              min="0"
                              value={ul[key] ?? 0}
                              onChange={e => setUL(key, Number(e.target.value))}
                              className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316]/50 focus:outline-none transition-colors"
                              placeholder="0"
                            />
                          )}
                          {isUnlimited && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#f97316]/5 border border-[#f97316]/20 rounded-lg">
                              <span className="text-[#f97316] text-lg font-bold">∞</span>
                              <span className="text-xs text-[#f97316]/80">No restriction — organizer can create without limit</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Access & Permissions */}
                <div className="p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-xl space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Access & Permissions</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Toggle features that are unlocked for organizers on this plan. Disabled features show an upgrade prompt.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {ACCESS_FIELDS.map(({ key, label, desc }) => {
                      const checked = !!ul[key];
                      return (
                        <label
                          key={key}
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? "bg-green-500/5 border-green-500/30"
                              : "bg-gray-50 dark:bg-[#1b1b1c] border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-[#444444]"
                          }`}
                        >
                          <div className="mt-0.5">
                            <div
                              className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${checked ? "bg-green-500" : "bg-gray-200 dark:bg-[#333333]"}`}
                              style={{ minWidth: 40 }}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`}
                              />
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => setUL(key, e.target.checked)}
                              className="sr-only"
                            />
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${checked ? "text-green-400" : "text-gray-900 dark:text-white"}`}>{label}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Support Type */}
                  <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-4 space-y-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Support Type</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">The level of support access this plan includes. Shown on the organizer's settings and contact pages.</div>
                    </div>
                    <select
                      value={ul.support_type || "standard"}
                      onChange={e => setUL("support_type", e.target.value)}
                      className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#f97316]/50 focus:outline-none"
                    >
                      <option value="email">Email Only — Async responses within 48h</option>
                      <option value="standard">Standard — Business hours via email & chat</option>
                      <option value="priority">Priority — Faster response, priority queue</option>
                      <option value="dedicated">24/7 Dedicated — Personal account manager</option>
                    </select>
                  </div>

                  {/* Venue Design Type */}
                  <div className="bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333] rounded-xl p-4 space-y-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Venue Design Type</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Controls which venue design editor features are available in Agatike Studio for this plan.</div>
                    </div>
                    <select
                      value={ul.venue_design_type || "basic"}
                      onChange={e => setUL("venue_design_type", e.target.value)}
                      className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:border-[#f97316]/50 focus:outline-none"
                    >
                      <option value="basic">Basic — Standard templates, limited customization</option>
                      <option value="advanced">Advanced — Full editor, custom branding</option>
                      <option value="custom">Custom — White-label, API access, full control</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] flex justify-between items-center gap-3">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#444444] rounded-lg transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
            {currentStep < TOTAL_STEPS ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/internal/control/admin/pricing" className="p-2 hover:bg-gray-200 dark:hover:bg-[#333333] rounded-lg transition-colors text-muted-foreground hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{plan.name}</h1>
            {!plan.active && <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs uppercase font-bold border border-red-500/20">Inactive</span>}
            {plan.is_popular && <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs uppercase font-bold border border-blue-500/20">Popular</span>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{plan.description || "No description provided."}</p>
        </div>
        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Edit2 className="h-4 w-4" /> Edit Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Plan Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-gray-50 dark:bg-[#1b1b1c] rounded-xl border border-gray-200 dark:border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pricing & Margins</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Monthly Price</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(plan.price, plan.currency || "USD")}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Yearly Price</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{plan.yearly_price ? formatCurrency(plan.yearly_price, plan.currency || "USD") : "-"}</div>
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

          <div className="bg-gray-50 dark:bg-[#1b1b1c] rounded-xl border border-gray-200 dark:border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Included Features & Modules</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Features List</h3>
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Unlocked Modules</h3>
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

          {/* Usage Limits Summary */}
          {(() => {
            const ul = typeof plan.usage_limits === "string"
              ? (() => { try { return JSON.parse(plan.usage_limits); } catch { return {}; } })()
              : (plan.usage_limits || {});
            const limitKeys = [
              { key: 'max_workspaces', label: 'Workspaces' },
              { key: 'max_events', label: 'Events' },
              { key: 'max_experiences', label: 'Experiences' },
              { key: 'max_cinemas', label: 'Cinemas' },
              { key: 'max_cinema_screens', label: 'Cinema Screens' },
              { key: 'max_movies', label: 'Movies' },
              { key: 'max_products', label: 'Products' },
              { key: 'max_spaces', label: 'Spaces' },
              { key: 'max_venues', label: 'Venues' },
              { key: 'max_ticket_designs', label: 'Ticket Designs' },
              { key: 'max_badge_designs', label: 'Badge Designs' },
              { key: 'max_page_builders', label: 'Page Builders' },
              { key: 'max_invoices', label: 'Invoices' },
              { key: 'max_tasks', label: 'Tasks' },
              { key: 'max_custom_forms', label: 'Custom Forms' },
              { key: 'max_campaigns', label: 'Campaigns' },
              { key: 'max_gift_cards', label: 'Gift Cards' },
              { key: 'max_punch_cards', label: 'Punch Cards' },
              { key: 'max_customer_books', label: 'Books' },
              { key: 'max_rsvps', label: 'RSVPs' },
              { key: 'max_ticket_tiers_per_event', label: 'Ticket Tiers/Event' },
              { key: 'max_workspace_users', label: 'Users' },
              { key: 'max_event_staff', label: 'Event Staff' },
              { key: 'max_event_sections', label: 'Event Sections' },
              { key: 'max_event_vendors', label: 'Event Vendors' },
              { key: 'max_event_vouchers', label: 'Event Vouchers' },
              { key: 'max_event_stories', label: 'Event Stories' },
              { key: 'max_event_posts', label: 'Event Posts' },
              { key: 'max_contributors', label: 'Contributors' },
            ];
            return (
              <div className="bg-gray-50 dark:bg-[#1b1b1c] rounded-xl border border-gray-200 dark:border-[#333333] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Usage Limits & Rules</h2>
                  <button onClick={handleOpenEdit} className="text-xs text-[#f97316] hover:underline">Edit limits →</button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Structural Limits</h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {limitKeys.map(({ key, label }) => {
                        const val = ul[key];
                        const display = val === -1 || val === undefined ? "∞" : String(val ?? 0);
                        return (
                          <div key={key} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">{display}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide leading-tight">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Access & Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'has_studio_access', label: 'Studio Access' },
                        { key: 'can_invite_contributors', label: 'Invite Contributors' },
                        { key: 'can_link_modules', label: 'Link Modules' },
                      ].map(({ key, label }) => (
                        <span key={key} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${ul[key] ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white dark:bg-[#111111] text-muted-foreground border-gray-200 dark:border-[#333333]'}`}>
                          {ul[key] ? '✓' : '✗'} {label}
                        </span>
                      ))}
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                        Support: {ul.support_type || "standard"}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-violet-500/10 text-violet-400 border-violet-500/20">
                        Venue Design: {ul.venue_design_type || "basic"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Right Column: Organizer Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 dark:bg-[#1b1b1c] rounded-xl border border-gray-200 dark:border-[#333333] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Adoption Stats</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Active Subscribers</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeSubscribers || 0}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#f97316]" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.monthlyRecurringRevenue || 0, plan.currency || "USD")}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111]/50 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Subscribed Workspaces</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {stats?.subscriptions?.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">No active subscriptions.</div>
                ) : (
                  stats?.subscriptions?.map((sub: any) => (
                    <div key={sub.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-[#1b1b1c] border border-gray-200 dark:border-[#333333]">
                      <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{sub.workspace?.name || sub.organizer?.name || "Unknown Workspace"}</div>
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
