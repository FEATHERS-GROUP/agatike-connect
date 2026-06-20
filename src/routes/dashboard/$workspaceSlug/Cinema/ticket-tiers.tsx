import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  getCinemaTicketTiers,
  createCinemaTicketTier,
  updateCinemaTicketTier,
  deleteCinemaTicketTier,
} from "@/api/cinema_ticket_tiers";
import {
  Plus,
  Ticket,
  Glasses,
  Baby,
  Star,
  Box,
  Layers,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/ticket-tiers")({
  component: CinemaTicketTiersPage,
});

const TIER_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "3d", label: "3D" },
  { value: "imax", label: "IMAX" },
  { value: "4dx", label: "4DX" },
  { value: "premium", label: "Premium" },
  { value: "kids", label: "Kids" },
  { value: "family", label: "Family Pack" },
];

const BADGE_ICONS: Record<string, React.ReactNode> = {
  includes_glasses: <Glasses className="h-3.5 w-3.5" />,
  is_kids: <Baby className="h-3.5 w-3.5" />,
  is_vip: <Star className="h-3.5 w-3.5" />,
  is_3d: <Box className="h-3.5 w-3.5" />,
  is_imax: <Layers className="h-3.5 w-3.5" />,
};

const BADGE_LABELS: Record<string, string> = {
  includes_glasses: "Glasses",
  is_kids: "Kids",
  is_vip: "VIP",
  is_3d: "3D",
  is_imax: "IMAX",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  type: "standard",
  price: "",
  currency: "RWF",
  includes_glasses: false,
  is_kids: false,
  is_vip: false,
  is_3d: false,
  is_imax: false,
};

// ─── Mock fallback data while database is being wired ───────────────────────
const MOCK_TIERS = [
  {
    id: "t1",
    name: "Standard 2D",
    description: "Regular cinema seat for standard 2D screenings.",
    type: "standard",
    price: 8000,
    currency: "RWF",
    includes_glasses: false,
    is_kids: false,
    is_vip: false,
    is_3d: false,
    is_imax: false,
    status: "active",
  },
  {
    id: "t2",
    name: "3D Experience",
    description: "Includes 3D glasses for an immersive screening experience.",
    type: "3d",
    price: 12000,
    currency: "RWF",
    includes_glasses: true,
    is_kids: false,
    is_vip: false,
    is_3d: true,
    is_imax: false,
    status: "active",
  },
  {
    id: "t3",
    name: "VIP Recliner",
    description: "Premium recliner seat with complimentary popcorn and drinks.",
    type: "vip",
    price: 25000,
    currency: "RWF",
    includes_glasses: false,
    is_kids: false,
    is_vip: true,
    is_3d: false,
    is_imax: false,
    status: "active",
  },
  {
    id: "t4",
    name: "Kids Standard",
    description: "Discounted ticket for children under 12.",
    type: "kids",
    price: 5000,
    currency: "RWF",
    includes_glasses: false,
    is_kids: true,
    is_vip: false,
    is_3d: false,
    is_imax: false,
    status: "active",
  },
  {
    id: "t5",
    name: "IMAX Premiere",
    description: "Largest screen format with superior sound quality.",
    type: "imax",
    price: 18000,
    currency: "RWF",
    includes_glasses: false,
    is_kids: false,
    is_vip: false,
    is_3d: false,
    is_imax: true,
    status: "active",
  },
];

function CinemaTicketTiersPage() {
  const { workspaceSlug } = useParams({ strict: false }) as any;
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["cinema_ticket_tiers", activeWorkspace?.id],
    queryFn: () => getCinemaTicketTiers({ data: { workspace_id: activeWorkspace?.id } }),
    enabled: !!activeWorkspace?.id,
  });

  const openCreate = () => {
    setEditingTier(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const openEdit = (tier: any) => {
    setEditingTier(tier);
    setForm({
      name: tier.name,
      description: tier.description || "",
      type: tier.type,
      price: tier.price,
      currency: tier.currency || "RWF",
      includes_glasses: tier.includes_glasses,
      is_kids: tier.is_kids,
      is_vip: tier.is_vip,
      is_3d: tier.is_3d,
      is_imax: tier.is_imax,
    });
    setSheetOpen(true);
  };

  const handleToggle = (key: string) => {
    setForm((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editingTier) {
        await updateCinemaTicketTier({ data: { id: editingTier.id, object: form } });
        toast.success("Ticket tier updated!");
      } else {
        await createCinemaTicketTier({ data: { object: { ...form, workspace_id: activeWorkspace?.id } } });
        toast.success("Ticket tier created!");
      }
      await queryClient.invalidateQueries({ queryKey: ["cinema_ticket_tiers"] });
      setSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save ticket tier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket tier?")) return;
    setDeletingId(id);
    try {
      await deleteCinemaTicketTier({ data: { id } });
      toast.success("Ticket tier deleted.");
      await queryClient.invalidateQueries({ queryKey: ["cinema_ticket_tiers"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ticket tier");
    } finally {
      setDeletingId(null);
    }
  };

  const getBadges = (tier: any) =>
    Object.entries(BADGE_ICONS)
      .filter(([key]) => tier[key])
      .map(([key]) => ({ key, icon: BADGE_ICONS[key], label: BADGE_LABELS[key] }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ticket Tiers</h2>
            <p className="text-muted-foreground mt-1">
              Define global ticket tiers that can be linked to any cinema, movie, or show.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="gap-2 rounded-xl h-11 px-6 font-bold shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" /> New Ticket Tier
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <Ticket className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/80">
            Ticket tiers are <strong>global templates</strong>. Once created here, they can be
            attached to any movie, show, or cinema in your workspace — including different prices
            per cinema.
          </p>
        </div>

        {/* Table */}
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                  Tier Name
                </th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground hidden md:table-cell">
                  Type
                </th>
                <th className="text-left px-4 py-4 font-semibold text-muted-foreground">
                  Features
                </th>
                <th className="text-right px-4 py-4 font-semibold text-muted-foreground">
                  Base Price
                </th>
                <th className="text-right px-6 py-4 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tiers.map((tier) => {
                const badges = getBadges(tier);
                return (
                  <tr key={tier.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Ticket className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{tier.name}</p>
                          {tier.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {tier.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-medium border border-border/40 capitalize">
                        {tier.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {badges.length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {badges.map((b) => (
                          <span
                            key={b.key}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary border border-border/50 text-[11px] font-medium"
                          >
                            {b.icon} {b.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold">
                      {formatCurrency(tier.price, tier.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs rounded-lg gap-1.5"
                          onClick={() => openEdit(tier)}
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(tier.id)}
                          disabled={deletingId === tier.id}
                        >
                          {deletingId === tier.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tiers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    No ticket tiers yet. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create / Edit Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl">
                {editingTier ? "Edit Ticket Tier" : "New Ticket Tier"}
              </SheetTitle>
              <SheetDescription>
                Define a global ticket tier. Attach it to any cinema or movie later.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tier Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. 3D Experience, VIP Recliner"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
                    placeholder="What's included in this ticket tier?"
                    className="rounded-xl min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <hr className="border-border/40" />

              {/* Type & Price */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Pricing
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value }))}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {TIER_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={form.currency}
                      onChange={(e) => setForm((p: any) => ({ ...p, currency: e.target.value }))}
                      className="rounded-xl h-11"
                      placeholder="RWF"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p: any) => ({ ...p, price: e.target.value }))}
                    placeholder="10000"
                    className="rounded-xl h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the default price. Individual cinemas can override it when linking.
                  </p>
                </div>
              </div>

              <hr className="border-border/40" />

              {/* Feature Toggles */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Features & Tags
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      key: "is_3d",
                      icon: <Box className="h-4 w-4" />,
                      label: "3D Screening",
                      desc: "Movie is shown in 3D format",
                    },
                    {
                      key: "includes_glasses",
                      icon: <Glasses className="h-4 w-4" />,
                      label: "Glasses Included",
                      desc: "3D glasses are provided with this ticket",
                    },
                    {
                      key: "is_imax",
                      icon: <Layers className="h-4 w-4" />,
                      label: "IMAX Format",
                      desc: "Shown on an IMAX screen",
                    },
                    {
                      key: "is_vip",
                      icon: <Star className="h-4 w-4" />,
                      label: "VIP Tier",
                      desc: "Premium seating or perks included",
                    },
                    {
                      key: "is_kids",
                      icon: <Baby className="h-4 w-4" />,
                      label: "Kids Ticket",
                      desc: "Discounted ticket for children",
                    },
                  ].map(({ key, icon, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleToggle(key)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        form[key]
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-secondary/30 border-border/50 text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${form[key] ? "bg-primary/20" : "bg-secondary"}`}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 transition-opacity ${form[key] ? "opacity-100 text-primary" : "opacity-0"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => setSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl h-11 gap-2 shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={handleSave}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : editingTier ? "Save Changes" : "Create Tier"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
