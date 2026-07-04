import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSupportTicket,
  getOrganizerTickets,
  getOrganizerTicketWithComments,
  addOrganizerComment,
} from "@/api/support";
import type { SupportTicketComment, TicketCategory, TicketPriority } from "@/api/support";
import {
  LifeBuoy,
  Plus,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  CreditCard,
  Bug,
  Zap,
  Tag,
  FileQuestion,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Ticket,
  Sparkles,
  ShieldCheck,
  History,
  Info,
  Wrench,
  PauseCircle,
  MinusCircle,
  Code2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/support")({
  component: SupportPage,
  head: () => ({
    meta: [{ title: "Help & Support — Agatike" }],
  }),
});

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const CATEGORIES: {
  value: TicketCategory;
  label: string;
  icon: any;
  desc: string;
  color: string;
  bg: string;
}[] = [
  {
    value: "billing",
    label: "Billing",
    icon: CreditCard,
    desc: "Invoices & charges",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/25",
  },
  {
    value: "subscription",
    label: "Subscription",
    icon: Zap,
    desc: "Plans & renewals",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/25",
  },
  {
    value: "payment",
    label: "Payment",
    icon: CreditCard,
    desc: "Transactions & refunds",
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/25",
  },
  {
    value: "event",
    label: "Event Issue",
    icon: Ticket,
    desc: "Setup & attendees",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/25",
  },
  {
    value: "model_issue",
    label: "Model Issue",
    icon: FileQuestion,
    desc: "AI & recommendations",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/25",
  },
  {
    value: "request",
    label: "Feature Request",
    icon: Sparkles,
    desc: "Ideas & improvements",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/25",
  },
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    desc: "Something broken",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/25",
  },
  {
    value: "other",
    label: "Other",
    icon: MessageSquare,
    desc: "General questions",
    color: "text-slate-400",
    bg: "bg-secondary/40 border-border/40",
  },
];

const PRIORITIES: {
  value: TicketPriority;
  label: string;
  emoji: string;
  desc: string;
  activeClass: string;
}[] = [
  {
    value: "low",
    label: "Low",
    emoji: "🟢",
    desc: "Not urgent",
    activeClass: "border-slate-400 bg-slate-400/10 text-slate-600 dark:text-slate-300",
  },
  {
    value: "normal",
    label: "Normal",
    emoji: "🔵",
    desc: "Standard",
    activeClass: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    value: "high",
    label: "High",
    emoji: "🟠",
    desc: "Affects my work",
    activeClass: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    value: "urgent",
    label: "Urgent",
    emoji: "🔴",
    desc: "Critical",
    activeClass: "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
  },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  open: {
    label: "Open",
    icon: AlertCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  troubleshooting: {
    label: "Troubleshooting",
    icon: Wrench,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  pending_customer_response: {
    label: "Waiting on You",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  on_hold: {
    label: "On Hold",
    icon: PauseCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  suspended: {
    label: "Suspended",
    icon: MinusCircle,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  under_development: {
    label: "Under Development",
    icon: Code2,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
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

const CATEGORY_BADGE: Record<string, string> = {
  billing: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  subscription: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  payment: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  event: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  model_issue: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  request: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  bug: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  other: "bg-secondary/40 text-muted-foreground border-border/40",
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const d = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (d < 1) return "just now";
  if (d < 60) return `${d}m ago`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

type View = "list" | "new" | "detail";

function SupportPage() {
  const [view, setView] = useState<View>("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {view !== "list" && (
            <button
              onClick={() => setView("list")}
              className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LifeBuoy className="h-[18px] w-[18px] text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">
                {view === "list"
                  ? "Help & Support"
                  : view === "new"
                    ? "New Support Ticket"
                    : "Ticket Thread"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                {view === "list"
                  ? "Get help from our team — we usually reply within 24h"
                  : view === "new"
                    ? "Tell us what's going on and we'll get back to you"
                    : "Your conversation with the support team"}
              </p>
            </div>
          </div>
        </div>

        {view === "list" && (
          <button
            onClick={() => setView("new")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-md hover:shadow-primary/20 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            New Ticket
          </button>
        )}
      </div>

      {view === "list" && (
        <TicketListView
          onNewTicket={() => setView("new")}
          onTicketClick={(id) => {
            setSelectedTicketId(id);
            setView("detail");
          }}
        />
      )}
      {view === "new" && (
        <NewTicketView
          onSuccess={(id) => {
            setSelectedTicketId(id);
            setView("detail");
          }}
          onCancel={() => setView("list")}
        />
      )}
      {view === "detail" && selectedTicketId && <TicketDetailView ticketId={selectedTicketId} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────────────────────

function TicketListView({
  onNewTicket,
  onTicketClick,
}: {
  onNewTicket: () => void;
  onTicketClick: (id: string) => void;
}) {
  const {
    data: tickets = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["organizer-support-tickets"],
    queryFn: () => getOrganizerTickets(),
    refetchInterval: 30000,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-52">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );

  // ── Empty state ──
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LifeBuoy className="h-7 w-7 text-primary/60" />
          </div>
          <div>
            <h2 className="text-base font-bold mb-1">No tickets yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Having an issue or question? Raise a ticket and our team will get back to you.
            </p>
          </div>
          <button
            onClick={onNewTicket}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-md hover:shadow-primary/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Raise a Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-border/40 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          {[
            {
              icon: CreditCard,
              label: "Billing & Payments",
              desc: "Questions about invoices or charges",
            },
            { icon: Zap, label: "Subscription", desc: "Plan changes, renewals, cancellations" },
            { icon: Bug, label: "Report a Bug", desc: "Something not working as expected" },
          ].map((c) => (
            <button
              key={c.label}
              onClick={onNewTicket}
              className="flex items-start gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const openCount = tickets.filter(
    (t: any) => t.status === "open" || t.status === "in_progress",
  ).length;
  const resolvedCount = tickets.filter(
    (t: any) => t.status === "resolved" || t.status === "closed",
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: tickets.length, color: "text-foreground" },
          { label: "Open / In Progress", value: openCount, color: "text-amber-500" },
          { label: "Resolved", value: resolvedCount, color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3.5">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {openCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
            You have <strong>{openCount}</strong> open ticket{openCount !== 1 ? "s" : ""}. Our team
            is on it.
          </p>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded hover:bg-amber-500/10 transition-colors text-amber-600 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
        {/* Desktop header */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3 bg-secondary/30 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Subject</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1" />
        </div>

        <div className="divide-y divide-border/40">
          {tickets.map((ticket: any) => {
            const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const StIcon = st.icon;
            const cat = CATEGORIES.find((c) => c.value === ticket.category);

            return (
              <button
                key={ticket.id}
                onClick={() => onTicketClick(ticket.id)}
                className="w-full text-left group hover:bg-secondary/10 transition-colors"
              >
                {/* Desktop */}
                <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-3.5 items-center">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${cat ? cat.bg : "bg-secondary/40 border border-border/40"} group-hover:opacity-80 transition-opacity`}
                    >
                      {cat ? (
                        <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{ticket.subject}</p>
                      {ticket.subscription_plan_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CreditCard className="h-2.5 w-2.5" />
                          {ticket.subscription_plan_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${CATEGORY_BADGE[ticket.category] || CATEGORY_BADGE.other}`}
                    >
                      {cat?.label || ticket.category}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${st.bg} ${st.color}`}
                    >
                      <StIcon className="h-2.5 w-2.5" />
                      {st.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {timeAgo(ticket.updated_at)}
                    {ticket.comments?.[0]?.author_type === "admin" && (
                      <span className="block text-primary text-[10px] mt-0.5 font-medium">
                        ↩ Support replied
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden flex items-start gap-3 px-4 py-3.5">
                  <div
                    className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${cat ? cat.bg : "bg-secondary/40 border border-border/40"}`}
                  >
                    {cat ? (
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold truncate flex-1">{ticket.subject}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${st.bg} ${st.color}`}
                      >
                        <StIcon className="h-2.5 w-2.5" />
                        {st.label}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CATEGORY_BADGE[ticket.category] || CATEGORY_BADGE.other}`}
                      >
                        {cat?.label || ticket.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {timeAgo(ticket.updated_at)}
                      </span>
                    </div>
                    {ticket.comments?.[0]?.author_type === "admin" && (
                      <p className="text-[10px] text-primary font-medium mt-1">↩ Support replied</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW TICKET FORM
// ─────────────────────────────────────────────────────────────

function NewTicketView({
  onSuccess,
  onCancel,
}: {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createSupportTicket({
        data: { subject, description, category: category as TicketCategory, priority },
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["organizer-support-tickets"] });
      onSuccess(data.id);
    },
    onError: (e: any) => setError(e.message || "Failed to submit. Please try again."),
  });

  const handleSubmit = () => {
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your issue.");
      return;
    }
    setError("");
    mutation.mutate();
  };

  const selectedCat = CATEGORIES.find((c) => c.value === category);
  const selectedPri = PRIORITIES.find((p) => p.value === priority);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ── LEFT: Form ── */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-border/40 bg-secondary/20 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ticket className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Create a Support Ticket</p>
              <p className="text-[11px] text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                Category <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`group flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                        selected
                          ? `${cat.bg} border-current shadow-sm`
                          : "border-border/50 hover:border-border hover:bg-secondary/30"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${selected ? cat.color : "text-muted-foreground"}`}
                      />
                      <span
                        className={`text-xs font-semibold leading-tight ${selected ? cat.color : "text-foreground"}`}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => {
                  const sel = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        sel
                          ? p.activeClass + " border-2"
                          : "border-border/60 text-muted-foreground hover:border-border hover:bg-secondary/30"
                      }`}
                    >
                      <span>{p.emoji}</span>
                      {p.label}
                      <span
                        className={`font-normal ${sel ? "opacity-70" : "hidden sm:inline opacity-50"}`}
                      >
                        — {p.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Subject <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                maxLength={140}
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-muted-foreground">{subject.length}/140</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in detail — include steps to reproduce, error messages, or any relevant context. The more detail you share, the faster we can resolve it."
                rows={6}
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1 border-t border-border/40">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-full border border-border/60 text-sm text-muted-foreground hover:bg-secondary/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all hover:shadow-md hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Submit Ticket
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Summary sidebar ── */}
        <div className="space-y-3">
          {/* Ticket preview */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 bg-secondary/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ticket Preview
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Category</span>
                {selectedCat ? (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${selectedCat.bg} ${selectedCat.color}`}
                  >
                    <selectedCat.icon className="h-3 w-3" />
                    {selectedCat.label}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Not selected</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Priority</span>
                {selectedPri ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${selectedPri.activeClass}`}
                  >
                    {selectedPri.emoji} {selectedPri.label}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Normal</span>
                )}
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0 mt-0.5">Subject</span>
                <span className="text-xs font-medium text-foreground flex-1 break-words">
                  {subject || <span className="text-muted-foreground italic">Untitled</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 bg-secondary/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tips for faster help
              </p>
            </div>
            <ul className="p-4 space-y-2.5">
              {[
                "Include exact error messages",
                "Describe steps to reproduce",
                "Share your browser/OS if relevant",
                "Attach screenshots when useful",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* SLA */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              We respond to all tickets <strong className="text-foreground">within 24 hours</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TICKET DETAIL VIEW
// ─────────────────────────────────────────────────────────────

function TicketDetailView({ ticketId }: { ticketId: string }) {
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );

  if (!ticket) return null;

  const st = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StIcon = st.icon;
  const cat = CATEGORIES.find((c) => c.value === ticket.category);

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* ── CRM HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 rounded-xl border border-border/60 bg-card shadow-sm relative overflow-hidden">
        {/* Subtle decorative background matching category */}
        {cat && (
          <div
            className={`absolute top-0 right-0 w-64 h-64 ${cat.bg} rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none`}
          />
        )}

        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${cat ? `${cat.bg} ${cat.color} border-${cat.color.split("-")[1]}-500/20` : "bg-secondary border-border/50 text-muted-foreground"}`}
          >
            {cat ? <cat.icon className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Ticket
              </span>
              <span className="text-[11px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/40">
                #{ticket.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{ticket.subject}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium text-sm shadow-sm ${st.bg} ${st.color} border-current/20`}
          >
            <StIcon className="h-4 w-4" />
            {st.label}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 bg-background border border-border/60 shadow-sm rounded-md hover:bg-secondary transition-colors text-muted-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT: MAIN TIMELINE & PUBLISHER ── */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Status Alert */}
          {ticket.status === "resolved" && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-green-800 dark:text-green-300">
                  Ticket Resolved
                </h4>
                <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-0.5">
                  This issue has been marked as resolved. If you are still experiencing problems,
                  posting a new reply will automatically reopen the ticket.
                </p>
              </div>
            </div>
          )}

          {/* Publisher Box */}
          {ticket.status !== "closed" && (
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <div className="bg-secondary/30 px-4 py-2.5 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Post an Update
              </div>
              <div className="p-0">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={
                    ticket.status === "resolved"
                      ? "Reply to reopen this ticket..."
                      : "Type your message here to update the support team..."
                  }
                  rows={4}
                  className="w-full bg-transparent p-4 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && reply.trim())
                      replyMutation.mutate();
                  }}
                />
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/10 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground font-medium bg-background px-2 py-1 rounded border border-border/40 hidden sm:inline-block">
                    Press ⌘+Enter to send
                  </span>
                  <div className="sm:hidden" />
                  <button
                    onClick={() => replyMutation.mutate()}
                    disabled={!reply.trim() || replyMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Share"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Activity Timeline</h3>
            </div>

            <div className="p-5 sm:p-6">
              {!ticket.comments || ticket.comments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <MessageSquare className="h-5 w-5 opacity-40" />
                  </div>
                  No activity yet. Our team will review your ticket shortly.
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] sm:before:left-[15px] before:w-px before:bg-border/60">
                  {ticket.comments?.map((comment: SupportTicketComment) => {
                    const isAdmin = comment.author_type === "admin";
                    return (
                      <div key={comment.id} className="relative group">
                        {/* Timeline Node */}
                        <div
                          className={`absolute -left-[30px] sm:-left-[38px] top-0 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 border-card z-10 shadow-sm ${
                            isAdmin
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {isAdmin ? "S" : comment.author_name?.[0]?.toUpperCase() || "O"}
                        </div>

                        {/* Content Box */}
                        <div
                          className={`rounded-lg border shadow-sm p-4 ${
                            isAdmin
                              ? "bg-primary/[0.02] border-primary/15"
                              : "bg-card border-border/60"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <span className="text-xs font-bold flex items-center gap-1.5">
                              {isAdmin ? "Support Team" : comment.author_name || "You"}
                              {isAdmin && <ShieldCheck className="h-3 w-3 text-primary" />}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium bg-secondary/50 px-2 py-0.5 rounded-full border border-border/40 w-fit">
                              {new Date(comment.created_at).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
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

        {/* ── RIGHT: DETAILS PANEL ── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 bg-secondary/30 flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Ticket Details</h3>
            </div>

            <div className="divide-y divide-border/40">
              {/* Category */}
              <div className="p-4 flex flex-col gap-1.5 hover:bg-secondary/10 transition-colors">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </span>
                <div className="flex items-center gap-2">
                  {cat ? (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${cat.color}`}
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </span>
                  ) : (
                    <span className="text-sm font-medium">{ticket.category}</span>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="p-4 flex flex-col gap-1.5 hover:bg-secondary/10 transition-colors">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold capitalize">
                    {ticket.priority}
                    {ticket.priority === "urgent" && " 🔥"}
                    {ticket.priority === "high" && " 🔴"}
                  </span>
                </div>
              </div>

              {/* Plan */}
              {ticket.subscription_plan_name && (
                <div className="p-4 flex flex-col gap-1.5 hover:bg-secondary/10 transition-colors">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Related Plan
                  </span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{ticket.subscription_plan_name}</span>
                  </div>
                </div>
              )}

              {/* Created */}
              <div className="p-4 flex flex-col gap-1.5 hover:bg-secondary/10 transition-colors">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Opened On
                </span>
                <span className="text-sm font-medium">
                  {new Date(ticket.created_at).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* ID */}
              <div className="p-4 flex flex-col gap-1.5 hover:bg-secondary/10 transition-colors bg-secondary/5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  System ID
                </span>
                <span className="text-xs font-mono text-muted-foreground break-all">
                  {ticket.id}
                </span>
              </div>
            </div>
          </div>

          {/* Support Info Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Standard SLA</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our support team operates Monday to Friday. We aim to respond to all standard
                requests within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
