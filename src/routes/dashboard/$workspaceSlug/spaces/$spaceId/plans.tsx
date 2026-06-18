import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpaceById, updateSpace } from "@/api/spaces";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  GripVertical,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/plans")({
  component: SpacePlansPage,
});

// ── Types ──────────────────────────────────────────────────────────────────────
interface Plan {
  name: string;
  price: number | string;
  billing_cycle: string;
  description: string;
  features: string[];
}

const BILLING_CYCLES = ["Monthly", "Annually", "Weekly", "Daily", "One-time"];

const EMPTY_PLAN: Plan = {
  name: "",
  price: "",
  billing_cycle: "Monthly",
  description: "",
  features: [""],
};

// ── Accent colours cycling for plan cards ─────────────────────────────────────
const CARD_ACCENTS = [
  "from-orange-500/60 to-orange-500/10",
  "from-violet-500/60 to-violet-500/10",
  "from-emerald-500/60 to-emerald-500/10",
  "from-sky-500/60 to-sky-500/10",
  "from-rose-500/60 to-rose-500/10",
  "from-amber-500/60 to-amber-500/10",
];

// ── Plan Editor Modal ─────────────────────────────────────────────────────────
interface PlanModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Plan | null;
  currency: string;
  onSave: (plan: Plan) => Promise<void>;
}

function PlanModal({ open, onOpenChange, initial, currency, onSave }: PlanModalProps) {
  const [form, setForm] = useState<Plan>(initial ?? EMPTY_PLAN);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form whenever the modal opens with new data
  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_PLAN);
    }
  }, [open, initial]);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
  };

  const setField = <K extends keyof Plan>(key: K, value: Plan[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setFeature = (idx: number, value: string) =>
    setForm((prev) => {
      const features = [...prev.features];
      features[idx] = value;
      return { ...prev, features };
    });

  const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));

  const removeFeature = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Plan name is required.");
      return;
    }
    if (form.price === "" || isNaN(Number(form.price))) {
      toast.error("A valid price is required.");
      return;
    }

    const cleaned: Plan = {
      ...form,
      price: Number(form.price),
      features: form.features.filter((f) => f.trim()),
    };

    setIsSaving(true);
    try {
      await onSave(cleaned);
      onOpenChange(false);
    } catch {
      // toast handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border border-border/60 bg-card shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-secondary/10 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {initial?.name ? `Edit "${initial.name}"` : "Add New Plan"}
            </DialogTitle>
            <DialogDescription>
              Define the plan name, price, billing cycle, and features.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Plan Name *</Label>
            <Input
              id="plan-name"
              placeholder="e.g. Hot Desk, Dedicated Desk, Private Office"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="rounded-xl h-10"
            />
          </div>

          {/* Price + Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-price">Price ({currency}) *</Label>
              <Input
                id="plan-price"
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-cycle">Billing Cycle</Label>
              <select
                id="plan-cycle"
                value={form.billing_cycle}
                onChange={(e) => setField("billing_cycle", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-desc">Description</Label>
            <textarea
              id="plan-desc"
              placeholder="Brief summary shown to potential members…"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Features / Inclusions</Label>
              <button
                type="button"
                onClick={addFeature}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="h-3 w-3" /> Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {form.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                  <Input
                    placeholder={`Feature ${idx + 1}`}
                    value={feat}
                    onChange={(e) => setFeature(idx, e.target.value)}
                    className="rounded-xl h-9 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    disabled={form.features.length <= 1}
                    className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-8 py-5 border-t border-border/40 bg-secondary/10">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={isSaving}
            onClick={handleSave}
            className="rounded-xl gap-2"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSaving ? "Saving…" : initial?.name ? "Save Changes" : "Add Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function SpacePlansPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => getSpaceById({ data: { id: spaceId } }),
    enabled: !!spaceId,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // Delete confirmation
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const plans: Plan[] = space?.plans ?? [];

  // Persist full plans array to DB
  const savePlans = async (newPlans: Plan[]) => {
    await updateSpace({ data: { id: spaceId, plans: newPlans } });
    await queryClient.invalidateQueries({ queryKey: ["space", spaceId] });
  };

  const handleAdd = async (plan: Plan) => {
    try {
      await savePlans([...plans, plan]);
      toast.success(`"${plan.name}" plan added!`);
    } catch {
      toast.error("Failed to add plan. Please try again.");
      throw new Error("Failed");
    }
  };

  const handleEdit = async (plan: Plan) => {
    if (editingIdx === null) return;
    try {
      const updated = plans.map((p, i) => (i === editingIdx ? plan : p));
      await savePlans(updated);
      toast.success(`"${plan.name}" updated!`);
    } catch {
      toast.error("Failed to update plan. Please try again.");
      throw new Error("Failed");
    }
  };

  const handleDelete = async () => {
    if (deleteIdx === null) return;
    const planName = plans[deleteIdx]?.name;
    setIsDeleting(true);
    try {
      const updated = plans.filter((_, i) => i !== deleteIdx);
      await savePlans(updated);
      toast.success(`"${planName}" removed.`);
      setDeleteIdx(null);
    } catch {
      toast.error("Failed to delete plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openAdd = () => {
    setEditingIdx(null);
    setModalOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditingIdx(idx);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-secondary/30 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!space) {
    return <div className="p-8 text-center text-red-500 font-semibold">Space not found</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membership Plans</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage pricing tiers and features for{" "}
            <span className="text-foreground font-semibold">{space.name}</span>.
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 rounded-xl h-11 px-6 shadow-sm"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Add Plan
        </Button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-card border border-border/60 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            {/* Coloured top accent bar */}
            <div
              className={cn(
                "absolute top-0 inset-x-0 h-1 bg-gradient-to-r",
                CARD_ACCENTS[idx % CARD_ACCENTS.length],
              )}
            />

            {/* Title + action buttons */}
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-xl pr-2 leading-tight">{plan.name}</h4>
              <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-secondary"
                  onClick={() => openEdit(idx)}
                >
                  <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                  onClick={() => setDeleteIdx(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold mb-1 flex items-baseline gap-1 mt-1">
              {space.currency} {Number(plan.price || 0).toLocaleString()}
              {plan.billing_cycle && plan.billing_cycle !== "One-time" && (
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  / {plan.billing_cycle}
                </span>
              )}
            </div>

            {/* Description */}
            {plan.description ? (
              <p className="text-sm text-muted-foreground mb-5 line-clamp-2 min-h-[36px]">
                {plan.description}
              </p>
            ) : (
              <div className="min-h-[20px] mb-3" />
            )}

            {/* Features */}
            <div className="space-y-2.5 flex-1 border-t border-border/40 pt-4 mt-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Inclusions
              </p>
              {plan.features && plan.features.filter(Boolean).length > 0 ? (
                plan.features.filter(Boolean).map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No features listed.</p>
              )}
            </div>

            {/* Edit CTA at bottom */}
            <button
              onClick={() => openEdit(idx)}
              className="mt-5 w-full text-xs text-muted-foreground border border-border/50 rounded-xl py-2 hover:border-primary/40 hover:text-primary transition-colors font-medium"
            >
              Edit Plan
            </button>
          </div>
        ))}

        {/* Empty state */}
        {plans.length === 0 && (
          <div className="col-span-full p-14 text-center bg-secondary/20 border border-dashed border-border/60 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-primary opacity-70" />
            </div>
            <h3 className="text-lg font-bold mb-2">No Membership Plans Yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Create your first plan to start accepting member registrations and subscriptions.
            </p>
            <Button
              onClick={openAdd}
              className="gap-2 rounded-xl"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> Create First Plan
            </Button>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <PlanModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingIdx !== null ? plans[editingIdx] : null}
        currency={space.currency || "RWF"}
        onSave={editingIdx !== null ? handleEdit : handleAdd}
      />

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={deleteIdx !== null} onOpenChange={(v) => !v && setDeleteIdx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{plans[deleteIdx ?? 0]?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this plan. Existing subscribers on this plan will not be
              affected, but no new members can subscribe to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting…
                </>
              ) : (
                "Delete Plan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
