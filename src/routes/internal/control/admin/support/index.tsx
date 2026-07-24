import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSupportTickets,
  getAdminSupportStats,
  bulkDeleteSupportTickets,
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
  Trash2,
  List,
  LayoutGrid,
  BookOpen,
  Search,
} from "lucide-react";
import readmeRaw from "../../../../../../README.md?raw";

const readmeSections = (() => {
  try {
    const raw = readmeRaw as string;
    const parts = raw.split(/^## /m);
    return parts
      .map((part) => {
        const lines = part.split("\n");
        return {
          title: lines[0].replace(/#/g, "").trim() || "Introduction",
          content: lines.slice(1).join("\n").trim(),
        };
      })
      .filter((p) => p.content.length > 0)
      .map((p, i) => ({ ...p, id: i }));
  } catch (e) {
    return [];
  }
})();

function formatInline(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 dark:bg-[#222] px-1 py-0.5 rounded text-[11px] text-[#f97316]">$1</code>',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>',
    );
}

function SimpleMarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;
  const blocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          const content = block.slice(3, -3);
          const lines = content.split("\n");
          const lang = lines[0].trim();
          const code = lines.slice(1).join("\n");
          return (
            <pre
              key={i}
              className="bg-gray-100 dark:bg-[#111] p-4 rounded-md overflow-x-auto text-[11px] font-mono border border-gray-200 dark:border-[#333] my-4 custom-scrollbar"
            >
              <code className="text-gray-800 dark:text-[#ccc]">{code || lang}</code>
            </pre>
          );
        }

        const paragraphs = block.split(/\n\n+/);
        return paragraphs.map((p, j) => {
          if (!p.trim()) return null;

          if (p.trim().startsWith("- ")) {
            const items = p
              .split("\n")
              .filter((l) => l.trim().startsWith("- "))
              .map((l) => l.replace(/^- /, ""));
            return (
              <ul
                key={`${i}-${j}`}
                className="list-disc pl-5 space-y-1 my-3 text-gray-700 dark:text-[#ccc] leading-relaxed"
              >
                {items.map((item, k) => (
                  <li key={k} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                ))}
              </ul>
            );
          }

          if (p.trim().startsWith("### ")) {
            return (
              <h3
                key={`${i}-${j}`}
                className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-2"
              >
                {p.trim().replace(/^### /, "")}
              </h3>
            );
          }

          return (
            <p
              key={`${i}-${j}`}
              className="my-3 text-gray-700 dark:text-[#ccc] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatInline(p) }}
            />
          );
        });
      })}
    </>
  );
}

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
  other:
    "bg-gray-200 dark:bg-[#333]/60 text-gray-600 dark:text-[#999] border-gray-300 dark:border-[#444]",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-500 dark:text-[#888]",
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
    color: "text-gray-500 dark:text-[#888]",
    bg: "bg-gray-100 dark:bg-[#222] border-gray-200 dark:border-[#333]",
  },
};

type Tab = "unassigned" | "in_progress" | "all" | "resolved" | "documentation";

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

function BulkDeleteModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () =>
      bulkDeleteSupportTickets({
        data: {
          status,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
      }),
    onSuccess: () => {
      onComplete();
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#333] flex items-center justify-between bg-gray-50 dark:bg-[#161616]">
          <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Bulk Delete Tickets
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#888] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-[#888]">
            This action will permanently delete all matching tickets and their comments. This cannot
            be undone.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-500 dark:text-[#888] uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm text-gray-900 dark:text-white px-3 py-2 rounded-md outline-none focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm text-gray-900 dark:text-white px-3 py-2 rounded-md outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-sm text-gray-900 dark:text-white px-3 py-2 rounded-md outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-[#333] space-y-1.5">
            <label className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-red-500/50 text-sm text-gray-900 dark:text-white px-3 py-2 rounded-md outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#161616] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#ccc] hover:bg-gray-200 dark:bg-[#333] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={
              confirmText !== "DELETE" || !startDate || !endDate || deleteMutation.isPending
            }
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete Permanently"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("unassigned");
  const [activeDocTopic, setActiveDocTopic] = useState<number>(0);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const router = useRouter();

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

  const {
    data: tickets = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-support-tickets", activeTab],
    queryFn: () => getAdminSupportTickets({ data: { status: tabToStatus(activeTab) } }),
    refetchInterval: 30000,
    enabled: activeTab !== "documentation",
  });

  const handleRefresh = () => {
    if (activeTab !== "documentation") refetch();
    refetchStats();
  };

  const TABS: { id: Tab; label: string; count?: number; icon?: any }[] = [
    { id: "unassigned", label: "Unassigned", count: stats?.unassigned },
    { id: "in_progress", label: "In Progress", count: stats?.in_progress },
    { id: "all", label: "All Tickets", count: stats?.total },
    { id: "resolved", label: "Solved / Closed", count: stats?.closed },
    { id: "documentation", label: "Documentation", icon: BookOpen },
  ];

  return (
    <div className="flex h-full gap-0 font-sans text-sm overflow-hidden">
      {/* Left panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333] mb-4 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Support Tickets</h1>
            <p className="text-[11px] text-gray-500 dark:text-[#666] mt-0.5">
              Manage and respond to organizer support requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[12px] transition-colors rounded border border-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bulk Delete
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-[#cccccc] text-[12px] transition-colors rounded"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
          {[
            { label: "Total", value: stats?.total ?? "—", color: "text-gray-900 dark:text-white" },
            { label: "Open", value: stats?.open ?? "—", color: "text-amber-400" },
            { label: "Unassigned", value: stats?.unassigned ?? "—", color: "text-red-400" },
            { label: "Solved / Closed", value: stats?.closed ?? "—", color: "text-green-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded p-3"
            >
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-gray-500 dark:text-[#666] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs and Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#333] mb-0 shrink-0">
          <div className="flex">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`px-4 py-2 text-[12px] font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "border-[#f97316] text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-[#888] hover:text-gray-700 dark:text-[#ccc]"
                  }`}
                >
                  {TabIcon && <TabIcon className="h-3.5 w-3.5" />}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab.id
                          ? "bg-[#f97316]/20 text-[#f97316]"
                          : "bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-[#888]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          {activeTab !== "documentation" && (
            <div className="flex items-center gap-1 pr-2 pb-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-gray-200 dark:bg-[#333] text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-[#666] hover:text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:bg-[#222]"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-gray-200 dark:bg-[#333] text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-[#666] hover:text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:bg-[#222]"
                }`}
                title="Table View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeTab === "documentation" ? (
            (() => {
              const filteredSections = readmeSections.filter(
                (sec) =>
                  sec.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                  sec.content.toLowerCase().includes(docSearchQuery.toLowerCase()),
              );

              // Get the actual section to display
              const displaySection =
                readmeSections.find((s) => s.id === activeDocTopic) || filteredSections[0] || null;

              return (
                <div className="flex h-full">
                  {/* Sidebar topics */}
                  <div className="w-64 border-r border-gray-200 dark:border-[#333] flex flex-col shrink-0">
                    <div className="p-3 border-b border-gray-200 dark:border-[#333]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search documentation..."
                          value={docSearchQuery}
                          onChange={(e) => setDocSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-[#1a1a1a] border-transparent focus:bg-white dark:focus:bg-[#111] focus:border-[#f97316] dark:focus:border-[#f97316] rounded-md text-[12px] text-gray-900 dark:text-white outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {filteredSections.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => setActiveDocTopic(sec.id)}
                          className={`w-full text-left px-4 py-3 text-[13px] transition-colors border-l-[3px] ${
                            displaySection?.id === sec.id
                              ? "border-[#f97316] bg-[#f97316]/10 text-[#f97316]"
                              : "border-transparent text-gray-600 dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"
                          }`}
                        >
                          <div
                            className={`font-medium ${displaySection?.id === sec.id ? "text-[#f97316]" : "text-gray-800 dark:text-[#ddd]"}`}
                          >
                            {sec.title}
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                              <Tag className="h-2.5 w-2.5" />
                              Admin Docs
                            </span>
                          </div>
                        </button>
                      ))}
                      {filteredSections.length === 0 && (
                        <div className="p-4 text-center text-[12px] text-gray-500">
                          No articles found.
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Content area */}
                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {displaySection ? (
                      <div className="max-w-3xl mx-auto">
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                              <Tag className="h-3 w-3" />
                              Admin Docs
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-[#f97316]" />
                            {displaySection.title}
                          </h2>
                        </div>
                        <div className="text-[13px]">
                          <SimpleMarkdownRenderer text={displaySection.content || ""} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No documentation available.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <InboxIcon className="h-10 w-10 text-gray-500 dark:text-[#444] mb-3" />
              <p className="text-gray-500 dark:text-[#888] text-sm">No tickets in this category</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="divide-y divide-gray-200 dark:divide-[#2a2a2a]">
              {tickets.map((ticket: any) => {
                const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                const StatusIcon = statusCfg.icon;

                return (
                  <Link
                    key={ticket.id}
                    to="/internal/control/admin/support/$ticketId"
                    params={{ ticketId: ticket.id }}
                    className={`w-full text-left px-4 py-3 transition-colors flex gap-3 items-start hover:bg-gray-100 dark:bg-[#1a1a1a]`}
                  >
                    <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${statusCfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[13px] font-medium text-gray-900 dark:text-[#e0e0e0] truncate">
                          {ticket.subject}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#555] shrink-0">
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
                          <span className="text-[10px] text-gray-500 dark:text-[#666]">
                            {ticket.organizer.name || ticket.organizer.email}
                          </span>
                        )}
                      </div>
                      {/* Last comment preview */}
                      {ticket.lastComment && (
                        <p className="text-[11px] text-gray-500 dark:text-[#555] mt-1.5 truncate">
                          {ticket.lastComment.author_type === "admin" ? "▸ " : "← "}
                          {ticket.lastComment.body}
                        </p>
                      )}
                      {/* Assignment */}
                      <div className="mt-1.5 flex items-center gap-1">
                        {ticket.assigned_to ? (
                          <span className="text-[10px] text-gray-500 dark:text-[#555] flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-green-500" />
                            {ticket.assignedAdmin?.email || "Assigned"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400/70 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Unassigned
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 dark:text-[#555] ml-auto flex items-center gap-0.5">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.commentCount || 0}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-500 dark:text-[#444] mt-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-6">
              <table className="w-full text-left text-sm text-gray-900 dark:text-[#e0e0e0] border-collapse">
                <thead className="text-[11px] uppercase bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#333] text-gray-500 dark:text-[#888] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12 text-center">Status</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Assignee</th>
                    <th className="px-4 py-3 font-semibold">Organizer</th>
                    <th className="px-4 py-3 font-semibold text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a2a] bg-transparent">
                  {tickets.map((ticket: any) => {
                    const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                    const StatusIcon = statusCfg.icon;

                    return (
                      <tr
                        key={ticket.id}
                        onClick={() =>
                          router.navigate({
                            to: "/internal/control/admin/support/$ticketId",
                            params: { ticketId: ticket.id },
                          })
                        }
                        className="hover:bg-gray-100 dark:bg-[#1a1a1a] transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5 text-center">
                          <div
                            className={`inline-flex items-center justify-center h-7 w-7 rounded border ${statusCfg.bg}`}
                            title={statusCfg.label}
                          >
                            <StatusIcon className={`h-4 w-4 ${statusCfg.color}`} />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="font-medium text-[13px] truncate group-hover:text-[#f97316] transition-colors">
                            {ticket.subject}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-[#666] font-mono mt-0.5 truncate">
                            #{ticket.id.slice(0, 8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other}`}
                          >
                            {CATEGORY_LABELS[ticket.category] || ticket.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] font-semibold uppercase ${PRIORITY_COLORS[ticket.priority] || ""}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {ticket.assigned_to ? (
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-[11px] text-gray-600 dark:text-[#aaa]">
                                {ticket.assignedAdmin?.email?.split("@")[0] || "Assigned"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] px-1.5 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[11px] text-gray-600 dark:text-[#aaa]">
                          {ticket.organizer?.name || ticket.organizer?.email || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[11px] text-gray-600 dark:text-[#777] whitespace-nowrap">
                          {formatRelative(ticket.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <BulkDeleteModal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onComplete={handleRefresh}
      />
    </div>
  );
}
