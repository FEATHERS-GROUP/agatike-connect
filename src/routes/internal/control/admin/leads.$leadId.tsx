import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef } from "react";
import { getAdminLeadById, updateAdminLeadProfile, sendEmailToLead } from "@/api/admin_leads";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Paperclip,
  File as FileIcon,
  X,
  Mail,
  Phone,
  Bookmark,
  MessageSquare,
  Facebook,
  Linkedin,
  MapPin,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/internal/control/admin/leads/$leadId")({
  component: LeadDetailsPage,
});

const STATUS_STAGES = ["new", "contacted", "qualified", "lost"];

function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "new": return "New";
    case "contacted": return "Contacted";
    case "qualified": return "Qualified";
    case "lost": return "Lost";
    default: return status;
  }
}

const EMAIL_TEMPLATES = [
  {
    label: "Starting Lead",
    subject: "Introduction - Agatike Connect",
    message: (name: string) => `Hi ${name},\n\nThanks for reaching out! We'd love to learn more about your needs and how Agatike Connect can help.\n\nCould we schedule a quick call?\n\nBest,\nSales Team`
  },
  {
    label: "Follow-up",
    subject: "Checking In - Agatike Connect",
    message: (name: string) => `Hi ${name},\n\nI just wanted to follow up and see if you had any further thoughts or questions since we last spoke.\n\nLet me know if you need any more information.\n\nBest,\nSales Team`
  },
  {
    label: "Closing Deal",
    subject: "Next Steps - Agatike Connect",
    message: (name: string) => `Hi ${name},\n\nWe're thrilled to move forward! Please review the agreement and let me know if you have any questions.\n\nBest,\nSales Team`
  }
];

function LeadDetailsPage() {
  const { leadId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["admin_lead", leadId],
    queryFn: () => getAdminLeadById({ data: { id: leadId } }),
  });

  const [activeTab, setActiveTab] = useState("activity");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editDetailsForm, setEditDetailsForm] = useState<any>({});

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailFrom, setEmailFrom] = useState("sales@agatike.rw");
  const [attachments, setAttachments] = useState<{ filename: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill CC if available
  React.useEffect(() => {
    if (lead?.customer_profile?.cc_emails && !emailCc) {
      setEmailCc(lead.customer_profile.cc_emails);
    }
  }, [lead?.customer_profile?.cc_emails]);

  const updateProfileMutation = useMutation({
    mutationFn: (vars: any) => updateAdminLeadProfile({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_lead", leadId] });
    },
    onError: (e: any) => alert(`Error updating profile: ${e.message}`),
  });

  const sendEmailMutation = useMutation({
    mutationFn: (vars: any) => sendEmailToLead({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_lead", leadId] });
      setEmailSubject("");
      setEmailMessage("");
      setAttachments([]);
    },
    onError: (e: any) => alert(`Error sending email: ${e.message}`),
  });

  const handleStatusChange = (newStatus: string) => {
    if (!lead || lead.status === newStatus) return;
    updateProfileMutation.mutate({
      id: leadId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: newStatus,
      profile: lead.customer_profile || {}
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!lead) return;
    if (e.key === "Enter" && newTagInput.trim()) {
      const currentTags = lead.customer_profile?.tags || [];
      if (!currentTags.includes(newTagInput.trim())) {
        const updatedTags = [...currentTags, newTagInput.trim()];
        updateProfileMutation.mutate({
          id: leadId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: lead.status,
          profile: { ...(lead.customer_profile || {}), tags: updatedTags }
        });
      }
      setNewTagInput("");
      setIsAddingTag(false);
    } else if (e.key === "Escape") {
      setIsAddingTag(false);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!lead) return;
    const currentTags = lead.customer_profile?.tags || [];
    const updatedTags = currentTags.filter((t: string) => t !== tagToRemove);
    updateProfileMutation.mutate({
      id: leadId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
      profile: { ...(lead.customer_profile || {}), tags: updatedTags }
    });
  };

  const handleEditDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    updateProfileMutation.mutate({
      id: leadId,
      name: editDetailsForm.name,
      email: editDetailsForm.email,
      phone: editDetailsForm.phone,
      company: editDetailsForm.company,
      status: lead.status,
      profile: { 
        ...(lead.customer_profile || {}),
        country: editDetailsForm.country,
        language: editDetailsForm.language,
        cc_emails: editDetailsForm.cc_emails,
        job_title: editDetailsForm.job_title,
      }
    });
    setIsEditingDetails(false);
  };

  const startEditingDetails = () => {
    if (!lead) return;
    setEditDetailsForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      country: lead.customer_profile?.country || lead.country || "",
      language: lead.customer_profile?.language || lead.language || "",
      cc_emails: lead.customer_profile?.cc_emails || "",
      job_title: lead.customer_profile?.job_title || ""
    });
    setIsEditingDetails(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachments(prev => [...prev, { filename: file.name, content: base64String }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate({
      leadId,
      subject: emailSubject,
      message: emailMessage,
      attachments,
      cc: emailCc,
      from_email: emailFrom
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-[#f97316] h-8 w-8" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        Lead not found.
        <button onClick={() => navigate({ to: '/internal/control/admin/leads' })} className="mt-4 text-[#f97316] underline">
          Go back to Leads
        </button>
      </div>
    );
  }

  const communications = lead.customer_profile?.communications || [];
  const initialMessage = lead.message ? [{
    id: "initial",
    type: "received",
    subject: "Initial Contact",
    message: lead.message,
    date: lead.created_at,
    hasAttachments: false
  }] : [];

  const allCommunications = [...initialMessage, ...communications].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Tags
  const tags = lead.customer_profile?.tags || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] text-gray-700 dark:text-[#ccc] overflow-y-auto">
      <div className="p-4 sm:p-6 w-full space-y-6">
        
        {/* Navigation */}
        <button
          onClick={() => navigate({ to: '/internal/control/admin/leads' })}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#aaa] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to leads
        </button>

        {/* Header Snapshot Card */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
          {/* Top Section: Identity & Actions */}
          <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-[#222]">
                <img 
                  src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lead.email)}&backgroundColor=10b981,f97316,3b82f6`} 
                  alt={lead.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-[#888] mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {lead.country || "Unknown Location"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {lead.phone || "No phone"}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Middle Section: Attributes Grid */}
          <div className="px-6 py-4 border-t border-b border-gray-100 dark:border-[#222] grid grid-cols-2 md:grid-cols-6 gap-6 bg-gray-50/50 dark:bg-[#161616]/50">
            <div>
              <div className="text-[11px] font-medium text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1">Company</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.company || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1">Emails</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#eee] truncate max-w-[150px]" title={lead.email}>{lead.email}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1">Sales Owner</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#eee]">Agatike Team</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1">Created At</div>
              <div className="text-sm font-medium text-gray-900 dark:text-[#eee]">{format(new Date(lead.created_at), "dd-MM-yyyy")}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] font-medium text-gray-500 dark:text-[#888] uppercase tracking-wider mb-1">Tags</div>
              <div className="flex gap-2 flex-wrap items-center h-6">
                {tags.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] font-semibold text-[10px] uppercase rounded-md flex items-center gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                {isAddingTag ? (
                  <input
                    type="text"
                    autoFocus
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onBlur={() => {
                      setIsAddingTag(false);
                      setNewTagInput("");
                    }}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag & Enter..."
                    className="text-[10px] px-2 py-0.5 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded-md outline-none focus:border-[#f97316] text-gray-900 dark:text-white w-28"
                  />
                ) : (
                  <button 
                    onClick={() => setIsAddingTag(true)} 
                    className="text-[11px] font-medium text-gray-400 hover:text-[#f97316] px-1"
                  >
                    + Add Tag
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Lifecycle Pipeline */}
          <div className="p-4 md:px-6 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white">Leads Details</div>
            
            <div className="flex items-center gap-1 w-full md:w-auto">
              <div className="text-sm text-gray-500 dark:text-[#888] mr-3">Lifecycle stage:</div>
              <div className="flex items-center flex-1 md:flex-initial h-9 bg-gray-100 dark:bg-[#222] rounded-lg p-1 overflow-hidden relative">
                {STATUS_STAGES.map((s, idx) => {
                  const isActive = lead.status === s;
                  const currentIndex = STATUS_STAGES.indexOf(lead.status);
                  const isPassed = STATUS_STAGES.indexOf(s) < currentIndex;
                  
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updateProfileMutation.isPending}
                      className={`
                        relative px-4 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center flex-1 transition-all
                        ${isActive 
                          ? 'bg-[#f97316] text-white shadow-sm z-10' 
                          : isPassed 
                            ? 'bg-[#f97316]/20 text-[#f97316] hover:bg-[#f97316]/30' 
                            : 'text-gray-500 dark:text-[#888] hover:bg-gray-200 dark:hover:bg-[#333]'
                        }
                      `}
                    >
                      {(isActive || isPassed) && <CheckCircle2 className={`h-3.5 w-3.5 mr-1.5 ${isActive ? 'text-white' : 'text-[#f97316]'}`} />}
                      {getStatusLabel(s)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN: Activity & Emails (65%) */}
          <div className="flex-1 w-full lg:w-[65%] space-y-4">
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#333]">
              <button 
                onClick={() => setActiveTab("activity")}
                className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "activity" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare className="h-4 w-4" /> Activity Timeline
              </button>
              <button 
                onClick={() => setActiveTab("notes")}
                className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "notes" ? "border-[#f97316] text-[#f97316]" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <FileIcon className="h-4 w-4" /> Internal Notes
              </button>
            </div>

            {activeTab === "activity" && (
              <div className="space-y-6">
                
                {/* Email Timeline */}
                <div className="space-y-4">
                  {allCommunications.length === 0 ? (
                    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl p-8 text-center text-gray-500 text-sm">
                      No communications recorded yet.
                    </div>
                  ) : (
                    allCommunications.map((msg: any) => (
                      <div key={msg.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
                        <div className={`px-5 py-3 border-b flex items-center justify-between ${
                          msg.type === 'sent' 
                            ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20' 
                            : 'bg-gray-50/50 dark:bg-[#161616] border-gray-100 dark:border-[#222]'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-[#333] overflow-hidden flex items-center justify-center shrink-0">
                              {msg.type === 'sent' ? (
                                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=AgatikeTeam`} alt="Team" className="h-full w-full object-cover" />
                              ) : (
                                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lead.email)}&backgroundColor=10b981`} alt={lead.name} className="h-full w-full object-cover" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {msg.type === 'sent' ? 'Agatike Team' : lead.name}
                                <span className="text-xs font-normal text-gray-500 dark:text-[#888]">
                                  {msg.type === 'sent' ? `to ${lead.email}` : `from ${lead.email}`}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-[#888]">
                                {format(new Date(msg.date), "MMM d, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#333] text-gray-500 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          {msg.subject && <div className="text-sm font-bold text-gray-900 dark:text-white mb-3 pb-3 border-b border-gray-100 dark:border-[#222]">{msg.subject}</div>}
                          <div className="text-sm text-gray-800 dark:text-[#ccc] whitespace-pre-wrap font-sans leading-relaxed">
                            {msg.message}
                          </div>
                          
                          {msg.hasAttachments && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#222] flex items-center gap-2 text-xs text-gray-600 dark:text-[#aaa]">
                              <Paperclip className="h-3.5 w-3.5" /> Contains attachments
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Email Composer */}
                <div className="bg-white dark:bg-[#111] border border-[#f97316]/30 dark:border-[#f97316]/20 rounded-xl overflow-hidden shadow-sm relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]"></div>
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-[#222] bg-orange-50/30 dark:bg-orange-900/10 text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-[#f97316]" /> Reply to {lead.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-normal">
                      <span className="text-gray-500">From:</span>
                      <select 
                        value={emailFrom}
                        onChange={e => setEmailFrom(e.target.value)}
                        className="bg-transparent border border-gray-200 dark:border-[#333] rounded px-2 py-1 outline-none focus:border-[#f97316] text-gray-700 dark:text-[#ccc]"
                      >
                        <option value="sales@agatike.rw">sales@agatike.rw</option>
                        <option value="hello@agatike.rw">hello@agatike.rw</option>
                      </select>
                    </div>
                  </div>
                  <form onSubmit={handleSendEmail} className="flex flex-col">
                    <div className="flex border-b border-gray-100 dark:border-[#222] items-center px-5 py-3 gap-2 overflow-x-auto">
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Templates:</span>
                      {EMAIL_TEMPLATES.map(t => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => {
                            setEmailSubject(t.subject);
                            setEmailMessage(t.message(lead.name || 'there'));
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] rounded-full text-gray-700 dark:text-[#ccc] transition-colors whitespace-nowrap"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex border-b border-gray-100 dark:border-[#222] items-center px-5 py-3 text-sm">
                      <span className="text-gray-500 font-medium mr-2 w-16">To:</span>
                      <span className="text-gray-900 dark:text-white">{lead.email}</span>
                    </div>
                    <div className="flex border-b border-gray-100 dark:border-[#222] items-center px-5 py-2 text-sm">
                      <span className="text-gray-500 font-medium mr-2 w-16">Cc:</span>
                      <input
                        type="text"
                        placeholder="Comma separated emails"
                        value={emailCc}
                        onChange={e => setEmailCc(e.target.value)}
                        className="w-full bg-transparent text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                    <div className="flex border-b border-gray-100 dark:border-[#222] items-center px-5 py-2 text-sm">
                      <span className="text-gray-500 font-medium mr-2 w-16">Subject:</span>
                      <input
                        required
                        type="text"
                        placeholder="Email subject"
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        className="w-full bg-transparent text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                    <textarea
                      required
                      rows={5}
                      placeholder="Type your message here..."
                      value={emailMessage}
                      onChange={e => setEmailMessage(e.target.value)}
                      className="w-full bg-transparent border-none px-5 py-4 text-sm text-gray-900 dark:text-white outline-none resize-y min-h-[120px]"
                    />
                    
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 px-5 pb-3">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-[#222] px-3 py-1.5 rounded-full text-xs text-gray-700 dark:text-[#aaa]">
                            <FileIcon className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{file.filename}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="hover:text-red-500">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-[#161616]/50 border-t border-gray-100 dark:border-[#222] flex justify-between items-center">
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-[#333] rounded-full transition-colors flex items-center gap-2 text-xs font-medium"
                      >
                        <Paperclip className="h-4 w-4" /> Attach Files
                      </button>
                      <button
                        type="submit"
                        disabled={sendEmailMutation.isPending || !emailSubject || !emailMessage}
                        className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {sendEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

            {activeTab === "notes" && (
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl p-6 shadow-sm min-h-[400px]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Internal Profile Notes</h3>
                <textarea 
                  className="w-full h-[300px] p-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-[#f97316] resize-none"
                  placeholder="Record internal profiling details, tracking info, and background context here..."
                  defaultValue={lead.customer_profile?.profileNotes}
                  onBlur={(e) => {
                    if (e.target.value !== lead.customer_profile?.profileNotes) {
                      updateProfileMutation.mutate({
                        id: leadId,
                        name: lead.name,
                        email: lead.email,
                        status: lead.status,
                        profile: { ...(lead.customer_profile || {}), profileNotes: e.target.value }
                      });
                    }
                  }}
                />
                {updateProfileMutation.isPending && <div className="text-xs text-[#f97316] mt-2 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Saving...</div>}
              </div>
            )}
          </div>
          
          {/* RIGHT COLUMN: Details & Widgets (35%) */}
          <div className="w-full lg:w-[35%] space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[#222] bg-gray-50/50 dark:bg-[#161616]/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Contact Details</h3>
                {!isEditingDetails && (
                  <button onClick={startEditingDetails} className="text-xs font-medium text-[#f97316] hover:underline">
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingDetails ? (
                <form onSubmit={handleEditDetailsSubmit} className="p-5 space-y-3 bg-gray-50/30 dark:bg-[#161616]/30">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label>
                    <input required value={editDetailsForm.name} onChange={e => setEditDetailsForm({...editDetailsForm, name: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input required type="email" value={editDetailsForm.email} onChange={e => setEditDetailsForm({...editDetailsForm, email: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input value={editDetailsForm.phone} onChange={e => setEditDetailsForm({...editDetailsForm, phone: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Company</label>
                    <input value={editDetailsForm.company} onChange={e => setEditDetailsForm({...editDetailsForm, company: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Title</label>
                    <input value={editDetailsForm.job_title} onChange={e => setEditDetailsForm({...editDetailsForm, job_title: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Country</label>
                    <input value={editDetailsForm.country} onChange={e => setEditDetailsForm({...editDetailsForm, country: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Language</label>
                    <input value={editDetailsForm.language} onChange={e => setEditDetailsForm({...editDetailsForm, language: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CC Emails (comma separated)</label>
                    <input value={editDetailsForm.cc_emails} onChange={e => setEditDetailsForm({...editDetailsForm, cc_emails: e.target.value})} className="w-full border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] rounded px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none" placeholder="e.g. colleague@example.com" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditingDetails(false)} className="px-3 py-1.5 text-xs text-gray-600 dark:text-[#aaa] hover:bg-gray-200 dark:hover:bg-[#333] rounded">Cancel</button>
                    <button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#f97316] text-white rounded hover:bg-[#ea580c]">
                      {updateProfileMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#222] border-dashed">
                    <span className="text-xs text-gray-500 dark:text-[#888]">Email Address</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#222] border-dashed">
                    <span className="text-xs text-gray-500 dark:text-[#888]">CC Emails</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.customer_profile?.cc_emails || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#222] border-dashed">
                    <span className="text-xs text-gray-500 dark:text-[#888]">Phone Number</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#222] border-dashed">
                    <span className="text-xs text-gray-500 dark:text-[#888]">Country</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.customer_profile?.country || lead.country || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#222] border-dashed">
                    <span className="text-xs text-gray-500 dark:text-[#888]">Language</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.customer_profile?.language || lead.language || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-[#222] border-dashed">
                    <span className="text-xs text-gray-500 dark:text-[#888]">Job Title</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#eee]">{lead.customer_profile?.job_title || "—"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[#222] bg-gray-50/50 dark:bg-[#161616]/50">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="p-2 flex flex-col">
                <button className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Enroll in Sequence</div>
                      <div className="text-xs text-gray-500 dark:text-[#888]">Add to automated sales follow-ups</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#f97316] transition-colors" />
                </button>
                <button className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Log a Call</div>
                      <div className="text-xs text-gray-500 dark:text-[#888]">Record offline conversation</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#f97316] transition-colors" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
