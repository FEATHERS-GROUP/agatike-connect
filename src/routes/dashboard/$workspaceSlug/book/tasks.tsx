import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  Plus,
  CheckSquare,
  Clock,
  Check,
  Loader2,
  Trash2,
  AlertCircle,
  Kanban,
  List,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceTasks, createWorkspaceTask, updateWorkspaceTask, deleteWorkspaceTask } from "@/api/tasks";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/book/tasks")({
  component: TasksPage,
});

type Status = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "bg-blue-500/15 text-blue-500 border-blue-500/30", dot: "bg-blue-500" },
  medium: { label: "Medium", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", dot: "bg-yellow-500" },
  high: { label: "High", color: "bg-orange-500/15 text-orange-500 border-orange-500/30", dot: "bg-orange-500" },
  urgent: { label: "Urgent", color: "bg-red-500/15 text-red-500 border-red-500/30", dot: "bg-red-500" },
};

const STATUS_COLUMNS: { id: Status; label: string; icon: any; color: string; bg: string }[] = [
  { id: "todo", label: "To Do", icon: CheckSquare, color: "text-slate-500", bg: "bg-slate-500/10" },
  { id: "in_progress", label: "In Progress", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "done", label: "Done", icon: Check, color: "text-green-500", bg: "bg-green-500/10" },
];

function TasksPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    due_date: "",
    assigned_to: "",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["workspace-tasks", wsId],
    queryFn: () => getWorkspaceTasks({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createWorkspaceTask({ data: { workspace_id: wsId, title: form.title, description: form.description || null, priority: form.priority, status: "todo", due_date: form.due_date || null, assigned_to: form.assigned_to || null } } as any),
    onSuccess: () => {
      toast.success("Task created!");
      setCreateOpen(false);
      setForm({ title: "", description: "", priority: "medium", due_date: "", assigned_to: "" });
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks", wsId] });
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; status: Status }) =>
      updateWorkspaceTask({ data: { id: vars.id, status: vars.status } } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-tasks", wsId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkspaceTask({ data: { id } } as any),
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks", wsId] });
    },
  });

  const filtered = (tasks as any[]).filter(
    (t) => filterPriority === "all" || t.priority === filterPriority,
  );

  const tasksByStatus = (status: Status) => filtered.filter((t: any) => t.status === status);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {(tasks as any[]).filter((t: any) => t.status !== "done").length} open ·{" "}
            {(tasks as any[]).filter((t: any) => t.status === "done").length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
            {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                  filterPriority === p
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                view === "kanban" ? "bg-background shadow-sm text-primary" : "text-muted-foreground",
              )}
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                view === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : view === "kanban" ? (
        /* ── Kanban board ────────────────────────────────────── */
        <div className="grid grid-cols-3 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasksByStatus(col.id);
            return (
              <div key={col.id} className="rounded-3xl border border-border/60 bg-card/50 overflow-hidden">
                <div className={`p-4 border-b border-border/60 flex items-center gap-2.5`}>
                  <div className={`h-8 w-8 rounded-xl ${col.bg} ${col.color} flex items-center justify-center`}>
                    <col.icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{col.label}</span>
                  <span className="ml-auto text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {colTasks.map((task: any) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => updateMutation.mutate({ id: task.id, status })}
                      onDelete={() => deleteMutation.mutate(task.id)}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs py-8">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List view ──────────────────────────────────────── */
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-secondary/30 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            <span>Task</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Due</span>
            <span></span>
          </div>
          <div className="divide-y divide-border/50">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                No tasks yet. Create your first one!
              </div>
            )}
            {filtered.map((task: any) => {
              const pc = PRIORITY_CONFIG[task.priority as Priority] || PRIORITY_CONFIG.low;
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-secondary/20 transition-colors"
                >
                  <div>
                    <p className={cn("font-medium text-sm", task.status === "done" && "line-through opacity-50")}>
                      {task.title}
                    </p>
                    {task.assigned_to && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" /> {task.assigned_to}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", pc.color)}>
                    {pc.label}
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => updateMutation.mutate({ id: task.id, status: e.target.value as Status })}
                    className="text-xs font-medium rounded-lg border border-input bg-background px-2 py-1 focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {task.due_date ? (
                      <>
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-40 hover:opacity-100"
                    onClick={() => deleteMutation.mutate(task.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">New Task</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                required
                placeholder="e.g. Follow up with venue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional details..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Input
                placeholder="Name or email"
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full h-11 rounded-xl"
              style={{ background: "var(--gradient-primary)" }}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({ task, onStatusChange, onDelete }: { task: any; onStatusChange: (s: Status) => void; onDelete: () => void }) {
  const pc = PRIORITY_CONFIG[task.priority as Priority] || PRIORITY_CONFIG.low;
  const nextStatus: Record<Status, Status> = { todo: "in_progress", in_progress: "done", done: "todo" };

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", pc.color)}>
          {pc.label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <p className={cn("text-sm font-medium leading-snug mb-3", task.status === "done" && "line-through opacity-50")}>
        {task.title}
      </p>
      <div className="flex items-center justify-between gap-2">
        {task.due_date && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
        <button
          onClick={() => onStatusChange(nextStatus[task.status as Status])}
          className="ml-auto text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          {task.status === "done" ? "Reopen" : task.status === "todo" ? "Start" : "Complete"}
          <ChevronDown className="h-3 w-3 -rotate-90" />
        </button>
      </div>
    </div>
  );
}
