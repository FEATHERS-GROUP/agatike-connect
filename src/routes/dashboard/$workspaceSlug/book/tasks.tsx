import { createFileRoute, useParams, Link } from "@tanstack/react-router";
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
  ArrowLeft,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  GripVertical,
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
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const STATUS_COLUMNS: {
  id: Status;
  label: string;
  icon: any;
  color: string;
  bg: string;
  dotColor: string;
}[] = [
  {
    id: "todo",
    label: "To Do",
    icon: CheckSquare,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    dotColor: "bg-slate-400",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    dotColor: "bg-amber-400",
  },
  {
    id: "done",
    label: "Done",
    icon: Check,
    color: "text-green-500",
    bg: "bg-green-500/10",
    dotColor: "bg-green-500",
  },
];

// ─── Sortable Task Card Wrapper ──────────────────────────────────────────────
function SortableTaskCard({
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        allColumns={allColumns}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onClick={onClick}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────────────────────
function DroppableColumn({
  col,
  colTasks,
  allColumns,
  onStatusChange,
  onDelete,
  onTaskClick,
  onAddTask,
  isOver,
}: {
  col: any;
  colTasks: any[];
  allColumns: any[];
  onStatusChange: (id: string, s: Status) => void;
  onDelete: (id: string) => void;
  onTaskClick: (task: any) => void;
  onAddTask: () => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-none w-[300px] snap-center rounded-2xl border transition-all duration-200",
        isOver
          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/50 bg-card/60 backdrop-blur-sm",
      )}
    >
      {/* Column Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", col.dotColor)} />
        <span className="font-semibold text-sm tracking-wide">{col.label}</span>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full shrink-0">
          {colTasks.length} {colTasks.length === 1 ? "TASK" : "TASKS"}
        </span>
        <button
          className="h-6 w-6 rounded-md hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1"
          onClick={onAddTask}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button className="h-6 w-6 rounded-md hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mx-4 h-px bg-border/60" />

      {/* Cards */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto min-h-[250px]">
        <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {colTasks.map((task: any) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              allColumns={allColumns}
              onStatusChange={(s) => onStatusChange(task.id, s)}
              onDelete={() => onDelete(task.id)}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {colTasks.length === 0 && (
          <div
            className={cn(
              "h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors",
              isOver ? "border-primary/40 bg-primary/5" : "border-border/40",
            )}
          >
            <p className="text-xs text-muted-foreground opacity-60">Drop tasks here</p>
          </div>
        )}
      </div>

      {/* Add Task */}
      <div className="p-3 border-t border-border/30">
        <button
          onClick={onAddTask}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add task</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function TasksPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const queryClient = useQueryClient();
  const { canCreateTask } = useSubscriptionLimits(
    activeWorkspace?.orgnizer_id,
    activeWorkspace?.id,
  );

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    due_date: "",
    assigned_to: "",
    status: "todo" as Status,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

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

  const filtered = (tasks as any[]).filter((t) => {
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesSearch =
      !searchQuery ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

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
      dotColor: "bg-slate-400",
    };
  });

  const activeTask = activeId ? (tasks as any[]).find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    const overId = over.id as string;
    if (allColIds.includes(overId)) {
      setOverColumnId(overId);
      return;
    }
    const overTask = (tasks as any[]).find((t) => t.id === overId);
    if (overTask) setOverColumnId(overTask.status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    let targetColumnId: string | null = null;
    if (allColIds.includes(overId)) {
      targetColumnId = overId;
    } else {
      const overTask = (tasks as any[]).find((t) => t.id === overId);
      if (overTask) targetColumnId = overTask.status;
    }

    if (!targetColumnId) return;
    const currentTask = (tasks as any[]).find((t) => t.id === activeTaskId);
    if (!currentTask) return;
    if (currentTask.status !== targetColumnId) {
      updateMutation.mutate({ id: activeTaskId, status: targetColumnId });
    }
  };

  const openCreateForColumn = (colId: string) => {
    if (!canCreateTask()) {
      toast.error("Task Limit Reached", {
        description: "You have reached the maximum number of tasks. Please upgrade your plan.",
      });
      return;
    }
    setForm({ ...form, status: colId });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-2">
        <Link
          to="/dashboard/$workspaceSlug/book"
          params={{ workspaceSlug: wsId && activeWorkspace?.slug ? activeWorkspace.slug : "" }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 hover:bg-secondary px-3 py-1.5 rounded-full border border-border/30"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Agatike Book
        </Link>
      </div>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {(tasks as any[]).filter((t: any) => t.status !== "done").length} open ·{" "}
            {(tasks as any[]).filter((t: any) => t.status === "done").length} completed
          </p>
        </div>
        <Button
          onClick={() => openCreateForColumn("todo")}
          className="rounded-xl gap-2 shadow-[var(--shadow-glow)] px-5"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Create task
        </Button>
      </div>

      {/* ── Nav Tabs + Search + Filters ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-0.5 border-b border-border/50">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              view === "kanban"
                ? "text-foreground border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground",
            )}
          >
            <Kanban className="h-3.5 w-3.5" />
            Task Pipeline
            <span className="ml-1 text-xs font-bold bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">
              {(tasks as any[]).length}
            </span>
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              view === "list"
                ? "text-foreground border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" />
            List View
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1 ml-auto bg-secondary/50 p-1 rounded-xl">
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

        <button className="h-9 w-9 rounded-lg border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* ── Board / List ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : view === "kanban" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {dynamicColumns.map((col) => (
              <DroppableColumn
                key={col.id}
                col={col}
                colTasks={tasksByStatus(col.id)}
                allColumns={dynamicColumns}
                onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
                onDelete={(id) => deleteMutation.mutate(id)}
                onTaskClick={(task) => setEditTask(task)}
                onAddTask={() => openCreateForColumn(col.id)}
                isOver={overColumnId === col.id}
              />
            ))}

            {/* Add Column */}
            <div
              className="flex flex-col flex-none w-[280px] rounded-2xl border border-dashed border-border/50 bg-secondary/10 items-center justify-center min-h-[250px] snap-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer hover:bg-secondary/20"
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
              <div className="h-10 w-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Add Column</span>
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 scale-105 shadow-2xl">
                <TaskCard
                  task={activeTask}
                  allColumns={dynamicColumns}
                  onStatusChange={() => {}}
                  onDelete={() => {}}
                  onClick={() => {}}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* ── List View ────────────────────────────────────────── */
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
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

      {/* ── Create Task Dialog ─────────────────────────────────── */}
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

      {/* ── Edit Task Dialog ───────────────────────────────────── */}
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
                <Label>Status</Label>
                <select
                  value={editTask.status}
                  onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none"
                >
                  {dynamicColumns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => {
                    deleteMutation.mutate(editTask.id);
                    setEditTask(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 h-11 rounded-xl"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Task Card ───────────────────────────────────────────────────────────────
function TaskCard({
  task,
  allColumns,
  onStatusChange,
  onDelete,
  onClick,
  dragListeners,
  dragAttributes,
  isDragging,
}: {
  task: any;
  allColumns: any[];
  onStatusChange: (s: Status) => void;
  onDelete: () => void;
  onClick: () => void;
  dragListeners?: any;
  dragAttributes?: any;
  isDragging?: boolean;
}) {
  const pc = PRIORITY_CONFIG[task.priority as Priority] || PRIORITY_CONFIG.low;

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-rose-500",
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div
      {...dragListeners}
      {...dragAttributes}
      className={cn(
        "rounded-xl bg-card border border-border/50 p-4 hover:border-border hover:shadow-sm transition-all group cursor-grab active:cursor-grabbing select-none",
        isDragging && "shadow-lg ring-2 ring-primary/20",
      )}
      onClick={onClick}
    >
      {/* Priority + drag handle hint */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
            pc.color,
          )}
        >
          {pc.label}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground p-0.5">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Title */}
      <p
        className={cn(
          "text-sm font-semibold leading-snug mb-3 text-foreground",
          task.status === "done" && "line-through opacity-50",
        )}
      >
        {task.title}
      </p>

      {/* Description snippet */}
      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
        {task.assigned_to ? (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                getAvatarColor(task.assigned_to),
              )}
            >
              {getInitials(task.assigned_to)}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {task.assigned_to}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
              <User className="h-3 w-3" />
            </div>
            <span className="text-xs text-muted-foreground">Unassigned</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
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
      </div>
    </div>
  );
}
