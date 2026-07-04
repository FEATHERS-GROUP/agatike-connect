import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAdminLeads, updateAdminLeadStatus, deleteAdminLead } from "@/api/admin_leads";
import type { Lead } from "@/api/admin_leads";
import { Users, Mail, Phone, Building2, Trash2, Edit, X, Loader2, MessageSquare, Save } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/internal/control/admin/leads")({
  component: AdminLeadsPage,
});

function AdminLeadsPage() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
      case "new": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "contacted": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "qualified": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "lost": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#ccc] border-gray-300 dark:border-[#444]";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#f97316]" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] text-gray-700 dark:text-[#ccc]">
      <div className="p-6 border-b border-gray-200 dark:border-[#333] shrink-0 bg-gray-50 dark:bg-[#161616]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#f97316]" />
          Inbound Leads
        </h1>
        <p className="text-[12px] text-gray-500 dark:text-[#888] mt-1">Review and manage inbound contact and pricing plan requests.</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#333] text-gray-500 dark:text-[#888] uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Lead Contact</th>
                <th className="px-4 py-3 font-semibold">Company / Country</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a2a]">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                    <div className="text-xs text-gray-500 dark:text-[#888] flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="text-xs text-gray-500 dark:text-[#888] flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-[#aaa]">
                    {lead.company && <div className="flex items-center gap-1 text-gray-900 dark:text-white"><Building2 className="h-3 w-3 text-gray-500 dark:text-[#666]" /> {lead.company}</div>}
                    <div className="text-xs text-gray-500 dark:text-[#888] mt-1">{lead.country || "—"} • {lead.language || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-[#888] text-xs">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedLead(lead)} 
                        className="p-1.5 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:bg-[#333] rounded transition-colors"
                        title="View & Edit Lead"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Delete this lead permanently?")) deleteMutation.mutate({ id: lead.id }) }}
                        className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500 dark:text-[#666]">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: string; notes?: string }) => updateAdminLeadStatus({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_leads"] });
      onClose();
    },
    onError: (e: any) => alert(`Error saving lead: ${e.message}`)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ id: lead.id, status, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#111] shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lead Details</h2>
          <button onClick={onClose} className="p-1 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 grid grid-cols-2 gap-6 border-b border-gray-200 dark:border-[#333]">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1">Contact</div>
              <div className="text-gray-900 dark:text-white font-medium">{lead.name}</div>
              <div className="text-sm text-gray-600 dark:text-[#aaa]">{lead.email}</div>
              {lead.phone && <div className="text-sm text-gray-600 dark:text-[#aaa]">{lead.phone}</div>}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1">Company Info</div>
              <div className="text-gray-900 dark:text-white font-medium">{lead.company || "—"}</div>
              <div className="text-sm text-gray-600 dark:text-[#aaa]">{lead.country || "—"} • {lead.language || "—"}</div>
            </div>
          </div>

          <div className="p-5 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#111]">
            <div className="text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-2 flex items-center gap-1"><MessageSquare className="h-3 w-3"/> Message from Lead</div>
            <div className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded p-4 text-sm text-gray-900 dark:text-[#ddd] whitespace-pre-wrap">
              {lead.message || <span className="text-gray-500 dark:text-[#666] italic">No message provided.</span>}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#888] uppercase mb-1.5">Internal Notes</label>
              <textarea 
                rows={4}
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add private notes about this lead..."
                className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none resize-none" 
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#aaa] hover:bg-gray-200 dark:bg-[#333] rounded transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium rounded transition-colors flex items-center gap-2">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
