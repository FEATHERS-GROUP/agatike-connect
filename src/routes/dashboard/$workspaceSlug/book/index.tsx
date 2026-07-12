import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  CheckSquare,
  StickyNote,
  TrendingUp,
  ShoppingCart,
  FileText,
  ArrowRight,
  Sparkles,
  HardDrive
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceTasks } from "@/api/tasks";
import { getWorkspaceNotes } from "@/api/notes";
import { getProcurementInvoices } from "@/api/procurement";
import { getAgatikeBooksByWorkspace } from "@/api/book";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/")({
  component: AgatikeBookHub,
});

function AgatikeBookHub() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;

  const { data: tasks = [] } = useQuery({
    queryKey: ["workspace-tasks", wsId],
    queryFn: () => getWorkspaceTasks({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });
  const { data: notes = [] } = useQuery({
    queryKey: ["workspace-notes", wsId],
    queryFn: () => getWorkspaceNotes({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["procurement-invoices", wsId],
    queryFn: () => getProcurementInvoices({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });
  const { data: books = [] } = useQuery({
    queryKey: ["workspace-books", wsId],
    queryFn: () => getAgatikeBooksByWorkspace({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const openTasks = (tasks as any[]).filter((t) => t.status !== "done").length;
  const pinnedNotes = (notes as any[]).filter((n) => n.pinned).length;
  const draftInvoices = (invoices as any[]).filter((i) => i.status === "draft").length;
  const pendingInvoices = (invoices as any[]).filter(
    (i) => i.status === "sent" || i.status === "overdue",
  ).length;

  const sections = [
    {
      id: "tasks",
      label: "Tasks",
      description: "Manage and track work across your team with a kanban board.",
      icon: CheckSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      gradient: "from-blue-500/10 to-blue-600/5",
      href: `/dashboard/${workspaceSlug}/book/tasks`,
      stat: openTasks > 0 ? `${openTasks} open` : "All clear",
      statColor: openTasks > 0 ? "text-blue-500" : "text-green-500",
    },
    {
      id: "notes",
      label: "Notes",
      description: "Capture ideas, meeting notes, and important information.",
      icon: StickyNote,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      gradient: "from-amber-500/10 to-amber-600/5",
      href: `/dashboard/${workspaceSlug}/book/notes`,
      stat: `${(notes as any[]).length} notes${pinnedNotes > 0 ? ` · ${pinnedNotes} pinned` : ""}`,
      statColor: "text-amber-500",
    },
    {
      id: "finance",
      label: "Finance",
      description: "Full workspace P&L — revenue, expenses, and net position.",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/10 to-emerald-600/5",
      href: `/dashboard/${workspaceSlug}/book/finance`,
      stat: "Live overview",
      statColor: "text-emerald-500",
    },
    {
      id: "books",
      label: "Custom Books",
      description: "Spreadsheet-style tracking for staff, expenses, checklists & more.",
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      gradient: "from-purple-500/10 to-purple-600/5",
      href: `/dashboard/${workspaceSlug}/book/books`,
      stat: `${(books as any[]).length} books`,
      statColor: "text-purple-500",
    },
    {
      id: "procurement",
      label: "Procurement",
      description: "Create proforma invoices, bills, and share with clients.",
      icon: ShoppingCart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      gradient: "from-rose-500/10 to-rose-600/5",
      href: `/dashboard/${workspaceSlug}/book/procurement`,
      stat:
        draftInvoices + pendingInvoices > 0
          ? `${draftInvoices} draft · ${pendingInvoices} pending`
          : `${(invoices as any[]).length} invoices`,
      statColor:
        pendingInvoices > 0
          ? "text-orange-500"
          : draftInvoices > 0
            ? "text-amber-500"
            : "text-rose-500",
    },
    {
      id: "drive",
      label: "Drive Manager",
      description: "Browse exported Excel files and pull data from Google Drive.",
      icon: HardDrive,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      gradient: "from-indigo-500/10 to-indigo-600/5",
      href: `/dashboard/${workspaceSlug}/book/drive`,
      stat: "Connected",
      statColor: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            <Sparkles className="h-3 w-3" /> Business Suite
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Agatike Book</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Everything you need to run{" "}
            <span className="font-semibold text-foreground">{activeWorkspace?.name}</span> — tasks,
            notes, finances, and procurement in one place.
          </p>
        </div>
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((s) => (
          <Link
            key={s.id}
            to={s.href as any}
            className={`group relative overflow-hidden rounded-3xl border ${s.border} bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60`} />
            <div className="relative p-6 flex flex-col h-full min-h-[180px]">
              <div
                className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{s.label}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed flex-1">
                {s.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                <span className={`text-xs font-semibold ${s.statColor}`}>{s.stat}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity strip */}
      {(tasks as any[]).length > 0 && (
        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-500" /> Recent Tasks
          </h2>
          <div className="space-y-2">
            {(tasks as any[]).slice(0, 5).map((task: any) => {
              const priorityColors: Record<string, string> = {
                urgent: "bg-red-500/15 text-red-500",
                high: "bg-orange-500/15 text-orange-500",
                medium: "bg-yellow-500/15 text-yellow-600",
                low: "bg-blue-500/15 text-blue-500",
              };
              const statusColors: Record<string, string> = {
                done: "text-green-500",
                in_progress: "text-amber-500",
                todo: "text-muted-foreground",
              };
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColors[task.priority] || "bg-secondary text-muted-foreground"}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-sm font-medium ${task.status === "done" ? "line-through opacity-50" : ""}`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold capitalize ${statusColors[task.status] || ""}`}
                  >
                    {task.status?.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
          <Link
            to={`/dashboard/${workspaceSlug}/book/tasks` as any}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
          >
            View all tasks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
