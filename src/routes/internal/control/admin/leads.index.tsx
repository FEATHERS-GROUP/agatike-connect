import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAdminLeads, deleteAdminLead, createAdminLead } from "@/api/admin_leads";
import type { Lead } from "@/api/admin_leads";
import {
  Users,
  Mail,
  Phone,
  Building2,
  Trash2,
  Edit,
  X,
  Loader2,
  Save,
  Plus,
  Search,
  Tag,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/internal/control/admin/leads/")({
  component: AdminLeadsPage,
});

function AdminLeadsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("leads");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin_leads"],
    queryFn: () => getAdminLeads(),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string }) => deleteAdminLead({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_leads"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "contacted":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "qualified":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "lost":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#ccc] border-gray-300 dark:border-[#444]";
    }
  };

  const filteredLeads = leads?.filter(lead => {
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.company || "").toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] text-gray-700 dark:text-[#ccc]">
      <div className="p-6 border-b border-gray-200 dark:border-[#333] shrink-0 bg-gray-50 dark:bg-[#161616] flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#f97316]" />
            Inbound Leads
          </h1>
          <p className="text-[12px] text-gray-500 dark:text-[#888] mt-1">
            Review and manage inbound contact and pricing plan requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-lg outline-none focus:border-[#f97316] text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ea580c] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Lead
          </button>
        </div>
      </div>

      <div className="flex gap-6 px-6 pt-4 border-b border-gray-200 dark:border-[#333] shrink-0">
        <button 
          onClick={() => setActiveTab("leads")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "leads" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          All Leads
        </button>
        <button 
          onClick={() => setActiveTab("profiles")}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "profiles" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Customer Profiles
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "leads" ? (
          <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#333] text-gray-500 dark:text-[#888] uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lead Contact</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Tags</th>
                  <th className="px-4 py-3 font-semibold">Created / Updated</th>
                  <th className="px-4 py-3 font-semibold">Creator</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a2a]">
                {filteredLeads?.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate({ to: '/internal/control/admin/leads/$leadId', params: { leadId: lead.id } })}
                    className="hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors cursor-pointer group"
                  >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-[#f97316] transition-colors flex items-center gap-2">
                      {lead.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-[#888] flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="text-xs text-gray-500 dark:text-[#888] flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-[#aaa] w-48">
                    {lead.company && (
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white truncate">
                        <Building2 className="h-3 w-3 text-gray-500 dark:text-[#666]" />{" "}
                        {lead.company}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-[#888] mt-1">
                      {lead.country || "—"} • {lead.language || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 w-48">
                    <div className="flex flex-wrap gap-1">
                      {lead.customer_profile?.tags?.slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#ccc] text-[10px] rounded-md uppercase font-semibold">
                          {tag}
                        </span>
                      ))}
                      {lead.customer_profile?.tags?.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#222] text-gray-500 text-[10px] rounded-md">
                          +{lead.customer_profile.tags.length - 2}
                        </span>
                      )}
                      {(!lead.customer_profile?.tags || lead.customer_profile.tags.length === 0) && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-[#888] text-xs w-32">
                    <div>{format(new Date(lead.created_at), "MMM d, yyyy")}</div>
                    <div className="text-[10px] mt-0.5 text-gray-400">Upd: {format(new Date(lead.updated_at), "MMM d, yyyy")}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888]">
                    {lead.message ? "Inbound" : "Admin"}
                  </td>
                  <td className="px-4 py-3 w-32">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right w-24">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this lead permanently?"))
                            deleteMutation.mutate({ id: lead.id });
                        }}
                        className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#f97316] transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500 dark:text-[#666]">
                    No leads found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLeads?.map(lead => (
              <div 
                key={lead.id}
                onClick={() => navigate({ to: '/internal/control/admin/leads/$leadId', params: { leadId: lead.id } })}
                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center group relative"
              >
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-bold uppercase border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-[#222] mb-3">
                  <img 
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lead.email)}&backgroundColor=f97316`} 
                    alt={lead.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#f97316] transition-colors line-clamp-1">{lead.name}</h3>
                <div className="text-xs text-gray-500 dark:text-[#888] mt-1 line-clamp-1">{lead.email}</div>
                {lead.company && <div className="text-xs font-medium text-gray-700 dark:text-[#ccc] mt-2 line-clamp-1"><Building2 className="h-3 w-3 inline mr-1" />{lead.company}</div>}
                
                <div className="mt-4 flex flex-wrap justify-center gap-1 w-full">
                  {lead.customer_profile?.tags?.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-[#aaa] text-[9px] rounded uppercase font-semibold">
                      {tag}
                    </span>
                  ))}
                  {(!lead.customer_profile?.tags || lead.customer_profile.tags.length === 0) && (
                    <span className="text-xs text-gray-400 italic">No tags</span>
                  )}
                </div>
              </div>
            ))}
            {filteredLeads?.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-500 dark:text-[#666]">
                No profiles found matching your search.
              </div>
            )}
          </div>
        )}
      </div>

      {isCreateModalOpen && <CreateLeadModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}

function CreateLeadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    notes: ""
  });

  const mutation = useMutation({
    mutationFn: (vars: any) => createAdminLead({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_leads"] });
      onClose();
    },
    onError: (e: any) => alert(`Error creating lead: ${e.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#111] shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Lead</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Full Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Email Address *</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Company</label>
              <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Initial Notes</label>
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none resize-none" placeholder="Add any background context..." />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-[#333] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#aaa] hover:bg-gray-200 dark:bg-[#333] rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded transition-colors flex items-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
