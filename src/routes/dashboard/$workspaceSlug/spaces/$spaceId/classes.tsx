import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSpaceClasses,
  createSpaceClass,
  updateSpaceClass,
  deleteSpaceClass,
} from "@/api/space_classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dumbbell,
  Plus,
  Pencil,
  Trash2,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/classes")({
  component: ClassesPage,
});

const EMPTY_FORM = {
  name: "",
  description: "",
  duration_minutes: 60,
  max_capacity: 20,
  price: 0,
  is_free_with_subscription: true,
  status: "active",
};

function ClassesPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["space_classes", spaceId],
    queryFn: () => getSpaceClasses({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const createMutation = useMutation({
    mutationFn: createSpaceClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_classes", spaceId] });
      toast.success("Class created!");
      setShowDialog(false);
    },
    onError: () => toast.error("Failed to create class."),
  });

  const updateMutation = useMutation({
    mutationFn: updateSpaceClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_classes", spaceId] });
      toast.success("Class updated!");
      setShowDialog(false);
    },
    onError: () => toast.error("Failed to update class."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpaceClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_classes", spaceId] });
      toast.success("Class deleted.");
    },
    onError: () => toast.error("Failed to delete class."),
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setShowDialog(true);
  };
  const openEdit = (cls: any) => {
    setEditTarget(cls);
    setForm({
      name: cls.name,
      description: cls.description || "",
      duration_minutes: cls.duration_minutes,
      max_capacity: cls.max_capacity,
      price: cls.price,
      is_free_with_subscription: cls.is_free_with_subscription,
      status: cls.status,
    });
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      updateMutation.mutate({ data: { id: editTarget.id, object: form } });
    } else {
      createMutation.mutate({ data: { object: { ...form, space_id: spaceId } } });
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-500",
    draft: "bg-muted text-muted-foreground",
    archived: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-orange-500" />
            Classes
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Define the class types offered at your space.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="shrink-0 gap-2 rounded-xl h-10 px-5 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" />
          New Class
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading classes...</p>
      ) : classes.length === 0 ? (
        <div className="bg-secondary/30 border border-dashed border-border rounded-2xl p-12 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">No classes yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first class template like "Yoga", "Boxing", or "Spin".
          </p>
          <Button onClick={openCreate} variant="outline" className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Create a Class
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls: any) => (
            <div
              key={cls.id}
              className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-orange-500/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight">{cls.name}</h3>
                  {cls.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {cls.description}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${statusColors[cls.status] || statusColors.draft}`}
                >
                  {cls.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>{cls.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2 text-sm">
                  <Users className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>Max {cls.max_capacity}</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/40 rounded-lg px-3 py-2 text-sm">
                  <DollarSign className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span>
                    {Number(cls.price) === 0 ? "Free" : `${Number(cls.price).toLocaleString()}`}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${cls.is_free_with_subscription ? "bg-green-500/10 text-green-600" : "bg-secondary/40"}`}
                >
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {cls.is_free_with_subscription ? "Free w/ Sub" : "Not included"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 rounded-lg"
                  onClick={() => openEdit(cls)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                  onClick={() => {
                    if (confirm(`Delete class "${cls.name}"?`)) {
                      deleteMutation.mutate({ data: { id: cls.id } });
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Class" : "New Class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Class Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Morning Yoga, Spin Class"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this class..."
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  min={5}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Capacity</label>
                <Input
                  type="number"
                  min={1}
                  value={form.max_capacity}
                  onChange={(e) => setForm((f) => ({ ...f, max_capacity: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Standalone Price</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <input
                type="checkbox"
                id="freeWithSub"
                checked={form.is_free_with_subscription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_free_with_subscription: e.target.checked }))
                }
                className="w-4 h-4 rounded"
              />
              <label htmlFor="freeWithSub" className="text-sm cursor-pointer">
                <span className="font-medium">Free for subscribers</span>
                <span className="block text-xs text-muted-foreground">
                  Members with an active subscription can join at no extra cost
                </span>
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ background: "var(--gradient-primary)" }}
              >
                {editTarget ? "Save Changes" : "Create Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
