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
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceTasks,
  createWorkspaceTask,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from "@/api/tasks";
import { getWorkspaceUsers } from "@/api/workspace_users";
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

type Status = string;
type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low: {
    label: "Low",
    color: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    dot: "bg-blue-500",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  high: {
    label: "High",
    color: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    dot: "bg-orange-500",
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-500/15 text-red-500 border-red-500/30",
    dot: "bg-red-500",
  },
};

const STATUS_COLUMNS: { id: Status; label: string; icon: any; color: string; bg: string }[] = [
  { id: "todo", label: "To Do", icon: CheckSquare, color: "text-slate-500", bg: "bg-slate-500/10" },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  { id: "done", label: "Done", icon: Check, color: "text-green-500", bg: "bg-green-500/10" },
];

function TasksPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    due_date: "",
    assigned_to: "",
    status: "todo" as Status,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["workspace-users"],
    queryFn: () => getWorkspaceUsers(),
  });

  const [localColumns, setLocalColumns] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`workspace-task-cols-${wsId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (wsId) {
      localStorage.setItem(`workspace-task-cols-${wsId}`, JSON.stringify(localColumns));
    }
  }, [localColumns, wsId]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["workspace-tasks", wsId],
    queryFn: () => getWorkspaceTasks({ data: { workspace_id: wsId! } } as any),
    enabled: !!wsId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createWorkspaceTask({
        data: {
          workspace_id: wsId,
          title: form.title,
          description: form.description || null,
          priority: form.priority,
          status: form.status,
          due_date: form.due_date || null,
          assigned_to: form.assigned_to || null,
        },
      } as any),
    onSuccess: () => {
      toast.success("Task created!");
      setCreateOpen(false);
      setForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to: "",
        status: "todo",
      });
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks", wsId] });
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; [k: string]: any }) => {
      const { id, ...rest } = vars;
      return updateWorkspaceTask({ data: { id, ...rest } } as any);
    },
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

  const defaultCols = ["todo", "in_progress", "done"];
  const dbCols = Array.from(new Set(tasks.map((t: any) => t.status)));
  const allColIds = Array.from(new Set([...defaultCols, ...localColumns, ...dbCols]));

  const dynamicColumns = allColIds.map((id) => {
    const def = STATUS_COLUMNS.find((c) => c.id === id);
    if (def) return def;
    return {
      id,
      label: (id as string).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: CheckSquare,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    };
  });

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
                view === "kanban"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground",
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
            onClick={() => {
              setForm({ ...form, status: "todo" });
              setCreateOpen(true);
            }}
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
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {dynamicColumns.map((col) => {
            const colTasks = tasksByStatus(col.id);
            return (
              <div
                key={col.id}
                className="rounded-3xl border border-border/60 bg-card/50 overflow-hidden flex-none w-[320px] snap-center flex flex-col max-h-[80vh]"
              >
                <div className={`p-4 border-b border-border/60 flex items-center gap-2.5`}>
                  <div
                    className={`h-8 w-8 rounded-xl ${col.bg} ${col.color} flex items-center justify-center shrink-0`}
                  >
                    <col.icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold truncate">{col.label}</span>
                  <span className="ml-auto text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">
                    {colTasks.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 flex-1 overflow-y-auto min-h-[200px]">
                  {colTasks.map((task: any) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      allColumns={dynamicColumns}
                      onStatusChange={(status) => updateMutation.mutate({ id: task.id, status })}
                      onDelete={() => deleteMutation.mutate(task.id)}
                      onClick={() => setEditTask(task)}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs py-8 opacity-60">
                      No tasks here
                    </p>
                  )}
                </div>
                <div className="p-3 border-t border-border/30 bg-secondary/10">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => {
                      setForm({ ...form, status: col.id as string });
                      setCreateOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Task...
                  </Button>
                </div>
              </div>
            );
          })}
          <div
            className="flex flex-col flex-none w-[320px] rounded-3xl border border-dashed border-border/60 bg-secondary/20 items-center justify-center min-h-[200px] snap-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => {
              const name = prompt("Enter new column name:");
              if (name) {
                const id = name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "_")
                  .replace(/(^_|_$)/g, "");
                if (id && !localColumns.includes(id)) {
                  setLocalColumns((prev) => [...prev, id]);
                }
              }
            }}
          >
            <div className="h-12 w-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-3">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium">Add Column</span>
          </div>
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
                    <p
                      className={cn(
                        "font-medium text-sm",
                        task.status === "done" && "line-through opacity-50",
                      )}
                    >
                      {task.title}
                    </p>
                    {task.assigned_to && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3" /> {task.assigned_to}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                      pc.color,
                    )}
                  >
                    {pc.label}
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateMutation.mutate({ id: task.id, status: e.target.value as Status })
                    }
                    className="text-xs font-medium rounded-lg border border-input bg-background px-2 py-1 focus:outline-none"
                  >
                    {dynamicColumns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {task.due_date ? (
                      <>
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
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
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
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
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none"
              >
                <option value="">Unassigned</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
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

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate(editTask);
                setEditTask(null);
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label>Task Title *</Label>
                <Input
                  required
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  value={editTask.description || ""}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select
                    value={editTask.priority}
                    onChange={(e) =>
                      setEditTask({ ...editTask, priority: e.target.value as Priority })
                    }
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
                    value={editTask.due_date || ""}
                    onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <select
                  value={editTask.assigned_to || ""}
                  onChange={(e) => setEditTask({ ...editTask, assigned_to: e.target.value })}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full h-11 rounded-xl"
                style={{ background: "var(--gradient-primary)" }}
              >
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskCard({
  task,
  allColumns,
  onStatusChange,
  onDelete,
  onClick,
}: {
  task: any;
  allColumns: any[];
  onStatusChange: (s: Status) => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const pc = PRIORITY_CONFIG[task.priority as Priority] || PRIORITY_CONFIG.low;

  return (
    <div
      className="rounded-2xl bg-card border border-border/60 p-4 hover:border-primary/30 transition-colors group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
            pc.color,
          )}
        >
          {pc.label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <p
        className={cn(
          "text-sm font-medium leading-snug mb-3",
          task.status === "done" && "line-through opacity-50",
        )}
      >
        {task.title}
      </p>
      <div className="flex items-center flex-wrap gap-2 mb-2">
        {task.assigned_to && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-md">
            <User className="h-3 w-3" /> {task.assigned_to}
          </span>
        )}
        {task.due_date && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-md">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/30 pt-2 mt-2">
        <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs font-semibold text-primary bg-transparent focus:outline-none cursor-pointer hover:underline"
          >
            {allColumns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
