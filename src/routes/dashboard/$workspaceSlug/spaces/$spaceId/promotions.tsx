import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus, Tag, Trash2, Calendar, CheckCircle2, XCircle, Search, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSpacePromotions,
  createSpacePromotion,
  updateSpacePromotion,
  deleteSpacePromotion,
} from "@/api/space_promotions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/$workspaceSlug/spaces/$spaceId/promotions")({
  component: SpacePromotionsPage,
});

function SpacePromotionsPage() {
  const { spaceId } = useParams({ strict: false }) as any;
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    code: "",
    discount_percentage: "",
    flat_amount: "",
    max_uses: "",
    expires_at: "",
    is_active: true,
  });

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["space_promotions", spaceId],
    queryFn: () => getSpacePromotions({ data: { space_id: spaceId } }),
    enabled: !!spaceId,
  });

  const createMutation = useMutation({
    mutationFn: createSpacePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_promotions", spaceId] });
      toast.success("Promotion created successfully");
      setShowModal(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create promotion"),
  });

  const updateMutation = useMutation({
    mutationFn: updateSpacePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_promotions", spaceId] });
      toast.success("Promotion updated");
      setShowModal(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update promotion"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpacePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space_promotions", spaceId] });
      toast.success("Promotion deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete promotion"),
  });

  const resetForm = () => {
    setEditingPromo(null);
    setForm({
      code: "",
      discount_percentage: "",
      flat_amount: "",
      max_uses: "",
      expires_at: "",
      is_active: true,
    });
  };

  const handleOpenEdit = (promo: any) => {
    setEditingPromo(promo);
    setForm({
      code: promo.code || "",
      discount_percentage: promo.discount_percentage?.toString() || "",
      flat_amount: promo.flat_amount?.toString() || "",
      max_uses: promo.max_uses?.toString() || "",
      expires_at: promo.expires_at ? new Date(promo.expires_at).toISOString().slice(0, 16) : "",
      is_active: promo.is_active,
    });
    setShowModal(true);
  };

  const handleToggleActive = (promo: any) => {
    updateMutation.mutate({
      data: {
        id: promo.id,
        object: { is_active: !promo.is_active },
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return toast.error("Code is required");
    if (!form.discount_percentage && !form.flat_amount) {
      return toast.error("Please specify a discount percentage or flat amount");
    }

    const payload = {
      space_id: spaceId,
      code: form.code.toUpperCase().replace(/\s+/g, ""),
      discount_percentage: form.discount_percentage ? parseFloat(form.discount_percentage) : null,
      flat_amount: form.flat_amount ? parseFloat(form.flat_amount) : null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    if (editingPromo) {
      updateMutation.mutate({ data: { id: editingPromo.id, object: payload } });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const filteredPromos = promotions.filter((p: any) =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotions & Discounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount codes and referrals for this space.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="gap-2 rounded-xl h-11 px-6 shadow-sm font-bold"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Add Code
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">
          Loading promotions...
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] p-12 text-center text-muted-foreground shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-[#1b1b1c] rounded-2xl flex items-center justify-center mb-4 border border-gray-100 dark:border-[#333333]">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No promotions yet
          </h3>
          <p className="text-sm max-w-md mx-auto mb-6">
            Create a discount code to offer specialized pricing to your members or event attendees.
          </p>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="rounded-xl bg-[#f97316] hover:bg-[#ea6c0a] text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Create first code
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333333] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-[#333333] flex items-center justify-between bg-gray-50/50 dark:bg-[#1b1b1c]/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#888888]" />
              <input
                type="text"
                placeholder="Search codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#333333] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] transition-all placeholder:text-gray-400 dark:placeholder:text-[#666666]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#1b1b1c] text-gray-500 dark:text-[#888888]">
                <tr>
                  <th className="px-6 py-4 font-medium">Promo Code</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Uses</th>
                  <th className="px-6 py-4 font-medium">Expires At</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                {filteredPromos.map((promo: any) => (
                  <tr
                    key={promo.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1b1b1c]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#252526] px-2 py-1 rounded-md border border-gray-200 dark:border-[#444444]">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#f97316]">
                        {promo.discount_percentage
                          ? `${promo.discount_percentage}% OFF`
                          : promo.flat_amount
                            ? `${promo.flat_amount} FLAT`
                            : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white">
                        {promo.uses || 0} / {promo.max_uses ? promo.max_uses : "∞"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#888888]">
                      {promo.expires_at ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(promo.expires_at).toLocaleDateString()}
                        </div>
                      ) : (
                        "Never"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={() => handleToggleActive(promo)}
                        className="data-[state=checked]:bg-[#f97316]"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(promo)}
                          className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 h-8 px-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(`Are you sure you want to delete promo code ${promo.code}?`)
                            ) {
                              deleteMutation.mutate({ data: { id: promo.id } });
                            }
                          }}
                          className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPromos.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 dark:text-[#888888]"
                    >
                      <div className="flex flex-col items-center">
                        <Tag className="w-8 h-8 mb-3 text-gray-300 dark:text-[#444444]" />
                        <p>No promotional codes found matching "{searchQuery}".</p>
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="text-[#f97316] mt-2 h-auto p-0"
                        >
                          Clear search
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code Name</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER2024"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
                className="font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="e.g. 15"
                  min="0"
                  max="100"
                  value={form.discount_percentage}
                  onChange={(e) =>
                    setForm({ ...form, discount_percentage: e.target.value, flat_amount: "" })
                  }
                  disabled={!!form.flat_amount}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flat">Or Flat Amount</Label>
                <Input
                  id="flat"
                  type="number"
                  placeholder="e.g. 5000"
                  min="0"
                  value={form.flat_amount}
                  onChange={(e) =>
                    setForm({ ...form, flat_amount: e.target.value, discount_percentage: "" })
                  }
                  disabled={!!form.discount_percentage}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  placeholder="Unlimited"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-2">
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(c) => setForm({ ...form, is_active: !!c })}
                className="data-[state=checked]:bg-[#f97316]"
              />
              <Label htmlFor="active">Active (Available for use)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ background: "var(--gradient-primary)" }}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
