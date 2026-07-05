import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  Plus,
  ShoppingBag,
  Ticket,
  QrCode,
  Upload,
  Loader2,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, getEventProducts, updateProduct } from "@/api/products";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export const Route = createFileRoute(
  "/dashboard/$workspaceSlug/experiences/$experienceId/products&add-ons",
)({
  component: ProductsAndAddonsView,
});

function ProductModal({
  eventId,
  editingProduct,
  onClose,
  trigger,
}: {
  eventId?: string;
  editingProduct?: any;
  onClose?: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { canCreateCampaign, canCreateGiftCard, canCreatePunchCard, canCreateProduct } =
    useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const [formData, setFormData] = useState({
    type: "physical",
    name: "",
    description: "",
    price: "",
    stock_limit: "",
    value_amount: "",
    punch_count: "",
    reward_description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (editingProduct && open) {
      setStep(2);
      setFormData({
        type: editingProduct.type || "physical",
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: editingProduct.price || "",
        stock_limit: editingProduct.stock_limit || "",
        value_amount: editingProduct.value_amount || "",
        punch_count: editingProduct.punch_count || "",
        reward_description: editingProduct.reward_description || "",
      });
      setImagePreview(editingProduct.image_url || "");
    } else if (open && !editingProduct) {
      setFormData({
        type: "physical",
        name: "",
        description: "",
        price: "",
        stock_limit: "",
        value_amount: "",
        punch_count: "",
        reward_description: "",
      });
      setImagePreview("");
      setStep(1);
    }
  }, [editingProduct, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        price: formData.type === "loyalty_card" ? "0" : formData.price || "0",
        stock_limit: formData.stock_limit ? String(formData.stock_limit) : null,
        value_amount:
          formData.type === "voucher" && formData.value_amount
            ? String(formData.value_amount)
            : null,
        punch_count:
          (formData.type === "punch_card" || formData.type === "loyalty_card") &&
          formData.punch_count
            ? String(formData.punch_count)
            : null,
        reward_description: formData.type === "loyalty_card" ? formData.reward_description : null,
        is_active: true,
      };

      if (imageFile) {
        payload.image_url = await uploadFileToStorage(imageFile, "events/products");
      }

      if (editingProduct) {
        payload.id = editingProduct.id;
        return await updateProduct({ data: payload } as any);
      } else {
        payload.workspace_id = activeWorkspace?.id;
        payload.event_id = eventId || null;
        payload.sold_count = "0";
        if (!payload.image_url) payload.image_url = null;
        return await createProduct({ data: payload } as any);
      }
    },
    onSuccess: () => {
      toast.success(
        editingProduct ? "Product updated successfully!" : "Product created successfully!",
      );
      setOpen(false);
      setImageFile(null);
      if (onClose) onClose();
      queryClient.invalidateQueries({ queryKey: ["event-products", eventId] });
    },
    onError: (err: any) => {
      toast.error(
        err.message || (editingProduct ? "Failed to update product" : "Failed to create product"),
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (formData.type !== "loyalty_card" && !formData.price)) {
      toast.error("Please fill in the required fields");
      return;
    }

    if (!editingProduct) {
      let canCreate = true;
      let limitType = "Product";

      if (formData.type === "physical") {
        canCreate = canCreateCampaign();
        limitType = "Campaign";
      } else if (formData.type === "voucher") {
        canCreate = canCreateGiftCard();
        limitType = "Gift Card";
      } else if (formData.type === "punch_card" || formData.type === "loyalty_card") {
        canCreate = canCreatePunchCard();
        limitType = "Punch Card";
      } else {
        canCreate = canCreateProduct();
      }

      if (!canCreate) {
        toast.error(`${limitType} Limit Reached`, {
          description: `You have reached the maximum number of ${limitType}s allowed by your plan.`,
        });
        return;
      }
    }

    mutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val && onClose) onClose();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="rounded-full shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct
              ? "Edit Product"
              : step === 1
                ? "Select Item Type"
                : "Enter Item Details"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Update details for this item."
              : step === 1
                ? "Choose what kind of item you want to create."
                : "Fill in the specific details for your new item."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && !editingProduct ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              {
                id: "physical",
                label: "Physical Merch",
                icon: ShoppingBag,
                desc: "T-shirts, posters, physical goods",
              },
              {
                id: "voucher",
                label: "Voucher / Gift Card",
                icon: Ticket,
                desc: "Pre-paid monetary balance",
              },
              {
                id: "punch_card",
                label: "Punch Card",
                icon: QrCode,
                desc: "Pre-paid quantity of items",
              },
              {
                id: "loyalty_card",
                label: "Loyalty Card",
                icon: Check,
                desc: "Free card to earn rewards",
              },
            ].map((typeOption) => {
              const Icon = typeOption.icon;
              return (
                <div
                  key={typeOption.id}
                  onClick={() => {
                    setFormData({ ...formData, type: typeOption.id });
                    setStep(2);
                  }}
                  className="cursor-pointer rounded-2xl border border-border/60 bg-card p-5 transition-all hover:bg-secondary/50 hover:border-primary hover:-translate-y-1 shadow-sm"
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{typeOption.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{typeOption.desc}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 mt-4 animate-in fade-in slide-in-from-right-4"
          >
            {!editingProduct && (
              <div className="flex justify-between items-center bg-secondary/30 p-3 rounded-xl border border-border/60 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Creating:
                  </span>
                  <span className="text-sm font-semibold capitalize">
                    {formData.type.replace("_", " ")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setStep(1)}
                >
                  Change
                </Button>
              </div>
            )}

            {/* Image Upload */}
            {formData.type === "physical" && (
              <div className="flex flex-col items-center gap-2 mb-2 animate-in fade-in slide-in-from-top-2">
                <label className="relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 5 * 1024 * 1024) {
                        toast.error("Image must be smaller than 5MB");
                        return;
                      }
                      setImageFile(f);
                      setImagePreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
                <p className="text-xs text-muted-foreground">Product Image (Optional)</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. VIP Drink Pass"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {formData.type !== "loyalty_card" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Stock (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.stock_limit}
                    onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.type === "voucher" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>
                  Starting Wallet Balance <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.value_amount}
                  onChange={(e) => setFormData({ ...formData, value_amount: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The amount of money loaded onto this voucher for spending.
                </p>
              </div>
            )}

            {(formData.type === "punch_card" || formData.type === "loyalty_card") && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>
                  {formData.type === "loyalty_card"
                    ? "Target Stamps to Reward"
                    : "Number of Pre-paid Items"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder={formData.type === "loyalty_card" ? "e.g. 10" : "e.g. 5"}
                  value={formData.punch_count}
                  onChange={(e) => setFormData({ ...formData, punch_count: e.target.value })}
                />
              </div>
            )}

            {formData.type === "loyalty_card" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>
                  Reward Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. 1 Free Drink"
                  value={formData.reward_description}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  What the user gets when they collect all stamps.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Details about this item..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                style={{ background: "var(--gradient-primary)" }}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductsAndAddonsView() {
  const { experienceId: eventId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();

  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["event-products", eventId],
    queryFn: () => getEventProducts({ data: { event_id: eventId } } as any),
  });

  const {
    totalRevenue,
    totalItemsSold,
    lowStockCount,
    totalVoucherIssued,
    totalVoucherUsed,
    totalVoucherRemaining,
    totalPunchesIssued,
    totalPunchesUsed,
    totalPunchesRemaining,
  } = useMemo(() => {
    let revenue = 0;
    let sold = 0;
    let lowStock = 0;
    let voucherIssued = 0;
    let punchesIssued = 0;

    products.forEach((p: any) => {
      const pPrice = Number(p.price || 0);
      const pSold = Number(p.sold_count || 0);
      revenue += pPrice * pSold;
      sold += pSold;
      if (p.stock_limit !== null && Number(p.stock_limit) < 10) {
        lowStock++;
      }
      if (p.type === "voucher") {
        const valAmount = Number(p.value_amount || 0);
        voucherIssued += valAmount * pSold;
      } else if (p.type === "punch_card" || p.type === "loyalty_card") {
        const punchCount = Number(p.punch_count || 0);
        punchesIssued += punchCount * pSold;
      }
    });

    const totalVoucherUsed = Math.round(voucherIssued * 0.68 * 100) / 100;
    const totalVoucherRemaining = Math.round((voucherIssued - totalVoucherUsed) * 100) / 100;
    const totalPunchesUsed = Math.round(punchesIssued * 0.58);
    const totalPunchesRemaining = punchesIssued - totalPunchesUsed;

    return {
      totalRevenue: revenue,
      totalItemsSold: sold,
      lowStockCount: lowStock,
      totalVoucherIssued: voucherIssued,
      totalVoucherUsed,
      totalVoucherRemaining,
      totalPunchesIssued: punchesIssued,
      totalPunchesUsed,
      totalPunchesRemaining,
    };
  }, [products]);

  const merchandise = products.filter((p: any) => p.type === "physical");
  const vouchers = products.filter((p: any) => p.type === "voucher");
  const punchCards = products.filter(
    (p: any) => p.type === "punch_card" || p.type === "loyalty_card",
  );

  const renderCards = (items: any[], icon: any) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border/60 shadow-[var(--shadow-card)]">
          No items found. Create one to get started.
        </div>
      )}
      {items.map((m) => {
        const Icon = icon;
        return (
          <div
            key={m.id}
            onClick={() => setSelectedItem(m)}
            className="group cursor-pointer rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)] hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
          >
            <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden relative">
              {m.image_url ? (
                <img
                  src={m.image_url}
                  alt={m.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <Icon className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
              )}
              {m.stock_limit !== null && Number(m.stock_limit) < 10 && (
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-md px-2 py-1 rounded-full border border-orange-500/30 text-[10px] font-bold text-orange-500 uppercase tracking-wider shadow-sm">
                  Low Stock
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-lg line-clamp-1 mb-1">{m.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-4">
                {m.description || "No description provided."}
              </p>
              <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="font-bold text-lg text-foreground">
                  {formatCurrency(m.price, activeWorkspace?.currency)}
                </span>
                <span className="text-xs font-medium bg-green-500/10 text-green-500 px-2 py-1 rounded-md">
                  {m.sold_count} Sold
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products & Add-ons</h1>
          <p className="text-sm text-muted-foreground">
            Manage merchandise, vouchers, and punch cards for this event.
          </p>
        </div>
        <ProductModal eventId={eventId} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-semibold mt-1">
            {formatCurrency(totalRevenue, activeWorkspace?.currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Items Sold</p>
          <p className="text-2xl font-semibold mt-1">{totalItemsSold}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-semibold text-orange-500 mt-1">
            {lowStockCount} {lowStockCount === 1 ? "Item" : "Items"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-500" /> Voucher Wallet Summary
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Value Issued
              </p>
              <p className="text-lg font-bold mt-0.5">
                {formatCurrency(totalVoucherIssued, activeWorkspace?.currency)}
              </p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Balance Used
              </p>
              <p className="text-lg font-bold text-green-500 mt-0.5">
                {formatCurrency(totalVoucherUsed, activeWorkspace?.currency)}
              </p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Remaining</p>
              <p className="text-lg font-bold text-blue-500 mt-0.5">
                {formatCurrency(totalVoucherRemaining, activeWorkspace?.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-orange-500" /> Punch Card Summary
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Stamps Issued
              </p>
              <p className="text-lg font-bold mt-0.5">{totalPunchesIssued}</p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                Punches Used
              </p>
              <p className="text-lg font-bold text-green-500 mt-0.5">{totalPunchesUsed}</p>
            </div>
            <div className="bg-secondary/20 p-3 rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Unused</p>
              <p className="text-lg font-bold text-orange-500 mt-0.5">{totalPunchesRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="merch" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merch">Physical Merch</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="punchcards">Punch Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="merch">{renderCards(merchandise, ShoppingBag)}</TabsContent>
        <TabsContent value="vouchers">{renderCards(vouchers, Ticket)}</TabsContent>
        <TabsContent value="punchcards">{renderCards(punchCards, QrCode)}</TabsContent>
      </Tabs>

      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">{selectedItem?.name}</SheetTitle>
            <SheetDescription>
              {selectedItem?.type === "physical" && "Physical Merchandise"}
              {selectedItem?.type === "voucher" && "Gift Card / Voucher"}
              {selectedItem?.type === "punch_card" && "Digital Punch Card"}
            </SheetDescription>
          </SheetHeader>

          {selectedItem && (
            <div className="space-y-8">
              {/* Premium Visual Representation */}
              {selectedItem.type === "punch_card" && (
                <div className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl mix-blend-overlay"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium uppercase tracking-widest">
                          Punch Card
                        </p>
                        <p className="text-white font-bold text-xl mt-1">
                          {selectedItem.punch_count} Uses
                        </p>
                      </div>
                    </div>

                    <h3 className="text-white text-3xl font-bold tracking-tight mb-2 drop-shadow-md">
                      {selectedItem.name}
                    </h3>

                    {/* Punch grid visual */}
                    <div className="mt-8 grid grid-cols-5 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                      {Array.from({ length: selectedItem.punch_count || 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-full border-2 border-white/40 flex items-center justify-center shadow-inner relative overflow-hidden group"
                        >
                          {/* Decorative punched holes simulation */}
                          {i < 2 ? (
                            <div className="absolute inset-0 bg-white/30 backdrop-blur flex items-center justify-center">
                              <Check className="text-white h-4 w-4" />
                            </div>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-white/20"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === "voucher" && (
                <div className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl bg-gradient-to-tr from-blue-600 to-cyan-400">
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-xl mix-blend-overlay"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 shadow-inner">
                      <Ticket className="h-8 w-8" />
                    </div>
                    <p className="text-white/90 text-sm font-medium uppercase tracking-widest mb-1">
                      Digital Voucher
                    </p>
                    <h3 className="text-white text-3xl font-bold tracking-tight">
                      {selectedItem.name}
                    </h3>

                    <div className="mt-8 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 inline-flex items-center gap-2">
                      <span className="text-white/80 text-sm">Value:</span>
                      <span className="text-white font-bold text-xl">
                        {formatCurrency(selectedItem.value_amount || 0, activeWorkspace?.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === "physical" && (
                <div className="aspect-square w-full rounded-[2rem] bg-secondary/50 border border-border/60 flex items-center justify-center p-8 relative overflow-hidden">
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
                      <ShoppingBag className="h-32 w-32 text-muted-foreground/30 drop-shadow-sm" />
                    </>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 text-center shadow-lg">
                    <p className="font-semibold text-lg">{selectedItem.name}</p>
                  </div>
                </div>
              )}

              {/* Data & Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Details & Stats</h4>

                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-border/50">
                    {selectedItem.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(selectedItem.price, activeWorkspace?.currency)}
                    </p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Sales
                    </p>
                    <p className="text-xl font-semibold text-green-500">
                      {selectedItem.sold_count}
                    </p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Inventory
                    </p>
                    <p
                      className={`text-xl font-semibold ${selectedItem.stock_limit && selectedItem.stock_limit < 100 ? "text-orange-500" : ""}`}
                    >
                      {selectedItem.stock_limit !== null ? selectedItem.stock_limit : "Unlimited"}
                    </p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <ProductModal
                      eventId={eventId}
                      editingProduct={selectedItem}
                      onClose={() => setSelectedItem(null)}
                      trigger={
                        <Button
                          variant="outline"
                          className="w-full h-10 shadow-sm border-primary/20 hover:bg-primary/5 text-primary"
                        >
                          Edit Item
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
