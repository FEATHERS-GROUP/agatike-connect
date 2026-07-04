import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentProviderFeesAdmin, updatePaymentProviderFeeAdmin, createPaymentProviderFeeAdmin } from "@/api/admin_finance";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import { Loader2, Edit2, Save, X, Plus, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/providers")({
  component: AdminProviderFeesPage,
});

function AdminProviderFeesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["admin-provider-fees"],
    queryFn: () => getPaymentProviderFeesAdmin(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Record<string, any> }) => updatePaymentProviderFeeAdmin({ data }),
    onSuccess: () => {
      toast.success("Provider fee updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-provider-fees"] });
      setEditingProvider(null);
    },
    onError: (e) => toast.error(e.message || "Failed to update provider fee"),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createPaymentProviderFeeAdmin({ data }),
    onSuccess: () => {
      toast.success("Provider created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-provider-fees"] });
      setIsCreateModalOpen(false);
    },
    onError: (e) => toast.error(e.message || "Failed to create provider"),
  });

  const handleOpenEdit = (fee: any) => {
    let rules = fee.tiered_rules;
    if (typeof rules === "string" && rules) {
      try { rules = JSON.parse(rules); } catch(e) {}
    }
    setFormState({
      ...fee,
      tiered_rules: typeof rules === "object" ? JSON.stringify(rules, null, 2) : rules || ""
    });
    setEditingProvider(fee);
  };

  const handleOpenCreate = () => {
    setFormState({
      network: "",
      country_code: "RWA",
      category: "mobile",
      collection_percentage: 0,
      collection_fixed_fee: 0,
      disbursement_percentage: 0,
      disbursement_fixed_fee: 0,
      is_tiered: "false",
      tiered_rules: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updates = { ...formState };
    delete updates.id;
    delete updates.updated_at;
    
    if (updates.is_tiered === "true" || updates.is_tiered === true) {
      updates.is_tiered = true;
      try {
        if (updates.tiered_rules) updates.tiered_rules = JSON.parse(updates.tiered_rules);
      } catch (e) {
        toast.error("Invalid JSON in Tiered Rules");
        return;
      }
    } else {
      updates.is_tiered = false;
      updates.tiered_rules = null;
    }

    const numericFields = ['collection_percentage', 'collection_fixed_fee', 'disbursement_percentage', 'disbursement_fixed_fee'];
    for (const field of numericFields) {
      if (updates[field] !== undefined) updates[field] = Number(updates[field]);
    }

    updateMutation.mutate({ id: editingProvider.id, updates });
  };

  const handleSaveCreate = () => {
    const data = { ...formState };
    if (data.is_tiered === "true" || data.is_tiered === true) {
      data.is_tiered = true;
      try {
        if (data.tiered_rules) data.tiered_rules = JSON.parse(data.tiered_rules);
      } catch (e) {
        toast.error("Invalid JSON in Tiered Rules");
        return;
      }
    } else {
      data.is_tiered = false;
      data.tiered_rules = null;
    }

    createMutation.mutate(data);
  };

  // Derived state for filters
  const uniqueCountries = useMemo(() => Array.from(new Set(fees.map((f: any) => f.country_code).filter(Boolean))).sort(), [fees]);
  const uniqueCategories = useMemo(() => Array.from(new Set(fees.map((f: any) => f.category).filter(Boolean))).sort(), [fees]);

  const filteredFees = useMemo(() => {
    return fees.filter((f: any) => {
      const matchesSearch = 
        f.network?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.country_code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = countryFilter === "all" || f.country_code === countryFilter;
      const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
      return matchesSearch && matchesCountry && matchesCategory;
    }).sort((a: any, b: any) => {
      if (a.country_code !== b.country_code) return a.country_code?.localeCompare(b.country_code);
      return a.network?.localeCompare(b.network);
    });
  }, [fees, searchQuery, countryFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredFees.length / ITEMS_PER_PAGE);
  const paginatedFees = filteredFees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Provider Fees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage payment provider rates, categories, and tiered rules.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Provider
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search network or country..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white w-full sm:w-64 focus:outline-none focus:border-[#f97316]"
        />
        <select
          value={countryFilter}
          onChange={(e) => { setCountryFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white w-full sm:w-48 focus:outline-none focus:border-[#f97316]"
        >
          <option value="all">All Countries</option>
          {uniqueCountries.map((c: any) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white w-full sm:w-48 focus:outline-none focus:border-[#f97316]"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map((c: any) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-[#1b1b1c] rounded-xl border border-[#333333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-[#111111]/50 border-b border-[#333333]">
              <tr>
                <th className="px-6 py-4 font-medium">Network & Category</th>
                <th className="px-6 py-4 font-medium">Collection</th>
                <th className="px-6 py-4 font-medium">Disbursement</th>
                <th className="px-6 py-4 font-medium">Tiered</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {paginatedFees.map((fee: any) => (
                <tr key={fee.id} className="hover:bg-[#252526]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-white">{fee.network}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="font-mono bg-[#333333] text-[#cccccc] px-1.5 rounded">{fee.country_code}</span>
                      {fee.category && <span className="text-[#a1a1aa]">{fee.category.replace(/_/g, ' ')}</span>}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between w-32">
                        <span className="text-muted-foreground">Percentage:</span>
                        <span className="text-white font-medium">{fee.collection_percentage}%</span>
                      </div>
                      <div className="flex justify-between w-32">
                        <span className="text-muted-foreground">Fixed Fee:</span>
                        <span className="text-white font-medium">{fee.collection_fixed_fee}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between w-32">
                        <span className="text-muted-foreground">Percentage:</span>
                        <span className="text-white font-medium">{fee.disbursement_percentage}%</span>
                      </div>
                      <div className="flex justify-between w-32">
                        <span className="text-muted-foreground">Fixed Fee:</span>
                        <span className="text-white font-medium">{fee.disbursement_fixed_fee}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${fee.is_tiered ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-[#333333] text-muted-foreground border border-[#444]'}`}>
                      {fee.is_tiered ? "Tiered Rules Active" : "Fixed Rate"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleOpenEdit(fee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#111111] hover:bg-[#333333] border border-[#333333] text-white rounded-md transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              
              {paginatedFees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No provider fees match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFees.length)} of {filteredFees.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#1b1b1c] border border-[#333333] rounded-md text-sm text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[#1b1b1c] border border-[#333333] rounded-md text-sm text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#333333] bg-[#111111]">
              <h2 className="text-lg font-bold text-white">Provider Details: {editingProvider.network}</h2>
              <button onClick={() => setEditingProvider(null)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Network Name</label>
                  <input type="text" value={formState.network} onChange={e => setFormState({...formState, network: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Country Code</label>
                  <select value={formState.country_code} onChange={e => setFormState({...formState, country_code: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select value={formState.category || "mobile"} onChange={e => setFormState({...formState, category: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="mobile">Mobile Money</option>
                    <option value="card">Card</option>
                    <option value="bitcoin">Bitcoin / Crypto</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 bg-[#111111] rounded-lg border border-[#333333]">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Collections</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Percentage Fee (%)</label>
                    <input type="number" step="0.01" value={formState.collection_percentage} onChange={e => setFormState({...formState, collection_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Fixed Fee</label>
                    <input type="number" step="0.01" value={formState.collection_fixed_fee} onChange={e => setFormState({...formState, collection_fixed_fee: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Disbursements</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Percentage Fee (%)</label>
                    <input type="number" step="0.01" value={formState.disbursement_percentage} onChange={e => setFormState({...formState, disbursement_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Fixed Fee</label>
                    <input type="number" step="0.01" value={formState.disbursement_fixed_fee} onChange={e => setFormState({...formState, disbursement_fixed_fee: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Tiered Rules</label>
                  <select
                    value={formState.is_tiered ? "true" : "false"}
                    onChange={(e) => setFormState({...formState, is_tiered: e.target.value})}
                    className="bg-[#111111] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  >
                    <option value="false">Disabled (Fixed Rate Only)</option>
                    <option value="true">Enabled (Use Tiered JSON)</option>
                  </select>
                </div>
                
                {(formState.is_tiered === true || formState.is_tiered === "true") && (
                  <textarea
                    value={formState.tiered_rules}
                    onChange={(e) => setFormState({...formState, tiered_rules: e.target.value})}
                    className="w-full h-48 bg-[#111111] border border-[#333333] rounded-lg p-3 text-xs font-mono text-blue-400 focus:outline-none focus:border-[#f97316]"
                    placeholder='{"disbursement": [{"max": 500, "fixed": 0, "pct": 1}], "collection": []}'
                  />
                )}
              </div>

            </div>
            <div className="p-4 border-t border-[#333333] bg-[#111111] flex justify-end gap-3">
              <button onClick={() => setEditingProvider(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
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
          <div className="bg-[#1b1b1c] border border-[#333333] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#333333] bg-[#111111]">
              <h2 className="text-lg font-bold text-white">Add New Provider</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Network Name</label>
                  <input type="text" value={formState.network} onChange={e => setFormState({...formState, network: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. MTN" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Country Code</label>
                  <select value={formState.country_code} onChange={e => setFormState({...formState, country_code: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select value={formState.category || "mobile"} onChange={e => setFormState({...formState, category: e.target.value})} className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="mobile">Mobile Money</option>
                    <option value="card">Card</option>
                    <option value="bitcoin">Bitcoin / Crypto</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 bg-[#111111] rounded-lg border border-[#333333]">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Collections</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Percentage Fee (%)</label>
                    <input type="number" step="0.01" value={formState.collection_percentage} onChange={e => setFormState({...formState, collection_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Fixed Fee</label>
                    <input type="number" step="0.01" value={formState.collection_fixed_fee} onChange={e => setFormState({...formState, collection_fixed_fee: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white border-b border-[#333333] pb-2">Disbursements</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Percentage Fee (%)</label>
                    <input type="number" step="0.01" value={formState.disbursement_percentage} onChange={e => setFormState({...formState, disbursement_percentage: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Fixed Fee</label>
                    <input type="number" step="0.01" value={formState.disbursement_fixed_fee} onChange={e => setFormState({...formState, disbursement_fixed_fee: e.target.value})} className="w-full bg-[#1b1b1c] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Tiered Rules</label>
                  <select
                    value={formState.is_tiered}
                    onChange={(e) => setFormState({...formState, is_tiered: e.target.value})}
                    className="bg-[#111111] border border-[#333333] rounded px-3 py-1.5 text-xs text-white"
                  >
                    <option value="false">Disabled (Fixed Rate Only)</option>
                    <option value="true">Enabled (Use Tiered JSON)</option>
                  </select>
                </div>
                
                {(formState.is_tiered === true || formState.is_tiered === "true") && (
                  <textarea
                    value={formState.tiered_rules}
                    onChange={(e) => setFormState({...formState, tiered_rules: e.target.value})}
                    className="w-full h-48 bg-[#111111] border border-[#333333] rounded-lg p-3 text-xs font-mono text-blue-400 focus:outline-none focus:border-[#f97316]"
                    placeholder='{"disbursement": [{"max": 500, "fixed": 0, "pct": 1}], "collection": []}'
                  />
                )}
              </div>

            </div>
            <div className="p-4 border-t border-[#333333] bg-[#111111] flex justify-end gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveCreate} disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <Save className="h-4 w-4" /> Create Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
