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
  Loader2,
  CreditCard,
  RefreshCw,
  Send,
  Wrench,
  PauseCircle,
  MinusCircle,
  Code2,
  Pencil,
  RotateCcw,
  X,
  ChevronDown,
  Plus,
  Forward,
  Minus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Paperclip,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/internal/control/admin/support/$ticketId")({
  component: AdminTicketDetailPage,
});

// ── helpers ──────────────────────────────────────────────────────────────────
function avatarColor(seed: string) {
  const palette = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-sky-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return palette[h % palette.length];
}

function Avatar({
  name,
  src,
  size = "h-8 w-8",
  text = "text-[11px]",
}: {
  name: string;
  src?: string;
  size?: string;
  text?: string;
}) {
  if (src) {
    return (
      <div className={`${size} rounded-full overflow-hidden shrink-0`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  const parts = (name || "?").trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (name[0] || "?").toUpperCase();
  return (
    <div
      className={`${size} rounded-full ${avatarColor(name)} flex items-center justify-center text-white ${text} font-bold shrink-0`}
    >
      {letters}
    </div>
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  open: {
    label: "Open",
    icon: AlertCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  troubleshooting: {
    label: "Troubleshooting",
    icon: Wrench,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  pending_customer_response: {
    label: "Waiting on Customer",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  on_hold: {
    label: "On Hold",
    icon: PauseCircle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  suspended: {
    label: "Suspended",
    icon: MinusCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  under_development: {
    label: "Under Development",
    icon: Code2,
    color: "text-cyan-600",
    bg: "bg-cyan-50 border-cyan-200",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-500",
  normal: "text-blue-600",
  high: "text-red-500",
  urgent: "text-orange-500",
  critical: "text-red-700",
};
const PRIORITY_BG: Record<string, string> = {
  low: "bg-gray-100",
  normal: "bg-blue-50",
  high: "bg-red-50",
  urgent: "bg-orange-50",
  critical: "bg-red-100",
};

// ── SideRow: reusable left-panel row ─────────────────────────────────────────
function SideRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 px-4 border-b border-gray-100 dark:border-[#252526] last:border-0">
      <div className="text-[11px] font-semibold text-gray-400 dark:text-[#666] uppercase tracking-wider mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SideRow label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full text-[13px] text-gray-800 dark:text-[#e0e0e0] bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400 disabled:opacity-50 appearance-none pr-7 cursor-pointer"
          style={
            disabled
              ? undefined
              : {
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                }
          }
        >
          {children}
        </select>
        {disabled && (
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
          </div>
        )}
      </div>
    </SideRow>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
function AdminTicketDetailPage() {
  const { ticketId } = Route.useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [reply, setReply] = useState("");
  const [activeComposer, setActiveComposer] = useState<"reply" | "note" | "forward">("reply");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const {
    data: ticket,
    isLoading,
    refetch,
  } = useQuery({
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
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });
  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => updateTicketStatus({ data: { ticketId, status } }),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });
  const priorityMutation = useMutation({
    mutationFn: (priority: TicketPriority) =>
      updateTicketPriority({ data: { ticketId, priority } }),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-gray-500">
        Ticket not found.{" "}
        <Link to="/internal/control/admin/support" className="text-blue-500 hover:underline">
          Return to Support
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;
  const organizerName = (ticket as any).organizer?.name || "Unknown";
  const organizerEmail = (ticket as any).organizer?.email || "";
  const assigneeName = (ticket as any).assignedAdmin?.email?.split("@")[0] || null;
  const ticketShortId = `#${String(ticket.id).slice(-6).toUpperCase()}`;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111] font-sans text-sm overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-[#252526] bg-white dark:bg-[#111] shrink-0">
        <button
          onClick={() => router.history.back()}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e1e1e] text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
              {ticket.subject}
            </h1>
            <span className="text-[12px] font-mono text-gray-400 dark:text-[#666] shrink-0">
              {ticketShortId}
            </span>
            <button className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e1e1e] text-gray-400 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <Link
            to="/internal/control/admin/support"
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e1e1e] text-gray-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT: metadata sidebar ── */}
        <div className="w-52 shrink-0 border-r border-gray-200 dark:border-[#252526] bg-white dark:bg-[#111] overflow-y-auto">
          {/* Resolution due */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[#252526]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Resolution Due
            </div>
            <div className="text-[13px] font-medium text-gray-800 dark:text-[#ddd]">
              {new Date(ticket.created_at).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              {new Date(ticket.created_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            {/* orange progress bar */}
            <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-[#252526] rounded-full overflow-hidden">
              <div className="h-1 bg-orange-400 rounded-full" style={{ width: "60%" }} />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Due in 9h 50m 15s</div>
          </div>

          <SelectRow
            label="Status"
            value={ticket.status}
            onChange={(v) => statusMutation.mutate(v as TicketStatus)}
            disabled={statusMutation.isPending}
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
          </SelectRow>

          <SelectRow
            label="Priority"
            value={ticket.priority}
            onChange={(v) => priorityMutation.mutate(v as TicketPriority)}
            disabled={priorityMutation.isPending}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </SelectRow>

          <SideRow label="Group">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-700 dark:text-[#ccc]">
                {(ticket as any).category ? (ticket as any).category.replace(/_/g, " ") : "General"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </div>
          </SideRow>

          <SelectRow
            label="Assigned To"
            value={ticket.assigned_to || ""}
            onChange={(v) => assignMutation.mutate(v || null)}
            disabled={assignMutation.isPending}
          >
            <option value="">— Unassigned —</option>
            {(adminUsers as any[]).map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.email?.split("@")[0] || a.email}
              </option>
            ))}
          </SelectRow>

          <SideRow label="Channel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[13px] text-gray-700 dark:text-[#ccc]">Email</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </div>
          </SideRow>

          <SideRow label="Tags">
            <div className="flex items-center gap-1 text-gray-400">
              <Plus className="h-3 w-3" />
              <span className="text-[12px]">Add tags</span>
              <ChevronDown className="h-3 w-3 ml-auto" />
            </div>
          </SideRow>
        </div>

        {/* ── CENTRE: conversation ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Original message */}
            <div className="flex gap-3">
              <Avatar name={organizerName} src={(ticket as any).organizer?.image} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                    {organizerName}
                  </span>
                  <span className="text-[11px] text-gray-400">{formatTime(ticket.created_at)}</span>
                  <span className="text-[11px] text-gray-400 ml-auto">
                    {formatFullDate(ticket.created_at)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mb-2">
                  To: support@wd.jservicedesk.com
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4 text-[13px] text-gray-700 dark:text-[#ccc] leading-relaxed">
                  {ticket.description || ticket.subject}
                </div>
              </div>
            </div>

            {/* Comments */}
            {(ticket.comments || []).map((comment: SupportTicketComment) => {
              const isAdmin = comment.author_type === "admin";
              const isPrivate = (comment as any).is_private;
              const authorName = isAdmin
                ? (ticket as any).assignedAdmin?.email?.split("@")[0] || "Support Team"
                : comment.author_name || organizerName;
              const authorImage = isAdmin ? undefined : (ticket as any).organizer?.image;

              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar name={authorName} src={authorImage} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-gray-900 dark:text-white">
                        {authorName}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-semibold">
                          Replied
                        </span>
                      )}
                      {isPrivate && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-semibold flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> private note
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {formatTime(comment.created_at)}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {formatFullDate(comment.created_at)}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="text-[11px] text-gray-400 mb-2">
                        To: {organizerEmail}
                        {(ticket as any).assignedAdmin?.email &&
                          ` · Cc: ${(ticket as any).assignedAdmin.email}`}
                      </div>
                    )}
                    <div
                      className={`border rounded-lg p-4 text-[13px] leading-relaxed ${
                        isPrivate
                          ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/40 text-yellow-900 dark:text-yellow-200"
                          : isAdmin
                            ? "bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-[#ccc]"
                            : "bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-[#ccc]"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{comment.body}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={commentsEndRef} />
          </div>

          {/* ── Composer bar ── */}
          <div className="shrink-0 border-t border-gray-200 dark:border-[#252526] bg-white dark:bg-[#111]">
            {/* Composer tabs */}
            <div className="flex border-b border-gray-200 dark:border-[#252526]">
              {(["reply", "note", "forward"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveComposer(tab)}
                  className={`px-4 py-2.5 text-[12px] font-medium capitalize flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
                    activeComposer === tab
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab === "reply" && <MessageSquare className="h-3.5 w-3.5" />}
                  {tab === "note" && <Plus className="h-3.5 w-3.5" />}
                  {tab === "forward" && <Forward className="h-3.5 w-3.5" />}
                  {tab === "reply" ? "Reply" : tab === "note" ? "Add Note" : "Forward"}
                </button>
              ))}
              <div className="flex-1" />
              <button className="px-3 text-gray-400 hover:text-gray-600">
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                activeComposer === "reply"
                  ? "Type your reply..."
                  : activeComposer === "note"
                    ? "Add a private note..."
                    : "Forward this ticket..."
              }
              rows={4}
              className={`w-full px-5 py-3 text-[13px] bg-transparent outline-none resize-none text-gray-800 dark:text-[#ddd] placeholder:text-gray-400 ${
                activeComposer === "note" ? "bg-yellow-50/40 dark:bg-yellow-950/10" : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && reply.trim())
                  replyMutation.mutate();
              }}
            />

            <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 dark:border-[#252526]">
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#1e1e1e] text-gray-400 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] text-gray-400 hidden sm:block">⌘+Enter to send</span>
              </div>
              <button
                onClick={() => replyMutation.mutate()}
                disabled={!reply.trim() || replyMutation.isPending}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-semibold transition-colors disabled:opacity-40 ${
                  activeComposer === "note"
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    : "bg-[#f97316] text-white hover:bg-[#ea6c0a]"
                }`}
              >
                {replyMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    {activeComposer === "reply"
                      ? "Reply"
                      : activeComposer === "note"
                        ? "Add Note"
                        : "Forward"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: contact panel ── */}
        <div className="w-60 shrink-0 border-l border-gray-200 dark:border-[#252526] bg-white dark:bg-[#111] overflow-y-auto">
          {/* Contact details header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#252526]">
            <span className="text-[12px] font-semibold text-gray-600 dark:text-[#aaa]">
              Contact Details
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-[#252526]">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={organizerName} src={(ticket as any).organizer?.image} size="h-10 w-10" text="text-[13px]" />
              <div>
                <div className="text-[13px] font-semibold text-gray-900 dark:text-white">
                  {organizerName}
                </div>
                <div className="text-[11px] text-gray-400 break-all">{organizerEmail}</div>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600 shrink-0">
                <Pencil className="h-3 w-3" />
              </button>
            </div>

            {/* Contact fields */}
            <div className="space-y-2">
              {(ticket as any).organizer?.phone && (
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{(ticket as any).organizer.phone}</span>
                </div>
              )}
              {(ticket as any).organizer?.country && (
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{(ticket as any).organizer.country}</span>
                </div>
              )}
              {ticket.subscription_plan_name && (
                <div className="flex items-center gap-2 text-[12px] text-orange-500">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{ticket.subscription_plan_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Extra info rows */}
          {[
            { label: "Language", value: "English" },
            {
              label: "Since",
              value: new Date(ticket.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
          ].map((r) => (
            <div
              key={r.label}
              className="px-4 py-2.5 border-b border-gray-100 dark:border-[#252526]"
            >
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                {r.label}
              </div>
              <div className="text-[13px] text-gray-700 dark:text-[#ccc]">{r.value}</div>
            </div>
          ))}

          {/* Previous Tickets */}
          <div className="px-4 py-3">
            <div className="text-[12px] font-semibold text-gray-600 dark:text-[#aaa] mb-3">
              Previous Tickets
            </div>
            <div className="space-y-3">
              {((ticket as any).organizer?.support_tickets || []).length === 0 ? (
                <div className="text-[12px] text-gray-500 italic">No previous tickets</div>
              ) : (
                ((ticket as any).organizer?.support_tickets || []).map((pt: any) => (
                  <Link
                    key={pt.id}
                    to="/internal/control/admin/support/$ticketId"
                    params={{ ticketId: pt.id }}
                    className="block border border-gray-200 dark:border-[#252526] rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 truncate pr-2">
                        #{pt.id.split("-")[0]}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatFullDate(pt.created_at)}</span>
                    </div>
                    <p className="text-[12px] text-gray-600 dark:text-[#bbb] mb-2 leading-snug line-clamp-2">
                      {pt.subject}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          pt.status === "resolved" || pt.status === "closed"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {pt.status === "resolved" || pt.status === "closed" ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : (
                          <Clock className="h-2.5 w-2.5" />
                        )}
                        {pt.status.replace("_", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-semibold ${PRIORITY_BG[pt.priority as TicketPriority]} ${PRIORITY_COLORS[pt.priority as TicketPriority]}`}
                      >
                        {pt.priority.charAt(0).toUpperCase() + pt.priority.slice(1)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Assigned admin */}
            {assigneeName && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#252526]">
                <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                  Assigned Agent
                </div>
                <div className="flex items-center gap-2">
                  <Avatar name={assigneeName} size="h-7 w-7" text="text-[10px]" />
                  <span className="text-[13px] text-gray-700 dark:text-[#ccc]">{assigneeName}</span>
                </div>
              </div>
            )}

            {/* Ticket meta */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#252526] space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>Opened {formatTime(ticket.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${statusCfg.bg} ${statusCfg.color}`}
                >
                  <StatusIcon className="h-2.5 w-2.5" />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
