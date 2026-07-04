import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminSupportTickets,
  getAdminSupportStats,
} from "@/api/support";
import type { SupportTicket, SupportTicketComment, TicketStatus } from "@/api/support";
import {
  TicketCheck,
  TicketX,
  MessageSquare,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  X,
  Send,
  RefreshCw,
  AlertCircle,
  Loader2,
  Tag,
  CreditCard,
  ArrowRight,
  InboxIcon,
  Wrench,
  PauseCircle,
  MinusCircle,
  Code2,
} from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/support/")({
  component: AdminSupportPage,
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

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-[#888]",
  normal: "text-blue-400",
  high: "text-amber-400",
  urgent: "text-red-400",
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  open: {
    label: "Open",
    icon: AlertCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  troubleshooting: {
    label: "Troubleshooting",
    icon: Wrench,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  pending_customer_response: {
    label: "Waiting on Customer",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  on_hold: {
    label: "On Hold",
    icon: PauseCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  suspended: {
    label: "Suspended",
    icon: MinusCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
  under_development: {
    label: "Under Development",
    icon: Code2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    color: "text-[#888]",
    bg: "bg-[#222] border-[#333]",
  },
};

type Tab = "unassigned" | "in_progress" | "all" | "resolved";

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("unassigned");

  const tabToStatus = (tab: Tab) => {
    if (tab === "unassigned") return "unassigned";
    if (tab === "in_progress") return "in_progress";
    if (tab === "resolved") return "resolved";
    return "all";
  };

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["admin-support-stats"],
    queryFn: () => getAdminSupportStats(),
    refetchInterval: 30000,
  });

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-support-tickets", activeTab],
    queryFn: () => getAdminSupportTickets({ data: { status: tabToStatus(activeTab) } }),
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "unassigned", label: "Unassigned", count: stats?.unassigned },
    { id: "in_progress", label: "In Progress", count: stats?.in_progress },
    { id: "all", label: "All Tickets", count: stats?.total },
    { id: "resolved", label: "Resolved", count: stats?.resolved },
  ];

  return (
    <div className="flex h-full gap-0 font-sans text-sm overflow-hidden">
      {/* Left panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#333333] mb-4 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">Support Tickets</h1>
            <p className="text-[11px] text-[#666] mt-0.5">
              Manage and respond to organizer support requests
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#333333] text-[#cccccc] text-[12px] transition-colors rounded"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
          {[
            { label: "Total", value: stats?.total ?? "—", color: "text-white" },
            { label: "Open", value: stats?.open ?? "—", color: "text-amber-400" },
            { label: "Unassigned", value: stats?.unassigned ?? "—", color: "text-red-400" },
            { label: "Resolved", value: stats?.resolved ?? "—", color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1e1e1e] border border-[#333] rounded p-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-[#666] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333] mb-0 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2 text-[12px] font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-[#f97316] text-white"
                  : "border-transparent text-[#888] hover:text-[#ccc]"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id
                      ? "bg-[#f97316]/20 text-[#f97316]"
                      : "bg-[#333] text-[#888]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <InboxIcon className="h-10 w-10 text-[#444] mb-3" />
              <p className="text-[#888] text-sm">No tickets in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]">
              {tickets.map((ticket: any) => {
                const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                const StatusIcon = statusCfg.icon;

                return (
                  <Link
                    key={ticket.id}
                    to="/internal/control/admin/support/$ticketId"
                    params={{ ticketId: ticket.id }}
                    className={`w-full text-left px-4 py-3 transition-colors flex gap-3 items-start hover:bg-[#1a1a1a]`}
                  >
                    <StatusIcon
                      className={`h-4 w-4 shrink-0 mt-0.5 ${statusCfg.color}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[13px] font-medium text-[#e0e0e0] truncate">
                          {ticket.subject}
                        </span>
                        <span className="text-[11px] text-[#555] shrink-0">
                          {formatRelative(ticket.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category */}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                            CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other
                          }`}
                        >
                          {CATEGORY_LABELS[ticket.category] || ticket.category}
                        </span>
                        {/* Priority */}
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            PRIORITY_COLORS[ticket.priority] || ""
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        {/* Plan */}
                        {ticket.subscription_plan_name && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316] flex items-center gap-1">
                            <CreditCard className="h-2.5 w-2.5" />
                            {ticket.subscription_plan_name}
                          </span>
                        )}
                        {/* Organizer */}
                        {ticket.organizer && (
                          <span className="text-[10px] text-[#666]">
                            {ticket.organizer.name || ticket.organizer.email}
                          </span>
                        )}
                      </div>
                      {/* Last comment preview */}
                      {ticket.lastComment && (
                        <p className="text-[11px] text-[#555] mt-1.5 truncate">
                          {ticket.lastComment.author_type === "admin" ? "▸ " : "← "}
                          {ticket.lastComment.body}
                        </p>
                      )}
                      {/* Assignment */}
                      <div className="mt-1.5 flex items-center gap-1">
                        {ticket.assigned_to ? (
                          <span className="text-[10px] text-[#555] flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-green-500" />
                            {ticket.assignedAdmin?.email || "Assigned"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400/70 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Unassigned
                          </span>
                        )}
                        <span className="text-[10px] text-[#555] ml-auto flex items-center gap-0.5">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.commentCount || 0}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-[#444] mt-0.5 transition-transform"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
