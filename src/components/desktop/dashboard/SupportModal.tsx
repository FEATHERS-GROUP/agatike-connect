import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSupportTicket,
  getOrganizerTickets,
  getOrganizerTicketWithComments,
  addOrganizerComment,
} from "@/api/support";
import type {
  SupportTicket,
  SupportTicketComment,
  TicketCategory,
  TicketPriority,
} from "@/api/support";
import {
  X,
  Send,
  LifeBuoy,
  Plus,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  Tag,
  CreditCard,
  FileQuestion,
  Zap,
  Bug,
  Ticket as TicketIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const CATEGORIES: { value: TicketCategory; label: string; icon: any; desc: string }[] = [
  {
    value: "billing",
    label: "Billing",
    icon: CreditCard,
    desc: "Invoice, charges, payment history",
  },
  {
    value: "subscription",
    label: "Subscription",
    icon: Zap,
    desc: "Plan upgrades, renewals, cancellations",
  },
  {
    value: "payment",
    label: "Payment",
    icon: CreditCard,
    desc: "Failed payments, refunds, transactions",
  },
  {
    value: "event",
    label: "Event Issue",
    icon: TicketIcon,
    desc: "Event setup, attendees, tickets",
  },
  {
    value: "model_issue",
    label: "Model Issue",
    icon: FileQuestion,
    desc: "AI models, recommendations, outputs",
  },
  {
    value: "request",
    label: "Feature Request",
    icon: Tag,
    desc: "New features, improvements",
  },
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    desc: "Something is not working correctly",
  },
  { value: "other", label: "Other", icon: MessageSquare, desc: "General questions, other topics" },
];

const PRIORITIES: { value: TicketPriority; label: string; color: string; desc: string }[] = [
  { value: "low", label: "Low", color: "text-muted-foreground", desc: "Not urgent, informational" },
  { value: "normal", label: "Normal", color: "text-blue-500", desc: "Standard priority" },
  { value: "high", label: "High", color: "text-amber-500", desc: "Affects my workflow" },
  { value: "urgent", label: "Urgent", color: "text-red-500", desc: "Business critical" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  open: {
    label: "Open",
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/20",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    color: "text-muted-foreground",
    bg: "bg-secondary/40 border-border/40",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  billing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  subscription: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  payment: "bg-green-500/10 text-green-600 border-green-500/20",
  event: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  model_issue: "bg-red-500/10 text-red-600 border-red-500/20",
  request: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  bug: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  other: "bg-secondary/40 text-muted-foreground border-border/40",
};

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = "list" | "new" | "detail";

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [view, setView] = useState<View>("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) setView("list");
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Prevent scroll behind modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setView("detail");
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-end"
    >
      <div
        className="relative h-full w-full max-w-xl bg-background border-l border-border/60 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ maxWidth: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            {view !== "list" && (
              <button
                onClick={() => setView("list")}
                className="p-1 rounded hover:bg-secondary/60 transition-colors text-muted-foreground mr-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <span className="text-base font-semibold">
                {view === "list" && "Help & Support"}
                {view === "new" && "New Ticket"}
                {view === "detail" && "Ticket Details"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button
                onClick={() => setView("new")}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Ticket
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === "list" && (
            <TicketList onNewTicket={() => setView("new")} onTicketClick={handleTicketClick} />
          )}
          {view === "new" && (
            <NewTicketForm
              onSuccess={(ticketId) => {
                setSelectedTicketId(ticketId);
                setView("detail");
              }}
              onCancel={() => setView("list")}
            />
          )}
          {view === "detail" && selectedTicketId && <TicketDetail ticketId={selectedTicketId} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TICKET LIST VIEW
// ─────────────────────────────────────────────────────────────

function TicketList({
  onNewTicket,
  onTicketClick,
}: {
  onNewTicket: () => void;
  onTicketClick: (id: string) => void;
}) {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["organizer-support-tickets"],
    queryFn: () => getOrganizerTickets(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LifeBuoy className="h-10 w-10 text-primary/60" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-1">No tickets yet</h3>
          <p className="text-sm text-muted-foreground">
            Having an issue or a question? Raise a support ticket and our team will get back to you.
          </p>
        </div>
        <button
          onClick={onNewTicket}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Raise a Ticket
        </button>
      </div>
    );
  }

  const openCount = tickets.filter(
    (t: any) => t.status === "open" || t.status === "in_progress",
  ).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Summary bar */}
      {openCount > 0 && (
        <div className="mx-5 mt-4 mb-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You have <strong>{openCount}</strong> open ticket{openCount !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
        {tickets.map((ticket: any) => {
          const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
          const StatusIcon = statusCfg.icon;
          const catMeta = CATEGORIES.find((c) => c.value === ticket.category);
          const CatIcon = catMeta?.icon || MessageSquare;

          return (
            <button
              key={ticket.id}
              onClick={() => onTicketClick(ticket.id)}
              className="w-full text-left rounded-xl border border-border/60 bg-card hover:bg-secondary/20 transition-all duration-200 p-4 flex gap-3 group"
            >
              {/* Category icon */}
              <div className="h-9 w-9 rounded-lg bg-secondary/40 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <CatIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium truncate">{ticket.subject}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatRelative(ticket.updated_at)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${statusCfg.bg} ${statusCfg.color}`}
                  >
                    <StatusIcon className="h-2.5 w-2.5" />
                    {statusCfg.label}
                  </span>

                  {/* Category */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other
                    }`}
                  >
                    {catMeta?.label || ticket.category}
                  </span>

                  {/* Plan */}
                  {ticket.subscription_plan_name && (
                    <span className="text-[10px] text-muted-foreground">
                      {ticket.subscription_plan_name} plan
                    </span>
                  )}
                </div>

                {/* Latest comment preview */}
                {ticket.comments?.[0] && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                    {ticket.comments[0].author_type === "admin" ? (
                      <span className="text-primary/80 font-medium">Support: </span>
                    ) : null}
                    {ticket.comments[0].body}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW TICKET FORM
// ─────────────────────────────────────────────────────────────

function NewTicketForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (ticketId: string) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createSupportTicket({
        data: {
          subject,
          description,
          category: category as TicketCategory,
          priority,
        },
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["organizer-support-tickets"] });
      onSuccess(data.id);
    },
    onError: (e: any) => {
      setError(e.message || "Failed to create ticket. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your issue.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    setError("");
    mutation.mutate();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 shrink-0">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {s}
            </div>
            <span className={`text-xs ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "Category & Priority" : "Details"}
            </span>
            {s < 2 && <div className="w-8 h-px bg-border/60 ml-1" />}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 ? (
          <div className="space-y-6">
            {/* Category */}
            <div>
              <h3 className="text-sm font-semibold mb-3">What is this about?</h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-card hover:border-primary/40 hover:bg-secondary/20"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 mb-1.5 ${selected ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <div
                        className={`text-xs font-semibold ${selected ? "text-primary" : "text-foreground"}`}
                      >
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{cat.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Priority</h3>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    title={p.desc}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      priority === p.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/60 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span className={priority === p.value ? p.color : ""}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className="w-full rounded-lg border border-border/60 bg-secondary/20 px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                maxLength={140}
              />
              <div className="text-right text-[10px] text-muted-foreground mt-1">
                {subject.length}/140
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or relevant information."
                rows={8}
                className="w-full rounded-lg border border-border/60 bg-secondary/20 px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border/60 shrink-0 flex gap-3">
        {step === 1 ? (
          <>
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-border/60 text-sm text-muted-foreground hover:bg-secondary/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!category) {
                  setError("Please select a category.");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 rounded-lg border border-border/60 text-sm text-muted-foreground hover:bg-secondary/40 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Ticket
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TICKET DETAIL VIEW
// ─────────────────────────────────────────────────────────────

function TicketDetail({ ticketId }: { ticketId: string }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const {
    data: ticket,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["organizer-ticket-detail", ticketId],
    queryFn: () => getOrganizerTicketWithComments({ data: { ticketId } }),
    refetchInterval: 15000,
  });

  const replyMutation = useMutation({
    mutationFn: () => addOrganizerComment({ data: { ticketId, body: reply } }),
    onSuccess: () => {
      setReply("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["organizer-support-tickets"] });
    },
  });

  useEffect(() => {
    if (ticket?.comments?.length) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.comments?.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) return null;

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;
  const catMeta = CATEGORIES.find((c) => c.value === ticket.category);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Ticket header */}
      <div className="px-5 py-4 border-b border-border/40 shrink-0">
        <h2 className="text-sm font-semibold mb-2 leading-snug">{ticket.subject}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.color}`}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {statusCfg.label}
          </span>
          {/* Category */}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              CATEGORY_COLORS[ticket.category] || CATEGORY_COLORS.other
            }`}
          >
            {catMeta?.label || ticket.category}
          </span>
          {/* Plan */}
          {ticket.subscription_plan_name && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-2.5 w-2.5" />
              {ticket.subscription_plan_name}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {new Date(ticket.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Status message */}
        {ticket.status === "resolved" && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-400">
              This ticket has been resolved by our team.
            </p>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {ticket.comments?.map((comment: SupportTicketComment) => {
          const isAdmin = comment.author_type === "admin";
          return (
            <div key={comment.id} className={`flex gap-3 ${isAdmin ? "" : "flex-row-reverse"}`}>
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isAdmin ? "bg-primary/15 text-primary" : "bg-secondary text-foreground"
                }`}
              >
                {isAdmin ? "S" : comment.author_name?.[0]?.toUpperCase() || "O"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] flex flex-col gap-1 ${isAdmin ? "items-start" : "items-end"}`}
              >
                <div className={`flex items-center gap-2 ${isAdmin ? "" : "flex-row-reverse"}`}>
                  <span className="text-[11px] font-medium text-foreground">
                    {isAdmin ? "Support Team" : "You"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelative(comment.created_at)}
                  </span>
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isAdmin
                      ? "bg-primary/10 border border-primary/20 text-foreground rounded-tl-sm"
                      : "bg-secondary border border-border/60 text-foreground rounded-tr-sm"
                  }`}
                >
                  {comment.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={commentsEndRef} />
      </div>

      {/* Reply box — hide if closed */}
      {ticket.status !== "closed" && (
        <div className="px-5 py-4 border-t border-border/60 shrink-0">
          <div className="flex flex-col gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Add a reply or more details…"
              rows={3}
              className="w-full rounded-xl border border-border/60 bg-secondary/20 px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && reply.trim()) {
                  replyMutation.mutate();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">⌘+Enter to send</span>
              <button
                onClick={() => replyMutation.mutate()}
                disabled={!reply.trim() || replyMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
