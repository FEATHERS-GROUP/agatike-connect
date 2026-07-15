import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShoppingBag, Ticket, QrCode, Loader2, Check } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { getWorkspaceProducts } from "@/api/products";
import {
  getWorkspaceSponsoredVoucherBatches,
  batchGenerateSponsoredVouchers,
} from "@/api/vouchers";
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
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProduct } from "@/api/products";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export const Route = createFileRoute("/dashboard/$workspaceSlug/products&add-ons")({
  component: WorkspaceProductsView,
});

import { Link } from "@tanstack/react-router";

function BatchGenerateModal() {
  const [open, setOpen] = useState(false);
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    batch_name: "",
    value_per_person: "",
    quantity: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        workspace_id: activeWorkspace?.id,
        event_id: null,
        batch_name: formData.batch_name,
        value_per_person: Number(formData.value_per_person),
        quantity: Number(formData.quantity),
        generation_type: "manual",
        value_type: "fixed",
      };
      return await batchGenerateSponsoredVouchers({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Voucher batch generated successfully!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workspace-vouchers", activeWorkspace?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate vouchers");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batch_name || !formData.value_per_person || !formData.quantity) {
      toast.error("Please fill in all fields");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full shadow-[var(--shadow-glow)] mr-2 border-primary/20 hover:bg-primary/5 text-primary"
        >
          <Ticket className="mr-1 h-4 w-4" /> Batch Generate Vouchers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Batch Generate Vouchers</DialogTitle>
          <DialogDescription>
            Generate a batch of pre-loaded vouchers for your workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>
              Batch Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Summer Promo Vouchers"
              value={formData.batch_name}
              onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Value per Voucher <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="50"
                value={formData.value_per_person}
                onChange={(e) => setFormData({ ...formData, value_per_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Quantity to Generate <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
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
              Generate Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceProductsView() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { activeWorkspace } = useWorkspace();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["workspace-products", activeWorkspace?.id],
    queryFn: () => getWorkspaceProducts({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: voucherBatches = [], isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["workspace-vouchers", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceSponsoredVoucherBatches({ data: { workspace_id: activeWorkspace?.id } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const merchandise = products
    .filter((p: any) => p.type === "physical")
    .map((p: any) => ({
      ...p,
      stock: p.stock_limit || "Unlimited",
      sold: p.sold_count || 0,
    }));

  const productVouchers = products
    .filter((p: any) => p.type === "voucher")
    .map((p: any) => ({
      ...p,
      stock: p.stock_limit || "Unlimited",
      sold: p.sold_count || 0,
    }));

  const generatedBatches = voucherBatches.map((b: any) => ({
    id: b.id,
    name: b.name,
    price: b.value_per_voucher,
    stock: b.vouchers?.length || 0,
    sold: b.vouchers?.filter((v: any) => !v.is_active).length || 0,
    type: "voucher_batch",
    value_amount: b.value_per_voucher,
    description: `Batch generated with ${b.vouchers?.length || 0} vouchers.`,
  }));

  const allVouchers = [...productVouchers, ...generatedBatches];

  const punchCards = products
    .filter((p: any) => p.type === "punch_card" || p.type === "loyalty_card")
    .map((p: any) => ({
      ...p,
      stock: p.stock_limit || "Unlimited",
      sold: p.sold_count || 0,
    }));

  const renderTable = (items: any[], icon: any) => (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <table className="w-full text-sm text-left">
        <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 font-medium">Item Name</th>
            <th className="px-6 py-4 font-medium">Price</th>
            <th className="px-6 py-4 font-medium">Stock Remaining</th>
            <th className="px-6 py-4 font-medium">Sold</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {items.map((m) => {
            const Icon = icon;
            return (
              <tr
                key={m.id}
                className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                onClick={() => setSelectedItem(m)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-foreground">{m.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">
                  {formatCurrency(m.price, activeWorkspace?.currency)}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${m.stock < 100 ? "text-orange-500" : ""}`}>
                    {m.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-green-500 font-medium">{m.sold}</td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                No items found. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products & Add-ons</h1>
          <p className="text-sm text-muted-foreground">
            Manage standalone campaigns, general merch, and vouchers for your brand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BatchGenerateModal />
          <Link to="/dashboard/$workspaceSlug/products/create" params={{ workspaceSlug: activeWorkspace?.slug as string }}>
            <Button
              className="rounded-full shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="mr-1 h-4 w-4" /> Create Campaign
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-semibold mt-1">
            {formatCurrency(7650, activeWorkspace?.currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Campaigns</p>
          <p className="text-2xl font-semibold mt-1">5</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
          <p className="text-2xl font-semibold text-orange-500 mt-1">0 Items</p>
        </div>
      </div>

      <Tabs defaultValue="merch" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="merch">Physical Merch</TabsTrigger>
          <TabsTrigger value="vouchers">Gift Cards & Vouchers</TabsTrigger>
          <TabsTrigger value="punchcards">Punch Cards</TabsTrigger>
        </TabsList>
        <TabsContent value="merch">{renderTable(merchandise, ShoppingBag)}</TabsContent>
        <TabsContent value="vouchers">{renderTable(allVouchers, Ticket)}</TabsContent>
        <TabsContent value="punchcards">{renderTable(punchCards, QrCode)}</TabsContent>
      </Tabs>

      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">{selectedItem?.name}</SheetTitle>
            <SheetDescription>
              {selectedItem?.type === "physical" && "Physical Merchandise"}
              {selectedItem?.type === "voucher" && "Gift Card / Voucher"}
              {selectedItem?.type === "voucher_batch" && "Generated Voucher Batch"}
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

              {(selectedItem.type === "voucher" || selectedItem.type === "voucher_batch") && (
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
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
                  <ShoppingBag className="h-32 w-32 text-muted-foreground/30 drop-shadow-sm" />
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
                    <p className="text-xl font-semibold text-green-500">{selectedItem.sold}</p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Inventory
                    </p>
                    <p
                      className={`text-xl font-semibold ${selectedItem.stock < 100 ? "text-orange-500" : ""}`}
                    >
                      {selectedItem.stock}
                    </p>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                    <Button
                      variant="outline"
                      className="w-full h-10 shadow-sm border-primary/20 hover:bg-primary/5 text-primary"
                    >
                      Edit Item
                    </Button>
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
