import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTicketWithComments,
  addAdminComment,
  getAdminUsers,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
} from "@/api/support";
import type { SupportTicketComment, TicketStatus, TicketPriority } from "@/api/support";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  History,
  Info,
  ShieldCheck,
  Loader2,
  CreditCard,
  RefreshCw,
  Send,
  UserCheck,
  Wrench,
  PauseCircle,
  MinusCircle,
  Code2,
} from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/support/$ticketId")({
  component: AdminTicketDetailPage,
});

const CATEGORY_LABELS: Record<string, string> = {
  billing: "Billing",
  subscription: "Subscription",
  payment: "Payment",
  event: "Event",
  model_issue: "Model Issue",
  request: "Request",
  bug: "Bug",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  billing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  subscription: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  payment: "bg-green-500/20 text-green-400 border-green-500/30",
  event: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  model_issue: "bg-red-500/20 text-red-400 border-red-500/30",
  request: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  bug: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  other: "bg-[#333]/60 text-[#999] border-[#444]",
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  open: { label: "Open", icon: AlertCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  troubleshooting: { label: "Troubleshooting", icon: Wrench, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  pending_customer_response: { label: "Waiting on Customer", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  on_hold: { label: "On Hold", icon: PauseCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  suspended: { label: "Suspended", icon: MinusCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  under_development: { label: "Under Development", icon: Code2, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  closed: { label: "Closed", icon: XCircle, color: "text-[#888]", bg: "bg-[#222] border-[#333]" },
};

function AdminTicketDetailPage() {
  const { ticketId } = Route.useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [reply, setReply] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ["admin-ticket-detail", ticketId],
    queryFn: () => getAdminTicketWithComments({ data: { ticketId } }),
    refetchInterval: 15000,
  });

  const { data: adminUsers = [] } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => getAdminUsers(),
  });

  const assignMutation = useMutation({
    mutationFn: (adminUserId: string | null) => assignTicket({ data: { ticketId, adminUserId } }),
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] }); },
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => updateTicketStatus({ data: { ticketId, status } }),
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] }); },
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: TicketPriority) => updateTicketPriority({ data: { ticketId, priority } }),
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] }); },
  });

  const replyMutation = useMutation({
    mutationFn: () => addAdminComment({ data: { ticketId, body: reply } }),
    onSuccess: () => {
      setReply("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  useEffect(() => {
    if (ticket?.comments?.length) commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.comments?.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-[#888]">
        Ticket not found.
        <br />
        <Link to="/internal/control/admin/support" className="text-[#f97316] hover:underline mt-4 inline-block">
          Return to Support
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-y-auto p-6 font-sans">
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-5">
        
        {/* ── BACK BUTTON ── */}
        <button 
          onClick={() => router.history.back()}
          className="flex items-center gap-2 text-[#888] hover:text-white transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </button>

        {/* ── CRM HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 rounded-xl border border-[#333] bg-[#161616] shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other}`}>
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider">Ticket</span>
                <span className="text-[11px] font-mono text-[#888] bg-[#222] px-1.5 py-0.5 rounded border border-[#333]">#{ticket.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight text-white">{ticket.subject}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium text-sm shadow-sm ${statusCfg.bg} ${statusCfg.color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusCfg.label}
            </div>
            <button onClick={() => refetch()} className="p-2 bg-[#222] border border-[#333] shadow-sm rounded-md hover:bg-[#333] transition-colors text-[#ccc]" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ── LEFT: MAIN TIMELINE & PUBLISHER ── */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* Publisher Box */}
            <div className="rounded-xl border border-[#333] bg-[#161616] shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-[#f97316] transition-all">
              <div className="bg-[#1a1a1a] px-4 py-2.5 border-b border-[#333] text-xs font-bold text-[#888] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Post an Update
              </div>
              <div className="p-0">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply to the organizer here..."
                  rows={4}
                  className="w-full bg-transparent p-4 text-sm outline-none resize-none placeholder:text-[#555] text-white"
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && reply.trim()) replyMutation.mutate(); }}
                />
                <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-t border-[#333]">
                  <span className="text-[10px] text-[#888] font-medium bg-[#222] px-2 py-1 rounded border border-[#333] hidden sm:inline-block">
                    Press ⌘+Enter to send
                  </span>
                  <div className="sm:hidden" />
                  <button
                    onClick={() => replyMutation.mutate()}
                    disabled={!reply.trim() || replyMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#f97316] text-white text-xs font-bold hover:bg-[#ea6a0a] transition-all shadow-sm disabled:opacity-50"
                  >
                    {replyMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="rounded-xl border border-[#333] bg-[#161616] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#333] flex items-center gap-2">
                <History className="h-4 w-4 text-[#888]" />
                <h3 className="text-sm font-bold text-white">Activity Timeline</h3>
              </div>
              
              <div className="p-5 sm:p-6">
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <div className="text-center py-8 text-sm text-[#888] flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-[#222] flex items-center justify-center mb-3">
                      <MessageSquare className="h-5 w-5 opacity-40" />
                    </div>
                    No activity yet.
                  </div>
                ) : (
                  <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] sm:before:left-[15px] before:w-px before:bg-[#333]">
                    {ticket.comments?.map((comment: SupportTicketComment) => {
                      const isAdmin = comment.author_type === "admin";
                      return (
                        <div key={comment.id} className="relative group">
                          {/* Timeline Node */}
                          <div className={`absolute -left-[30px] sm:-left-[38px] top-0 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 border-[#161616] z-10 shadow-sm ${
                            isAdmin ? "bg-[#f97316] text-white" : "bg-blue-600 text-white"
                          }`}>
                            {isAdmin ? "A" : (comment.author_name?.[0]?.toUpperCase() || "O")}
                          </div>
                          
                          {/* Content Box */}
                          <div className={`rounded-lg border shadow-sm p-4 ${
                            isAdmin 
                              ? "bg-[#f97316]/5 border-[#f97316]/20" 
                              : "bg-[#222] border-[#333]"
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                              <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                                {isAdmin ? "Support Team" : (comment.author_name || "Organizer")}
                                {isAdmin && <ShieldCheck className="h-3 w-3 text-[#f97316]" />}
                              </span>
                              <span className="text-[10px] text-[#888] font-medium bg-[#111] px-2 py-0.5 rounded-full border border-[#333] w-fit">
                                {new Date(comment.created_at).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="text-sm leading-relaxed text-[#ddd] whitespace-pre-wrap">
                              {comment.body}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={commentsEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: ADMIN CONTROLS & DETAILS PANEL ── */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Control Panel */}
            <div className="rounded-xl border border-[#f97316]/30 bg-[#f97316]/5 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f97316]/20 bg-[#f97316]/10 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#f97316]" />
                <h3 className="text-sm font-bold text-[#f97316]">Admin Controls</h3>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Assigned To</label>
                  <div className="flex gap-2">
                    <select
                      value={ticket.assigned_to || ""}
                      onChange={(e) => assignMutation.mutate(e.target.value || null)}
                      disabled={assignMutation.isPending}
                      className="flex-1 bg-[#161616] border border-[#333] text-xs text-white px-3 py-2 rounded-md outline-none focus:border-[#f97316] disabled:opacity-50"
                    >
                      <option value="">— Unassigned —</option>
                      {adminUsers.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.email}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Severity / Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => priorityMutation.mutate(e.target.value as TicketPriority)}
                    disabled={priorityMutation.isPending}
                    className="w-full bg-[#161616] border border-[#333] text-xs text-white px-3 py-2 rounded-md outline-none focus:border-[#f97316] disabled:opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Ticket Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => statusMutation.mutate(e.target.value as TicketStatus)}
                    disabled={statusMutation.isPending}
                    className="w-full bg-[#161616] border border-[#333] text-xs text-white px-3 py-2 rounded-md outline-none focus:border-[#f97316] disabled:opacity-50"
                  >
                    <option value="open">Open</option>
                    <option value="troubleshooting">Troubleshooting</option>
                    <option value="pending_customer_response">Waiting on Customer</option>
                    <option value="on_hold">On Hold</option>
                    <option value="suspended">Suspended</option>
                    <option value="under_development">Under Development</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Details Panel */}
            <div className="rounded-xl border border-[#333] bg-[#161616] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#333] bg-[#1a1a1a] flex items-center gap-2">
                <Info className="h-4 w-4 text-[#888]" />
                <h3 className="text-sm font-bold text-white">Ticket Details</h3>
              </div>
              
              <div className="divide-y divide-[#333]">
                {/* Organizer */}
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Organizer</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white">{(ticket as any).organizer?.name || 'Unknown'}</span>
                    <span className="text-xs text-[#888]">{(ticket as any).organizer?.email}</span>
                  </div>
                </div>

                {/* Organizer ID */}
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Organizer ID</span>
                  <span className="text-xs font-mono text-[#888] break-all">{(ticket as any).organizer_id}</span>
                </div>
                
                {/* System ID */}
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">System Ticket ID</span>
                  <span className="text-xs font-mono text-[#888] break-all">{ticket.id}</span>
                </div>

                {/* Category */}
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Category</span>
                  <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-bold border ${CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other}`}>
                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                  </span>
                </div>
                
                {/* Plan */}
                {ticket.subscription_plan_name && (
                  <div className="p-4 flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Related Plan</span>
                    <div className="flex items-center gap-2 text-[#f97316]">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">{ticket.subscription_plan_name}</span>
                    </div>
                  </div>
                )}

                {/* Created */}
                <div className="p-4 flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">Opened On</span>
                  <span className="text-sm font-medium text-[#ccc]">{new Date(ticket.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
